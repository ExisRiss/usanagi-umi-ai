// Actual native dispatcher, Realms plugin and SQLite. WA transport/serializer mocked.
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
import realms from '../plugins/rpg/realms.js'
global.__filename=url=>fileURLToPath(url)
const {handler}=await import('../handler.js')
process.env.GROQ_API_KEY='fixture-no-real-credential'
let serial=0
function fixture({self=false,group=false,onlyGroup=false,publicMode=true,text='/realms login',registered=false,prefix='/'}={}){
 const id=++serial,bot=(900000000+id)+'@s.whatsapp.net',sender=self?bot:(800000000+id)+'@s.whatsapp.net',chat=group?'fixture@g.us':sender,replies=[]
 global.owner=[];global.opts={};global.mainBot={defaultPrefix:'/'};global.jadibotPlatform={};global.mods=[]
 const store=createUnifiedStore({db:getDb(),users:{[sender]:{registered,limit:50,premiumTime:0,money:0,exp:0}},links:[]});store.migrate();globalThis[UNIFIED_RPG]=store
 global.db={data:{users:store.users,chats:{},stats:{},settings:{[bot]:{public:true}},blacklistUser:{}},write:async()=>{}};global.loadDatabase=async()=>{};global.dfail=(reason,m)=>m.reply('Denied: '+reason)
 global.conn={sendMessage:()=>{throw Error('main is OFF')}}
 const conn={user:{id:bot,jid:bot},botConfig:{type:'jadibot',scope:'self-dispatch-'+id,public:publicMode,onlyGroup,defaultPrefix:prefix,defaultLimit:50,registrationRequired:true,values:{brandingAssets:{menuAudioEnabled:false}}},pushMessage:async()=>{},groupMetadata:async()=>({participants:[]}),onWhatsApp:async()=>[],readMessages:async()=>{},sendMessage:async(jid,content)=>{replies.push({jid,content});return {key:{id:crypto.randomUUID()}}}}
 Object.defineProperty(conn,'reply',{value:function(jid,text){return this.sendMessage(jid,{text})}})
 const proto=Object.defineProperty({},'reply',{value:function(text){return this.conn.reply(this.chat,text)}})
 const m=Object.assign(Object.create(proto),{conn,chat,sender,fromMe:self,key:{id:crypto.randomUUID(),remoteJid:chat,fromMe:self},message:{conversation:text},text,mentionedJid:[],isGroup:group,pushName:'Fixture'})
 global.plugins={'rpg/realms.js':realms}
 return {conn,m,replies,store,finish(){delete globalThis[UNIFIED_RPG];delete global.db}}
}
for(const onlyGroup of [false,true])test('real realms login replies privately for non-premium/new user, onlyGroup='+onlyGroup,async()=>{const f=fixture({onlyGroup});try{await handler.call(f.conn,{messages:[f.m]});assert.equal(f.replies.length,1);assert.match(f.replies[0].content.text,/Kode masuk sekali pakai: [A-F0-9]{12}/);assert.equal(f.replies[0].jid,f.m.chat)}finally{f.finish()}})
test('group login responds with private instruction and never exposes code',async()=>{const f=fixture({group:true});try{await handler.call(f.conn,{messages:[f.m]});assert.equal(f.replies.length,1);assert.match(f.replies[0].content.text,/chat pribadi/);assert(!/[A-F0-9]{12}/.test(f.replies[0].content.text))}finally{f.finish()}})
test('self mode restriction still blocks non-owner Realm login',async()=>{const f=fixture({publicMode:false});try{await handler.call(f.conn,{messages:[f.m]});assert.equal(f.replies.length,0)}finally{f.finish()}})
test('unrelated private gameplay remains premium-restricted',async()=>{const f=fixture({text:'/realms buy potion',registered:true});try{await handler.call(f.conn,{messages:[f.m]});assert.equal(f.replies.length,0)}finally{f.finish()}})
for(const prefix of ['/','!','!!'])test('own !!buka menu dispatch/replay with active prefix '+prefix,async()=>{const f=fixture({self:true,text:'!!buka menu',registered:true,prefix});let called=0;global.plugins={'main/menu.js':Object.assign(async m=>{called++;await m.reply('MENU OPEN')},{command:'menu',help:['menu'],tags:['info']})};try{await handler.call(f.conn,{messages:[f.m]});assert.equal(called,1);assert.equal(f.replies[0].content.text,'MENU OPEN');const again=Object.create(Object.getPrototypeOf(f.m),Object.getOwnPropertyDescriptors(f.m));delete again.__autoAIHandled;again.text=again.message.conversation;await handler.call(f.conn,{messages:[again]});assert.equal(called,1)}finally{f.finish()}})
test('own !!developer replies but ordinary own text and generated echo do not',async()=>{for(const [text,echo,expected]of [['!!siapa developer lu',false,1],['siapa developer lu',false,0],['!!siapa developer lu',true,0]]){const f=fixture({self:true,text,registered:true});f.m.isBaileys=echo;try{await handler.call(f.conn,{messages:[f.m]});assert.equal(f.replies.length,expected);if(expected)assert.match(f.replies[0].content.text,/AlzRiss/)}finally{f.finish()}}})
test.after(()=>cleanup())
