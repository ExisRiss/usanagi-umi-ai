// Run with realms-sqlite-loader + mock-native-loader. Actual handler and SQLite;
// external WA transport and serializer are mocked, not physical WhatsApp acceptance.
import test from 'node:test'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
import {createUnifiedStore,UNIFIED_RPG} from '../lib/rpg/unified-store.js'
import {getDb,cleanup} from './fixtures/realms-sqlite.mjs'
global.__filename=url=>fileURLToPath(url)
const {handler}=await import('../handler.js')
for (const held of [false,true]) test('actual Jadibot handler reaches readonly reply; held identity='+held,async t=>{
 const errors=[];t.mock.method(console,'error',e=>errors.push(e?.message||String(e)))
 const sender=held?'888888888@lid':'333333333@s.whatsapp.net',bot='222222222@s.whatsapp.net',chat='test@g.us',sent=[],trace=[]
 global.owner=[];global.opts={};global.mainBot={defaultPrefix:'/'};global.jadibotPlatform={};global.mods=[]
 const store=createUnifiedStore({db:getDb(),users:{[sender]:{registered:true,limit:50,premiumTime:0,...(held?{}:{exp:0,money:5})}},links:[]});store.migrate();globalThis[UNIFIED_RPG]=store
 global.db={data:{users:store.users,chats:{},stats:{},settings:{[bot]:{public:true}},blacklistUser:{}},write:async()=>{}}
 global.loadDatabase=async()=>{};global.dfail=(reason,m)=>m.reply('Denied: '+reason)
 global.conn={sendMessage:()=>{throw Error('Must not use disabled main socket')}}
 const main=global.conn
 const conn={user:{id:bot,jid:bot},botConfig:{type:'jadibot',scope:'test',public:true,defaultPrefix:'/',defaultLimit:50,registrationRequired:true},pushMessage:async()=>{},groupMetadata:async()=>({participants:[]}),onWhatsApp:async()=>[],readMessages:async()=>{},sendMessage:async function(jid,content){assert.equal(this,conn);sent.push({jid,content});return {key:{id:'accepted'}}}}
 Object.defineProperty(conn,'reply',{value:function(jid,text){return this.sendMessage(jid,{text})}})
 const proto=Object.defineProperty({},'reply',{value:function(text){return this.conn.reply(this.chat,text)}})
 const m=Object.assign(Object.create(proto),{conn,chat,sender,key:{id:'unified-dispatch-1',remoteJid:chat},message:{conversation:'/ping'},text:'/ping',mentionedJid:[],isGroup:true,pushName:'Test'})
 const plugin=Object.assign(async m=>{trace.push('command');await m.reply('pong')},{command:/^ping$/,before:async()=>{trace.push('before');return false},help:['ping'],tags:['info']})
 global.plugins={'info/ping.js':plugin}
 try{
  // Load the real default initializer (the handler's other dependencies remain mocked).
  const initialize=(await import(new URL('../lib/database.js',import.meta.url))).default
  initialize(m,conn)
  await handler.call(conn,{messages:[m]})
  assert.deepEqual(trace,['before','command']);assert.equal(sent.length,1);assert.deepEqual(sent[0],{jid:chat,content:{text:'pong'}})
  assert.deepEqual(errors,[]);if(held){assert.equal(store.users[sender].exp,undefined);assert.equal(store.users[sender].lastclaim,undefined);assert.throws(()=>{store.users[sender].money=50},/terverifikasi/)}
  assert.equal(m.error,undefined);assert.equal(global.conn,main);assert.equal(Object.getOwnPropertyDescriptor(conn,'reply').writable,false)
 }finally{delete globalThis[UNIFIED_RPG];delete global.db}
})

test.after(()=>cleanup())
