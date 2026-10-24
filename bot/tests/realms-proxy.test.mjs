import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import {createRealmProxy} from '../../db-mirror/realms-proxy.js'
import {createRealmHttp} from '../lib/realms/http.js'
import {realmRequestHost} from '../lib/realms/proxy-auth.js'
const secret='unit-test-shared-relay-secret-not-production-123456',publicHost='game.example'
test('proxy accepts only configured destinations and authenticated remote HTTPS',()=>{
 for(const origin of ['http://remote.example','https://name:password@remote.example','https://remote.example/path','https://remote.example/?redirect=other'])assert.throws(()=>createRealmProxy({origin,secret,publicHost}))
 assert.throws(()=>createRealmProxy({origin:'https://remote.example',secret:'short',publicHost}))
 assert.equal(typeof createRealmProxy({origin:'https://remote.example',secret,publicHost}),'function')
})
test('origin forwarding requires exact public hostname and constant-time key match',()=>{
 const req={headers:{host:'api.example','x-umi-realms-key':secret,'x-umi-realms-host':publicHost}}
 assert.equal(realmRequestHost(req,{secret,publicHost}),publicHost)
 req.headers['x-umi-realms-key']='wrong';assert.equal(realmRequestHost(req,{secret,publicHost}),'api.example')
 req.headers['x-umi-realms-key']=secret;req.headers['x-umi-realms-host']='evil.example';assert.equal(realmRequestHost(req,{secret,publicHost}),'api.example')
})
test('real HTTP relay preserves cookies, overwrites spoofed relay headers and rejects untrusted origin',async()=>{
 const oldKey=process.env.UMI_GAME_TOKEN,oldHost=process.env.UMI_REALMS_PUBLIC_HOST;process.env.UMI_GAME_TOKEN=secret;process.env.UMI_REALMS_PUBLIC_HOST=publicHost
 const service={redeem:code=>{assert.equal(code,'unit-login');return{token:'unit-session-token',state:{id:'public-test-id'}}},authenticate:token=>{if(token!=='unit-session-token')throw Object.assign(Error('Unauthorized'),{status:401});return{id:'public-test-id'}},snapshot:()=>({id:'public-test-id',gold:100}),advance:()=>({id:'public-test-id',gold:100})}
 const bot=http.createServer(createRealmHttp(()=>service));await new Promise(r=>bot.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+bot.address().port
 const game=http.createServer(createRealmProxy({origin,secret,publicHost}));await new Promise(r=>game.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+game.address().port
 try{
  const opts={method:'POST',headers:{'content-type':'application/json',origin:'https://'+publicHost},body:JSON.stringify({code:'unit-login'})}
  assert.equal((await fetch(origin+'/realms/api/login',opts)).status,403)
  const spoof={...opts,headers:{...opts.headers,'x-umi-realms-key':'fake','x-umi-realms-host':publicHost}}
  assert.equal((await fetch(origin+'/realms/api/login',spoof)).status,403)
  const r=await fetch(base+'/realms/api/login',spoof);assert.equal(r.status,200);const cookie=r.headers.get('set-cookie');assert.match(cookie,/Secure/);assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.equal(r.headers.get('x-umi-realms-key'),null);assert(!(await r.text()).includes(secret))
  const state=await fetch(base+'/realms/api/state',{headers:{cookie:cookie.split(';')[0]}});assert.equal(state.status,200);assert.equal((await state.json()).state.gold,100)
  assert.equal((await fetch(base+'/realms/api/login',{...opts,headers:{...opts.headers,origin:'https://evil.example'}})).status,403)
  assert.equal((await fetch(base+'/realms/api/demo-login',{...opts,headers:{...opts.headers,cookie:cookie.split(';')[0]}})).status,404)
 }finally{bot.closeAllConnections();game.closeAllConnections();await Promise.all([new Promise(r=>bot.close(r)),new Promise(r=>game.close(r))]);if(oldKey===undefined)delete process.env.UMI_GAME_TOKEN;else process.env.UMI_GAME_TOKEN=oldKey;if(oldHost===undefined)delete process.env.UMI_REALMS_PUBLIC_HOST;else process.env.UMI_REALMS_PUBLIC_HOST=oldHost}
})
