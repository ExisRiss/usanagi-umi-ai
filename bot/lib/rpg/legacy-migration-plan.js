// Safe planning/rehearsal only. Does NOT enable legacy commands to spend a second wallet.
import crypto from 'node:crypto'
export const hashLegacy=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const amount=v=>v===undefined?0:Number.isSafeInteger(v)&&v>=0?v:null
const table=(db,name)=>Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name))
const current=(db,id)=>table(db,'rpg_users')?db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(id)?.data||null:null
export function planLegacyCurrency(db,users){
 const entries=[],seen=new Map(),hasReceipts=table(db,'rpg_legacy_currency_receipts')
 for(const [source,user]of Object.entries(users||{})){
  const match=source.match(/^(\d{7,15})(?::\d+)?@s\.whatsapp\.net$/)
  if(match){if(!seen.has(match[1]))seen.set(match[1],[]);seen.get(match[1]).push(source)}
  if(!user||typeof user!=='object'||Array.isArray(user)){entries.push({source,status:'held',reason:'invalid-record'});continue}
  if(source.endsWith('@lid')){entries.push({source,status:'held',reason:'unverified-lid',sourceHash:hashLegacy(user)});continue}
  if(!match){entries.push({source,status:'excluded',reason:'not-a-personal-pn-record'});continue}
  const canonical=match[1]
  if(hasReceipts&&db.prepare('SELECT 1 FROM rpg_legacy_currency_receipts WHERE source=?').get(source)){entries.push({source,canonical,status:'already-imported'});continue}
  if(hasReceipts&&db.prepare('SELECT 1 FROM rpg_legacy_currency_receipts WHERE canonical=?').get(canonical)){entries.push({source,canonical,status:'held',reason:'canonical-already-imported'});continue}
  const values=['money','balance','koin'].map(k=>amount(user[k]))
  if(values.includes(null)||!Number.isSafeInteger(values.reduce((a,b)=>a+b,0))){entries.push({source,canonical,status:'held',reason:'invalid-currency'});continue}
  if(user.__rpgUnifiedCurrency){entries.push({source,canonical,status:'held',reason:'marker-without-receipt'});continue}
  const before=current(db,canonical);let saved
  try{saved=before?JSON.parse(before):{}}catch{entries.push({source,canonical,status:'held',reason:'invalid-canonical-json'});continue}
  if(!saved||typeof saved!=='object'||Array.isArray(saved)){entries.push({source,canonical,status:'held',reason:'invalid-canonical-record'});continue}
  if(amount(saved.koin)===null||!Number.isSafeInteger((saved.koin||0)+values.reduce((a,b)=>a+b,0))){entries.push({source,canonical,status:'held',reason:'invalid-canonical-currency'});continue}
  const entry={source,canonical,status:'eligible',credit:values.reduce((a,b)=>a+b,0),components:Object.fromEntries(['money','balance','koin'].map((k,i)=>[k,values[i]])),sourceHash:hashLegacy(user),sourceData:user,beforeHash:hashLegacy(before)}
  entries.push(entry)
 }
 for(const e of entries)if(e.status==='eligible'&&seen.get(e.canonical).length>1){e.status='held';e.reason='ambiguous-duplicate-pn'}
 const summary={records:entries.length,eligible:0,held:0,excluded:0,alreadyImported:0,totalCredit:0,currencyRule:'money + balance_RPG + koin -> koin, 1:1',walletAndTradingIncluded:false}
 for(const e of entries){if(e.status==='eligible'){summary.eligible++;summary.totalCredit+=e.credit}else if(e.status==='held')summary.held++;else if(e.status==='excluded')summary.excluded++;else summary.alreadyImported++}
 if(!Number.isSafeInteger(summary.totalCredit))throw Error('Aggregate exceeds safe integer range')
 return{version:1,summary,entries}
}
export function rehearseLegacyCurrency(db,plan,{stagingOnly=false}={}){
 if(!stagingOnly)throw Error('Rehearsal requires an isolated staging database; live adapter is not enabled by this tool')
 db.exec('CREATE TABLE IF NOT EXISTS rpg_users(jid TEXT PRIMARY KEY,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS rpg_legacy_currency_receipts(source TEXT PRIMARY KEY,canonical TEXT NOT NULL,credit INTEGER NOT NULL,source_hash TEXT NOT NULL,source_json TEXT NOT NULL,created INTEGER NOT NULL);')
 return db.transaction(()=>{
  let count=0,credit=0
  for(const e of plan.entries.filter(e=>e.status==='eligible')){
   if(db.prepare('SELECT 1 FROM rpg_legacy_currency_receipts WHERE source=?').get(e.source))continue
   const before=current(db,e.canonical)
   if(hashLegacy(before)!==e.beforeHash||hashLegacy(e.sourceData)!==e.sourceHash)throw Error('Source or canonical data drift; no partial migration')
   const user=before?JSON.parse(before):{jid:e.canonical,koin:0,exp:0,level:1,inventory:{},rpg:{}}
   user.koin=(user.koin||0)+e.credit
   // Original full record retained privately; no guessed EXP/item/pet conversion.
   db.prepare('INSERT INTO rpg_users VALUES(?,?) ON CONFLICT(jid) DO UPDATE SET data=excluded.data').run(e.canonical,JSON.stringify(user))
   db.prepare('INSERT INTO rpg_legacy_currency_receipts VALUES(?,?,?,?,?,?)').run(e.source,e.canonical,e.credit,e.sourceHash,JSON.stringify(e.sourceData),Date.now())
   count++;credit+=e.credit
  }
  return{imported:count,credited:credit,stagingOnly:true}
 })()
}

// Owner-only DTO: never return source records, identities or per-user balances.
export function summarizeLegacyCurrency(db, users) {
 if (!users || typeof users !== 'object' || Array.isArray(users)) throw Error('Legacy users unavailable')
 const plan = planLegacyCurrency(db, users)
 const heldReasons = {}
 for (const entry of plan.entries) if (entry.status === 'held') heldReasons[entry.reason] = (heldReasons[entry.reason] || 0) + 1
 return { ...plan.summary, heldReasons, stage: 'audit-only', currencyConversionApplied: false, legacySpendAdapterEnabled: false, progressUnificationComplete: false }
}
