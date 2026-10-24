import test from 'node:test'
import assert from 'node:assert/strict'
import {EventEmitter} from 'node:events'
import {createGroupMetadataCache} from '../lib/group-metadata-cache.js'
import store from '../lib/store.js'
import {sendAutoAIReply} from '../lib/auto-ai-reply.js'
const metadata=id=>({id,subject:'Fixture',participants:[{id:'fixture@example.test',admin:null}]})
test('history of 500 groups does not issue any eager metadata queries',async()=>{
 let calls=0;const conn={ev:new EventEmitter(),decodeJid:x=>x,chats:{},groupMetadata:async id=>{calls++;return metadata(id)}};store.bind(conn)
 await conn.ev.listeners('chats.set')[0]({chats:Array.from({length:500},(_,i)=>({id:i+'@g.us',name:'History '+i}))});assert.equal(calls,0);assert.equal(conn.chats['499@g.us'].subject,'History 499')
})
test('history updates retain known metadata, without using it to refresh authorization TTL',async()=>{
 const data=metadata('fixture@g.us'),conn={ev:new EventEmitter(),decodeJid:x=>x,chats:{'fixture@g.us':{metadata:data}},groupMetadata:()=>{throw Error('unnecessary query')}};store.bind(conn);await conn.ev.listeners('chats.set')[0]({chats:[{id:'fixture@g.us'}]});assert.equal(conn.chats['fixture@g.us'].metadata,data);assert.equal(conn.chats['fixture@g.us'].subject,'Fixture')
})
test('hanging group query is bounded, shared, backed off and late metadata is discarded',async()=>{
 let finish,calls=0,clock=0;const cache=createGroupMetadataCache({fetchGroup:id=>{calls++;return calls===1?new Promise(r=>finish=r):Promise.resolve(metadata(id))},fetchAll:async()=>({}),now:()=>clock,fetchTimeoutMs:20})
 const results=await Promise.allSettled(Array.from({length:20},()=>cache.get('fixture@g.us')));assert.equal(calls,1);assert(results.every(x=>x.status==='rejected'&&x.reason.code==='GROUP_METADATA_TIMEOUT'));finish({...metadata('fixture@g.us'),subject:'late, must be ignored'});await Promise.resolve();await assert.rejects(cache.get('fixture@g.us'),e=>e.statusCode===503);assert.equal(calls,1);clock+=5001;assert.equal((await cache.get('fixture@g.us')).subject,'Fixture');assert.equal(calls,2)
})
test('hanging all-groups fetch times out rather than blocking every later request',async()=>{
 let clock=0,calls=0;const cache=createGroupMetadataCache({fetchGroup:async id=>metadata(id),fetchAll:()=>{calls++;return new Promise(()=>{})},now:()=>clock,fetchTimeoutMs:20});await assert.rejects(cache.all(),e=>e.code==='GROUP_METADATA_TIMEOUT');await assert.rejects(cache.all(),e=>e.statusCode===503);assert.equal(calls,1);clock+=5001;assert.equal((await cache.get('fixture@g.us')).subject,'Fixture')
})
test('rate-overlimit never supplies invented or expired participant permissions',async()=>{
 let clock=0,calls=0;const cache=createGroupMetadataCache({fetchGroup:async id=>{if(++calls>1)throw Error('rate-overlimit');return metadata(id)},fetchAll:async()=>({}),now:()=>clock});await cache.get('fixture@g.us');clock=30001;await assert.rejects(cache.get('fixture@g.us'),/rate-overlimit/);await assert.rejects(cache.get('fixture@g.us'),e=>e.statusCode===429);assert.equal(calls,2)
})
test('unresolved composing/paused presence does not hold up AutoAI delivery',{timeout:1500},async()=>{
 const events=[],conn={sendPresenceUpdate:state=>{events.push(state);return new Promise(()=>{})}},m={chat:'fixture@g.us',reply:async text=>events.push(text)}
 await sendAutoAIReply(conn,m,'Halo');assert.deepEqual(events,['composing','Halo','paused'])
})
test('sync throw, async rejection and undefined presence results are harmless',async()=>{
 for(const presence of [()=>{throw Error('fixture')},()=>Promise.reject(Error('fixture')),()=>undefined]){let sent=0;await sendAutoAIReply({sendPresenceUpdate:presence,botConfig:{values:{autoTyping:{enabled:false}}}},{chat:'fixture@g.us',reply:async()=>sent++},'Halo');assert.equal(sent,1)}
})
test('reply fallback preserves content and empty output sends nothing',async()=>{
 const sent=[],conn={botConfig:{values:{autoTyping:{enabled:false}}},sendMessage:async(jid,content)=>sent.push({jid,content})},m={chat:'fixture@g.us',reply:async()=>{throw Error('fixture')}};await sendAutoAIReply(conn,m,'  Halo /menu  ');await sendAutoAIReply(conn,m,'   ');assert.deepEqual(sent,[{jid:m.chat,content:{text:'Halo /menu'}}])
})
