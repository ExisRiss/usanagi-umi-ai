import test from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'
import {planLegacyCurrency,rehearseLegacyCurrency} from '../lib/rpg/legacy-migration-plan.js'
test('planner is read-only, excludes channels and holds unverified LIDs',()=>{
 const db=new Database(':memory:');try{const p=planLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:10,balance:20,koin:30},'22222222@lid':{money:10},'33333333@newsletter':{money:100}});assert.equal(p.summary.totalCredit,60);assert.equal(p.summary.held,1);assert.equal(p.summary.excluded,1);assert.equal(db.prepare('SELECT count(*) n FROM sqlite_master').get().n,0)}finally{db.close()}
})
test('1:1 rehearsal is idempotent, keeps existing coins and records original source',()=>{
 const db=new Database(':memory:');try{db.exec('CREATE TABLE rpg_users(jid TEXT PRIMARY KEY,data TEXT)');db.prepare('INSERT INTO rpg_users VALUES(?,?)').run('11111111',JSON.stringify({koin:5,inventory:{wood:2}}));const user={money:10,balance:20,koin:30,bank:999};const plan=planLegacyCurrency(db,{'11111111@s.whatsapp.net':user});assert.throws(()=>rehearseLegacyCurrency(db,plan));assert.equal(rehearseLegacyCurrency(db,plan,{stagingOnly:true}).credited,60);const saved=JSON.parse(db.prepare('SELECT data FROM rpg_users').get().data);assert.equal(saved.koin,65);assert.equal(saved.inventory.wood,2);assert.equal(JSON.parse(db.prepare('SELECT source_json FROM rpg_legacy_currency_receipts').get().source_json).bank,999);assert.equal(rehearseLegacyCurrency(db,plan,{stagingOnly:true}).credited,0)}finally{db.close()}
})
test('invalid values, overflow, duplicated PN and missing-receipt markers are held',()=>{
 const db=new Database(':memory:');try{const p=planLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:3},'11111111:2@s.whatsapp.net':{money:3},'22222222@s.whatsapp.net':{money:-1},'33333333@s.whatsapp.net':{money:'99'},'44444444@s.whatsapp.net':{money:Number.MAX_SAFE_INTEGER,balance:1},'55555555@s.whatsapp.net':{money:10,__rpgUnifiedCurrency:1}});assert.equal(p.summary.held,6);assert.equal(p.summary.totalCredit,0)}finally{db.close()}
})
test('drift aborts the transaction without partial currency or receipts',()=>{
 const db=new Database(':memory:');try{const p=planLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:10},'22222222@s.whatsapp.net':{money:20}});p.entries[1].sourceData.money=21;assert.throws(()=>rehearseLegacyCurrency(db,p,{stagingOnly:true}),/drift/);assert.equal(db.prepare('SELECT count(*) n FROM rpg_users').get().n,0);assert.equal(db.prepare('SELECT count(*) n FROM rpg_legacy_currency_receipts').get().n,0)}finally{db.close()}
})

test('invalid aliases still prevent crediting the valid duplicate PN',()=>{
 for(const invalid of [{money:-1},null,[]]){
  const db=new Database(':memory:');try{const p=planLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:3},'11111111:2@s.whatsapp.net':invalid});assert.equal(p.summary.eligible,0);assert.equal(p.summary.held,2)}finally{db.close()}
 }
})
test('new device alias cannot re-credit a previously imported canonical identity',()=>{
 const db=new Database(':memory:');try{
  rehearseLegacyCurrency(db,planLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:8}}),{stagingOnly:true})
  const p=planLegacyCurrency(db,{'11111111:2@s.whatsapp.net':{money:8}})
  assert.equal(p.summary.eligible,0);assert.equal(p.entries[0].reason,'canonical-already-imported')
 }finally{db.close()}
})
test('non-object canonical JSON is held without coercing balances',()=>{
 const db=new Database(':memory:');try{db.exec('CREATE TABLE rpg_users(jid TEXT PRIMARY KEY,data TEXT)');for(const value of ['null','[]','42','"bad"']){
  db.prepare('INSERT OR REPLACE INTO rpg_users VALUES(?,?)').run('11111111',value)
  const p=planLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:8}});assert.equal(p.summary.eligible,0);assert.equal(p.summary.held,1)
 }}finally{db.close()}
})
test('owner summary has no source identity or private record and performs no writes',async()=>{
 const {summarizeLegacyCurrency}=await import('../lib/rpg/legacy-migration-plan.js')
 const db=new Database(':memory:');try{
  const report=summarizeLegacyCurrency(db,{'11111111@s.whatsapp.net':{money:9,name:'Private Person'},'22222222@lid':{money:3}})
  assert.equal(report.totalCredit,9);assert.equal(report.heldReasons['unverified-lid'],1)
  assert.equal(report.currencyConversionApplied,false);assert.equal(report.progressUnificationComplete,false)
  assert.doesNotMatch(JSON.stringify(report),/11111111|22222222|Private Person|sourceData|sourceHash/)
  assert.equal(db.prepare('SELECT count(*) n FROM sqlite_master').get().n,0)
  assert.throws(()=>summarizeLegacyCurrency(db,null),/unavailable/)
 }finally{db.close()}
})
test('owner audit route is behind the existing owner-ticket verification',async()=>{
 const {readFileSync}=await import('node:fs');const src=readFileSync(new URL('../lib/jadibot-platform-api.js',import.meta.url),'utf8')
 const route=src.slice(src.indexOf('async function routeOwnerConsole('),src.indexOf('// The Website platform validates'))
 assert.ok(route.indexOf('verifyOwnerConsoleTicket(req)')<route.indexOf("pathname === '/api/owner-console/rpg-unification'"))
 assert.match(route,/summarizeLegacyCurrency\(getDb\(\), users\)/)
})
