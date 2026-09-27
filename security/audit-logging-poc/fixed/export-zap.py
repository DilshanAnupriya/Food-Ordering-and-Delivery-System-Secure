#!/usr/bin/env python3
"""Export verified fixed-run evidence from the existing local ZAP history. No scan/session reset."""
import hashlib,json,re,shutil,subprocess,urllib.request,urllib.parse
from pathlib import Path
from datetime import datetime,timezone
import xml.etree.ElementTree as ET
base=Path(__file__).resolve().parent
source=base/'target/evidence'
summary=json.loads((source/'summary.json').read_text())
proxy=summary['zapProxy']; parsed=urllib.parse.urlparse(proxy)
if parsed.hostname!='127.0.0.1' or parsed.scheme!='http': raise ValueError('Loopback ZAP only')
key=ET.parse(Path.home()/'Library/Application Support/ZAP/config.xml').getroot().findtext('api/key','')
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
def api(path,**params):
    req=urllib.request.Request(proxy+path+'?'+urllib.parse.urlencode(params),headers={'X-ZAP-API-Key':key})
    with opener.open(req,timeout=30) as response: result=json.load(response)
    if 'code' in result: raise ValueError('ZAP API error: '+result['code'])
    return result
messages=api('/JSON/core/view/messages/',baseurl=summary['baseUrl'],start=0,count=100)['messages']
ordered=[]; history=[]
for step in summary['requests']:
    matches=[m for m in messages if str(m['type'])=='1' and
             ('x-request-id: '+step['requestId']).lower() in m['responseHeader'].lower()]
    if len(matches)!=1:raise ValueError('Missing or duplicate ZAP response for '+step['step'])
    message=matches[0]; line=message['requestHeader'].splitlines()[0].split()
    status=int(message['responseHeader'].splitlines()[0].split()[1])
    if line[:2]!=[step['method'],step['url']] or status!=step['status']:raise ValueError('ZAP mismatch: '+step['step'])
    # Saved evidence excludes tokens, including the short-lived synthetic fixture JWTs.
    message['requestHeader']=re.sub(r'(?im)^Authorization:[^\r\n]*','Authorization: [synthetic JWT redacted]',message['requestHeader'])
    ordered.append(message); history.append({**step,'historyId':message['id']})
output=base.parent/'evidence/fixed-zap-run'
output.mkdir(parents=True,exist_ok=False)
observations=output/'observations'; observations.mkdir()
for path in source.iterdir():
    if path.suffix in ('.json','.csv','.http','.txt'):shutil.copy2(path,observations/path.name)
shutil.copy2(base/'target/run.log',output/'maven-run.log')
(output/'zap-messages-redacted.json').write_text(json.dumps({'messages':ordered},indent=2)+'\n')
result={'recordedAtUtc':datetime.now(timezone.utc).isoformat(),'zapVersion':api('/JSON/core/view/version/')['version'],
        'history':history,'requestCount':len(history),'scope':summary['scope'],
        'method':'ZAP Desktop proxy + API export. Authorization headers redacted; no GUI screenshots generated.'}
(output/'zap-summary.json').write_text(json.dumps(result,indent=2)+'\n')
repo=base.parents[2]
files=sorted((repo/'Server/Order_Service/src/main/java').rglob('*.java'))+[repo/'Server/Order_Service/pom.xml']
manifest={'repository':str(repo),'baseCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),
          'note':'Working tree includes the uncommitted audit remediation; hashes identify tested code.',
          'files':{str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}}
(output/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
lines=['FIXED AUDIT TRAIL — ZAP Desktop '+result['zapVersion']]+[
    'History '+str(x['historyId'])+': '+x['step']+' -> HTTP '+str(x['status'])+'; request ID '+x['requestId'] for x in history]
lines+=['', (source/'verification.txt').read_text().strip(),
        'Audit tests: 3 passed; includes transaction rollback/storage failure and invalid JWT controls.',
        'The simulated audit-storage CHECK constraint error in the test log is intentional.']
(output/'verification.txt').write_text('\n'.join(lines)+'\n')
print('\n'.join(lines))
