// Actual dispatcher + AutoAI planner + preview hook + SQLite; WA transport/serializer mocked.
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
import preview from '../plugins/_system/_allfake.js'
global.__filename=url=>fileURLToPath(url)
const {handler}=await import('../handler.js')
process.env.GROQ_API_KEY='fixture-no-real-credential'
let serial=0
function fixture(text,prefix,self=true){
 const id=++serial,bot=(900000000+id)+'@s.whatsapp.net',sender=self?bot:(800000000+id)+'@s.whatsapp.net',chat='fixture@g.us',sent=[]
 global.owner=[];global.opts={};global.mainBot={defaultPrefix:'/'};global.jadibotPlatform={};global.mods=[];global.links={};global.scriptUrl=''
 const store=createUnifiedStore({db:getDb(),users:{[sender]:{registered:true,limit:50,premiumTime:0,money:0,exp:0}},links:[]});store.migrate();globalThis[UNIFIED_RPG]=store
 global.db={data:{users:store.users,chats:{},stats:{},settings:{[bot]:{public:true}},blacklistUser:{}},write:async()=>{}};global.loadDatabase=async()=>{};global.dfail=(reason,m)=>m.reply('Denied: '+reason)
 global.conn={sendMessage:()=>{throw Error('main must remain OFF')}}
 const conn={user:{id:bot,jid:bot},botConfig:{type:'jadibot',scope:'preview-dispatch-'+id,public:true,defaultPrefix:prefix,defaultLimit:50,registrationRequired:true},pushMessage:async()=>{},groupMetadata:async()=>({participants:[]}),onWhatsApp:async()=>[],readMessages:async()=>{},sendMessage:async(jid,content)=>{sent.push({jid,content});return {key:{id:crypto.randomUUID()}}}}
 Object.defineProperty(conn,'reply',{value:function(jid,text){return this.sendMessage(jid,{text})}})
 const proto=Object.defineProperty({},'reply',{value:function(text){return this.conn.reply(this.chat,text)}})
 const m=Object.assign(Object.create(proto),{conn,chat,sender,fromMe:self,key:{id:crypto.randomUUID(),remoteJid:chat,fromMe:self},message:{conversation:text},text,mentionedJid:[],isGroup:true,pushName:'Fixture'})
 global.plugins={'_system/_allfake.js':preview}
 return {conn,m,sent,finish(){delete globalThis[UNIFIED_RPG];delete global.db}}
}
for(const prefix of ['/','!','!!']){
 test('AutoAI developer answer passes actual preview hook without leading slash; prefix '+prefix,async()=>{
  const f=fixture('!!siapa developer lu',prefix)
  try{await handler.call(f.conn,{messages:[f.m]});assert(f.conn._autoFakePatched);assert.equal(f.sent.length,1);assert.match(f.sent[0].content.text,/AlzRiss/);assert(!f.sent[0].content.text.startsWith('/'));assert(!f.sent[0].content.text.includes('\u2063'))}finally{f.finish()}
 })
 test('AutoAI menu command response is not prefixed by preview; prefix '+prefix,async()=>{
  const f=fixture('!!buka menu',prefix);global.plugins['main/menu.js']=Object.assign(async m=>m.reply('MENU OPEN'),{command:'menu',help:['menu'],tags:['info']})
  try{await handler.call(f.conn,{messages:[f.m]});assert(f.conn._autoFakePatched);assert.equal(f.sent.length,1);assert.equal(f.sent[0].content.text,'MENU OPEN')}finally{f.finish()}
 })
 test('ordinary command reply retains its configured command example; prefix '+prefix,async()=>{
  const f=fixture(prefix+'probe',prefix,false);global.plugins['main/probe.js']=Object.assign(async(m,{usedPrefix})=>m.reply('Contoh: '+usedPrefix+'menu'),{command:'probe',help:['probe'],tags:['info']})
  try{await handler.call(f.conn,{messages:[f.m]});assert(f.conn._autoFakePatched);assert.equal(f.sent.length,1);assert.equal(f.sent[0].content.text,'Contoh: '+prefix+'menu')}finally{f.finish()}
 })
}
test('model-generated conversational reply also passes actual preview unchanged',async()=>{
 const f=fixture('halo, apa kabar?','/',false),originalFetch=global.fetch
 f.m.mentionedJid=[f.conn.user.id]
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reply:'Halo, kabarku baik. Kamu gimana?',commands:[]})}}]})})
 try{await handler.call(f.conn,{messages:[f.m]});assert(f.conn._autoFakePatched);assert.equal(f.sent.length,1);assert.equal(f.sent[0].content.text,'Halo, kabarku baik. Kamu gimana?')}finally{global.fetch=originalFetch;f.finish()}
})
test.after(()=>{delete global.links;delete global.scriptUrl;cleanup()})
