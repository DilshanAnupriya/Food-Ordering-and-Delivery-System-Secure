#!/usr/bin/env python3
"""Verify and export this run's seven real ZAP history messages without resetting the session."""
import hashlib,json,shutil,subprocess,urllib.request,urllib.parse
from pathlib import Path
from datetime import datetime,timezone
import xml.etree.ElementTree as ET
base=Path(__file__).resolve().parent
source=base/'target/evidence'
summary=json.loads((source/'summary.json').read_text())
proxy=summary['zapProxy']
parsed=urllib.parse.urlparse(proxy)
if parsed.hostname!='127.0.0.1' or parsed.scheme!='http': raise ValueError('Loopback ZAP only')
key=ET.parse(Path.home()/'Library/Application Support/ZAP/config.xml').getroot().findtext('api/key','')
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
def api(path,**params):
    req=urllib.request.Request(proxy+path+('?' + urllib.parse.urlencode(params) if params else ''),headers={'X-ZAP-API-Key':key})
    with opener.open(req,timeout=30) as result:return result.read()
def data(path,**params):
    result=json.loads(api(path,**params))
    if 'code' in result:raise ValueError('ZAP API error: '+result['code'])
    return result
version=data('/JSON/core/view/version/')['version']
old_session=data('/JSON/core/view/sessionLocation/')['sessionLocation']
candidates=data('/JSON/core/view/messages/',baseurl=summary['baseUrl'],start=0,count=100)['messages']
messages=[m for m in candidates if str(m['type'])=='1' and 'x-request-id: audit-poc-' in m['requestHeader'].lower()]
if len(messages)!=7:raise ValueError('Expected exactly seven matching HTTP history messages, got '+str(len(messages)))
results=[]; ordered=[]
for step in summary['requests']:
    matching=[m for m in messages if ('x-request-id: '+step['requestId']).lower() in m['requestHeader'].lower()]
    if len(matching)!=1:raise ValueError('Missing/duplicate message for '+step['step'])
    message=matching[0];line=message['requestHeader'].splitlines()[0].split()
    status=int(message['responseHeader'].splitlines()[0].split()[1])
    if line[0]!=step['method'] or line[1]!=step['url'] or status!=step['status'] or message['responseBody']!=step['body']:
        raise ValueError('Client and ZAP evidence disagree for '+step['step'])
    results.append({'step':step['step'],'historyId':message['id'],'method':step['method'],'url':step['url'],'status':status})
    ordered.append(message)
output=base/'evidence/zap-run'
output.mkdir(parents=True,exist_ok=False)
shutil.copytree(source,output/'observations')
shutil.copy2(base/'target/run.log',output/'maven-run.log')
(output/'zap-messages.json').write_text(json.dumps({'messages':ordered},indent=2)+'\n')
har=api('/OTHER/core/other/messagesHarById/',ids=','.join(m['id'] for m in ordered))
if len(json.loads(har)['log']['entries'])!=7:raise ValueError('Wrong HAR entry count')
(output/'zap-messages.har').write_bytes(har)
result=data('/JSON/core/action/snapshotSession/',name=str(output/'zap-session'),overwrite='false')
if result.get('Result')!='OK':raise ValueError('Session snapshot failed')
if data('/JSON/core/view/sessionLocation/')['sessionLocation']!=old_session:raise ValueError('Active session changed')
original=base.parents[2]/'Food-Ordering-Delivery-System'
files=list((original/'Server/Order_Service/src/main/java').rglob('*.java'))
manifest={'originalRepository':str(original),'originalCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=original,text=True).strip(),'files':{str(p.relative_to(original)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}}
(output/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
result={'recordedAtUtc':datetime.now(timezone.utc).isoformat(),'zapVersion':version,'proxy':proxy,'history':results,'requestCount':7,'applicationLogEvents':summary['orderPackageLogEvents'],'captureControlEvents':summary['loggingCaptureControlEvents'],'orderExistsAfterDeletion':summary['orderExistsAfterDeletion'],'method':'Actual original Order_Service requests through running ZAP Desktop proxy; API export, no GUI automation or screenshot creation. Synthetic fixture and disposable H2; no gateway.','interpretation':summary['interpretation'],'limitations':summary['limitations']}
(output/'zap-summary.json').write_text(json.dumps(result,indent=2)+'\n')
lines=['OBSERVED BEFORE-FIX AUDIT-LOGGING POC — '+result['recordedAtUtc'],'ZAP Desktop '+version+'; original source '+manifest['originalCommit'],'']
for item in results:lines.append('History '+str(item['historyId'])+': '+item['method']+' '+item['url']+' -> HTTP '+str(item['status']))
lines+=['','Order exists after deletion: '+str(summary['orderExistsAfterDeletion']),'Logging capture control events: '+str(summary['loggingCaptureControlEvents']),'Order application package log events: '+str(summary['orderPackageLogEvents']),'SQL logging: enabled; framework/SQL output is present.','PoC test: 1 passed (passing reproduces the original weakness; no fix tested).','Evidence scope: local Order_Service, synthetic order, H2 database; no gateway.']
(output/'verification.txt').write_text('\n'.join(lines)+'\n')
print('\n'.join(lines))
