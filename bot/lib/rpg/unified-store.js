// SQLite-backed compatibility layer. No network, credentials or financial-wallet access.
import crypto from 'node:crypto'
import {AsyncLocalStorage} from 'node:async_hooks'
const clone=v=>{try{return v===undefined?undefined:parse(JSON.stringify(v))}catch{fail('Nilai RPG tidak dapat disimpan.')}}
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex')
const valid=n=>Number.isSafeInteger(n)&&n>=0
const transactions=new AsyncLocalStorage()
const fail=message=>{const error=Object.assign(new Error(message),{status:409});const ctx=transactions.getStore();if(ctx&&!ctx.closed)ctx.poisoned=error;throw error}
const parse=value=>{try{return JSON.parse(value)}catch{fail('Data RPG tidak valid; pemulihan diperlukan.')}}
const structure={defineProperty(){fail('Definisi properti RPG tidak diizinkan.')},setPrototypeOf(){fail('Prototype RPG tidak boleh diubah.')},preventExtensions(){fail('Struktur RPG tidak boleh dibekukan.')}}
export const UNIFIED_RPG=Symbol.for('umi.rpg.unified.v1')
export const unifiedRpg=()=>globalThis[UNIFIED_RPG]||null
export const pn=value=>String(value||'').match(/^(\d{7,15})(?::\d+)?(?:@s\.whatsapp\.net)?$/)?.[1]||''
export const ITEMS=new Set(('bibitapel bibitjeruk bibitdurian bibitmangga bibitpisang apel jeruk durian mangga pisang banteng harimau gajah kambing panda buaya kerbau sapi monyet babihutan babi ayam ikan lele nila bawal udang paus kepiting sword pickaxe axe fishingrod armor atm potion string wood rock coal iron diamond emerald trash common uncommon mythic legendary ayambakar ayamgoreng oporayam gulaiayam steak rendang babipanggang ikanbakar lelebakar nilabakar bawalbakar udangbakar pausbakar kepitingbakar bait fertilizer anggur bibitanggur botol kaleng kardus kayu tiketcoin').split(' '))
const stats=Object.assign(Object.create(null),{health:'health',maxhealth:'maxHealth',mana:'mana',stamina:'stamina'})
const auxiliary=new Set('dailyStreak energy gold bank horse horseexp sworddurability pickaxedurability axedurability fishingroddurability armordurability fullatm'.split(' '))
export function ownedField(k){return ['money','balance','koin','exp','level','inventory','rpg','quest','cooldowns','pet','pets','petStorage'].includes(k)||ITEMS.has(k)||k in stats||auxiliary.has(k)||/^last[A-Za-z_]/.test(k)}
const safePath=p=>{if(p.some(k=>['__proto__','prototype','constructor'].includes(String(k))))fail('Field RPG tidak diizinkan.')}
function fieldPath(k){
 if(['money','balance','koin'].includes(k))return ['koin']
 if(['exp','inventory','rpg','quest','cooldowns'].includes(k))return [k]
 if(k==='pet')return ['rpg','pet']
 if(k==='pets'||k==='petStorage')return ['rpg','petStorage']
 if(ITEMS.has(k))return ['inventory',k]
 if(k in stats)return ['rpg',stats[k]]
 return ['legacy',k]
}
const at=(o,p)=>p.reduce((v,k)=>v?.[k],o)
function assign(o,p,value,remove=false){safePath(p);let v=o;for(const k of p.slice(0,-1)){if(!v[k]||typeof v[k]!=='object')v[k]={};v=v[k]}if(remove)delete v[p.at(-1)];else v[p.at(-1)]=clone(value)}
function validate(u){
 if(!valid(u.koin)||!valid(u.exp))fail('Saldo/EXP RPG harus bilangan bulat aman dan tidak negatif.')
 if(!u.inventory||Array.isArray(u.inventory)||typeof u.inventory!=='object')fail('Inventory RPG harus berupa jumlah item.')
 for(const [k,v]of Object.entries(u.inventory)){safePath([k]);if(!valid(v))fail('Jumlah item tidak valid.')}
 u.level=Math.floor(u.exp/10000)+1
 if(u.rpg)u.rpg.level=u.level
 return u
}
const base=id=>({jid:id,koin:0,exp:0,level:1,inventory:{},rpg:{health:100,maxHealth:100,mana:100,maxMana:100,stamina:100,maxStamina:100,attack:10,defense:5,speed:10,luck:5,pet:null,petStorage:[],stats:{}},quest:{},cooldowns:{},legacy:{}})
export function createUnifiedStore({db,users,links=[]}){
 if(!users||typeof users!=='object'||Array.isArray(users))throw Error('Legacy users unavailable')
 const context=transactions,proxies=new Map(),blocked=new Set(),blockedSources=new Set(),raw=users
 const schema=()=>db.exec(`CREATE TABLE IF NOT EXISTS rpg_users(jid TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS rpg_guilds(id TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS rpg_unified_jobs(id TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS rpg_unified_aliases(alias TEXT PRIMARY KEY,canonical TEXT NOT NULL,proof TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS rpg_unified_canonical ON rpg_unified_aliases(canonical);
 CREATE TABLE IF NOT EXISTS rpg_unified_sources(source TEXT PRIMARY KEY,canonical TEXT NOT NULL,data TEXT NOT NULL,components TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS rpg_unified_commands(id TEXT NOT NULL,phase INTEGER NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(id,phase));
 CREATE TABLE IF NOT EXISTS rpg_unified_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);`)
 schema()
 const phoneKeys=new Map()
 const remember=key=>{const id=pn(key);if(id){if(!phoneKeys.has(id))phoneKeys.set(id,new Set());phoneKeys.get(id).add(key)}}
 Object.keys(raw).forEach(remember)
 const ensureAliases=id=>{for(const key of phoneKeys.get(id)||[])if(!blocked.has(id)&&!blockedSources.has(key))db.prepare('INSERT OR IGNORE INTO rpg_unified_aliases VALUES(?,?,?)').run(key,id,'phone-jid')}
 const readSql=id=>db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(id)?.data||null
 const decode=(id,s)=>{if(!s&&db.prepare('SELECT 1 FROM rpg_unified_aliases WHERE canonical=? LIMIT 1').get(id))fail('Database authority hilang; pemulihan diperlukan.');try{return s?parse(s):base(id)}catch{fail('Data RPG rusak; pemulihan diperlukan.')}}
 function identity(key){return db.prepare('SELECT canonical FROM rpg_unified_aliases WHERE alias=?').get(String(key))?.canonical||(blockedSources.has(String(key))||blocked.has(pn(key))?'':pn(key))}
 function read(id){
  const ctx=context.getStore()
  if(ctx?.closed)return context.run(null,()=>read(id))
  if(ctx){if(!ctx.rows.has(id)){const before=readSql(id);ctx.rows.set(id,{before,data:decode(id,before),dirty:false})}return clone(ctx.rows.get(id).data)}
  const s=readSql(id);return decode(id,s)
 }
 function write(id,value,expected){
  const data=validate(clone(value)),ctx=context.getStore()
  // Konteks yang sudah ditutup bukan "transaksi yang ditutup": itu sisa
  // AsyncLocalStorage dari perintah sebelumnya (mis. tugas async yang selesai
  // setelah handler membalas). Tulis di luar transaksi supaya tidak ada
  // penulisan yang hilang — sebelumnya ini melempar 409 ke pengguna.
  if(ctx?.closed){
   if(context.getStore()===ctx)return context.run(null,()=>write(id,value,expected))
   fail('Transaksi RPG telah ditutup.')
  }
  if(ctx){read(id);const row=ctx.rows.get(id);if(expected!==undefined&&JSON.stringify(row.data)!==expected)fail('Progres berubah; coba ulang.');row.data=data;row.dirty=true;return}
  db.transaction(()=>{if(expected!==undefined&&JSON.stringify(read(id))!==expected)fail('Progres berubah; coba ulang.');db.prepare('INSERT INTO rpg_users(jid,data) VALUES(?,?) ON CONFLICT(jid) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(data));ensureAliases(id)})()
 }
 function patch(id,before,after){
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
  const object=v=>v&&typeof v==='object'&&!Array.isArray(v)
  function merge(b,a,c,p=[]){
   if(equal(b,a))return clone(c)
   if(object(b)&&object(a)&&object(c)){
    const result=clone(c)
    for(const k of new Set([...Object.keys(b),...Object.keys(a)])){
     safePath([...p,k]);const v=merge(b[k],a[k],c[k],[...p,k]);if(v===undefined)delete result[k];else result[k]=v
    }
    return result
   }
   if(!equal(c,b))fail('Progres berubah; perubahan lama tidak boleh menimpa data terbaru.')
   return clone(a)
  }
  write(id,merge(before,after,read(id)))
 }
 const docTables=new Set(['rpg_guilds','rpg_unified_jobs'])
 function docSql(table,id){if(!docTables.has(table))fail('Tabel tidak diizinkan.');return db.prepare('SELECT data FROM '+table+' WHERE id=?').get(id)?.data||null}
 function document(table,id,value){
  const ctx=context.getStore(),key=table+':'+id,before=docSql(table,id)
  if(ctx?.closed){if(arguments.length>2)fail('Transaksi RPG telah ditutup.');return before?parse(before):null}
  if(ctx&&!ctx.docs.has(key))ctx.docs.set(key,{table,id,before,data:before?parse(before):null,dirty:false})
  if(arguments.length<3)return clone(ctx?ctx.docs.get(key).data:before?parse(before):null)
  if(ctx){const d=ctx.docs.get(key);d.data=clone(value);d.dirty=true;return}
  if(value===null)db.prepare('DELETE FROM '+table+' WHERE id=?').run(id)
  else db.prepare('INSERT INTO '+table+' VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(value))
 }
 function documents(table){
  if(!docTables.has(table))fail('Tabel tidak diizinkan.')
  const all=new Map(db.prepare('SELECT id,data FROM '+table).all().map(r=>[r.id,parse(r.data)]))
  for(const d of context.getStore()?.docs?.values()||[])if(d.table===table)all.set(d.id,d.data)
  return [...all.values()].filter(Boolean).map(clone)
 }
 function flush(){
  const ctx=context.getStore();if(!ctx)return
  if(ctx.closed)return
  if(ctx.poisoned){ctx.rows.clear();ctx.docs.clear();return}
  const dirty=[...ctx.rows].filter(([,v])=>v.dirty),docs=[...ctx.docs.values()].filter(v=>v.dirty);if(!dirty.length&&!docs.length)return
  db.transaction(()=>{
   if(db.prepare('SELECT 1 FROM rpg_unified_commands WHERE id=? AND phase=?').get(ctx.id,ctx.phase))fail('Perintah RPG sudah diproses.')
   for(const [id,v]of dirty){if(readSql(id)!==v.before)fail('Progres berubah; tidak ada perubahan parsial.');validate(v.data)}
   for(const d of docs)if(docSql(d.table,d.id)!==d.before)fail('Data guild/job berubah; transaksi dibatalkan.')
   for(const [id,v]of dirty){db.prepare('INSERT INTO rpg_users(jid,data) VALUES(?,?) ON CONFLICT(jid) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(v.data));ensureAliases(id)}
   for(const d of docs){if(d.data===null)db.prepare('DELETE FROM '+d.table+' WHERE id=?').run(d.id);else db.prepare('INSERT INTO '+d.table+' VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(d.id,JSON.stringify(d.data))}
   db.prepare('INSERT INTO rpg_unified_commands VALUES(?,?,?)').run(ctx.id,ctx.phase,Date.now())
  })()
  ctx.rows.clear();ctx.docs.clear();ctx.phase++
 }
 async function command(id,task){
  const active=context.getStore()
  if(active&&!active.closed)return task()
  if(active?.closed)return context.run(null,()=>command(id,task))
  if(!id)fail('ID pesan diperlukan untuk transaksi RPG.')
  const key=hash(id)
  if(db.prepare('SELECT 1 FROM rpg_unified_commands WHERE id=?').get(key))return {success:true,duplicate:true}
  const ctx={id:key,phase:0,rows:new Map(),docs:new Map(),closed:false}
  return context.run(ctx,async()=>{try{const result=await task();if(ctx.poisoned)return {success:false};flush();return result}finally{ctx.closed=true;ctx.rows.clear();ctx.docs.clear()}})
 }
 function mutate(id,p,value,remove=false){const row=read(id);assign(row,p,value,remove);write(id,row)}
 // Deep objects are refreshed from the unit of work. Array methods receive their proxy.
 function view(id,p){
  const initial=at(read(id),p),target=Array.isArray(initial)?[]:{};let proxy
  proxy=new Proxy(target,{...structure,
   get(t,k){const v=at(read(id),p);if(k==='toJSON')return()=>clone(at(read(id),p));if(k===Symbol.iterator&&Array.isArray(v))return function*(){for(let i=0;i<(at(read(id),p)||[]).length;i++)yield proxy[i]};const x=v?.[k];if(typeof x==='function')return x.bind(proxy);return x&&typeof x==='object'?view(id,[...p,k]):x},
   set(t,k,v){mutate(id,[...p,k],v);return true},deleteProperty(t,k){mutate(id,[...p,k],undefined,true);return true},
   ownKeys(){return Reflect.ownKeys(at(read(id),p)||target)},
   getOwnPropertyDescriptor(t,k){if(Array.isArray(target)&&k==='length')return {value:(at(read(id),p)||[]).length,writable:true,enumerable:false,configurable:false};return {value:at(read(id),[...p,k]),writable:true,enumerable:true,configurable:true}},
   has(t,k){return k in (at(read(id),p)||{})}
  });return proxy
 }
 function heldView(value){
  if(!value||typeof value!=='object')return value
  return new Proxy(value,{...structure,get(t,k){return heldView(t[k])},set(){fail('Identitas RPG belum terverifikasi.')},deleteProperty(){fail('Identitas RPG belum terverifikasi.')}})
 }
 function userProxy(key){
  if(proxies.has(key))return proxies.get(key)
  const target=raw[key];if(!target||typeof target!=='object')return target
  const proxy=new Proxy(target,{...structure,
   get(t,k){
    const id=identity(key)
    if(k==='__unifiedRpg')return !!id
    if(k==='toJSON')return()=>id&&readSql(id)&&db.prepare('SELECT 1 FROM rpg_unified_aliases WHERE alias=?').get(key)?{...Object.fromEntries(Object.entries(t).filter(([k])=>!ownedField(k))),__rpgUnifiedCurrency:id}:clone(t)
    if(typeof k!=='string'||!ownedField(k))return t[k]
    if(!id)return heldView(t[k])
    const row=read(id);if(k==='level')return Math.floor(row.exp/10000)+1
    const p=fieldPath(k),v=at(row,p)
    return v&&typeof v==='object'?view(id,p):v===undefined?(k==='pet'?null:k==='pets'||k==='petStorage'?[]:k==='inventory'?view(id,['inventory']):0):v
   },
   set(t,k,v){
    if(typeof k!=='string'||!ownedField(k)){safePath([k]);t[k]=v;return true}
    const id=identity(key);if(!id)fail('Identitas RPG belum terverifikasi. Kirim perintah melalui akun WhatsApp asli.')
    if(k==='level'){if(v!==Math.floor(read(id).exp/10000)+1)fail('Level dihitung otomatis dari EXP.');return true}
    mutate(id,fieldPath(k),v);return true
   },
   has(t,k){return (identity(key)&&typeof k==='string'&&ownedField(k))||k in t},
   deleteProperty(t,k){if(typeof k==='string'&&ownedField(k))fail('Progres RPG tidak dapat dihapus melalui alias legacy.');return delete t[k]}
  });proxies.set(key,proxy);return proxy
 }
 function migrate(extraLinks=[]){
  if(db.prepare('SELECT 1 FROM rpg_unified_aliases a LEFT JOIN rpg_users u ON u.jid=a.canonical WHERE u.jid IS NULL LIMIT 1').get())fail('Database authority hilang; pemulihan diperlukan.')
  const trusted=new Map([...links,...extraLinks].map(x=>[x.alias,pn(x.canonical)]).filter(([a,c])=>/^\d+@lid$/.test(a)&&c))
  for(const a of db.prepare('SELECT alias,canonical FROM rpg_unified_aliases').all())trusted.set(a.alias,a.canonical)
  const groups=new Map(),held=[]
  for(const [source,u]of Object.entries(raw)){
   if(!source.endsWith('@s.whatsapp.net')&&!source.endsWith('@lid'))continue
   if(db.prepare('SELECT 1 FROM rpg_unified_sources WHERE source=?').get(source))continue
   if(u?.__rpgUnifiedCurrency){
    const a=db.prepare('SELECT canonical FROM rpg_unified_aliases WHERE alias=?').get(source)
    if(!a||a.canonical!==u.__rpgUnifiedCurrency||!readSql(a.canonical))fail('Database authority hilang; jangan membuat progres pengganti.')
    continue
   }
   const id=pn(source)||trusted.get(source)
   if(!id){held.push({source,reason:'unverified-lid'});continue}
   if(!groups.has(id))groups.set(id,[]);groups.get(id).push({source,u})
  }
  let imported=0,credited=0
  db.transaction(()=>{
   for(const [id,records]of groups){
    const components=records.map(({u})=>['money','balance','koin'].map(k=>u?.[k]===undefined?0:u[k]))
    if(records.some(({u})=>!u||typeof u!=='object'||Array.isArray(u)||u.__rpgUnifiedCurrency)||components.some(c=>c.some(v=>!valid(v))||!valid(c.reduce((a,b)=>a+b,0)))||new Set(components.map(JSON.stringify)).size>1){blocked.add(id);for(const r of records)held.push({source:r.source,reason:'ambiguous-or-invalid-source'});continue}
    const prior=db.prepare('SELECT components FROM rpg_unified_sources WHERE canonical=? LIMIT 1').get(id)
    if(prior&&prior.components!==JSON.stringify(components[0])&&components[0].some(Boolean)){for(const r of records){blockedSources.add(r.source);held.push({source:r.source,reason:'late-alias-currency-conflict'})}continue}
    const credit=prior?0:components[0].reduce((a,b)=>a+b,0),hadCanonical=!!readSql(id),row=read(id),sourcedStats=new Set();let sourcedRpg=false
    const history=db.prepare('SELECT data FROM rpg_unified_sources WHERE canonical=?').all(id).map(r=>parse(r.data))
    const maxExp=list=>Math.max(0,...list.map(u=>valid(u.exp)?u.exp:0))
    const incoming=records.map(r=>r.u)
    row.exp=prior?row.exp+Math.max(0,maxExp(incoming)-maxExp(history)):Math.max(row.exp,maxExp(incoming))
    const itemCounts=list=>{const counts={};for(const u of list){const items={};for(const k of ITEMS)if(valid(u[k]))items[k]=u[k];if(Array.isArray(u.inventory)){for(const label of u.inventory){const k='legacy_'+hash(JSON.stringify(label)).slice(0,16);items[k]=(items[k]||0)+1}}else if(u.inventory&&typeof u.inventory==='object'){for(const [k,v]of Object.entries(u.inventory)){safePath([k]);if(!valid(v))fail('Inventory sumber invalid.');items[k]=Math.max(items[k]||0,v)}}for(const [k,v]of Object.entries(items))counts[k]=Math.max(counts[k]||0,v)}return counts}
    const oldItems=itemCounts(history),newItems=itemCounts(incoming)
    row.koin+=credit;row.inventory=row.inventory||{};row.rpg=row.rpg||{};row.legacy=row.legacy||{}
    const collection=u=>{const arrays=[u.petStorage,u.pets,u.rpg?.petStorage].filter(Array.isArray);const list=clone(arrays.sort((a,b)=>b.length-a.length)[0]||[]);const pet=u.pet||u.rpg?.pet;if(pet&&!list.some(p=>p.id&&p.id===pet.id||p.type===pet.type&&p.name===pet.name))list.push(clone(pet));return list}
    let pets=collection(row)
    const existingPets=pets.length>0
    const oldPetCollections=history.map(collection).filter(v=>v.length)
    if(prior)for(const u of incoming){const c=collection(u);if(c.length&&!oldPetCollections.some(old=>JSON.stringify(old)===JSON.stringify(c)))row.legacy.petReview=true}
    const mergeProgress=(a,b)=>{
     if(b===undefined)return a
     if(typeof b==='number'&&valid(b))return Math.max(valid(a)?a:0,b)
     if(Array.isArray(b))return [...new Map([...(Array.isArray(a)?a:[]),...b].map(x=>[JSON.stringify(x),clone(x)])).values()]
     if(b&&typeof b==='object'){const result=a&&typeof a==='object'&&!Array.isArray(a)?clone(a):{};for(const [k,v]of Object.entries(b)){safePath([k]);result[k]=mergeProgress(result[k],v)}return result}
     return a===undefined?clone(b):a
    }
    for(const {u}of records){
     if(u.exp!==undefined&&!valid(u.exp))fail('EXP sumber tidak valid; migrasi dibatalkan.')
     for(const field of ['rpg','quest','cooldowns'])if(!prior&&(!hadCanonical||field!=='rpg')&&u[field]&&typeof u[field]==='object'&&!Array.isArray(u[field])){
      if(field==='rpg'&&!sourcedRpg){row.rpg={...row.rpg,...clone(u.rpg)};sourcedRpg=true}else row[field]=mergeProgress(row[field],u[field])
      if(field==='rpg')for(const f of Object.values(stats))if(valid(u.rpg[f]))sourcedStats.add(f)
     }

     for(const k of Object.keys(u)){
      if(ITEMS.has(k))continue
      else if(!prior&&!hadCanonical&&k in stats&&valid(u[k])){const f=stats[k];row.rpg[f]=sourcedStats.has(f)?Math.max(row.rpg[f]||0,u[k]):u[k];sourcedStats.add(f)}
      else if(((!prior&&auxiliary.has(k))||/^last[A-Za-z_]/.test(k))&&valid(u[k]))row.legacy[k]=Math.max(row.legacy[k]||0,u[k])
     }
     const candidate=collection(u)
     if(!prior&&!existingPets&&candidate.length>pets.length)pets=candidate
    }
    for(const [k,v]of Object.entries(newItems))row.inventory[k]=prior?(row.inventory[k]||0)+Math.max(0,v-(oldItems[k]||0)):Math.max(row.inventory[k]||0,v)
    row.rpg.pet=row.rpg.pet||pets[0]||null;row.rpg.petStorage=pets
    validate(row);db.prepare('INSERT INTO rpg_users(jid,data) VALUES(?,?) ON CONFLICT(jid) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(row))
    for(const {source,u}of records){db.prepare('INSERT INTO rpg_unified_sources VALUES(?,?,?,?,?)').run(source,id,JSON.stringify(u),JSON.stringify(components[0]),Date.now());db.prepare('INSERT OR REPLACE INTO rpg_unified_aliases VALUES(?,?,?)').run(source,id,source.endsWith('@lid')?'trusted-whatsapp-mapping':'phone-jid');imported++}
    credited+=credit
   }
   db.prepare("INSERT OR REPLACE INTO rpg_unified_meta VALUES('active','1')").run()
  })()
  return {imported,credited,held:held.length,heldReasons:held.reduce((r,x)=>(r[x.reason]=(r[x.reason]||0)+1,r),{})}
 }
 function bind(keys){
  const ids=[...new Set(keys.map(pn).filter(Boolean))];if(ids.length!==1)return null
  const id=ids[0],newLinks=keys.filter(k=>/^\d+@lid$/.test(k)).map(alias=>({alias,canonical:id}))
  for(const {alias}of newLinks){const existing=db.prepare('SELECT canonical FROM rpg_unified_aliases WHERE alias=?').get(alias);if(existing&&existing.canonical!==id)fail('Konflik identitas; akun tidak digabung.')}
  if(keys.some(k=>!db.prepare('SELECT 1 FROM rpg_unified_aliases WHERE alias=?').get(k)))migrate(newLinks)
  if(blocked.has(id)||keys.some(k=>blockedSources.has(k)))fail('Identitas RPG memiliki konflik saldo yang belum diselesaikan.')
  if(!readSql(id))db.prepare('INSERT INTO rpg_users VALUES(?,?)').run(id,JSON.stringify(base(id)))
  for(const key of keys){if(!raw[key])raw[key]={};if(!db.prepare('SELECT 1 FROM rpg_unified_sources WHERE source=?').get(key)&&Object.keys(raw[key]).some(k=>ownedField(k)&&raw[key][k]))continue;db.prepare('INSERT OR IGNORE INTO rpg_unified_aliases VALUES(?,?,?)').run(key,id,'trusted-message-identity')}
  const profile=Object.assign({},...keys.map(k=>raw[k]||{}).sort((a,b)=>Number(!!a.registered)-Number(!!b.registered)))
  for(const key of keys){raw[key]={...profile,...Object.fromEntries(Object.entries(raw[key]||{}).filter(([k])=>ownedField(k)))};proxies.delete(key)}
  return userProxy(keys[0])
 }
 const exposed=new Proxy(raw,{...structure,
  get(t,k){if(k==='toJSON')return()=>Object.fromEntries(Object.keys(raw).map(k=>[k,userProxy(k)?.toJSON?.()||raw[k]]));return typeof k==='string'?userProxy(k):t[k]},
  set(t,k,v){safePath([k]);remember(k);if(t[k]&&identity(k)&&v!==t[k]){for(const [f,x]of Object.entries(v||{}))if(!ownedField(f)){safePath([f]);t[k][f]=x}}else t[k]=v;proxies.delete(k);return true},
  deleteProperty(t,k){if(identity(k))fail('Akun RPG harus dihapus lewat prosedur owner.');return delete t[k]}
 })
 function status(){return {active:true,canonicalUsers:db.prepare('SELECT count(*) n FROM rpg_users').get().n,sourceRecords:db.prepare('SELECT count(*) n FROM rpg_unified_sources').get().n,verifiedAliases:db.prepare('SELECT count(*) n FROM rpg_unified_aliases').get().n,heldRecords:Object.keys(raw).filter(k=>/@(lid|s\.whatsapp\.net)$/.test(k)&&!db.prepare('SELECT 1 FROM rpg_unified_aliases WHERE alias=?').get(k)).length,pendingPetReviews:db.prepare("SELECT count(*) n FROM rpg_users WHERE json_extract(data,'$.legacy.petReview')=1").get().n,currencyRule:'RPG-only 1:1; duplicate aliases counted once',expRule:'highest verified cumulative EXP; level = floor(EXP/10000)+1',walletAndTradingIncluded:false}}
 function scheduleReward(id,delay,rewards,notification={}){
  const key=hash(id);if(document('rpg_unified_jobs',key))return
  if(!valid(delay)||delay>7*86400000)fail('Jeda hadiah tidak valid.')
  const converted=rewards.map(r=>{const canonical=identity(r.jid);if(!canonical||!valid(r.koin||0)||!valid(r.exp||0))fail('Hadiah atau identitas belum valid.');return {canonical,koin:r.koin||0,exp:r.exp||0}})
  document('rpg_unified_jobs',key,{id:key,due:Date.now()+delay,status:'pending',rewards:converted,notification})
 }
 function settleRewards(now=Date.now()){
  return direct(()=>db.transaction(()=>{
   const jobs=db.prepare("SELECT id,data FROM rpg_unified_jobs WHERE json_extract(data,'$.status')='pending' AND json_extract(data,'$.due')<=? LIMIT 32").all(now)
   for(const row of jobs){const j=parse(row.data);for(const r of j.rewards){const u=read(r.canonical);u.koin+=r.koin;u.exp+=r.exp;write(r.canonical,u)}j.status='done';j.completed=now;document('rpg_unified_jobs',row.id,j)}
   return jobs.length
  })())
 }
 function allUsers(){const all=new Map(db.prepare('SELECT jid,data FROM rpg_users').all().map(r=>[r.jid,parse(r.data)]));for(const [id,row]of context.getStore()?.rows||[])all.set(id,row.data);return [...all.values()].map(clone)}
 function direct(task){flush();return context.run(null,task)}
 return {users:exposed,identity,read,write,patch,allUsers,flush,command,migrate,bind,status,direct,reject:fail,document,documents,scheduleReward,settleRewards}
}
