import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import http from 'node:http'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
import {getUser,saveUser} from '../lib/rpg/awang-db.js'
import {createRealmService} from '../lib/realms/service.js'
import {createRealmHttp} from '../lib/realms/http.js'
import {NPCS,COMBAT} from '../lib/realms/catalog.js'
let serial=0
function fixture(){
 const jid='9900099'+String(++serial).padStart(7,'0');let now=Date.now()+100000
 const options={db:getDb(),getUser,saveUser,now:()=>now,randomInt:()=>50},service=createRealmService(options)
 const login=service.redeem(service.issueCode(jid).code),id=login.state.id
 const act=(op,rest={})=>service.act(id,{id:crypto.randomUUID(),op,...rest})
 act('create',{name:'Combat '+serial,class:'warrior'})
 const mutate=fn=>{const u=getUser(jid);fn(u,u.rpg.realm);saveUser(jid,u)}
 const position=(x,y,region='greenleaf')=>mutate((u,r)=>{r.x=x;r.y=y;r.region=region})
 const encounter=()=>{position(62,48);return act('encounter',{target:'slime'}).state.encounter}
 return{jid,id,token:login.token,service,options,act,mutate,position,encounter,tick:ms=>now+=ms}
}
test('idle monster attacks on server time without any player attack request',()=>{const f=fixture();f.encounter();const hp=f.service.snapshot(f.id).hp;f.tick(COMBAT.enemyIntervalMs-1);assert.equal(f.service.advance(f.id).hp,hp);f.tick(1);const s=f.service.advance(f.id);assert(s.hp<hp);assert(s.combatEvent.incoming>0);assert.equal(s.encounter.turn,0);assert.equal(s.encounter.enemyTurns,1)})
test('repeated updates and independent service instances cannot multiply one enemy hit',()=>{const f=fixture();f.encounter();f.tick(2200);const first=f.service.advance(f.id),second=createRealmService(f.options);for(let i=0;i<30;i++)assert.equal(second.advance(f.id).hp,first.hp);assert.equal(second.snapshot(f.id).encounter.enemyTurns,1)})
test('long offline interval applies at most one hit, not an accumulated burst',()=>{const f=fixture();f.encounter();f.tick(86400000);const s=f.service.advance(f.id);assert.equal(s.encounter.enemyTurns,1);assert(s.hp>0);assert.equal(f.service.advance(f.id).hp,s.hp)})
test('legacy encounter initializes its timer with a full grace period',()=>{const f=fixture();f.encounter();f.mutate((u,r)=>delete r.encounter.nextEnemyAttackAt);const hp=f.service.snapshot(f.id).hp;assert.equal(f.service.advance(f.id).hp,hp);f.tick(2200);assert(f.service.advance(f.id).hp<hp)})
test('corrupt historical encounter is cleared without granting a kill reward',()=>{const f=fixture();f.encounter();f.mutate((u,r)=>r.encounter.hp=null);const before=f.service.snapshot(f.id);const s=f.service.advance(f.id);assert.equal(s.encounter,null);assert.equal(s.gold,before.gold);assert.equal(s.exp,before.exp);const g=fixture();g.encounter();g.mutate((u,r)=>r.encounter.type="__proto__");assert.equal(g.service.advance(g.id).encounter,null)})
test('player attacks use their own cadence, not extra enemy hits per click',()=>{const f=fixture(),e=f.encounter();const hp=f.service.snapshot(f.id).hp;f.act('attack',{target:e.id});assert.equal(f.service.snapshot(f.id).hp,hp);assert.throws(()=>f.act('attack',{target:e.id}),/Tunggu giliran/);f.tick(550);f.act('attack',{target:e.id});assert.equal(f.service.snapshot(f.id).hp,hp)})
test('enemy death/respawn and duplicate player action do not duplicate rewards',()=>{const f=fixture(),e=f.encounter();f.mutate(u=>u.rpg.attack=100);const input={id:crypto.randomUUID(),op:'attack',target:e.id},result=f.service.act(f.id,input);assert(result.effect.victory);assert(result.state.respawnUntil.slime>result.state.serverTime);assert.equal(result.state.encounterReadyAt,result.state.serverTime+COMBAT.respawnMs);assert.equal(f.service.act(f.id,input).state.gold,result.state.gold);f.tick(2200);assert.equal(f.service.advance(f.id).hp,result.state.hp);assert.throws(()=>f.act('encounter',{target:'slime'}));f.tick(301);assert(f.act('encounter',{target:'slime'}).state.encounter)})
test('flee cancels autonomous enemy damage and returns to safe border',()=>{const f=fixture(),e=f.encounter();f.act('flee',{target:e.id});const hp=f.service.snapshot(f.id).hp;f.tick(5000);const s=f.service.advance(f.id);assert.equal(s.encounter,null);assert.equal(s.hp,hp);assert.equal(s.position.x,48)})
test('defeat exits encounter, stops further hits and healer can revive',()=>{const f=fixture();f.encounter();f.mutate(u=>u.rpg.health=1);f.tick(2200);const s=f.service.advance(f.id);assert.equal(s.hp,0);assert.equal(s.encounter,null);assert(s.combatEvent.defeat);assert.equal(s.position.region,'greenleaf');f.tick(5000);assert.equal(f.service.advance(f.id).hp,0);assert(f.act('talk',{target:'healer'}).dialogue);assert.equal(f.act('heal').state.hp,s.maxHp)})
test('boss phase affects independent server attacks',()=>{const f=fixture();f.mutate((u,r)=>{r.quest.claimed=true;r.x=84;r.y=26});f.act('encounter',{target:'sentinel'});f.mutate((u,r)=>r.encounter.phase=2);f.tick(2200);assert.equal(f.service.advance(f.id).combatEvent.incoming,20)})
test('walking near a hostile starts encounter, but safe capital never aggroes',()=>{const f=fixture();f.position(69,35);assert.equal(f.act('move',{direction:'e'}).state.encounter.type,'wolf');const g=fixture();g.position(69,50,'kingdom');assert.equal(g.act('move',{direction:'e'}).state.encounter,null)})
test('automatic boss aggro cannot bypass quest gate or dungeon stage',()=>{const f=fixture();f.position(78,26);assert.equal(f.act('move',{direction:'e'}).state.encounter,null);f.position(75,35,'dungeon');f.mutate((u,r)=>{r.quest.claimed=true;r.dungeon={id:'fixture',stage:0,rewardClaimed:false}});f.tick(200);assert.equal(f.act('move',{direction:'e'}).state.encounter,null)})
for(const npc of NPCS)test('server-validated conversation with '+npc.name,()=>{const f=fixture();f.position(npc.x,npc.y,npc.region||'greenleaf');const before=f.service.snapshot(f.id),result=f.act('talk',{target:npc.id});assert.equal(result.dialogue.id,npc.id);assert(result.dialogue.text.length>20);assert.equal(result.state.gold,before.gold);assert.equal(result.state.quest.accepted,false);assert(!JSON.stringify(result.dialogue).includes(f.jid))})
test('talk cannot spoof coordinates, another region, unknown NPC or combat bypass',()=>{const f=fixture();assert.throws(()=>f.act('talk',{target:'royal'}));assert.throws(()=>f.act('talk',{target:'__proto__'}));assert.throws(()=>f.act('talk',{target:'elder',x:30}),/Field/);f.position(80,40);assert.throws(()=>f.act('talk',{target:'elder'}),/Dekati/);f.encounter();f.position(30,50);assert.throws(()=>f.act('talk',{target:'elder'}),/pertarungan/)})
test('timer fields/damage/cooldown are not accepted from clients',()=>{const f=fixture(),e=f.encounter();for(const field of ['damage','nextEnemyAttackAt','enemyTurns','serverTime'])assert.throws(()=>f.act('attack',{target:e.id,[field]:999}),/Field/)})
test('failed persistence rolls back timed damage and next attack timestamp together',()=>{const f=fixture();f.encounter();f.tick(2200);const before=f.service.snapshot(f.id);const broken=createRealmService({...f.options,saveUser:(jid,u)=>{saveUser(jid,u);throw Error('fixture disk')}});assert.throws(()=>broken.advance(f.id),/fixture disk/);assert.deepEqual(f.service.snapshot(f.id),before)})
test('authenticated HTTP state and action routes advance the clock; anonymous cannot',async()=>{
 const f=fixture();f.encounter();const server=http.createServer(createRealmHttp(()=>f.service));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,headers={cookie:'realm_session='+f.token,'content-type':'application/json'}
 try{assert.equal((await fetch(base+'/realms/api/state')).status,401);f.tick(2200);const a=await(await fetch(base+'/realms/api/state',{headers})).json();assert.equal(a.state.encounter.enemyTurns,1);const b=await(await fetch(base+'/realms/api/state',{headers})).json();assert.equal(b.state.hp,a.state.hp);f.tick(2200);await fetch(base+'/realms/api/action',{method:'POST',headers,body:JSON.stringify({id:crypto.randomUUID(),op:'attack',target:a.state.encounter.id})});assert.equal(f.service.snapshot(f.id).encounter.enemyTurns,2)}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
})
test.after(cleanup)
