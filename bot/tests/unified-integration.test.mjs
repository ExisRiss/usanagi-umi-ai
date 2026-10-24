import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
import {getUser,saveUser,setCooldown,checkCooldown} from '../lib/rpg/awang-db.js'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import {runUnifiedCommand,awardMessageExp,wrapRpgOutbound} from '../lib/rpg/unified-runtime.js'
import {createRealmService} from '../lib/realms/service.js'
import {withRealmGate} from '../lib/realms/gate.js'
import activity from '../plugins/economy/rpg-activity.js'
const db=getDb();let serial=0
function fixture(){
 delete globalThis[UNIFIED_RPG];getUser('777777777')
 const id='628111'+String(++serial).padStart(7,'0'),other='628222'+String(serial).padStart(7,'0'),a=id+'@s.whatsapp.net',b=other+'@s.whatsapp.net',lid='99888'+String(serial).padStart(8,'0')+'@lid'
 const s=createUnifiedStore({db,users:{[a]:{money:5000,exp:9990,registered:true},[b]:{money:0}},links:[]});s.migrate();s.bind([a,lid]);globalThis[UNIFIED_RPG]=s;global.db={data:{users:s.users}}
 const replies=[],m={sender:a,chat:'test-chat',key:{id:crypto.randomUUID()},mentionedJid:[b],reply:async text=>{replies.push(text);return {key:{id:crypto.randomUUID()}}}},conn={sendMessage:async()=>({key:{id:crypto.randomUUID()}})}
 const service=createRealmService({db,getUser,saveUser});const login=service.redeem(service.issueCode(lid).code),account=login.state.id
 service.act(account,{id:crypto.randomUUID(),op:'create',class:'warrior',name:'Unified '+serial})
 const u=getUser(id);u.rpg.realm.x=22;u.rpg.realm.y=50;saveUser(id,u)
 return {s,id,a,b,other,lid,m,conn,replies,service,account,finish(){delete globalThis[UNIFIED_RPG];delete global.db}}
}
test('real legacy transfer updates the web player, never parses mention as amount',async()=>{
 const f=fixture();try{await runUnifiedCommand('transfer:'+f.id,()=>activity(f.m,{conn:f.conn,command:'give',usedPrefix:'!',text:'@'+f.other+' 40'}),f.conn,f.m);assert.equal(f.service.snapshot(f.account).gold,4960);assert.equal(getUser(f.b).koin,40);assert.equal(f.replies.length,1);await runUnifiedCommand('transfer:'+f.id,()=>activity(f.m,{conn:f.conn,command:'give',usedPrefix:'!',text:'40'}),f.conn,f.m);assert.equal(getUser(f.b).koin,40)}finally{f.finish()}
})
test('negative/decimal amounts and self-transfer across PN/LID rejected',async()=>{
 const f=fixture();try{for(const amount of ['-2','1.5','2x','9007199254740992'])await runUnifiedCommand(amount+f.id,()=>activity(f.m,{command:'give',text:amount}),f.conn,f.m);f.m.mentionedJid=[f.lid];await runUnifiedCommand('self'+f.id,()=>activity(f.m,{command:'give',text:'20'}),f.conn,f.m);assert.equal(getUser(f.id).koin,5000);assert.equal(getUser(f.b).koin,0)}finally{f.finish()}
})
test('web buy and legacy earnings serialize against the same currency and inventory',async()=>{
 const f=fixture();try{await Promise.all([runUnifiedCommand('earn'+f.id,async()=>{const u=getUser(f.id);await new Promise(r=>setTimeout(r,10));u.koin+=100;saveUser(f.id,u)},f.conn,f.m),withRealmGate(()=>f.service.act(f.account,{id:crypto.randomUUID(),op:'buy',item:'potion',quantity:1}))]);assert.equal(f.s.users[f.a].money,4600);assert.equal(f.s.users[f.a].potion,3)}finally{f.finish()}
})
test('native cooldown and player writes are in the same rollback boundary',async()=>{
 const f=fixture();try{await assert.rejects(runUnifiedCommand('rollback'+f.id,()=>{const u=getUser(f.id);setCooldown(f.id,'test',60000);u.koin-=100;saveUser(f.id,u);throw Error('fail')},f.conn,f.m));assert.equal(checkCooldown(f.id,'test').onCooldown,false);assert.equal(getUser(f.id).koin,5000);await runUnifiedCommand('ok'+f.id,()=>{const u=getUser(f.id);setCooldown(f.id,'test',60000);u.koin-=100;saveUser(f.id,u)},f.conn,f.m);assert.equal(checkCooldown(f.id,'test').onCooldown,true);assert.equal(getUser(f.id).koin,4900)}finally{f.finish()}
})
test('a stale native save cannot replace a newer web balance',()=>{
 const f=fixture();try{const old=getUser(f.id);f.service.act(f.account,{id:crypto.randomUUID(),op:'buy',item:'potion',quantity:1});old.koin+=50;assert.throws(()=>saveUser(f.id,old),/Progres berubah/);assert.equal(getUser(f.id).koin,4500)}finally{f.finish()}
})
test('native web action inside a WA unit of work still rolls back its receipt and player together',async()=>{
 const f=fixture();try{const broken=createRealmService({db,getUser,saveUser:(id,u)=>{saveUser(id,u);throw Error('disk failure')}});const request=crypto.randomUUID();await assert.rejects(runUnifiedCommand('inner'+f.id,()=>broken.act(f.account,{id:request,op:'buy',item:'potion',quantity:1}),f.conn,f.m),/disk failure/);assert.equal(getUser(f.id).koin,5000);assert.equal(db.prepare('SELECT count(*) n FROM realm_actions WHERE request=?').get(request).n,0)}finally{f.finish()}
})
test('passive EXP is shared, cumulative and idempotent',async()=>{
 const f=fixture();try{await awardMessageExp(f.a,20,'msg');await awardMessageExp(f.a,20,'msg');assert.equal(getUser(f.id).exp,10010);assert.equal(f.service.snapshot(f.account).level,2);assert.equal(f.s.users[f.a].level,2)}finally{f.finish()}
})
test('outbound send commits before invoking the real sender and returns its actual result',async()=>{
 const f=fixture();try{const key={id:'real-result'};f.m.reply=async()=>{assert.equal(JSON.parse(db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(f.id).data).koin,5007);return {key}};wrapRpgOutbound(f.conn,f.m);const r=await runUnifiedCommand('send'+f.id,()=>{f.s.users[f.a].money+=7;return f.m.reply('ok')},f.conn,f.m);assert.deepEqual(r,{key})}finally{f.finish()}
})
test('held LID cannot mint a login or create a separate numeric RPG account',()=>{
 const f=fixture();try{assert.throws(()=>f.service.issueCode('888888888@lid'),/terverifikasi/);assert.throws(()=>getUser('888888888@lid'),/terverifikasi/)}finally{f.finish()}
})
test.after(()=>{delete globalThis[UNIFIED_RPG];delete global.db;cleanup()})

test('first imported recipient receives canonical currency and survives JSON/restart',async()=>{
 const f=fixture();try{const {getImportedDatabase}=await import('../lib/imported-compat.js');const fresh='333333333@s.whatsapp.net';await runUnifiedCommand('new-recipient'+f.id,()=>{const u=getImportedDatabase().getUser(fresh);u.money+=30},f.conn,f.m);const raw=JSON.parse(JSON.stringify(f.s.users));assert.equal(getUser(fresh).koin,30);const resumed=createUnifiedStore({db,users:raw});resumed.migrate();assert.equal(resumed.users[fresh].money,30)}finally{f.finish()}
})

test('real socket descriptor shape: readonly reply/helpers and inherited message reply do not abort hooks',async()=>{
 const f=fixture();try{
  let sends=0;const conn={sendMessage:async function(chat,body){assert.equal(this,conn);assert.equal(JSON.parse(db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(f.id).data).koin,5007);sends++;return {key:{id:'accepted'}}}}
  Object.defineProperties(conn,{reply:{value:function(chat,text){return this.sendMessage(chat,{text})}},sendFile:{value:function(chat){return this.sendMessage(chat,{text:'file'})}}})
  const proto=Object.defineProperty({},'reply',{value:function(text){return this.conn.reply(this.chat,text)}})
  const m=Object.assign(Object.create(proto),{conn,chat:f.m.chat,sender:f.a,key:f.m.key})
  await runUnifiedCommand('readonly-before'+f.id,()=>undefined,conn,m)
  const result=await runUnifiedCommand('readonly-command'+f.id,()=>{f.s.users[f.a].money+=7;return m.reply('done')},conn,m)
  assert.equal(result.key.id,'accepted');assert.equal(sends,1);assert.equal(Object.getOwnPropertyDescriptor(conn,'reply').writable,false)
 }finally{f.finish()}
})
test('immutable quoted reply delegates to socket transport with commit-before-send',async()=>{
 const f=fixture();try{let sends=0;const conn={sendMessage:async()=>{assert.equal(JSON.parse(db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(f.id).data).koin,5003);sends++;return 'sent'}};Object.defineProperty(conn,'reply',{value:()=>conn.sendMessage()});const m=Object.freeze({reply:()=>conn.reply()});await runUnifiedCommand('frozen'+f.id,()=>{f.s.users[f.a].money+=3;return m.reply('ok')},conn,m);assert.equal(sends,1)}finally{f.finish()}
})
test('configurable getter helpers are shadowed without invoking their setter',async()=>{
 const f=fixture();try{let sends=0;const m={};Object.defineProperty(m,'reply',{get:()=>()=>{sends++;return 'ok'},configurable:true});await runUnifiedCommand('getter'+f.id,()=>m.reply('ok'),f.conn,m);assert.equal(sends,1)}finally{f.finish()}
})
test('direct rich-message relay is wrapped once and commits before transmission',async()=>{
 const f=fixture();try{let sends=0;const conn={relayMessage:async()=>{assert.equal(JSON.parse(db.prepare('SELECT data FROM rpg_users WHERE jid=?').get(f.id).data).koin,5009);sends++;return 'relayed'}};wrapRpgOutbound(conn);const first=conn.relayMessage;wrapRpgOutbound(conn);assert.equal(conn.relayMessage,first);assert.equal(await runUnifiedCommand('relay'+f.id,()=>{f.s.users[f.a].money+=9;return conn.relayMessage()},conn),'relayed');assert.equal(sends,1)}finally{f.finish()}
})

test('Jadibot token linking preserves canonical WhatsApp/Realms identity and shared currency',()=>{
 const f=fixture();try{const subject=crypto.randomUUID(),linked=f.service.loginWithPlatform(subject,f.service.issueCode(f.lid).code);assert.equal(linked.state.id,f.account);f.service.act(f.account,{id:crypto.randomUUID(),op:'buy',item:'potion',quantity:1});const again=f.service.loginWithPlatform(subject);assert.equal(again.state.id,f.account);assert.equal(again.state.gold,4500);assert.equal(f.s.users[f.a].money,4500);assert.equal(f.s.users[f.lid].money,4500);f.service.revoke(f.lid);assert.throws(()=>f.service.loginWithPlatform(subject),/belum ditautkan/);assert.equal(f.s.users[f.a].money,4500)}finally{f.finish()}
})

test('response and RPG wrappers remain stable across repeated messages without transport chain growth',async()=>{
 const {withMessageResponses,bindResponseMessage}=await import('../lib/command-response.js');const f=fixture();try{let sends=0;const conn={sendMessage:async()=>{sends++;return {key:{id:'sent-'+sends}}}};let first;
 for(let i=0;i<100;i++){await withMessageResponses(conn,()=>{const m={chat:'test',reply:()=>conn.sendMessage('test',{text:'ok'})};bindResponseMessage(m);return runUnifiedCommand('wrap-stability:'+f.id+':'+i,()=>m.reply(),conn,m)});if(!first)first=conn.sendMessage;assert.equal(conn.sendMessage,first)}assert.equal(sends,100)}finally{f.finish()}
})
