// Real handler/AFK plugins/SQLite authority. External WA serializer/transport are mocked.
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import {setAfk,getAfk} from '../core/awang-afk.js'
import native from '../plugins/group/usanagi-afk.js'
import legacy from '../plugins/info/main-afk.js'
import imported from '../plugins/pelengkap/umi/group/umi-afk.js'
import * as hook from '../plugins/_system/_afk.js'
global.__filename=url=>fileURLToPath(url)
const {handler}=await import('../handler.js');let serial=0
function fixture({registered=true,publicMode=true,onlyGroup=false}={}){
 const id=++serial,sender=(700000000+id)+'@s.whatsapp.net',bot=(800000000+id)+'@s.whatsapp.net',other=(900000000+id)+'@s.whatsapp.net',output=[]
 global.owner=[];global.opts={};global.mods=[];global.mainBot={defaultPrefix:'/'};global.jadibotPlatform={};global.conn={sendMessage:()=>{throw Error('main socket must stay OFF')}}
 const store=createUnifiedStore({db:getDb(),users:{[sender]:{registered,limit:50,premiumTime:0,money:0,exp:0},[other]:{registered:true,limit:50,exp:0,money:0}},links:[]});store.migrate();globalThis[UNIFIED_RPG]=store
 global.db={data:{users:store.users,chats:{},stats:{},settings:{[bot]:{public:true}},blacklistUser:{}},write:async()=>{}};global.loadDatabase=async()=>{};global.dfail=(reason,m)=>m.reply('Denied: '+reason)
 const conn={user:{id:bot,jid:bot},botConfig:{type:'jadibot',scope:'afk-test-'+id,public:publicMode,onlyGroup,defaultPrefix:'/',defaultLimit:50,registrationRequired:true},pushMessage:async()=>{},groupMetadata:async()=>({participants:[]}),onWhatsApp:async()=>[],readMessages:async()=>{},sendMessage:async function(chat,body){assert.equal(this,conn);output.push({chat,body});return {key:{id:crypto.randomUUID()}}}}
 Object.defineProperty(conn,'reply',{value:function(chat,text){return this.sendMessage(chat,{text})}})
 const proto=Object.defineProperty({},'reply',{value:function(text){return this.conn.reply(this.chat,text)}})
 const message=(text='balik',extra={})=>Object.assign(Object.create(proto),{conn,sender,chat:'fixture@g.us',key:{id:crypto.randomUUID(),remoteJid:'fixture@g.us'},message:{conversation:text},text,mentionedJid:[],isGroup:true,pushName:'Test',...extra})
 global.plugins={'_system/_afk.js':hook,'group/usanagi-afk.js':native,'info/main-afk.js':legacy,'pelengkap/umi/group/umi-afk.js':imported}
 return {sender,other,conn,output,store,message,run:async m=>handler.call(conn,{messages:[m],type:'notify'}),finish(){delete global.db;delete globalThis[UNIFIED_RPG]}}
}
for(const command of ['/afk','/away','/brb','/usanagi-afk','/umi-afk','/umi-away','/umi-brb','/umi-group-afk'])test('actual command '+command+' → chat clears AFK → later tag no stale warning',async t=>{
 const errors=[];t.mock.method(console,'error',e=>errors.push(e?.message||String(e)));const f=fixture();try{await f.run(f.message(command+' makan'));assert.equal(getAfk(f.sender)?.reason,'makan');f.output.length=0;await f.run(f.message('aku sudah kembali'));assert.equal(getAfk(f.sender),null);assert.equal(f.output.length,1);assert.match(f.output[0].body.text,/AFK berakhir/);f.output.length=0;await f.run(f.message('tag',{sender:f.other,mentionedJid:[f.sender]}));assert.equal(f.output.length,0);assert.deepEqual(errors,[])}finally{f.finish()}
})
for(const onlyGroup of [false,true])test('ordinary private chat by non-premium/unregistered user clears AFK before gates; groupOnly='+onlyGroup,async()=>{const f=fixture({registered:false,onlyGroup});try{setAfk(f.sender,'makan');await f.run(f.message('balik',{chat:f.sender,isGroup:false,key:{id:crypto.randomUUID(),remoteJid:f.sender}}));assert(!getAfk(f.sender));assert.equal(f.output.length,1);assert.equal(f.output[0].chat,f.sender)}finally{f.finish()}})
test('private self-mode suppresses notification, but does not retain stale AFK',async()=>{const f=fixture({publicMode:false});try{setAfk(f.sender,'away');await f.run(f.message('balik'));assert(!getAfk(f.sender));assert.equal(f.output.length,0)}finally{f.finish()}})
test('live verified LID alias returns against the same state and no RPG currency changes',async()=>{const f=fixture(),lid='555555555@lid';try{f.store.bind([f.sender,lid]);setAfk(lid,'makan');const money=f.store.users[f.sender].money;await f.run(f.message());assert(!getAfk(lid));assert.equal(f.store.users[f.sender].money,money);assert.equal(f.output.length,1)}finally{f.finish()}})
test('same AFK command is not cleared by compatibility hook later in plugin traversal',async()=>{const f=fixture();try{setAfk(f.sender,'old');await f.run(f.message('/afk new'));assert.equal(getAfk(f.sender).reason,'new');assert(!f.output.some(x=>/sudah kembali/.test(x.body.text)))}finally{f.finish()}})
test.after(()=>cleanup())
