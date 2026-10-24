// Run with --loader ./bot/tests/mock-native-loader.mjs (only transport/database dependencies stubbed).
import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import suggestion from '../plugins/_system/_didyoumen.js'
import { portfolioHtml, sendRichInfo } from '../lib/rich-info-cards.js'
global.__filename=url=>fileURLToPath(url)
const {handler}=await import('../handler.js')
process.env.GROQ_API_KEY='unit-test-no-real-key'
global.owner=[];global.opts={};global.mainBot={defaultPrefix:'/'};global.jadibotPlatform={};global.mods=[]
global.db={data:{users:{},chats:{},stats:{},settings:{},blacklistUser:{}},write:async()=>{}}
global.loadDatabase=async()=>{}
global.dfail=(reason,m)=>m.reply('Denied: '+reason)
let serial=0
function fixture(text,{ai=false,answer=false,type='main',prehook=null,denied=false}={}) {
 const id=String(++serial+8000),out=[]
 const conn={user:{id:id+'@s.whatsapp.net',jid:id+'@s.whatsapp.net'},botConfig:{type,scope:id,public:true,defaultPrefix:'/',registrationRequired:true,defaultLimit:50},pushMessage:async()=>{},groupMetadata:async()=>({participants:[{id:'333@s.whatsapp.net',admin:'admin'},{id:id+'@s.whatsapp.net',admin:'admin'}]}),onWhatsApp:async()=>[],readMessages:async()=>{},reply:async(chat,text)=>out.push({chat,text}),sendMessage:async(chat,payload)=>out.push({chat,...payload}),relayMessage:async(chat,payload)=>out.push({chat,rich:payload})}
 const m={chat:'group@g.us',sender:'333@s.whatsapp.net',key:{id:'case-'+serial,remoteJid:'group@g.us'},message:{conversation:text},text,mentionedJid:[],isGroup:true,pushName:'Test',reply:async text=>out.push({text})}
 if(ai)m.quoted={fromMe:true,sender:conn.user.id,text:'pesan bot'}
 const portfolio=Object.assign(async(m,{conn,usedPrefix})=>sendRichInfo(conn,m,portfolioHtml({balance:10,equity:0,netWorth:10,positions:[]},usedPrefix),'PORTOFOLIO','fallback'),{command:/^portofolio$/i,help:['portofolio'],description:'Portofolio trading',premium:denied})
 global.db.data.settings[conn.user.jid]={public:true,autoread:false}
 global.db.data.users[m.sender]={registered:true,limit:50,level:100,exp:0,premiumTime:0};global.db.data.chats[m.chat]={}
 global.plugins={'_system/_didyoumen.js':suggestion,...(prehook?{'hook.js':Object.assign(async()=>{},{before:prehook})}:{}),'game/portfolio.js':portfolio}
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(answer?{reply:'halo juga'}:{reply:'',commands:[{command:'portofolio',plugin:'game/portfolio.js',args:''}]})}}]})})
 global.conn=conn
 return {conn,m,out,run:()=>handler.call(conn,{messages:[m]})}
}
for(const type of ['main','jadibot'])test('AI bare Portofolio produces one rich message, no similarity: '+type,async()=>{const x=fixture('Portofolio',{ai:true,type});await x.run();assert.equal(x.out.length,1,JSON.stringify(x.out));assert(x.out[0].rich);const d=JSON.parse(Buffer.from(x.out[0].rich.botForwardedMessage.message.richResponseMessage.unifiedResponse.data,'base64'));assert(d.sections[0].view_model.primitive.payload.includes('Portofolio'))})
for(const text of ['/portofolio','/PORTOFOLIO','/portofolio args tidak relevan'])test('native valid command never gets suggestion: '+text,async()=>{const x=fixture(text);await x.run();assert.equal(x.out.length,1);assert(x.out[0].rich)})
test('unknown typo emits exactly one similarity fallback',async()=>{const x=fixture('/portofoli');await x.run();assert.equal(x.out.length,1);assert.match(x.out[0].text,/Mungkin maksud kamu/);assert.match(x.out[0].text,/\/portofolio/)})
test('ordinary non-prefixed chatter does not trigger similarity',async()=>{const x=fixture('Portofoli');await x.run();assert.equal(x.out.length,0)})
test('AI conversational reply suppresses similarity',async()=>{const x=fixture('halo',{ai:true,answer:true});await x.run();assert.equal(x.out.length,1);assert.equal(x.out[0].text,'halo juga')})
test('permission denial is not followed by a typo suggestion',async()=>{const x=fixture('/portofolio',{denied:true});await x.run();assert.equal(x.out.length,1);assert.match(x.out[0].text,/Denied: premium/)})
test('before-hook text reply suppresses unknown fallback',async()=>{const x=fixture('/portofoli',{prehook:async m=>{await m.reply('sudah ditangani');return true}});await x.run();assert.equal(x.out.length,1);assert.equal(x.out[0].text,'sudah ditangani')})
test('before-hook raw rich relay also suppresses unknown fallback',async()=>{const x=fixture('/portofoli',{prehook:async function(m){await this.relayMessage(m.chat,{botForwardedMessage:{message:{richResponseMessage:{}}}},{});return true}});await x.run();assert.equal(x.out.length,1);assert(x.out[0].rich)})
test('recognised command with no output does not get false typo hint',async()=>{const x=fixture('/portofolio');global.plugins['game/portfolio.js']=Object.assign(async()=>{},{command:'portofolio',help:['portofolio']});await x.run();assert.equal(x.out.length,0)})
test('all-hook text reply suppresses unknown fallback',async()=>{const x=fixture('/portofoli');global.plugins['all.js']=Object.assign(async()=>{},{all:async m=>m.reply('all menjawab')});await x.run();assert.equal(x.out.length,1);assert.equal(x.out[0].text,'all menjawab')})
