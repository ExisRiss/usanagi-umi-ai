import test from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
const A='111111111@s.whatsapp.net',B='222222222@s.whatsapp.net',L='999999999@lid'
function fixture(users,links=[]){const db=new Database(':memory:');const store=createUnifiedStore({db,users,links});return {db,store,close(){db.close();delete globalThis[UNIFIED_RPG]}}}
test('1:1 aliases credited once; untrusted LID held; original source retained',()=>{
 const f=fixture({[A]:{money:10,balance:20,koin:30,exp:100,wood:2},'111111111:2@s.whatsapp.net':{money:10,balance:20,koin:30,exp:120,wood:3},[L]:{money:50}})
 try{const r=f.store.migrate();assert.equal(r.imported,2);assert.equal(r.credited,60);assert.equal(r.held,1);const u=f.store.read('111111111');assert.equal(u.koin,60);assert.equal(u.exp,120);assert.equal(u.inventory.wood,3);assert.equal(f.db.prepare('SELECT count(*) n FROM rpg_unified_sources').get().n,2);assert.equal(f.store.migrate().credited,0)}finally{f.close()}
})
test('invalid or conflicting aliases cannot spend an empty replacement balance',()=>{
 const f=fixture({[A]:{money:10},'111111111:2@s.whatsapp.net':{money:11}})
 try{assert.equal(f.store.migrate().held,2);assert.equal(f.store.identity(A),'');assert.throws(()=>{f.store.users[A].money=0},/terverifikasi/);assert.equal(f.db.prepare('SELECT count(*) n FROM rpg_users').get().n,0)}finally{f.close()}
})
test('legacy money/balance/koin and native SQLite writes share one live amount',()=>{
 const f=fixture({[A]:{money:12}});try{f.store.migrate();const u=f.store.users[A];u.balance+=3;assert.equal(u.money,15);const n=f.store.read('111111111');n.koin+=5;f.store.write('111111111',n);assert.equal(u.koin,20);assert.equal(u.money,20)}finally{f.close()}
})
test('two-user mutation is atomic; replay cannot credit twice',async()=>{
 const f=fixture({[A]:{money:100},[B]:{money:0}});try{f.store.migrate();const a=f.store.users[A],b=f.store.users[B];await f.store.command('transfer-1',()=>{a.money-=20;b.balance+=20});assert.equal(a.koin,80);assert.equal(b.koin,20);const replay=await f.store.command('transfer-1',()=>{a.money-=20;b.balance+=20});assert.equal(replay.duplicate,true);assert.equal(b.money,20);await assert.rejects(f.store.command('transfer-bad',()=>{a.money-=10;b.balance=-1}),/negatif/);assert.equal(a.money,80);assert.equal(b.money,20)}finally{f.close()}
})
test('source drift aborts all staged writes, preserving the concurrent change',async()=>{
 const f=fixture({[A]:{money:100},[B]:{money:0}});try{f.store.migrate();await assert.rejects(f.store.command('drift',async()=>{f.store.users[A].money-=20;f.store.users[B].money+=20;const changed=f.store.read('111111111');changed.koin=150;f.db.prepare('UPDATE rpg_users SET data=? WHERE jid=?').run(JSON.stringify(changed),'111111111')}),/parsial/);assert.equal(f.store.users[A].money,150);assert.equal(f.store.users[B].money,0)}finally{f.close()}
})
test('flat items, inventory and pets share canonical state without deleting source fields',()=>{
 const pet={name:'Mochi',type:'cat',level:2,exp:5,hunger:80};const f=fixture({[A]:{wood:3,pet}});try{f.store.migrate();const u=f.store.users[A];u.wood+=2;assert.equal(u.inventory.wood,5);u.inventory.wood-=1;assert.equal(u.wood,4);u.pet.exp+=2;assert.equal(f.store.read('111111111').rpg.pet.exp,7);u.petStorage.push({name:'Kumo',type:'dog'});assert.equal(u.petStorage.length,2);assert.throws(()=>{u.inventory.wood=-1});assert.equal(u.wood,4);assert.equal(JSON.parse(f.db.prepare('SELECT data FROM rpg_unified_sources').get().data).pet.exp,5)}finally{f.close()}
})
test('JSON compatibility snapshot carries a marker, not a second spendable balance',()=>{
 const f=fixture({[A]:{money:10,registered:true,exp:3}});try{f.store.migrate();f.store.users[A].money=30;const saved=JSON.parse(JSON.stringify(f.store.users));assert.equal(saved[A].money,undefined);assert.equal(saved[A].__rpgUnifiedCurrency,'111111111');const resumed=createUnifiedStore({db:f.db,users:saved});assert.equal(resumed.migrate().credited,0);assert.equal(resumed.users[A].balance,30);assert.equal(resumed.users[A].registered,true)}finally{f.close()}
})
test('trusted identity binds a held LID on demand without duplicating balance',()=>{
 const f=fixture({[A]:{money:5,exp:10},[L]:{money:5,exp:20}});try{f.store.migrate();assert.equal(f.store.identity(L),'');f.store.bind([L,A]);assert.equal(f.store.identity(L),'111111111');assert.equal(f.store.users[L].money,5);assert.equal(f.store.users[A].exp,20);assert.throws(()=>f.store.bind([L,B]),/Konflik/)}finally{f.close()}
})
test('unverified identity never becomes a numeric PN implicitly',()=>{
 const f=fixture({[L]:{money:99}});try{f.store.migrate();assert.equal(f.store.identity(L),'');assert.throws(()=>{f.store.users[L].money-=1},/terverifikasi/);assert.equal(f.store.users[L].money,99)}finally{f.close()}
})
test('EXP is cumulative, level derived; no legacy level-up loop',async()=>{
 const f=fixture({[A]:{exp:9999}});try{f.store.migrate();globalThis[UNIFIED_RPG]=f.store;const {canLevelUp,xpRange}=await import('../lib/levelling.js');const u=f.store.users[A];u.exp++;assert.equal(u.level,2);assert.equal(canLevelUp(u.level,u.exp),false);assert.deepEqual(xpRange(2),{min:10000,max:20000,xp:10000});assert.throws(()=>{u.level++},/otomatis/)}finally{f.close()}
})
test('failure after commit-before-send cannot replay committed reward',async()=>{
 const f=fixture({[A]:{money:0}});try{f.store.migrate();await assert.rejects(f.store.command('send-failure',()=>{f.store.users[A].money+=9;f.store.flush();throw Error('network failure')}));assert.equal(f.store.users[A].money,9);assert.equal((await f.store.command('send-failure',()=>{f.store.users[A].money+=9})).duplicate,true);assert.equal(f.store.users[A].money,9)}finally{f.close()}
})
test('missing authority cannot be recovered from zeroed compatibility markers',()=>{
 const f=fixture({[A]:{__rpgUnifiedCurrency:'111111111'}});try{assert.throws(()=>f.store.migrate(),/authority hilang/)}finally{f.close()}
})

test('caught validation failure cannot commit a partially debited transfer',async()=>{
 const f=fixture({[A]:{money:100},[B]:{money:0}});try{f.store.migrate();const result=await f.store.command('caught',()=>{try{f.store.users[A].money-=10;f.store.users[B].money=-1}catch{f.store.flush()}});assert.equal(result.success,false);assert.equal(f.store.users[A].money,100);assert.equal(f.store.users[B].money,0)}finally{f.close()}
})
test('later verified duplicate cannot replenish consumed inventory or discard new EXP',()=>{
 const f=fixture({[A]:{wood:5,exp:100},[L]:{wood:5,exp:100}});try{f.store.migrate();f.store.users[A].wood=0;f.store.users[A].exp+=20;f.store.bind([L,A]);assert.equal(f.store.users[A].wood,0);assert.equal(f.store.users[A].exp,120)}finally{f.close()}
})
test('later source high-water delta preserves post-migration gameplay',()=>{
 const f=fixture({[A]:{wood:5,exp:100},[L]:{wood:7,exp:150}});try{f.store.migrate();f.store.users[A].wood=0;f.store.users[A].exp+=20;f.store.bind([L,A]);assert.equal(f.store.users[A].wood,2);assert.equal(f.store.users[A].exp,170)}finally{f.close()}
})
test('nested RPG state is the same object graph as flat legacy pet and health aliases',()=>{
 const f=fixture({[A]:{pet:{name:'Mochi',type:'cat',exp:3}}});try{f.store.migrate();f.store.users[A].rpg.pet.exp+=5;assert.equal(f.store.users[A].pet.exp,8);f.store.users[A].health=70;assert.equal(f.store.users[A].rpg.health,70)}finally{f.close()}
})
test('identical pets legitimately present twice in one collection are not deleted',()=>{
 const p={name:'Mochi',type:'cat',exp:3};const f=fixture({[A]:{pet:p,petStorage:[p,p]}});try{f.store.migrate();assert.equal(f.store.users[A].petStorage.length,2)}finally{f.close()}
})
test('pending rewards and payment share one commit and survive reconstruction',async()=>{
 const users={[A]:{money:100},[B]:{money:0}},f=fixture(users);try{f.store.migrate();await f.store.command('start-job',()=>{f.store.users[A].money-=20;f.store.scheduleReward('reward-one',1000,[{jid:A,koin:15,exp:5},{jid:B,koin:10}])});assert.equal(f.store.users[A].money,80);const reopened=createUnifiedStore({db:f.db,users:JSON.parse(JSON.stringify(f.store.users))});reopened.migrate();assert.equal(reopened.settleRewards(Date.now()+2000),1);assert.equal(reopened.users[A].money,95);assert.equal(reopened.users[B].money,10);assert.equal(reopened.settleRewards(Date.now()+3000),0)}finally{f.close()}
})
test('failed scheduled action persists neither payment nor reward',async()=>{
 const f=fixture({[A]:{money:100}});try{f.store.migrate();await assert.rejects(f.store.command('failed-job',()=>{f.store.users[A].money-=20;f.store.scheduleReward('cancelled',1000,[{jid:A,koin:15}]);throw Error('failure')}));assert.equal(f.store.users[A].money,100);assert.equal(f.store.documents('rpg_unified_jobs').length,0)}finally{f.close()}
})
test('unverified nested inventory cannot be mutated through an object reference',()=>{
 const f=fixture({[L]:{inventory:{wood:5},rpg:{health:30}}});try{f.store.migrate();assert.throws(()=>{f.store.users[L].inventory.wood++},/terverifikasi/);assert.throws(()=>{f.store.users[L].rpg.health=100},/terverifikasi/)}finally{f.close()}
})
test('guild document and currency debit roll back together',async()=>{
 const f=fixture({[A]:{money:100}});try{f.store.migrate();await assert.rejects(f.store.command('guild-failure',()=>{f.store.users[A].money-=20;f.store.document('rpg_guilds','guild-test',{name:'Test',treasury:0});throw Error('failure')}));assert.equal(f.store.users[A].money,100);assert.equal(f.store.document('rpg_guilds','guild-test'),null)}finally{f.close()}
})

test('late conflicting currency quarantines only the new alias',()=>{
 const f=fixture({[A]:{money:10},[L]:{money:11}});try{f.store.migrate();f.store.users[A].money=7;assert.throws(()=>f.store.bind([L,A]),/konflik/);assert.equal(f.store.identity(A),'111111111');assert.equal(f.store.users[A].money,7);assert.equal(f.store.identity(L),'');assert.equal(f.store.status().heldRecords,1)}finally{f.close()}
})
test('late different pets are held for review without replacing the current collection',()=>{
 const f=fixture({[A]:{pet:{name:'Mochi',type:'cat'}},[L]:{pet:{name:'Kumo',type:'dog'}}});try{f.store.migrate();f.store.bind([L,A]);assert.equal(f.store.users[A].petStorage.length,1);assert.equal(f.store.users[A].petStorage[0].name,'Mochi');assert.equal(f.store.status().heldRecords,0);assert.equal(f.store.status().pendingPetReviews,1)}finally{f.close()}
})
test('initial low health is not healed by defaults, including nested native shape',()=>{
 const f=fixture({[A]:{health:25},[B]:{rpg:{health:23}}});try{f.store.migrate();assert.equal(f.store.users[A].health,25);assert.equal(f.store.users[B].health,23)}finally{f.close()}
})
test('prototype and property-definition bypasses cannot mutate held or canonical state',()=>{
 const f=fixture({[A]:{money:10},[L]:{pet:{name:'Mochi'}}});try{f.store.migrate();assert.throws(()=>Object.defineProperty(f.store.users[A],'money',{value:999}));assert.throws(()=>Object.setPrototypeOf(f.store.users[A].inventory,{wood:99}));assert.throws(()=>Object.defineProperty(f.store.users[L].pet,'name',{value:'Lost'}));assert.throws(()=>Object.defineProperty(f.store.users,A,{value:{}}));assert.equal(f.store.users[A].money,10);assert.equal(f.store.users[L].pet.name,'Mochi')}finally{f.close()}
})
test('caught serialization failure cannot commit an earlier debit',async()=>{
 const f=fixture({[A]:{money:100}});try{f.store.migrate();await f.store.command('caught-serialization',()=>{f.store.users[A].money-=20;const circular={};circular.self=circular;try{f.store.users[A].quest=circular}catch{}});assert.equal(f.store.users[A].money,100)}finally{f.close()}
})
