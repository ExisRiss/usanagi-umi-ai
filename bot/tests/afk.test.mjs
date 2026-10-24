import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {setAfk,getAfk,removeAfk,isAfk,persistAfk} from '../core/awang-afk.js'
import {handleAfkMessage,isAfkCommand} from '../lib/afk.js'
import {UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import legacy from '../plugins/info/main-afk.js'
import native from '../plugins/group/usanagi-afk.js'
import {handler as imported} from '../integrations/umi/plugins/group/afk.js'
const a='111111111@s.whatsapp.net',b='222222222@s.whatsapp.net',lid='999999999@lid'
function fixture(users={}){
 delete globalThis[UNIFIED_RPG];delete global.afkStorage
 let writes=0;global.db={data:{users},write:async()=>{writes++}}
 const output=[],conn={sendMessage:async(chat,body)=>{output.push({chat,body});return {key:{id:crypto.randomUUID()}}}}
 const message=(text='kembali',extra={})=>({sender:a,chat:'fixture@g.us',text,message:{conversation:text},key:{id:crypto.randomUUID()},reply:async text=>conn.sendMessage('fixture@g.us',{text}),...extra})
 return {conn,output,message,writes:()=>writes}
}
for(const [name,command]of [['legacy',legacy],['native',native],['imported',imported]])test(name+' AFK command → plain chat → later mention is no longer AFK',async()=>{
 const f=fixture({[a]:{afk:-1}}),m=f.message('makan');await command(m,{text:'makan',conn:f.conn,sock:f.conn});assert.equal(getAfk(a).reason,'makan');assert(f.writes()>0);f.output.length=0;await handleAfkMessage(f.message(),f.conn);assert(!isAfk(a));assert.equal(f.output.length,1);assert.match(f.output[0].body.text,/sudah kembali/);f.output.length=0;await handleAfkMessage(f.message('tag',{sender:b,mentionedJid:[a]}),f.conn);assert.equal(f.output.length,0)
})
test('migration preserves legacy JSON and imported Map states without leaving independent flags',()=>{const f=fixture({[a]:{afk:100,afkReason:'legacy'}});global.afkStorage=new Map([[b,{time:200,reason:'import'}]]);assert.equal(getAfk(a).reason,'legacy');assert.equal(getAfk(b).reason,'import');assert.equal(global.db.data.users[a].afk,-1);assert.equal(global.afkStorage.size,0);removeAfk(a);global.db.data=JSON.parse(JSON.stringify(global.db.data));assert(!isAfk(a));assert(isAfk(b))})
test('verified PN/LID and device suffix identify the same AFK record',async()=>{const f=fixture();globalThis[UNIFIED_RPG]={identity:jid=>jid===lid||jid===a?'111111111':''};setAfk(lid,'istirahat');assert(isAfk(a));await handleAfkMessage(f.message('kembali',{sender:'111111111:5@s.whatsapp.net'}),f.conn,{aliases:[lid,a]});assert(!isAfk(a));assert(!isAfk(lid));assert.equal(f.output.length,1)})
test('same digits in unverified LID and phone are not proof of identity',async()=>{const f=fixture(),unknown='111111111@lid';setAfk(unknown,'belum terverifikasi');await handleAfkMessage(f.message(),f.conn);assert(isAfk(unknown));assert.equal(f.output.length,0)})
test('trusted alias keys clear old LID before identity profile merging',async()=>{const f=fixture({[lid]:{afk:Date.now()-10000,afkReason:'lama'},[a]:{afk:-1}});await handleAfkMessage(f.message(),f.conn,{aliases:[a,lid]});assert(!getAfk(lid));assert(!getAfk(a));global.db.data=JSON.parse(JSON.stringify(global.db.data));assert(!getAfk(lid))})
test('conflicting phone aliases cannot clear another person',()=>{fixture();setAfk(b,'sibuk');removeAfk(a,[a,b]);assert(isAfk(b))})
test('all AFK aliases with configured prefixes preserve/re-set status without false welcome-back',async()=>{for(const prefix of ['/','!!','umi.'])for(const cmd of ['afk','away','brb','usanagi-afk','usanagi-away','usanagi-brb','umi-afk','umi-group-afk','umi-away','umi-brb']){const f=fixture();setAfk(a,'old');assert(isAfkCommand(prefix+cmd+' makan',prefix));await handleAfkMessage(f.message(prefix+cmd+' makan'),f.conn,{prefix});assert(isAfk(a));assert.equal(f.output.length,0)}})
for(const mtype of ['imageMessage','audioMessage','stickerMessage','documentMessage'])test(mtype+' activity ends AFK without caption',async()=>{const f=fixture();setAfk(a,'away');await handleAfkMessage(f.message('',{mtype,message:{[mtype]:{}}}),f.conn);assert(!isAfk(a));assert.equal(f.output.length,1)})
for(const [label,extra,options]of [['history',{}, {type:'append'}],['reaction',{mtype:'reactionMessage',message:{reactionMessage:{}}},{}],['protocol',{mtype:'protocolMessage',message:{protocolMessage:{}}},{}],['broadcast',{chat:'status@broadcast'},{}],['generated',{isBaileys:true},{}],['older than AFK',{messageTimestamp:Math.floor(Date.now()/1000)-60},{}]])test(label+' does not falsely end AFK',async()=>{const f=fixture();setAfk(a,'away');await handleAfkMessage(f.message('old',extra),f.conn,options);assert(isAfk(a));assert.equal(f.output.length,0)})
test('mentions and quoted reply warn once, target correct user, never clear target status',async()=>{const f=fixture();setAfk(b,'makan');await handleAfkMessage(f.message('halo',{mentionedJid:[b,b],quoted:{sender:b}}),f.conn);assert.equal(f.output.length,1);assert.deepEqual(f.output[0].body.mentions,[b]);assert.match(f.output[0].body.text,/sedang AFK/);assert(isAfk(b))})
test('two distinct people with identical timestamp/reason both appear in warnings',async()=>{const f=fixture();global.db.data.afkStateV1={[a]:{since:100,reason:'same'},[b]:{since:100,reason:'same'}};await handleAfkMessage(f.message('tag',{sender:lid,mentionedJid:[a,b]}),f.conn);assert.deepEqual(f.output[0].body.mentions,[a,b])})
test('clear happens before transport; failed send cannot keep AFK active',async t=>{const f=fixture();setAfk(a,'away');t.mock.method(console,'error',()=>{});f.conn.sendMessage=async()=>{assert(!isAfk(a));throw Error('network')};await handleAfkMessage(f.message(),f.conn);assert(!isAfk(a));assert(f.writes()>0)})
test('duplicate hook/message and concurrent chats return only once',async()=>{const f=fixture();setAfk(a,'away');const m=f.message();await Promise.all([handleAfkMessage(m,f.conn),handleAfkMessage(m,f.conn),handleAfkMessage({...m},f.conn)]);assert.equal(f.output.length,1);setAfk(a,'again');await handleAfkMessage({...m},f.conn);assert(isAfk(a))})
test('silent maintenance clears AFK without violating self-mode response policy',async()=>{const f=fixture();setAfk(a,'away');await handleAfkMessage(f.message(),f.conn,{notify:false});assert(!isAfk(a));assert.equal(f.output.length,0)})
test('active AFK survives JSON serialization/restart and can be cleared after it',async()=>{const f=fixture();setAfk(a,'persistent');await persistAfk();global.db.data=JSON.parse(JSON.stringify(global.db.data));assert.equal(getAfk(a).reason,'persistent');await handleAfkMessage(f.message(),f.conn);assert(!getAfk(a))})
test.after(()=>{delete global.db;delete global.afkStorage;delete globalThis[UNIFIED_RPG]})
