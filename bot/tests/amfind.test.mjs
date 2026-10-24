import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {createAmFinder,normalizeTikTokInput,extractPresetLinks} from '../lib/amfind.js'
import handler,{createAmfindHandler,formatAmResult} from '../plugins/tools/amfind.js'
const ID='1234567890123456789',URL=`https://www.tiktok.com/@fixture/video/${ID}`,SHORT='https://vt.tiktok.com/Fixture123/',LINK='https://alightcreative.com/am/share/u/fixture/p/example'
const json=data=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}})
const ok=data=>json({code:0,data})
const meta={id:ID,title:'Fixture video',author:{id:'creator',unique_id:'fixture',nickname:'Fixture'},comment_count:2,play_count:20,digg_count:3,duration:5}
const thread={id:'1001',text:'presetnya mana?',reply_total:1,user:{id:'someone'}}
const reply={id:'1002',text:LINK+'\nXML di saluran https://whatsapp.com/channel/Fixture',user:{id:'creator',unique_id:'fixture'}}
function fixture(overrides={}){
 let clock=0;const calls=[]
 const finder=createAmFinder({now:()=>clock,sleep:async ms=>{clock+=ms},pacingMs:1200,...overrides,fetchImpl:async(url,options)=>{
  const u=new globalThis.URL(url);calls.push({url,at:clock,options})
  if(overrides.fetchImpl)return overrides.fetchImpl(u,options,calls)
  if(u.hostname==='vt.tiktok.com')return new Response(null,{status:301,headers:{location:URL+'?_r=1'}})
  if(u.pathname==='/api/')return ok(meta)
  if(u.pathname==='/api/comment/list')return ok({comments:[thread],cursor:50,hasMore:false})
  if(u.pathname==='/api/comment/reply')return ok({comments:[reply],cursor:1,hasMore:false})
  throw Error('Unexpected fixture URL')
 }})
 return{finder,calls,advance:n=>clock+=n}
}
for(const input of [SHORT,SHORT.slice(0,-1),`[${SHORT}](${SHORT})`,`<${SHORT}>`])test('normalizes short URL variant '+input,()=>assert.equal(normalizeTikTokInput(input),SHORT))
for(const input of ['https://evil.test/?q=tiktok.com','https://www.tiktok.com.evil.test/@x/video/'+ID,'https://tiktok.com@127.0.0.1/@x/video/'+ID,'http://127.0.0.1','file:///etc/passwd','https://www.tiktok.com:8443/@x/video/'+ID,'https://www.tiktok.com/@fixture',URL+' '+URL,'https://vt.tiktok.com/../api/foo'])test('rejects non-video/unsafe input '+input,()=>assert.throws(()=>normalizeTikTokInput(input),e=>e.code==='INVALID_URL'))
test('canonical TikTok links discard tracking parameters without losing video identity',()=>assert.equal(normalizeTikTokInput(URL+'/?tracking=1#fragment'),URL))
test('Markdown uses its actual destination, not a misleading visible label',()=>assert.throws(()=>normalizeTikTokInput(`[${URL}](https://evil.test/)`)))
test('finds creator preset in reply, marks XML channel separately and paces requests',async()=>{
 const f=fixture(),r=await f.finder(SHORT);assert.equal(r.status,'found');assert.equal(r.items[0].url,LINK);assert.equal(r.items[0].source,'reply');assert.equal(r.items[0].isAuthor,true);assert.equal(r.items[1].kind,'channel');assert.equal(r.inspected,1);assert.equal(r.replies,1)
 const calls=f.calls.filter(x=>x.url.startsWith('https://www.tikwm.com'));assert.equal(calls.length,3);for(let i=1;i<calls.length;i++)assert(calls[i].at-calls[i-1].at>=1200);assert(new globalThis.URL(calls[2].url).searchParams.has('video_id'));assert(!f.calls.some(x=>x.url.includes('bintangapi')))
})
test('slash/Markdown duplicates share one in-flight lookup and cloned positive cache',async()=>{
 const f=fixture();const [a,b]=await Promise.all([f.finder(SHORT),f.finder(`[x](${SHORT.slice(0,-1)})`)]);assert.equal(f.calls.length,4);a.items[0].url='mutated';assert.equal(b.items[0].url,LINK);const c=await f.finder(URL);assert.equal(c.items[0].url,LINK);assert.equal(f.calls.length,4);f.advance(300001);await f.finder(URL);assert(f.calls.length>4)
})
test('caption preset can return without any comment queries',async()=>{
 const f=fixture({fetchImpl:async()=>ok({...meta,title:LINK})});const r=await f.finder(URL);assert.equal(r.status,'found');assert.equal(r.items[0].source,'caption');assert.equal(f.calls.length,1)
})
test('TikWM metadata/comments outage can use public TikTok page and comment API',async()=>{
 const f=fixture({pacingMs:0,fetchImpl:async u=>{
  if(u.hostname==='www.tikwm.com')throw Error('fixture provider outage')
  if(u.pathname.includes('/video/'))return new Response('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">'+JSON.stringify({__DEFAULT_SCOPE__:{'webapp.video-detail':{itemInfo:{itemStruct:{id:ID,desc:'Fixture',author:{id:'creator',uniqueId:'fixture',nickname:'Fixture'},stats:{commentCount:2}}}}}})+'</script>')
  return json({status_code:0,comments:u.pathname.includes('/reply/')?[{...reply,cid:'1002'}]:[{...thread,cid:'1001',reply_comment_total:1}],cursor:50,has_more:0})
 }});const r=await f.finder(URL);assert.equal(r.status,'found');assert.equal(r.source,'tiktok');assert.equal(r.items[0].url,LINK)
})
test('provider results for a different video are rejected, not attributed to requested video',async()=>{
 const f=fixture({fetchImpl:async()=>ok({...meta,id:'9999999999999999999'})});await assert.rejects(f.finder(URL),e=>e.code==='VIDEO_MISMATCH')
})
test('external redirects are rejected before the second network call',async()=>{
 const f=fixture({fetchImpl:async()=>new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}})});await assert.rejects(f.finder(SHORT),e=>e.code==='INVALID_URL');assert.equal(f.calls.length,1)
})
test('comment outages report incomplete instead of claiming no preset, and are not cached',async()=>{
 const f=fixture({pacingMs:0,fetchImpl:async u=>u.pathname==='/api/'?ok(meta):new Response('provider unavailable',{status:503})});const a=await f.finder(URL);assert.equal(a.status,'incomplete');const n=f.calls.length;await f.finder(URL);assert(f.calls.length>n)
})
test('fully read zero-comment video has qualified not-found result',async()=>{
 const f=fixture({pacingMs:0,fetchImpl:async u=>u.pathname==='/api/'?ok({...meta,comment_count:0}):ok({comments:[],cursor:0,hasMore:false})});const r=await f.finder(URL);assert.equal(r.status,'not_found');assert.match(formatAmResult(r),/tidak memastikan/)
})
test('repeated cursors and duplicate comments stop without endless pagination',async()=>{
 const f=fixture({pacingMs:0,fetchImpl:async u=>u.pathname==='/api/'?ok({...meta,comment_count:10}):ok({comments:[{id:'1',text:'nothing',user:{}}],cursor:0,hasMore:true})});const r=await f.finder(URL);assert.equal(r.status,'incomplete');assert.equal(r.inspected,1);assert.equal(r.pages,1);assert.equal(f.calls.length,2)
})
test('reply/thread and page limits bound work when no creator preset is found',async()=>{
 const f=fixture({pacingMs:0,maxPages:2,maxThreads:2,fetchImpl:async u=>{
  if(u.pathname==='/api/')return ok({...meta,comment_count:100})
  if(u.pathname==='/api/comment/reply')return ok({comments:[],cursor:0,hasMore:false})
  const cursor=Number(u.searchParams.get('cursor'));return ok({comments:Array.from({length:4},(_,i)=>({id:String(cursor+i+1),text:'preset?',reply_total:1,user:{}})),cursor:cursor+50,hasMore:true})
 }});const r=await f.finder(URL);assert.equal(r.status,'incomplete');assert.equal(r.pages,2);assert.equal(f.calls.filter(x=>x.url.includes('/comment/reply')).length,2)
})
test('one rate-limit response is retried with pacing, not a tight retry loop',async()=>{
 let n=0;const f=fixture({fetchImpl:async u=>{if(u.pathname==='/api/'){if(++n===1)return json({code:-1,msg:'Free Api Limit: 1 request/second.'});return ok({...meta,title:LINK})}throw Error('unexpected')}});assert.equal((await f.finder(URL)).status,'found');assert.equal(f.calls.length,2);assert(f.calls[1].at-f.calls[0].at>=1200)
})
test('per-search budget aborts unresponsive requests without 30-second hang',{timeout:1000},async()=>{
 const calls=[],find=createAmFinder({budgetMs:45,requestMs:25,pacingMs:0,fetchImpl:async(_u,o)=>{calls.push(o.signal);return new Promise(()=>{})}});const started=Date.now();await assert.rejects(find(URL));assert(Date.now()-started<500);assert(calls.every(x=>x.aborted))
})
test('oversized response is rejected before parsing',async()=>{
 const f=fixture({pacingMs:0,fetchImpl:async()=>new Response('x',{headers:{'content-length':'99999999'}})});await assert.rejects(f.finder(URL),e=>e.code==='SIZE')
})
test('busy limit rejects another video while identical requests still deduplicate',async()=>{
 let release;const hold=new Promise(r=>release=r);const f=fixture({maxActive:1,pacingMs:0,fetchImpl:async()=>{await hold;return ok({...meta,title:LINK})}});const first=f.finder(URL),same=f.finder(URL);await assert.rejects(f.finder(URL.replace(ID,'9999999999999999999')),e=>e.code==='BUSY');release();assert.equal((await first).status,'found');await same;assert.equal(f.calls.length,1)
})
test('different user link is not mislabelled as the video creator',async()=>{
 const f=fixture({pacingMs:0,fetchImpl:async u=>u.pathname==='/api/'?ok({...meta,comment_count:1}):ok({comments:[{id:'1',text:LINK,user:{id:'someone',unique_id:'fixture'}}],cursor:1,hasMore:false})});const r=await f.finder(URL);assert.equal(r.items[0].isAuthor,false);assert.match(formatAmResult(r),/pengguna lain/)
})
test('extractor rejects lookalikes/credentials/huge URLs and does not call channel an XML download',()=>{
 const links=extractPresetLinks(`${LINK}) ${LINK} https://alightcreative.com.evil/am/share/x https://evil.test/a.xml https://user:pass@alight.link/abc https://alight.link/${'x'.repeat(3000)} XML https://whatsapp.com/channel/Fixture`,{isAuthor:true,source:'reply'});assert.equal(links.length,2);assert.equal(links[0].url,LINK);assert.equal(links[1].kind,'channel');assert.match(links[1].label,/bukan file langsung/);assert.equal(extractPresetLinks('XML https://whatsapp.com/channel/Fixture',{isAuthor:false}).length,0)
})
test('XML file share links are returned as links only, without executing or downloading them',()=>{
 const items=extractPresetLinks('XML https://mediafire.com/file/fixture/preset.xml/file https://drive.google.com/file/d/fixture/view');assert.equal(items.length,2);assert(items.every(x=>x.kind==='preset'))
})
test('plugin preserves configured prefix for usage and both command aliases',async()=>{
 const texts=[];await handler({reply:async t=>texts.push(t)},{conn:{},usedPrefix:'!!',command:'amfinder',text:''});assert.match(texts[0],/!!amfinder/);assert.deepEqual(handler.command,['amfind','amfinder'])
})
test('actual plugin handler returns links and never waits for a stuck loading reaction',{timeout:1000},async()=>{
 const texts=[],f=fixture(),run=createAmfindHandler(f.finder);await run({chat:'fixture@g.us',key:{id:'fixture'},reply:async t=>texts.push(t)},{conn:{sendMessage:()=>new Promise(()=>{})},usedPrefix:'/',command:'amfind',text:SHORT});assert.equal(texts.length,1);assert(texts[0].includes(LINK));assert.match(texts[0],/balasan komentar kreator/);assert(!texts[0].startsWith('/'))
})
test('plugin does not expose raw timeout, HTML or private provider diagnostics',async()=>{
 const texts=[],run=createAmfindHandler(async()=>{throw Object.assign(Error('timeout of 30000ms exceeded <secret>'),{code:'TIMEOUT'})});await run({chat:'fixture@g.us',reply:async t=>texts.push(t)},{conn:{},usedPrefix:'!',command:'amfind',text:URL});assert.equal(texts.length,1);assert(!/30000|secret|Preset tidak ditemukan/.test(texts[0]));assert.match(texts[0],/belum dapat dibaca/)
})
test('new runtime files pass syntax checks without unsupported logical assignment',()=>{
 for(const file of ['../lib/amfind.js','../plugins/tools/amfind.js']){
  const url=new globalThis.URL(file,import.meta.url),source=fs.readFileSync(url,'utf8')
  assert(!/\|\|=|\?\?=|&&=/.test(source))
  execFileSync(process.execPath,['--check',fileURLToPath(url)])
 }
})
