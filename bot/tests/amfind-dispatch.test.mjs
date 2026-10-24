// Actual dispatcher + AutoAI planner + preview hook + SQLite; WA transport/serializer mocked.
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
import preview from '../plugins/_system/_allfake.js'
import amfind from '../plugins/tools/amfind.js'
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
 global.plugins={'_system/_allfake.js':preview,'tools/amfind.js':amfind}
 return {conn,m,sent,finish(){delete globalThis[UNIFIED_RPG];delete global.db}}
}
const originalFetch=global.fetch,ID='1234567890123456789',url='https://www.tiktok.com/@fixture/video/'+ID,link='https://alightcreative.com/am/share/u/fixture/p/dispatch'
global.fetch=async raw=>{
 const u=new URL(raw)
 if(u.hostname==='vt.tiktok.com')return new Response(null,{status:301,headers:{location:url}})
 let data
 if(u.pathname==='/api/')data={id:ID,title:'Fixture',author:{id:'creator',unique_id:'fixture',nickname:'Fixture'},comment_count:2}
 else if(u.pathname==='/api/comment/list')data={comments:[{id:'1001',text:'preset?',reply_total:1,user:{id:'other'}}],cursor:50,hasMore:false}
 else if(u.pathname==='/api/comment/reply')data={comments:[{id:'1002',text:link,user:{id:'creator'}}],cursor:1,hasMore:false}
 else throw Error('Unexpected network URL in dispatcher fixture')
 return new Response(JSON.stringify({code:0,data}))
}
for(const [prefix,command,input]of [['/','amfind','https://vt.tiktok.com/Fixture123'],['/','amfind','[https://vt.tiktok.com/Fixture123/](https://vt.tiktok.com/Fixture123/)'],['!','amfinder',url]])test('actual dispatcher/preview/AM finder: '+prefix+command+' '+input,async()=>{
 const f=fixture(prefix+command+' '+input,prefix,false)
 try{await handler.call(f.conn,{messages:[f.m]});const texts=f.sent.filter(x=>x.content.text);assert(f.conn._autoFakePatched);assert.equal(texts.length,1);assert(texts[0].content.text.includes(link));assert.match(texts[0].content.text,/balasan komentar kreator/);assert(!texts[0].content.text.startsWith('/'));assert(!texts[0].content.text.includes('timeout of'))}finally{f.finish()}
})
test.after(()=>{global.fetch=originalFetch;delete global.links;delete global.scriptUrl;cleanup()})
