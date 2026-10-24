import { unifiedRpg } from '../rpg/unified-store.js'
import crypto from 'node:crypto'
import {CLASSES,NPCS,MONSTERS,SHOP,PETS,QUEST,WORLD,EXP_PER_LEVEL,canWalk,REGIONS,PORTALS,DUNGEON,ROYAL_QUEST,COMBAT,NPC_DIALOGUE} from './catalog.js'
export class RealmError extends Error { constructor(message,status=400){super(message);this.status=status} }
const fail=(s,status)=>{throw new RealmError(s,status)}
const digest=s=>crypto.createHash('sha256').update(String(s)).digest('hex')
const integer=(n,min=0,max=1000000000)=>Number.isSafeInteger(n)&&n>=min&&n<=max
const copy=o=>JSON.parse(JSON.stringify(o))
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
const cleanName=s=>typeof s==='string' && /^[a-z][a-z0-9 _-]{2,19}$/i.test(s) && (s.match(/\d/g)||[]).length<7
export const publicText=s=>String(s||'').replace(/(?:\+?\d[\s().-]*){7,}/g,'[nomor disembunyikan]').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,240)
export const SCHEMA=`
CREATE TABLE IF NOT EXISTS rpg_users(jid TEXT PRIMARY KEY,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS realm_accounts(id TEXT PRIMARY KEY,jid TEXT NOT NULL UNIQUE,name TEXT NOT NULL COLLATE NOCASE UNIQUE,created INTEGER NOT NULL,muted_until INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS realm_codes(hash TEXT PRIMARY KEY,jid TEXT NOT NULL UNIQUE,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS realm_web_links(subject TEXT PRIMARY KEY,jid TEXT NOT NULL UNIQUE,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS realm_sessions(hash TEXT PRIMARY KEY,account TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS realm_sessions_account ON realm_sessions(account);
CREATE TABLE IF NOT EXISTS realm_actions(account TEXT NOT NULL,request TEXT NOT NULL,fingerprint TEXT NOT NULL,result TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(account,request));
CREATE TABLE IF NOT EXISTS realm_chat(id INTEGER PRIMARY KEY AUTOINCREMENT,account TEXT NOT NULL,channel TEXT NOT NULL,map TEXT NOT NULL,text TEXT NOT NULL,created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS realm_chat_channel ON realm_chat(channel,id);
CREATE TABLE IF NOT EXISTS realm_blocks(account TEXT NOT NULL,target TEXT NOT NULL,PRIMARY KEY(account,target));
CREATE TABLE IF NOT EXISTS realm_reports(id INTEGER PRIMARY KEY AUTOINCREMENT,account TEXT NOT NULL,message INTEGER NOT NULL,reason TEXT NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS realm_audit(id INTEGER PRIMARY KEY AUTOINCREMENT,account TEXT NOT NULL,kind TEXT NOT NULL,detail TEXT NOT NULL,created INTEGER NOT NULL);
`
// Receives the existing SQLite connection and RPG getUser/saveUser adapter.
// All mutations are synchronous inside ONE SQLite transaction; no second player DB.
export function createRealmService({db,getUser,saveUser,now=Date.now,randomInt=crypto.randomInt}) {
 db.exec(SCHEMA)
 const canonicalJid=jid=>unifiedRpg()?(unifiedRpg().identity(jid)||fail('Identitas WhatsApp belum terverifikasi.',409)):String(jid).split('@')[0]
 const presence=new Map()
 function account(id){return db.prepare('SELECT * FROM realm_accounts WHERE id=?').get(id)||fail('Akun tidak ditemukan.',401)}
 function ensureAccount(jid){
  let a=db.prepare('SELECT * FROM realm_accounts WHERE jid=?').get(jid)
  if(!a){const id=crypto.randomUUID();db.prepare('INSERT INTO realm_accounts(id,jid,name,created) VALUES(?,?,?,?)').run(id,jid,'Adventurer-'+id.slice(0,6),now());a=account(id)}
  return a
 }
 function load(a){
  const u=getUser(a.jid)
  if(!u.rpg)u.rpg={};if(!u.inventory)u.inventory={};if(!u.quest)u.quest={}
  if(!u.rpg.realm)u.rpg.realm={version:1,class:null,x:30,y:56,quest:{accepted:false,kills:0,claimed:false},tokens:0,gear:{},encounter:null,lastMove:0,lastTurn:0,lastHeal:0,lastEncounter:0,summons:[]}
  if(!REGIONS[u.rpg.realm.region])u.rpg.realm.region='greenleaf'
  if(!u.rpg.realm.royalQuest)u.rpg.realm.royalQuest={accepted:false,kills:0,claimed:false}
  return u
 }
 function petDto(p){return p?{type:String(p.type||'cat'),name:publicText(p.name||'Pet'),level:Number(p.level)||1,exp:Number(p.exp)||0,hunger:Number(p.hunger)||0,rarity:String(p.rarity||'Companion'),stats:{attack:Number(p.stats?.attack)||3,defense:Number(p.stats?.defense)||0}}:null}
 function view(a,u=load(a)){
  const r=u.rpg.realm, inventory={}
  for(const [key,value] of Object.entries(u.inventory||{}))if(/^[a-z_]{2,32}$/.test(key)&&Number.isSafeInteger(value)&&value>0)inventory[key]=value
  return {id:a.id,name:a.name,class:r.class,level:u.level,exp:u.exp,nextExp:(Math.floor(u.exp/EXP_PER_LEVEL)+1)*EXP_PER_LEVEL,gold:u.koin,hp:u.rpg.health,maxHp:u.rpg.maxHealth,mp:u.rpg.mana,maxMp:u.rpg.maxMana,attack:u.rpg.attack,defense:u.rpg.defense,inventory,position:{x:r.x,y:r.y,region:r.region,map:r.region==='greenleaf'?(r.x<WORLD.forestX?'village':'forest'):r.region},quest:copy(r.quest),royalQuest:copy(r.royalQuest),dungeon:r.dungeon?{stage:r.dungeon.stage,rewardClaimed:r.dungeon.rewardClaimed,nextEntryAt:(r.lastDungeonReward||0)+DUNGEON.cooldown}:null,dailyQuests:Object.fromEntries(Object.entries(u.quest||{}).filter(([k])=>/^[a-z]+\d?$/.test(k)).map(([k,v])=>[k,{progress:Number(v.progress)||0,claimed:!!v.claimed}])),tokens:r.tokens,gear:copy(r.gear),encounter:r.encounter?copy(r.encounter):null,pet:petDto(u.rpg.pet),pets:(u.rpg.petStorage||[]).map(petDto),summons:copy(r.summons||[]),revision:r.version,serverTime:now(),combatReadyAt:(r.lastTurn||0)+COMBAT.playerCooldownMs,encounterReadyAt:(r.lastEncounter||0)+COMBAT.respawnMs,respawnUntil:copy(r.respawnUntil||{}),combatEvent:r.combatEvent?copy(r.combatEvent):null}
 }
 function audit(a,kind,detail){db.prepare('INSERT INTO realm_audit(account,kind,detail,created) VALUES(?,?,?,?)').run(a.id,kind,JSON.stringify(detail),now())}
 function award(u,exp,gold){
  const previous=Math.floor(u.exp/EXP_PER_LEVEL)+1
  u.exp=Math.min(9000000000,u.exp+exp);u.koin+=gold;u.level=Math.floor(u.exp/EXP_PER_LEVEL)+1;u.rpg.level=u.level
  if(u.level>previous){u.rpg.maxHealth=100+(u.level-1)*10;u.rpg.maxMana=100+(u.level-1)*5;u.rpg.maxStamina=100+(u.level-1)*5;u.rpg.health=u.rpg.maxHealth;u.rpg.mana=u.rpg.maxMana;u.rpg.stamina=u.rpg.maxStamina}
 }
 function near(r,id){const npc=NPCS.find(n=>(n.id===id||n.service===id)&&(n.region||'greenleaf')===r.region);if(!npc||distance(r,npc)>COMBAT.npcRange)fail('Dekati NPC terlebih dahulu.');if(r.encounter)fail('Selesaikan pertarungan dulu.')}
 const issueCode=db.transaction(jid=>{
  if(!/^\d{7,25}(?:@s\.whatsapp\.net|@lid)?$/.test(jid))fail('Identitas bot tidak valid.')
  jid=canonicalJid(jid)
  const code=crypto.randomBytes(6).toString('hex').toUpperCase(),expires=now()+5*60000
  db.prepare('DELETE FROM realm_codes WHERE jid=? OR expires<?').run(jid,now())
  db.prepare('INSERT INTO realm_codes VALUES(?,?,?)').run(digest(code),jid,expires)
  return {code,expires}
 })
 function validCode(code){
  if(typeof code!=='string'||! /^[A-Fa-f0-9]{12}$/.test(code))fail('Kode salah atau sudah kedaluwarsa.',401)
  const row=db.prepare('SELECT * FROM realm_codes WHERE hash=? AND expires>?').get(digest(code.toUpperCase()),now())
  if(!row)fail('Kode salah atau sudah kedaluwarsa.',401)
  return row
 }
 function openSession(jid){
  const a=ensureAccount(canonicalJid(jid)),u=load(a);saveUser(a.jid,u)
  const token=crypto.randomBytes(32).toString('base64url'),expires=now()+7*86400000
  db.prepare('DELETE FROM realm_sessions WHERE expires<?').run(now())
  db.prepare('INSERT INTO realm_sessions VALUES(?,?,?)').run(digest(token),a.id,expires)
  audit(a,'login',{});return {token,expires,state:view(a,u)}
 }
 const redeem=db.transaction(code=>{
  const row=validCode(code)
  db.prepare('DELETE FROM realm_codes WHERE hash=?').run(row.hash)
  return openSession(row.jid)
 })
 // subject must come ONLY from server-side website token verification.
 const loginWithPlatform=db.transaction((subject,code)=>{
  if(typeof subject!=='string'||!/^[a-zA-Z0-9_-]{8,128}$/.test(subject))fail('Identitas akun tidak valid.',401)
  const linked=db.prepare('SELECT jid FROM realm_web_links WHERE subject=?').get(subject)
  if(code){
   const row=validCode(code),other=db.prepare('SELECT subject FROM realm_web_links WHERE jid=?').get(row.jid)
   if((linked&&linked.jid!==row.jid)||(other&&other.subject!==subject))fail('Akun sudah ditautkan ke akun lain. Cabut tautan lama melalui perintah realms putus dari WhatsApp pemilik.',409)
   const result=redeem(code)
   db.prepare('INSERT OR IGNORE INTO realm_web_links VALUES(?,?,?)').run(subject,row.jid,now())
   return result
  }
  if(!linked)fail('Token valid, tetapi akun belum ditautkan. Isi kode dari {prefix}realms login sekali untuk menyambungkan progres WhatsApp.',409)
  return openSession(linked.jid)
 })
 function authenticate(token){const s=db.prepare('SELECT account FROM realm_sessions WHERE hash=? AND expires>?').get(digest(token||''),now());if(!s)fail('Masuk dengan kode WhatsApp terlebih dahulu.',401);return account(s.account)}
 function logout(token){db.prepare('DELETE FROM realm_sessions WHERE hash=?').run(digest(token||''))}
 function revoke(jid){const a=db.prepare('SELECT * FROM realm_accounts WHERE jid=?').get(canonicalJid(jid));if(a){db.prepare('DELETE FROM realm_sessions WHERE account=?').run(a.id);presence.delete(a.id)}db.prepare('DELETE FROM realm_codes WHERE jid=?').run(canonicalJid(jid));db.prepare('DELETE FROM realm_web_links WHERE jid=?').run(canonicalJid(jid))}
 function snapshot(id){const a=account(id);return view(a)}
 function eligibleMonster(r,type){
  const mob=Object.prototype.hasOwnProperty.call(MONSTERS,type)?MONSTERS[type]:null
  return mob&&(mob.region||'greenleaf')===r.region&&(r.region!=='greenleaf'||r.x>=WORLD.forestX)&&!(r.respawnUntil?.[type]>now())&&(r.region!=='dungeon'||(r.dungeon&&!r.dungeon.rewardClaimed&&DUNGEON.sequence[r.dungeon.stage]===type))&&(!mob.boss||r.quest.claimed)
 }
 function startEncounter(r,type){const mob=MONSTERS[type];r.encounter={id:crypto.randomUUID(),type,hp:mob.hp,maxHp:mob.hp,turn:0,phase:1,nextEnemyAttackAt:now()+COMBAT.enemyIntervalMs,enemyTurns:0};r.lastEncounter=now()}
 // Called under the gameplay gate; persisted nextEnemyAttackAt deduplicates tabs/SSE.
 // At most one hit per tick: no offline catch-up burst, no rewards from this timer.
 const advance=db.transaction(id=>{
  const a=account(id),u=load(a),r=u.rpg.realm,e=r.encounter
  if(!e)return view(a,u)
  const mob=Object.prototype.hasOwnProperty.call(MONSTERS,e.type)?MONSTERS[e.type]:null
  if(!mob||!Number.isFinite(e.hp)||e.hp<=0||(mob.region||'greenleaf')!==r.region){r.encounter=null;r.version++;saveUser(a.jid,u);return view(a,u)}
  if(!Number.isFinite(e.nextEnemyAttackAt)){e.nextEnemyAttackAt=now()+COMBAT.enemyIntervalMs;r.version++;saveUser(a.jid,u);return view(a,u)}
  if(now()<e.nextEnemyAttackAt)return view(a,u)
  const cls=CLASSES[r.class]||{defense:0},armor=SHOP[r.gear?.armor]
  const incoming=Math.max(1,mob.attack+(e.phase===2?7:0)-(Number(u.rpg.defense)||0)-cls.defense-(armor?.defense||0))
  u.rpg.health=Math.max(0,u.rpg.health-incoming);e.enemyTurns=(e.enemyTurns||0)+1;e.nextEnemyAttackAt=now()+COMBAT.enemyIntervalMs
  r.combatEvent={id:crypto.randomUUID(),at:now(),type:e.type,incoming,defeat:u.rpg.health===0}
  if(u.rpg.health===0){r.encounter=null;r.region='greenleaf';r.x=40;r.y=45}
  r.version++;saveUser(a.jid,u);return view(a,u)
 })

 const act=db.transaction((id,input)=>{
  const a=account(id)
  if(!input||typeof input!=='object'||Array.isArray(input))fail('Payload tidak valid.')
  const allowed=['id','op','direction','class','name','target','item','quantity','index']
  if(Object.keys(input).some(k=>!allowed.includes(k)))fail('Field aksi tidak diizinkan.')
  for(const k of ['op','direction','class','name','target','item'])if(k in input&&typeof input[k]!=='string')fail('Tipe field aksi tidak valid.')
  if(typeof input.id!=='string'||! /^[a-zA-Z0-9_-]{12,80}$/.test(input.id))fail('Idempotency key diperlukan.')
  const fingerprint=digest(JSON.stringify(input)),old=db.prepare('SELECT fingerprint,result FROM realm_actions WHERE account=? AND request=?').get(id,input.id)
  if(old){if(old.fingerprint!==fingerprint)fail('Request ID sudah digunakan untuk aksi lain.',409);return {...JSON.parse(old.result),state:view(a),replayed:true}}
  const u=load(a),r=u.rpg.realm;let message='',effect=null,dialogue=null
  if(input.op!=='create'&&!r.class)fail('Pilih class dan nama karakter dulu.')
  if(input.op==='create'){
   if(r.class)fail('Karakter sudah dibuat.',409)
   if(!Object.hasOwnProperty.call(CLASSES,input.class)||!cleanName(input.name))fail('Nama 3–20 karakter, diawali huruf; jangan gunakan nomor telepon.')
   if(db.prepare('SELECT id FROM realm_accounts WHERE name=? AND id<>?').get(input.name,id))fail('Nama sudah digunakan.',409)
   db.prepare('UPDATE realm_accounts SET name=? WHERE id=?').run(input.name,id);a.name=input.name;r.class=input.class
   // No gold overwrite or migration; a one-time non-saleable starter potion grant.
   u.inventory.potion=(u.inventory.potion||0)+2;r.tokens=1;r.gear={};message='Selamat datang. Temui Elder Rowan di plaza.'
  }else if(input.op==='move'){
   if(r.encounter)fail('Selesaikan pertarungan sebelum bergerak.')
   if(now()-r.lastMove<140)fail('Gerakan terlalu cepat.',429)
   const dirs={n:[0,-3],s:[0,3],e:[3,0],w:[-3,0]};const d=dirs[input.direction];if(!d)fail('Arah tidak valid.')
   const nx=Math.max(WORLD.minX,Math.min(WORLD.maxX,r.x+d[0])),ny=Math.max(WORLD.minY,Math.min(WORLD.maxY,r.y+d[1]));if(!canWalk(nx,ny,r.region))fail('Jalur terhalang. Ikuti plaza dan jalan hutan.');r.x=nx;r.y=ny;r.lastMove=now()
   if(u.rpg.health>0&&now()-r.lastEncounter>=COMBAT.respawnMs){const hostile=Object.entries(MONSTERS).find(([id,m])=>id!=='slime'&&eligibleMonster(r,id)&&distance(r,m)<=COMBAT.aggroRange);if(hostile){startEncounter(r,hostile[0]);message=hostile[1].name+' menyerang!'}}
  }else if(input.op==='travel'){
   if(r.encounter)fail('Tidak bisa berpindah lokasi saat bertarung.')
   const portal=PORTALS.find(p=>p.id===input.target&&p.region===r.region)
   if(!portal||distance(r,portal)>12)fail('Dekati gerbang lokasi yang benar terlebih dahulu.')
   if(portal.to==='dungeon'){
    if(!r.quest.claimed)fail('Selesaikan Cahaya di Greenleaf sebelum membuka Hollow Crypt.')
    if(u.rpg.health<=0)fail('Pulihkan HP sebelum masuk dungeon.')
    if(!r.dungeon||r.dungeon.rewardClaimed){
     if(r.lastDungeonReward&&now()-r.lastDungeonReward<DUNGEON.cooldown)fail('Dungeon tersedia kembali 10 menit setelah klaim terakhir.',429)
     r.dungeon={id:crypto.randomUUID(),stage:0,rewardClaimed:false,enteredAt:now()}
    }
   }
   r.region=portal.to;r.x=portal.spawn.x;r.y=portal.spawn.y;message='Tiba di '+REGIONS[r.region].name+'.'
  }else if(input.op==='talk'){
   const npc=NPCS.find(n=>n.id===input.target&&(n.region||'greenleaf')===r.region);if(!npc)fail('NPC tidak tersedia di lokasi ini.')
   near(r,npc.id);const service=npc.service||npc.id;dialogue={id:npc.id,name:npc.name,role:npc.role,service,text:NPC_DIALOGUE[service]||'Selamat datang, petualang.'};message=npc.name+': '+dialogue.text
  }else if(input.op==='royal-accept'){
   near(r,'royal');if(r.royalQuest.accepted)fail('Komisi kerajaan sudah diambil.');r.royalQuest.accepted=true;message='Kalahkan 2 Briar Wolf di Greenleaf, lalu laporkan kepada Captain Edrin.'
  }else if(input.op==='royal-claim'){
   near(r,'royal');if(!r.royalQuest.accepted||r.royalQuest.kills<ROYAL_QUEST.target||r.royalQuest.claimed)fail('Komisi belum selesai atau hadiah sudah diambil.')
   r.royalQuest.claimed=true;r.tokens+=ROYAL_QUEST.tokens;award(u,ROYAL_QUEST.exp,ROYAL_QUEST.gold);message='Komisi selesai: +600 koin, +400 EXP, +1 summon token.'
  }else if(input.op==='dungeon-claim'){
   if(r.region!=='dungeon'||!r.dungeon||r.dungeon.stage!==DUNGEON.sequence.length||r.dungeon.rewardClaimed||r.encounter)fail('Selesaikan seluruh encounter dungeon terlebih dahulu.')
   if(distance(r,MONSTERS.hollowking)>13)fail('Dekati peti di altar boss.')
   r.dungeon.rewardClaimed=true;r.lastDungeonReward=now();r.tokens+=DUNGEON.reward.tokens;award(u,DUNGEON.reward.exp,DUNGEON.reward.gold);message='Hollow Crypt selesai: +1000 koin, +500 EXP, +1 summon token.'
  }else if(input.op==='quest-accept'){
   near(r,'elder');if(r.quest.accepted)fail('Quest sudah diambil.');r.quest.accepted=true;message=QUEST.description
  }else if(input.op==='quest-claim'){
   near(r,'elder');if(!r.quest.accepted||r.quest.kills<QUEST.target||r.quest.claimed)fail('Objective belum selesai atau hadiah sudah diambil.')
   r.quest.claimed=true;r.tokens+=QUEST.tokens;award(u,QUEST.exp,QUEST.gold);message=`Quest selesai: +${QUEST.exp} EXP, +${QUEST.gold} koin, +1 summon token.`
  }else if(input.op==='encounter'){
   const mob=Object.prototype.hasOwnProperty.call(MONSTERS,input.target)?MONSTERS[input.target]:null;if(!mob||(mob.region||'greenleaf')!==r.region||distance(r,mob)>COMBAT.encounterRange||(r.region==='greenleaf'&&r.x<WORLD.forestX))fail('Dekati monster di lokasi yang sesuai.')
   if(r.region==='dungeon'&&(!r.dungeon||r.dungeon.rewardClaimed||DUNGEON.sequence[r.dungeon.stage]!==input.target))fail('Selesaikan encounter dungeon sesuai urutan; hadiah tidak dapat diulang.')
   if(r.encounter)fail('Masih ada pertarungan aktif.');if(u.rpg.health<=0)fail('Pulihkan HP di desa dulu.');if(now()-r.lastEncounter<COMBAT.respawnMs)fail('Tunggu sebentar sebelum encounter berikutnya.',429)
   if(mob.boss&&!r.quest.claimed)fail('Selesaikan quest Cahaya di Greenleaf sebelum menantang sentinel.')
   if(r.respawnUntil?.[input.target]>now())fail('Monster sedang respawn. Tunggu sebentar.',429)
   startEncounter(r,input.target);message=`${mob.name} menghadang!`
  }else if(['attack','skill','flee'].includes(input.op)){
   const encounter=r.encounter;if(!encounter)fail('Tidak ada pertarungan aktif.')
   if(input.target!==encounter.id)fail('Pertarungan sudah berubah. Muat ulang state.',409)
   if(now()-r.lastTurn<COMBAT.playerCooldownMs)fail('Tunggu giliran berikutnya.',429);r.lastTurn=now()
   if(input.op==='flee'){r.encounter=null;r.region='greenleaf';r.x=48;r.y=50;message='Berhasil kembali ke batas desa.'}
   else {
    const mob=MONSTERS[encounter.type],c=CLASSES[r.class],crit=randomInt(100)<(r.class==='archer'?25:10)
    if(input.op==='skill'&&u.rpg.mana<c.mana)fail('Mana tidak cukup.')
    if(input.op==='skill'&&encounter.skillTurn!==undefined&&encounter.turn-encounter.skillTurn<2)fail('Skill cooldown: lakukan basic attack dahulu.')
    if(input.op==='skill'){u.rpg.mana-=c.mana;encounter.skillTurn=encounter.turn}
    const gear=SHOP[r.gear.weapon],armor=SHOP[r.gear.armor]
    const pet=u.rpg.pet&&u.rpg.pet.hunger>0?Math.min(12,Math.floor((u.rpg.pet.stats?.attack||3)/2)):0
    const attack=Math.max(1,u.rpg.attack+(gear?.attack||0))
    const damage=Math.max(2,Math.floor(attack*(input.op==='skill'?c.multiplier:1)*(crit?1.5:1))+pet-mob.defense)
    encounter.hp=Math.max(0,encounter.hp-damage);encounter.turn++;effect={damage,crit,pet,skill:input.op==='skill'}
    if(encounter.hp===0){
     award(u,mob.exp,mob.gold);u.inventory[mob.loot]=(u.inventory[mob.loot]||0)+1
     if(r.region==='dungeon'&&DUNGEON.sequence[r.dungeon.stage]===encounter.type)r.dungeon.stage++
     if(encounter.type==='wolf'&&r.royalQuest.accepted&&!r.royalQuest.claimed)r.royalQuest.kills=Math.min(ROYAL_QUEST.target,r.royalQuest.kills+1)
     if(encounter.type==='slime'&&r.quest.accepted&&!r.quest.claimed)r.quest.kills=Math.min(QUEST.target,r.quest.kills+1)
     if(u.quest.hunt5&&!u.quest.hunt5.claimed)u.quest.hunt5.progress=(u.quest.hunt5.progress||0)+1
     if(u.rpg.pet){const p=u.rpg.pet;p.exp=(p.exp||0)+15;p.hunger=Math.max(0,(p.hunger||0)-1);if(p.exp>=p.level*100){p.exp-=p.level*100;p.level++;if(!p.stats)p.stats={attack:3,defense:2,luck:3};p.stats.attack+=2;p.stats.defense++}}
     u.rpg.stats=u.rpg.stats||{};u.rpg.stats.battle=(u.rpg.stats.battle||0)+1
     if(!r.respawnUntil)r.respawnUntil={};r.respawnUntil[encounter.type]=now()+COMBAT.respawnMs;r.lastEncounter=now()
     message=`${mob.name} dikalahkan · +${mob.exp} EXP · +${mob.gold} koin · ${mob.loot} +1`;r.encounter=null;effect.victory=true
    }else{
     encounter.phase=mob.boss&&encounter.hp<mob.hp/2?2:1
     message=`${damage} damage${crit?' · critical':''}. Monster menyiapkan serangan berikutnya.`
    }
   }
  }else if(input.op==='heal'){
   near(r,'healer');if(now()-r.lastHeal<30000)fail('Pemulihan tersedia setiap 30 detik.',429)
   u.rpg.health=u.rpg.maxHealth;u.rpg.mana=u.rpg.maxMana;r.lastHeal=now();message='HP dan mana dipulihkan.'
  }else if(['buy','sell','equip','unequip','use'].includes(input.op)){
   const item=Object.prototype.hasOwnProperty.call(SHOP,input.item)?SHOP[input.item]:null;if(!item)fail('Item tidak tersedia di layanan ini.')
   const q=input.quantity===undefined?1:input.quantity;if(!integer(q,1,99))fail('Jumlah harus bilangan bulat 1–99.')
   const stock=u.inventory[input.item]||0
   if(input.op==='buy'||input.op==='sell'){
    near(r,'merchant')
    if(input.op==='buy'){if(!item.buy||u.koin<item.buy*q)fail('Koin kurang atau item tidak dijual.');u.koin-=item.buy*q;u.inventory[input.item]=stock+q;message=`Membeli ${q} ${item.name}.`}
    else{if(!item.sell||stock<q||Object.values(r.gear).includes(input.item))fail('Item tidak dapat dijual, sedang dipakai, atau stok kurang.');u.inventory[input.item]=stock-q;u.koin+=item.sell*q;message=`Menjual ${q} ${item.name}.`}
   }else if(input.op==='equip'){if(!stock||!['weapon','armor'].includes(item.kind))fail('Equipment tidak dimiliki.');r.gear[item.kind]=input.item;message=`${item.name} dipakai.`}
   else if(input.op==='unequip'){delete r.gear[item.kind];message='Equipment dilepas.'}
   else{if(!stock||!['potion','mpotion'].includes(input.item))fail('Potion tidak dimiliki.');const field=input.item==='potion'?'health':'mana',max=input.item==='potion'?'maxHealth':'maxMana';if(u.rpg[field]>=u.rpg[max])fail('Status sudah penuh.');u.inventory[input.item]--;u.rpg[field]=Math.min(u.rpg[max],u.rpg[field]+45);message=`${item.name} digunakan.`}
  }else if(input.op==='summon'){
   near(r,'petkeeper');if(r.tokens<1)fail('Butuh 1 summon token. Selesaikan quest untuk mendapatkannya.');if((u.rpg.petStorage||[]).length>=50)fail('Pet storage penuh.')
   let roll=randomInt(100),species=PETS[0];for(const p of PETS){if(roll<p.weight){species=p;break}roll-=p.weight}
   r.tokens--;const p={type:species.type,name:species.name,rarity:species.rarity,level:1,exp:0,hunger:80,stats:copy(species.stats)}
   if(!u.rpg.pet)u.rpg.pet=p;else{if(!u.rpg.petStorage)u.rpg.petStorage=[];u.rpg.petStorage.push(p)}
   r.summons=[{type:p.type,name:p.name,rarity:p.rarity,at:now()},...(r.summons||[])].slice(0,50);message=`Summon: ${p.name} · ${p.rarity}`;effect={summon:p.type}
  }else if(input.op==='pet-select'){
   if(r.encounter)fail('Tidak bisa mengganti pet saat bertarung.');const list=u.rpg.petStorage||[];if(!integer(input.index,0,list.length-1))fail('Pet tidak ditemukan.')
   const selected=list.splice(input.index,1)[0];if(u.rpg.pet)list.push(u.rpg.pet);u.rpg.pet=selected;message=`${selected.name} sekarang mengikuti kamu.`
  }else fail('Aksi tidak dikenal.')
  r.version++;saveUser(a.jid,u)
  const result={state:view(a,u),message,effect,...(dialogue?{dialogue}:{})}
  // Movement is rate-limited but not an economy receipt. Still recorded for replay safety.
  db.prepare('INSERT INTO realm_actions VALUES(?,?,?,?,?)').run(id,input.id,fingerprint,JSON.stringify(input.op==='move'?{message:''}:result),now())
  if(input.op!=='move')audit(a,input.op,{message,gold:u.koin,exp:u.exp})
  return result
 })
 function room(id){const r=load(account(id)).rpg.realm;return r.region==='dungeon'?'dungeon:'+r.dungeon?.id:r.region==='greenleaf'?(r.x<WORLD.forestX?'village':'forest'):r.region}
 function touch(id){presence.set(id,now())}
 function online(id){const self=snapshot(id),list=[];for(const [pid,last]of presence){if(now()-last>20000){presence.delete(pid);continue}const p=snapshot(pid);if(p.class&&room(pid)===room(id))list.push({id:p.id,name:p.name,class:p.class,position:p.position,pet:p.pet?{type:p.pet.type,name:p.pet.name}:null})}return list.slice(0,100)}
 function chatHistory(id,{after=0,before=0,channel='global'}={}){
  if(!['global','local'].includes(channel))fail('Channel belum tersedia.')
  if(!integer(Number(after),0,Number.MAX_SAFE_INTEGER)||!integer(Number(before),0,Number.MAX_SAFE_INTEGER))fail('Cursor tidak valid.')
  const state=snapshot(id)
  const rows=db.prepare(`SELECT c.id,c.account AS playerId,a.name,c.text,c.channel,c.created FROM realm_chat c JOIN realm_accounts a ON a.id=c.account WHERE c.channel=? AND (?='global' OR c.map=?) AND c.id>? AND (?=0 OR c.id<?) AND c.created>? AND NOT EXISTS(SELECT 1 FROM realm_blocks b WHERE b.account=? AND b.target=c.account) ORDER BY c.id DESC LIMIT 50`).all(channel,channel,room(id),Number(after),Number(before),Number(before),now()-7*86400000,id)
  return rows.reverse()
 }
 const chat=db.transaction((id,input)=>{
  const a=account(id),state=snapshot(id);if(!state.class)fail('Buat karakter dahulu.');if(a.muted_until>now())fail('Chat sedang dibatasi moderator.',403)
  if(!input||!['global','local'].includes(input.channel)||typeof input.text!=='string'||input.text.length>240||!input.text.trim())fail('Pesan 1–240 karakter diperlukan.')
  const last=db.prepare('SELECT created FROM realm_chat WHERE account=? ORDER BY id DESC LIMIT 1').get(id);if(last&&now()-last.created<1500)fail('Jeda chat minimal 1,5 detik.',429)
  const text=publicText(input.text.trim());db.prepare('INSERT INTO realm_chat(account,channel,map,text,created) VALUES(?,?,?,?,?)').run(id,input.channel,room(id),text,now());db.prepare('DELETE FROM realm_chat WHERE created<?').run(now()-7*86400000)
  return {ok:true}
 })
 function block(id,target){if(typeof target!=='string'||! /^[a-f0-9-]{36}$/.test(target))fail('Player ID tidak valid.');if(id===target)fail('Tidak bisa block diri sendiri.');account(target);db.prepare('INSERT OR IGNORE INTO realm_blocks VALUES(?,?)').run(id,target);return {ok:true}}
 function report(id,message,reason){if(!integer(message,1)||!db.prepare('SELECT id FROM realm_chat WHERE id=?').get(message))fail('Pesan tidak ditemukan.');const visible=['global','local'].some(channel=>chatHistory(id,{channel,before:message+1}).some(m=>m.id===message));if(!visible)fail('Pesan tidak dapat diakses.',403);db.prepare('INSERT INTO realm_reports(account,message,reason,created) VALUES(?,?,?,?)').run(id,message,publicText(reason),now());return {ok:true}}
 function leaderboard(){return db.prepare('SELECT id,name,jid FROM realm_accounts LIMIT 1000').all().map(a=>{const u=load(a);return{id:a.id,name:a.name,level:u.level,exp:u.exp}}).sort((a,b)=>b.exp-a.exp).slice(0,50)}
 function botState(jid){const a=db.prepare('SELECT * FROM realm_accounts WHERE jid=?').get(canonicalJid(jid));return a?view(a):null}
 function botAction(jid,input){const a=db.prepare('SELECT * FROM realm_accounts WHERE jid=?').get(canonicalJid(jid));if(!a)fail('Masuk website dengan kode terlebih dahulu.');return act(a.id,input)}
 const api={issueCode,redeem,loginWithPlatform,authenticate,logout,revoke,snapshot,advance,act,touch,online,chatHistory,chat,block,report,leaderboard,botState,botAction}
 // Existing synchronous SQLite transactions must retain player+receipt atomicity.
 return Object.fromEntries(Object.entries(api).map(([name,fn])=>[name,(...args)=>unifiedRpg()?unifiedRpg().direct(()=>fn(...args)):fn(...args)]))
}
