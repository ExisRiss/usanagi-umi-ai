import test from 'node:test'
import assert from 'node:assert/strict'
import { requestBot } from '../api/_bot-transport.js'
import proxy from '../api/proxy.js'
import fs from 'node:fs'
import vm from 'node:vm'

async function mocked(fetcher, task) { const old=global.fetch; global.fetch=fetcher; try { await task() } finally { global.fetch=old } }
function response() { return {headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v},status(v){this.statusCode=v;return this},json(v){this.body=v;return this},send(v){this.body=v;return this},end(){return this}} }
test('transport preserves JSON and explicitly blocks credential-bearing redirects',()=>mocked(async(url,options)=>{assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer fixture-only');return new Response('{"ok":true}')},async()=>{const r=await requestBot('https://backend.example/api/health',{headers:{Authorization:'Bearer fixture-only'}});assert.equal(r.data.ok,true)}))
test('transport does not replay a failed POST or expose internal address',()=>{let calls=0;return mocked(async()=>{calls++;throw Error('private upstream address')},async()=>{await assert.rejects(requestBot('https://backend.example/api/session/restart',{method:'POST'}),e=>e.status===502&&e.code==='BOT_UNREACHABLE'&&!e.message.includes('private'));assert.equal(calls,1)})})
test('headers timeout is a sanitized 504',()=>mocked(async()=>{throw Object.assign(Error('private'),{name:'TimeoutError'})},async()=>{await assert.rejects(requestBot('https://backend.example'),e=>e.status===504&&e.code==='BOT_TIMEOUT')}))
test('response-body timeout also becomes 504',()=>mocked(async()=>({text:async()=>{throw Object.assign(Error('private'),{name:'AbortError'})}}),async()=>{await assert.rejects(requestBot('https://backend.example'),e=>e.status===504)}))
test('HTML tunnel failure is not forwarded as an API payload',()=>mocked(async()=>new Response('<html>internal details</html>',{status:502}),async()=>{await assert.rejects(requestBot('https://backend.example'),e=>e.code==='BOT_INVALID_RESPONSE'&&!e.message.includes('internal'))}))
test('wallet recovery 503 remains 503 and does not become an empty successful wallet',()=>mocked(async()=>Response.json({error:'Recovery required'},{status:503}),async()=>{const r=await requestBot('https://backend.example');assert.equal(r.response.status,503);assert.equal(r.data.error,'Recovery required')}))
test('HEAD and no-content responses remain valid',()=>mocked(async()=>new Response(null,{status:204}),async()=>{assert.equal((await requestBot('https://backend.example',{method:'HEAD'})).response.status,204)}))
test('proxy health reaches configured origin while protected routes and CSRF stay blocked',async()=>{
 const old=process.env.UMI_API_ORIGIN;process.env.UMI_API_ORIGIN='https://backend.example';
 try{await mocked(async(url)=>{assert.equal(url,'https://backend.example/api/health');return Response.json({ok:true,service:'usanagi-umi-jadibot'})},async()=>{
  const r=response();await proxy({method:'GET',query:{path:'health'},headers:{host:'site.example'}},r);assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).ok,true)
  const denied=response();await proxy({method:'GET',query:{path:'sessions'},headers:{host:'site.example'}},denied);assert.equal(denied.statusCode,401)
  const csrf=response();await proxy({method:'POST',query:{path:'session/restart'},headers:{host:'site.example',origin:'https://attacker.example'},body:{}},csrf);assert.equal(csrf.statusCode,403)
 })}finally{if(old===undefined)delete process.env.UMI_API_ORIGIN;else process.env.UMI_API_ORIGIN=old}
})
test('owner controls have access to the private application scope, not missing global helpers',()=>{
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{dataset:{},classList:{toggle(){}},textContent:'',disabled:false});return nodes.get(id)}
 const context={window:{},document:{getElementById:node},console};context.globalThis=context;vm.createContext(context)
 const script=fs.readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8').replace(/init\(\)\.catch\(error=>\{console\.error\(error\);toast\('Aplikasi gagal dimulai: '\+error\.message,true\)\}\)/,"globalThis.ui={applyMainBotToggle,applyAutoreadToggle,mainConnectionLabel}")
 vm.runInContext(script,context);context.ui.applyMainBotToggle({main_bot_enabled:false});context.ui.applyAutoreadToggle({autoread:false})
 assert.equal(node('mainBotToggleState').textContent,'NONAKTIF');assert.equal(node('autoreadState').textContent,'NONAKTIF');assert.equal(context.ui.mainConnectionLabel({main_bot_enabled:false}),'NONAKTIF')
})
test('HTML uses versioned external scripts/styles compatible with strict CSP',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/);assert.doesNotMatch(html,/\sstyle="/);assert.match(html,/auth-controls\.js\?v=20261018-session60/);assert.match(html,/layout-compat\.css/);assert.equal(html,fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8'))
})
