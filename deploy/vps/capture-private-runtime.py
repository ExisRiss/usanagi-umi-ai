#!/usr/bin/env python3
"""Private offline capture. Does not restore, restart, rotate keys, or revive sessions."""
import argparse, datetime, hashlib, io, json, os, pathlib, tarfile
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--bot-root',required=True)
p.add_argument('--output',required=True)
p.add_argument('--stopped',action='store_true',help='Operator confirms bot AND game writers are stopped')
p.add_argument('--retention-checked',action='store_true',help='Operator confirms expired/disconnected >=15min Jadibot sessions and their backups were removed')
a=p.parse_args()
if not (a.stopped and a.retention_checked): p.error('Stop all writers and check session retention first; both confirmations required')
root=pathlib.Path(a.bot_root).resolve(); dest=pathlib.Path(a.output).resolve()
if '.secrets' not in dest.parts or root==dest.parent or root in dest.parents: p.error('Output must be outside bot root, inside a private .secrets directory')
dest.parent.mkdir(parents=True,exist_ok=True,mode=0o700);os.chmod(dest.parent,0o700)
items=['config.js','bot-config.json','database.json','data','sessions','session','auth','jadibot','.env','.env.groq','.groq.env','.tunnel.env','.backup-export.env','.error-report.env','.main-bot.env','game-token.txt','tunnel-creds.json','tunnel-games.yml','lib/webgame.json','lib/trading-links.json','game/trading-data.json','game/game-data.json']
files=[]
for item in items:
    f=root/item
    if not f.exists(): continue
    candidates=list(f.rglob('*')) if f.is_dir() else [f]
    for q in candidates:
        rel=q.relative_to(root)
        if q.is_symlink(): raise SystemExit('Symlink in private runtime: inspect manually before capture')
        if not q.is_file(): continue
        if any('backup' in part.lower() for part in rel.parts if part not in ['.backup-export.env']): continue
        if q.name.endswith(('.tar.gz','.zip','.log')): continue
        files.append((q,rel.as_posix()))
if not files: raise SystemExit('No runtime files found; refusing empty backup')
manifest={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'writersStoppedAttested':True,'sessionRetentionAttested':True,'authFileCount':sum(n.endswith('/creds.json') for _,n in files),'sqlitePresent':any(n=='data/database/usanagi.sqlite' for _,n in files),'files':[]}
# Exclusive create; never overwrite an earlier backup. Filenames are private, not logged.
fd=os.open(dest,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
try:
    with os.fdopen(fd,'wb') as out, tarfile.open(fileobj=out,mode='w:gz') as archive:
        for f,n in files:
            content=f.read_bytes();info=tarfile.TarInfo(n);info.size=len(content);info.mode=0o600
            archive.addfile(info,io.BytesIO(content))
            manifest['files'].append({'path':n,'size':len(content),'sha256':hashlib.sha256(content).hexdigest()})
        content=json.dumps(manifest,indent=2).encode();info=tarfile.TarInfo('PRIVATE-RUNTIME-MANIFEST.json');info.size=len(content);info.mode=0o600;archive.addfile(info,io.BytesIO(content))
except BaseException:
    dest.unlink(missing_ok=True)
    raise
print(json.dumps({'capturedFiles':len(files),'authFileCount':manifest['authFileCount'],'sqlitePresent':manifest['sqlitePresent'],'privateArchive':True}))
