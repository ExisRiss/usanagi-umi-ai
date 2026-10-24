import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {getDb} from '../../core/awang-sqlite.js'
import {createUnifiedStore,UNIFIED_RPG,unifiedRpg,pn} from './unified-store.js'
import {withRealmGate} from '../realms/gate.js'
export function readTrustedLidLinks(root=process.cwd()){
 const links=[],folder=path.join(root,'sessions','jadibot')
 if(!fs.existsSync(folder))return links
 for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
  if(!entry.isDirectory()||!/^\d{7,15}$/.test(entry.name))continue
  const dir=path.join(folder,entry.name)
  for(const name of fs.readdirSync(dir)){
   const match=name.match(/^lid-mapping-(\d+)\.json$/);if(!match)continue
   try{
    const phone=JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'))
    if(typeof phone!=='string'||!pn(phone))continue
    const reverse=JSON.parse(fs.readFileSync(path.join(dir,'lid-mapping-'+phone+'_reverse.json'),'utf8'))
    if(String(reverse)!==match[1])continue
    links.push({alias:match[1]+'@lid',canonical:phone})
   }catch{}
  }
 }
 return links
}
export function initializeUnifiedRpg(){
 if(unifiedRpg())return unifiedRpg()
 const db=getDb(),table=db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='rpg_unified_meta'").get()
 const active=table&&db.prepare("SELECT value FROM rpg_unified_meta WHERE key='active'").get()?.value==='1'
 let approved=false;try{approved=fs.readFileSync(path.join(process.cwd(),'.rpg-unification.enabled'),'utf8').trim()==='RPG_ONLY_1_TO_1'}catch{}
 if(!active&&!approved)return null
 const users=global.db?.data?.users
 if(!users||typeof users!=='object')throw Error('Unified RPG requires loaded legacy data')
 if(!active)captureRpgSnapshot('before-unify')

 const store=createUnifiedStore({db,users,links:readTrustedLidLinks()})
 const result=store.migrate()
 globalThis[UNIFIED_RPG]=store;global.db.data.users=store.users
 startRewardWorker(store)
 console.log('[UMI-RPG] unified authority ready',JSON.stringify({...result,...store.status()}))
 return store
}
const WRAPPED=Symbol.for('umi.rpg.outbound.flush.v1')
export function wrapRpgOutbound(conn,m){
 if(!unifiedRpg())return
 for(const target of [conn,m]){
  if(!target)continue
  for(const name of ['sendMessage','relayMessage','reply','sendFile','sendImage','sendVideo','sendAudio','sendSticker']){
   const original=target[name];if(typeof original!=='function'||original[WRAPPED])continue
   const wrapped=function(...args){unifiedRpg()?.flush();return original.apply(this,args)}
   wrapped[WRAPPED]=true
   wrapped[Symbol.for('umi.rpg.outbound.original.v1')]=original
   // Socket helpers may be immutable own properties; message helpers may be
   // inherited readonly methods. Never assign through either descriptor.
   const descriptor=Object.getOwnPropertyDescriptor(target,name)
   if(descriptor&&!descriptor.configurable){
    if(descriptor.writable)Object.defineProperty(target,name,{value:wrapped})
    // Immutable convenience methods delegate to the wrapped socket transport.
    continue
   }
   if(!descriptor&&!Object.isExtensible(target))continue
   Object.defineProperty(target,name,{value:wrapped,writable:true,configurable:true,enumerable:descriptor?.enumerable||false})
  }
 }
}
export async function runUnifiedCommand(id,task,conn,m){
 const store=unifiedRpg();if(!store)return task()
 wrapRpgOutbound(conn,m)
 return withRealmGate(()=>store.command(id,task))
}
export async function awardMessageExp(sender,amount,messageId){
 const store=unifiedRpg();if(!store)return false
 const id=store.identity(sender);if(!id)return true
 await withRealmGate(()=>store.command('passive-exp:'+sender+':'+messageId,()=>{const u=store.read(id);u.exp+=Math.max(0,Math.floor(Number(amount)||0));store.write(id,u)}))
 return true
}

let rewardTimer=null
const notifying=new Set()
function startRewardWorker(store){
 if(rewardTimer)return
 const tick=()=>withRealmGate(()=>{store.settleRewards();return store.documents('rpg_unified_jobs').filter(j=>j.status==='done'&&!j.notified)}).then(async jobs=>{
  for(const job of jobs){
   if(notifying.has(job.id))continue
   const n=job.notification||{}
   const connections=[...(global.jadibotConns instanceof Map?global.jadibotConns.values():[]),...(global.mainBotEnabled&&global.conn?[global.conn]:[])]
   const conn=connections.find(c=>pn(c.user?.id)===pn(n.bot)&&(c.__jadibotConnected||c===global.conn))
   if(!conn||!n.chat||!n.text)continue
   notifying.add(job.id)
   try{await conn.sendMessage(n.chat,{text:String(n.text).slice(0,1000)});await withRealmGate(()=>{const current=store.document('rpg_unified_jobs',job.id);current.notified=true;store.document('rpg_unified_jobs',job.id,current)})}catch{}finally{notifying.delete(job.id)}
  }
 }).catch(e=>console.error('[UMI-RPG] reward worker',e.name))
 rewardTimer=setInterval(tick,10000);rewardTimer.unref();tick()
}
export function scheduleRpgReward(m,suffix,delay,rewards,conn,text){
 const store=unifiedRpg();if(!store)return false
 const messageId=m.key?.id||m.id||m.raw?.key?.id
 if(!messageId)store.reject('ID pesan diperlukan untuk hadiah tertunda.')
 store.scheduleReward([m.sender,m.chat,messageId,suffix].join(':'),delay,rewards,{bot:conn?.user?.id,chat:m.chat,text})
 return true
}

function captureRpgSnapshot(label){
 const db=getDb()
 if(!global.db?.data?.users)throw Object.assign(new Error('Database belum siap.'),{status:503})
 const name=label+'-'+Date.now()+'-'+crypto.randomBytes(4).toString('hex')
 const dir=path.join(path.dirname(db.name),'unification-backups',name)
 fs.mkdirSync(dir,{recursive:true,mode:0o700})
 const sqlite=path.join(dir,'database.sqlite');db.prepare('VACUUM INTO ?').run(sqlite);fs.chmodSync(sqlite,0o600)
 fs.writeFileSync(path.join(dir,'database.json'),JSON.stringify(global.db.data),{mode:0o600})
 return {directory:'/'+path.relative(process.cwd(),dir),sqliteBytes:fs.statSync(sqlite).size,containsWhatsAppAuth:false}
}
export function backupUnifiedRpg(){return withRealmGate(()=>captureRpgSnapshot('snapshot'))}
