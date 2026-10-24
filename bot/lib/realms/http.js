import {verifyJadibotToken} from './platform-login.js'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {withRealmGate} from './gate.js'
import {RealmError} from './service.js'
import {realmRequestHost} from './proxy-auth.js'
import {REALM_NAME,CLASSES,NPCS,MONSTERS,SHOP,PETS,QUEST,WORLD,WALKABLE,REGIONS,PORTALS,DUNGEON,ROYAL_QUEST,COMBAT} from './catalog.js'
const ROOT=fileURLToPath(new URL('../../public/realms/',import.meta.url))
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml'}
const allowed=new Set(['index.html','app.js','style.css','world.webp','kingdom.webp','dungeon.webp'])
function send(res,status,data){if(res.writableEnded)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
async function body(req){let data='',bytes=0;for await(const c of req){bytes+=c.length;if(bytes>4096)throw new RealmError('Payload terlalu besar.',413);data+=c}try{const parsed=JSON.parse(data);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('object required');return parsed}catch{throw new RealmError('JSON object tidak valid.')}}
function token(req){return String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('realm_session='))?.slice(14)||''}
export function createRealmHttp(getService,{preview=false,verifyPlatformToken=verifyJadibotToken}={}){
 const rates=new Map(),streams=new Map()
 function rate(key,max,window=60000){const t=Date.now(),r=rates.get(key);if(!r||r.until<t){if(rates.size>10000)for(const[k,v]of rates)if(v.until<t)rates.delete(k);if(rates.size>12000)throw new RealmError('Layanan sibuk.',503);rates.set(key,{count:1,until:t+window});return}if(++r.count>max)throw new RealmError('Terlalu banyak permintaan. Coba sebentar lagi.',429)}
 return async function realmHttp(req,res){
  try{
   const url=new URL(req.url,'http://localhost'),route=url.pathname.replace(/\/+$/,'')
   res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');res.setHeader('X-Frame-Options','DENY')
   res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'")
   if(req.method==='GET'&&!route.startsWith('/realms/api/')){
    const name=route==='/realms'?'index.html':route.slice('/realms/'.length)
    if(!allowed.has(name))return send(res,404,{error:'File tidak ditemukan.'})
    const content=fs.readFileSync(path.join(ROOT,name));res.writeHead(200,{'Content-Type':mime[path.extname(name)],'Content-Length':content.length,'Cache-Control':name.endsWith('.webp')?'public,max-age=86400':'no-cache'});return res.end(content)
   }
   if(!['GET','POST'].includes(req.method))return send(res,405,{error:'Metode tidak diizinkan.'})
   if(req.method==='POST'){
    if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new RealmError('Gunakan JSON.',415)
    const origin=req.headers.origin
    if(origin&&new URL(origin).host!==realmRequestHost(req))throw new RealmError('Origin ditolak.',403)
    if(req.headers['sec-fetch-site']==='cross-site')throw new RealmError('Permintaan lintas situs ditolak.',403)
   }
   if(route==='/realms/api/meta'&&req.method==='GET')return send(res,200,{name:REALM_NAME,classes:CLASSES,npcs:NPCS,monsters:MONSTERS,shop:SHOP,pets:PETS,quest:QUEST,world:WORLD,walkable:WALKABLE,regions:REGIONS,portals:PORTALS,dungeon:DUNGEON,royalQuest:ROYAL_QUEST,combat:COMBAT,preview,recoveryNotice:String(process.env.UMI_REALMS_RECOVERY_NOTICE||''),phase:'world-expansion',channels:['global','local']})
   const ip=String(req.headers['cf-connecting-ip']||req.socket.remoteAddress||'').slice(0,80)
   if(route==='/realms/api/login'&&req.method==='POST'){
    rate('login:'+ip,8,60000);const input=await body(req)
    if(Object.keys(input).some(k=>!['code','platformToken'].includes(k)))throw new RealmError('Field login tidak diizinkan.')
    if(input.code!==undefined&&typeof input.code!=='string')throw new RealmError('Kode tidak valid.',400)
    // Verify the website credential outside the game gate; outages must not block gameplay.
    const subject=input.platformToken!==undefined?await verifyPlatformToken(input.platformToken):null
    const result=await withRealmGate(()=>subject?getService().loginWithPlatform(subject,input.code):getService().redeem(input.code))
    const secure=!/^(localhost|127\.0\.0\.1)(:|$)/.test(realmRequestHost(req))
    res.setHeader('Set-Cookie',`realm_session=${result.token}; Path=/realms; HttpOnly; SameSite=Strict; Max-Age=604800${secure?'; Secure':''}`)
    return send(res,200,{state:result.state})
   }
   const service=getService(),session=token(req),a=service.authenticate(session)
   rate('api:'+a.id,650)
   if(route==='/realms/api/logout'&&req.method==='POST'){service.logout(session);res.setHeader('Set-Cookie','realm_session=; Path=/realms; HttpOnly; SameSite=Strict; Max-Age=0');return send(res,200,{ok:true})}
   if(route==='/realms/api/state'&&req.method==='GET')return send(res,200,await withRealmGate(()=>({state:service.advance(a.id)})))
   if(route==='/realms/api/action'&&req.method==='POST'){const input=await body(req);return send(res,200,await withRealmGate(()=>{service.advance(a.id);return service.act(a.id,input)}))}
   if(route==='/realms/api/leaderboard'&&req.method==='GET')return send(res,200,await withRealmGate(()=>({players:service.leaderboard()})))
   if(route==='/realms/api/chat'&&req.method==='GET')return send(res,200,await withRealmGate(()=>({messages:service.chatHistory(a.id,{channel:url.searchParams.get('channel')||'global',before:Number(url.searchParams.get('before')||0),after:Number(url.searchParams.get('after')||0)})})))
   if(route==='/realms/api/chat'&&req.method==='POST'){rate('chat:'+a.id,20);const input=await body(req);return send(res,200,await withRealmGate(()=>service.chat(a.id,input)))}
   if(route==='/realms/api/block'&&req.method==='POST'){rate('block:'+a.id,15);const input=await body(req);return send(res,200,service.block(a.id,input.playerId))}
   if(route==='/realms/api/report'&&req.method==='POST'){rate('report:'+a.id,5);const input=await body(req);return send(res,200,await withRealmGate(()=>service.report(a.id,input.messageId,input.reason)))}
   if(route==='/realms/api/events'&&req.method==='GET'){
    if((streams.get(a.id)||0)>=2||[...streams.values()].reduce((n,x)=>n+x,0)>=100)throw new RealmError('Batas koneksi aktif tercapai.',429)
    streams.set(a.id,(streams.get(a.id)||0)+1)
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive','X-Accel-Buffering':'no'})
    let busy=false,closed=false
    const tick=async()=>{if(busy||closed)return;busy=true;try{service.authenticate(session);await withRealmGate(()=>{if(closed)return;service.touch(a.id);if(res.writableLength>128000){res.end();return}res.write('event: world\ndata: '+JSON.stringify({state:service.advance(a.id),players:service.online(a.id),global:service.chatHistory(a.id),local:service.chatHistory(a.id,{channel:'local'})})+'\n\n')})}catch{res.end()}finally{busy=false}}
    const interval=setInterval(tick,1200);interval.unref();res.on('close',()=>{closed=true;clearInterval(interval);streams.set(a.id,Math.max(0,(streams.get(a.id)||1)-1))});tick();return
   }
   return send(res,404,{error:'Endpoint tidak ditemukan.'})
  }catch(error){const status=error.status||500;if(status>=500)console.error('[REALMS]',error.name);return send(res,status,{error:status>=500?'Layanan RPG belum siap. Coba lagi sebentar.':error.message})}
 }
}
