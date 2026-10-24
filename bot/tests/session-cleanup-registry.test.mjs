import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {tmpdir} from 'node:os'
const previousCwd=process.cwd(),root=fs.mkdtempSync(path.join(tmpdir(),'umi-session-fixture-'))
process.chdir(root)
const {platformSessions:registry,createPlatformSessionState}=await import('../lib/jadibot-platform-state.js')
const cleaner=await import('../lib/jadibot-session-cleaner.js')
let clock=Date.now(),serial=0
const originalNow=Date.now;Date.now=()=>clock
global.jadibotConns=new Map()
const TTL=15*60*1000
function seed({folder=true,backup=false}={}){
 const number=String(70000000000+(++serial)),id='fixture-backup-'+serial
 if(folder){fs.mkdirSync(path.join(root,'sessions/jadibot',number),{recursive:true});fs.writeFileSync(path.join(root,'sessions/jadibot',number,'creds.json'),'fixture auth, not a real credential')}
 registry.load().sessions[number]={sessionId:number,userId:'fixture-account-'+serial,email:'fixture@example.test'}
 if(backup){fs.mkdirSync(path.join(root,'data/jadibot-backups'),{recursive:true});fs.writeFileSync(path.join(root,'data/jadibot-backups',id+'.json'),'fixture');registry.load().backups[id]={id,sessionId:number,userId:'fixture-account-'+serial};fs.mkdirSync(path.join(root,'sessions-backup',number),{recursive:true});fs.writeFileSync(path.join(root,'sessions-backup',number,'creds.json'),'fixture')}
 registry.save();return {number,id}
}
function archived(){execFileSync('tar',['-czf',path.join(root,'sessions-backup.tar.gz'),'-C',root,'sessions-backup'])}
test('expired offline session removes auth, both backup stores, archive entry and shared website reservation',async()=>{
 const gone=seed({backup:true}),keep=seed({backup:true});global.jadibotConns.set(keep.number,{__jadibotConnected:true});fs.writeFileSync(path.join(root,'sessions/creds.json'),'main untouched');archived();cleaner.noteSessionOffline(gone.number);clock+=TTL+1
 const removed=await cleaner.sweepJadibotSessions();assert(removed.some(x=>x.number===gone.number));assert(!registry.load().sessions[gone.number]);assert(!registry.load().backups[gone.id]);assert(!fs.existsSync(path.join(root,'data/jadibot-backups',gone.id+'.json')));assert(!fs.existsSync(path.join(root,'sessions/jadibot',gone.number)));assert(!fs.existsSync(path.join(root,'sessions-backup',gone.number)))
 const tar=execFileSync('tar',['-tzf',path.join(root,'sessions-backup.tar.gz')]).toString();assert(!tar.includes(gone.number));assert(tar.includes(keep.number));assert(registry.load().sessions[keep.number]);assert.equal(fs.readFileSync(path.join(root,'sessions/creds.json'),'utf8'),'main untouched');assert(!JSON.parse(fs.readFileSync(path.join(root,'data/jadibot-platform.json'))).sessions[gone.number])
})
test('missing-folder reservation gets a full grace period, then is released',async()=>{
 const f=seed({folder:false});await cleaner.sweepJadibotSessions();assert(registry.load().sessions[f.number]);clock+=TTL-1;await cleaner.sweepJadibotSessions();assert(registry.load().sessions[f.number]);clock+=2;await cleaner.sweepJadibotSessions();assert(!registry.load().sessions[f.number])
})
test('online sessions are preserved even when folder is absent',async()=>{
 const f=seed({folder:false});global.jadibotConns.set(f.number,{__jadibotConnected:true});cleaner.noteSessionOffline(f.number);clock+=TTL+1;await cleaner.sweepJadibotSessions();assert(registry.load().sessions[f.number])
})
test('repeated automatic offline events do not reset retention',async()=>{
 const f=seed();cleaner.noteSessionOffline(f.number);clock+=TTL-1;cleaner.noteSessionOffline(f.number);clock+=2;await cleaner.sweepJadibotSessions();assert(!registry.load().sessions[f.number])
})
test('explicit user activity grants another grace period',async()=>{
 const f=seed();cleaner.noteSessionOffline(f.number);clock+=TTL-1;cleaner.noteSessionActivity(f.number);clock+=2;await cleaner.sweepJadibotSessions();assert(registry.load().sessions[f.number]);global.jadibotConns.set(f.number,{__jadibotConnected:true})
})
test('cleanup locks new pairing/restart access while stopping an expired socket',async()=>{
 const f=seed();cleaner.noteSessionOffline(f.number);clock+=TTL+1;let release,entered;const started=new Promise(r=>entered=r)
 cleaner.setSessionRemovalHook(async number=>{if(number===f.number){entered();await new Promise(r=>release=r)}})
 const work=cleaner.sweepJadibotSessions();await started;assert.throws(()=>registry.assertAvailable(f.number),e=>e.status===409);assert.equal(registry.beginRemoval(f.number),false);assert.deepEqual(await cleaner.sweepJadibotSessions(),[]);release();await work;assert.doesNotThrow(()=>registry.assertAvailable(f.number));cleaner.setSessionRemovalHook(null)
})
test('failed socket shutdown never deletes credentials or releases ownership',async()=>{
 const f=seed();cleaner.noteSessionOffline(f.number);clock+=TTL+1;cleaner.setSessionRemovalHook(()=>{throw Error('fixture shutdown failed')});await cleaner.sweepJadibotSessions();assert(registry.load().sessions[f.number]);assert(fs.existsSync(path.join(root,'sessions/jadibot',f.number)));cleaner.setSessionRemovalHook(null)
})
test('failed website-backup removal retains reservation and retries orphan on next sweep',async()=>{
 const f=seed({backup:true}),file=path.join(root,'data/jadibot-backups',f.id+'.json');fs.rmSync(file);fs.mkdirSync(file);cleaner.noteSessionOffline(f.number);clock+=TTL+1;await cleaner.sweepJadibotSessions();assert(registry.load().sessions[f.number]);assert(registry.load().backups[f.id]);fs.rmSync(file,{recursive:true});await cleaner.sweepJadibotSessions();assert(!registry.load().sessions[f.number]);assert(!registry.load().backups[f.id])
})
test('backup-only orphan is included in cleanup candidates',async()=>{
 const f=seed({folder:false,backup:true});delete registry.load().sessions[f.number];registry.save();await cleaner.sweepJadibotSessions();clock+=TTL+1;await cleaner.sweepJadibotSessions();assert(!registry.load().backups[f.id])
})
test('corrupt registry fails closed and is not replaced with an empty database',()=>{
 const dir=fs.mkdtempSync(path.join(root,'corrupt-'));fs.mkdirSync(path.join(dir,'data'));const file=path.join(dir,'data/jadibot-platform.json');fs.writeFileSync(file,'not json');const state=createPlatformSessionState(dir);assert.throws(()=>state.load());assert.equal(fs.readFileSync(file,'utf8'),'not json')
})
test('backup path traversal is rejected before ownership can be released',()=>{
 const dir=fs.mkdtempSync(path.join(root,'unsafe-')),state=createPlatformSessionState(dir),n='70000000123';state.load().sessions[n]={userId:'owner'};state.load().backups['../outside']={sessionId:n};state.save();assert.throws(()=>state.remove(n),/ID backup/);assert(state.load().sessions[n]);assert.throws(()=>state.remove('../'),/Nomor/)
})
test('disk write failure keeps current in-memory ownership',()=>{
 const dir=fs.mkdtempSync(path.join(root,'write-')),state=createPlatformSessionState(dir),n='70000000124';state.load().sessions[n]={userId:'owner'};state.save();const file=path.join(dir,'data/jadibot-platform.json');fs.renameSync(file,file+'.saved');fs.mkdirSync(file);assert.throws(()=>state.remove(n));assert.equal(state.load().sessions[n].userId,'owner')
})
test.after(()=>{Date.now=originalNow;process.chdir(previousCwd);fs.rmSync(root,{recursive:true,force:true});delete global.jadibotConns})
