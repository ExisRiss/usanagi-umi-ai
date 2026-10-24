import { unifiedRpg } from '../lib/rpg/unified-store.js'
const migrated=new WeakSet(),fallback={users:{}}
export function normalizeAfkJid(value){
 const jid=String(value||'').replace(/:\d+(?=@)/,'')
 return /^\d{1,25}@(s\.whatsapp\.net|lid)$/.test(jid)?jid:''
}
function canonical(jid){const id=unifiedRpg()?.identity(jid);return id?`${id}@s.whatsapp.net`:jid}
function candidateKeys(jid,aliases=[]){
 const own=normalizeAfkJid(jid);if(!own)return []
 let keys=[...new Set([own,...aliases.map(normalizeAfkJid)].filter(Boolean))]
 // A conflicting pair of phone identities must never clear another user's AFK.
 const phones=new Set(keys.map(canonical).filter(x=>x.endsWith('@s.whatsapp.net')))
 if(phones.size>1)keys=[own]
 const primary=canonical(own),phone=phones.size===1?[...phones][0]:''
 return [...new Set([primary.endsWith('@s.whatsapp.net')?primary:phone||primary,...keys, ...keys.map(canonical)])]
}
function state(){
 const data=global.db?.data||fallback
 if(!data.afkStateV1||typeof data.afkStateV1!=='object'||Array.isArray(data.afkStateV1))data.afkStateV1={}
 const states=data.afkStateV1
 if(!migrated.has(data)){
  migrated.add(data)
  const put=(jid,since,reason)=>{const key=normalizeAfkJid(jid);if(!key||!Number.isFinite(since)||since<=0)return;const id=canonical(key);if(!states[id]||states[id].since<since)states[id]={since,reason:String(reason||'').slice(0,1000)}}
  // Preserve legacy active records, then retire their independent flags.
  for(const [jid,user]of Object.entries(data.users||{})){if(normalizeAfkJid(jid)&&user&&Number(user.afk)>0){put(jid,Number(user.afk),user.afkReason);user.afk=-1;user.afkReason=''}}
  if(global.afkStorage instanceof Map){for(const [jid,value]of global.afkStorage){put(jid,Number(value?.time||value?.since),value?.reason);global.afkStorage.delete(jid)}}
 }
 return states
}
function keysInState(jid,aliases,states){
 const keys=candidateKeys(jid,aliases);if(!keys.length)return keys
 const ids=new Set(keys.map(canonical))
 // Only scan active AFK entries, not the whole user database, for newly verified aliases.
 for(const key of Object.keys(states))if(normalizeAfkJid(key)&&ids.has(canonical(key)))keys.push(key)
 return [...new Set(keys)]
}
export function setAfk(jid,reason,aliases=[]){
 const states=state(),keys=keysInState(jid,aliases,states);if(!keys.length)return null
 const entry={reason:String(reason||'').trim().slice(0,1000),since:Date.now()}
 for(const key of keys)delete states[key]
 states[keys[0]]=entry;return entry
}
export function getAfk(jid,aliases=[]){
 const states=state(),keys=keysInState(jid,aliases,states)
 let entry=null,recordKey=''
 for(const key of keys){const value=states[key];if(value&&Number.isFinite(value.since)&&value.since>0&&(!entry||value.since>entry.since)){entry=value;recordKey=key}}
 return entry?{...entry,key:recordKey}:null
}
export function removeAfk(jid,aliases=[]){
 const states=state(),keys=keysInState(jid,aliases,states);let removed=false
 for(const key of keys){if(states[key]){delete states[key];removed=true}}
 return removed
}
export function isAfk(jid){return Boolean(getAfk(jid))}
export async function persistAfk(){if(typeof global.db?.write==='function')await global.db.write()}
export function formatAfkDuration(ms){
 const totalSeconds=Math.max(0,Math.floor((Number(ms)||0)/1000)),hours=Math.floor(totalSeconds/3600),minutes=Math.floor(totalSeconds%3600/60),seconds=totalSeconds%60
 if(hours>0)return `${hours} jam ${minutes} menit`
 if(minutes>0)return `${minutes} menit ${seconds} detik`
 return `${seconds} detik`
}
export default {setAfk,getAfk,removeAfk,isAfk,persistAfk,formatAfkDuration}
