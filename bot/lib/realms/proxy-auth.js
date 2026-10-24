import crypto from 'node:crypto'
// The remote game relay must authenticate before overriding the browser origin.
export function realmRequestHost(req,{secret=process.env.UMI_GAME_TOKEN||process.env.GAME_TOKEN||'',publicHost=process.env.UMI_REALMS_PUBLIC_HOST||''}={}) {
 const given=String(req.headers['x-umi-realms-key']||''),forwarded=String(req.headers['x-umi-realms-host']||'')
 const a=Buffer.from(secret),b=Buffer.from(given)
 if(secret.length>=32&&publicHost&&forwarded===publicHost&&a.length===b.length&&crypto.timingSafeEqual(a,b))return publicHost
 return req.headers.host||''
}
