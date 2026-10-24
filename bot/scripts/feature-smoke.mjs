/* Import-only readiness check. Run with Node filesystem permission restrictions. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
if(process.cwd()!==ROOT)process.chdir(ROOT)
global.db={data:{users:{},chats:{},settings:{},stats:{}},write:async()=>{}}
global.owner=[];global.namebot='Usanagi Umi AI';global.packname='Usanagi Umi AI';global.author='AlzRiss';global.plugins={}
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'FEATURE_MIGRATION_REPORT.json'),'utf8'))
const results=[]
for(const row of manifest.features.filter(r=>r.status==='installed-static')){
 try{
  const native=await import(new URL('../'+row.wrapper,import.meta.url));
  const original=await import(new URL('../integrations/'+row.source+'/'+row.file,import.meta.url))
  const fn=original.handler||original.default?.handler||(typeof original.default==='function'?original.default:null)
  if(typeof native.default!=='function'||typeof fn!=='function')throw new Error('Missing handler export')
  if(!Array.isArray(native.default.command)||!native.default.command.length)throw new Error('No commands')
  results.push({source:row.source,file:row.file,wrapper:row.wrapper,import:'pass'})
 }catch(error){results.push({source:row.source,file:row.file,wrapper:row.wrapper,import:'fail',error:String(error?.message||error).replace(/(?:gsk_|ghp_|vcp_|ptlc_)[\w-]{16,}/g,'<redacted>').slice(0,300)})}
}
const summary={checked:results.length,passed:results.filter(r=>r.import==='pass').length,failed:results.filter(r=>r.import==='fail').length,runtime:process.version,scope:'Imports only; no feature handlers executed, no WhatsApp messages sent, no API behavior claimed',results}
fs.writeFileSync(path.join(ROOT,'feature-smoke-results.json'),JSON.stringify(summary,null,2))
console.log(JSON.stringify({checked:summary.checked,passed:summary.passed,failed:summary.failed,runtime:summary.runtime}))
process.exit(summary.failed?1:0)
