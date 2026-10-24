import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
const moduleUrl=new URL('../lib/jadibot-session-cleaner.js',import.meta.url).href
for(const online of [false,true])test(online?'connected jadibot retains its managed backup':'15-minute expiry deletes jadibot auth and managed backup, not main auth',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'umi-retention-test-')),number='111111111'
 try{
  for(const sub of ['sessions/jadibot/'+number,'sessions-backup/'+number,'data'])fs.mkdirSync(path.join(dir,sub),{recursive:true})
  for(const file of ['sessions/creds.json','sessions/jadibot/'+number+'/creds.json','sessions-backup/'+number+'/creds.json'])fs.writeFileSync(path.join(dir,file),'{}')
  fs.writeFileSync(path.join(dir,'data/jadibot-session-cleaner.json'),JSON.stringify({entries:{[number]:{online:false,disconnectedSince:new Date(Date.now()-16*60000).toISOString()}}}))
  const script=`global.jadibotConns=new Map(${online?JSON.stringify([[number,{__jadibotConnected:true}]]):'[]'});const {sweepJadibotSessions}=await import(${JSON.stringify(moduleUrl)});await sweepJadibotSessions()`
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:dir,encoding:'utf8',env:{...process.env,JADIBOT_SESSION_TTL_MS:'900000'}})
  assert.equal(result.status,0,result.stderr)
  assert.equal(fs.existsSync(path.join(dir,'sessions/creds.json')),true)
  assert.equal(fs.existsSync(path.join(dir,'sessions/jadibot/'+number)),online)
  assert.equal(fs.existsSync(path.join(dir,'sessions-backup/'+number)),online)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
