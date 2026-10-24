// Publicly playable PREVIEW only. This guest route is not part of production bot API.
import http from 'node:http'
import crypto from 'node:crypto'
import {getDb} from './sqlite.mjs'
import {getUser,saveUser} from '../../bot/lib/rpg/awang-db.js'
import {createRealmService} from '../../bot/lib/realms/service.js'
import {createRealmHttp} from '../../bot/lib/realms/http.js'
import {withRealmGate} from '../../bot/lib/realms/gate.js'
const db=getDb(),service=createRealmService({db,getUser,saveUser})
const handle=createRealmHttp(()=>service,{preview:true}),limits=new Map()
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.url==='/'){res.writeHead(302,{Location:'/realms'});res.end();return}
  if(req.url==='/health'){send(res,200,{ok:true,mode:'preview',storage:'sqlite',productionLinked:false});return}
  if(req.url==='/realms/api/demo-login'){
   if(req.method!=='POST')return send(res,405,{error:'POST diperlukan.'})
   if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(res,415,{error:'JSON diperlukan.'})
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return send(res,403,{error:'Origin ditolak.'})
   if(req.headers['sec-fetch-site']==='cross-site')return send(res,403,{error:'Origin ditolak.'})
   let bytes=0;for await(const part of req){bytes+=part.length;if(bytes>1024)return send(res,413,{error:'Payload terlalu besar.'})}
   const cookie=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('realm_session='))?.slice(14)
   try{const a=service.authenticate(cookie);return send(res,200,{state:service.snapshot(a.id),preview:true})}catch{}
   const ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].slice(0,80),now=Date.now()
   for(const[k,v]of limits)if(v.until<now)limits.delete(k)
   const limit=limits.get(ip)||{count:0,until:now+60000};if(++limit.count>8||limits.size>5000)return send(res,429,{error:'Terlalu banyak akun uji. Tunggu satu menit.'});limits.set(ip,limit)
   // Server-assigned synthetic identity; never a phone supplied by the visitor.
   const result=await withRealmGate(()=>{
    const jid='990'+BigInt('0x'+crypto.randomBytes(7).toString('hex')).toString().padStart(17,'0')
    const user=getUser(jid);user.koin=4000;user.inventory.potion=3;saveUser(jid,user)
    return service.redeem(service.issueCode(jid).code)
   })
   const secure=!/^(localhost|127\.0\.0\.1)(:|$)/.test(req.headers.host||'')
   res.setHeader('Set-Cookie',`realm_session=${result.token}; Path=/realms; HttpOnly; SameSite=Strict; Max-Age=604800${secure?'; Secure':''}`)
   return send(res,200,{state:result.state,preview:true})
  }
  return handle(req,res)
 }catch{if(!res.headersSent)send(res,500,{error:'Preview belum siap. Coba lagi sebentar.'});else res.end()}
})
server.listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('Eclipse Realms PREVIEW listening; persistent isolated SQLite; no production credentials loaded.'))
function stop(){server.close();server.closeAllConnections();try{db.pragma('wal_checkpoint(TRUNCATE)');db.close()}catch{}process.exit(0)}
process.on('SIGTERM',stop);process.on('SIGINT',stop)
