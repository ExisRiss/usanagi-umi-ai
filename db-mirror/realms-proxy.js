// Fixed server-configured destination; browser input can never choose an upstream.
import http from 'node:http'
import https from 'node:https'
export function createRealmProxy({origin=process.env.UMI_REALMS_BOT_ORIGIN||`http://127.0.0.1:${Number(process.env.UMI_REALMS_BOT_PORT)||3366}`,secret=process.env.UMI_GAME_TOKEN||process.env.GAME_TOKEN||'',publicHost=process.env.UMI_REALMS_PUBLIC_HOST||''}={}) {
 const base=new URL(origin)
 if(!['http:','https:'].includes(base.protocol)||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw Error('Invalid fixed RPG origin')
 const remote=!['127.0.0.1','localhost','[::1]'].includes(base.hostname)
 if(remote&&(base.protocol!=='https:'||secret.length<32||!publicHost))throw Error('Remote RPG origin requires HTTPS, existing shared secret and public host')
 return function proxy(req,res){
  const headers={...req.headers};for(const key of ['connection','upgrade','proxy-authorization','x-umi-realms-key','x-umi-realms-host'])delete headers[key]
  if(publicHost&&secret.length>=32){headers.host=base.host;headers['x-umi-realms-key']=secret;headers['x-umi-realms-host']=publicHost}
  const request=(base.protocol==='https:'?https:http).request({hostname:base.hostname,port:base.port||(base.protocol==='https:'?443:80),path:req.url,method:req.method,headers},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res)})
  request.setTimeout(35000,()=>request.destroy())
  request.on('error',()=>{if(res.destroyed||res.writableEnded)return;if(!res.headersSent)res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Layanan RPG sedang memulai ulang.'}))})
  res.on('close',()=>request.destroy());req.pipe(request)
 }
}
