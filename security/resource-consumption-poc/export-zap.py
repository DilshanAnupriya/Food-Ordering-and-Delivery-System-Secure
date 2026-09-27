#!/usr/bin/env python3
"""Export and verify only this PoC's messages from a running local ZAP desktop."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


def main():
    base = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=base / 'evidence/zap-desktop-run')
    parser.add_argument('--zap-config', type=Path,
                        default=Path.home() / 'Library/Application Support/ZAP/config.xml')
    args = parser.parse_args()
    source = base / 'target/evidence'
    pagination = json.loads((source / 'pagination/summary.json').read_text())
    notifications = json.loads((source / 'notifications/summary.json').read_text())
    proxy = pagination.get('zapProxy')
    if proxy != notifications.get('zapProxy') or not proxy:
        raise ValueError('First run both PoCs with POC_ZAP_PROXY set.')
    parsed = urllib.parse.urlparse(proxy)
    if parsed.scheme != 'http' or parsed.hostname != '127.0.0.1' or not parsed.port:
        raise ValueError('Only a local loopback ZAP API is supported.')
    config = ET.parse(args.zap_config).getroot()
    key = config.findtext('api/key', '')
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def api(path, **parameters):
        query = urllib.parse.urlencode(parameters)
        url = proxy.rstrip('/') + path + ('?' + query if query else '')
        request = urllib.request.Request(url, headers={'X-ZAP-API-Key': key})
        with opener.open(request, timeout=30) as response:
            return response.read()

    def json_api(path, **parameters):
        result = json.loads(api(path, **parameters))
        if 'code' in result:
            raise ValueError('ZAP API returned an error: ' + result['code'])
        return result

    version = json_api('/JSON/core/view/version/')['version']
    old_session = json_api('/JSON/core/view/sessionLocation/')['sessionLocation']
    targets = {
        pagination['baseline']['url'],
        pagination['oversized']['url'],
        f"http://127.0.0.1:{notifications['httpPort']}/api/notifications/payment-confirmation",
    }
    messages = []
    # ZAP also stores synthetic Sites tree entries (type=0). Export actual HTTP
    # history entries only (type=1), restricted to this run's exact URLs.
    for target in targets:
        candidates = json_api('/JSON/core/view/messages/', baseurl=target, start=0, count=100)['messages']
        for message in candidates:
            first_line = message['requestHeader'].splitlines()[0].split()
            if len(first_line) >= 2 and first_line[1] == target and str(message['type']) == '1':
                messages.append(message)
    messages = sorted({m['id']: m for m in messages}.values(), key=lambda m: int(m['id']))
    if len(messages) != 8:
        raise ValueError(f'Expected exactly eight PoC HTTP messages; found {len(messages)}.')
    ids = []
    for label in ('baseline', 'oversized'):
        matches = [m for m in messages if m['requestHeader'].splitlines()[0].split()[1] == pagination[label]['url']]
        if len(matches) != 1:
            raise ValueError('Expected one ZAP history entry for ' + label)
        message = matches[0]
        status = int(message['responseHeader'].splitlines()[0].split()[1])
        data = json.loads(message['responseBody'])
        size = len(message['responseBody'].encode('utf-8'))
        expected = pagination[label]
        if status != 200 or len(data['orders']) != expected['requestedSize']:
            raise ValueError('ZAP did not reproduce the expected pagination behaviour.')
        if size != expected['responseBytes'] or data['totalItems'] != 250:
            raise ValueError('ZAP and Java client pagination evidence disagree.')
        ids.append({'finding': label, 'id': message['id'], 'status': status,
                    'ordersReturned': len(data['orders']), 'responseBytes': size})
    email_messages = [m for m in messages if m['requestHeader'].startswith('POST ')]
    if len(email_messages) != 6 or notifications['capturedEmails'] != 6:
        raise ValueError('Expected six notification messages and six captured emails.')
    for message in email_messages:
        status = int(message['responseHeader'].splitlines()[0].split()[1])
        payload = json.loads(message['requestBody'])
        if status != 200 or payload != {'email': 'vidura-test@example.test',
                'orderId': 'TEST-ORDER-001', 'amount': 25.0, 'paymentStatus': 'SUCCESS'}:
            raise ValueError('Unexpected notification payload or status in ZAP history.')
        ids.append({'finding': 'notification', 'id': message['id'], 'status': status})

    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    for finding in ('pagination', 'notifications'):
        shutil.copytree(source / finding, output / finding)
        shutil.copyfile(base / 'target' / (finding + '-run.log'), output / (finding + '-run.log'))
    (output / 'zap-messages.json').write_text(json.dumps({'messages': messages}, indent=2) + '\n')
    selected_ids = ','.join(m['id'] for m in messages)
    har = api('/OTHER/core/other/messagesHarById/', ids=selected_ids)
    if len(json.loads(har)['log']['entries']) != 8:
        raise ValueError('ZAP HAR export must contain eight entries.')
    (output / 'zap-messages.har').write_bytes(har)

    # Snapshot the existing session rather than resetting it or switching it.
    session_path = output / 'zap-session'
    snapshot = json_api('/JSON/core/action/snapshotSession/', name=str(session_path), overwrite='false')
    if snapshot.get('Result') != 'OK':
        raise ValueError('ZAP could not snapshot the session.')
    if json_api('/JSON/core/view/sessionLocation/')['sessionLocation'] != old_session:
        raise ValueError('The active ZAP session unexpectedly changed.')

    repo = base.parent.parent
    fingerprints = {}
    for service in ('Order_Service', 'notification'):
        for file in sorted((repo / 'Server' / service / 'src/main/java').rglob('*.java')):
            fingerprints[str(file.relative_to(repo))] = hashlib.sha256(file.read_bytes()).hexdigest()
    summary = {
        'recordedAtUtc': datetime.now(timezone.utc).isoformat(),
        'zapVersion': version, 'zapProxy': proxy,
        'method': 'Java HTTP Client requests routed through the already-running ZAP Desktop proxy; evidence exported using the ZAP API.',
        'actualHttpMessages': len(messages), 'messageIds': ids,
        'capturedEmails': notifications['capturedEmails'],
        'notificationSequenceMs': notifications['durationMs'],
        'baseline': pagination['baseline'], 'oversized': pagination['oversized'],
        'originalCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip(),
        'originalSourceSha256': fingerprints,
        'scope': 'Two listing requests and six notification requests. Original application sources, synthetic data, temporary H2 database, local GreenMail SMTP catcher. No active scan or gateway test.',
        'limitations': 'This reproduces oversized retrieval and repeated mail delivery; it does not prove an outage, provider quota exhaustion, or absence of a higher rate threshold. No GUI Requester interaction or native screenshot was performed.',
    }
    (output / 'zap-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    print('ZAP Desktop', version, ': eight recorded HTTP messages verified.')
    for result in ids:
        print('History ID', result['id'], ':', result['finding'], 'HTTP', result['status'])
    print('Local emails captured:', notifications['capturedEmails'])
    print('Evidence:', output)


if __name__ == '__main__':
    main()
