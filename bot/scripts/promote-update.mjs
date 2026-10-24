/* Controlled maintenance only: run from .umi-update-stage-* after runtime backup. */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const STAGE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
if(!path.basename(STAGE).startsWith('.umi-update-stage-'))throw new Error('Run only from the verified staging directory')
const ROOT=path.dirname(STAGE),BACKUP=path.join(ROOT,'.umi-source-rollback-20261012')
const changed=['handler.js','package.json','lib/auto-ai.js','lib/auto-ai-prompt.js','lib/groq-client.js','lib/bot-connection-context.js','lib/imported-compat.js','lib/umi-agent.js','lib/auto-backup.js','lib/vercel-backup-export.js','plugins/group/group-manage.js','plugins/misc/rch2.js']
for(const rel of ['integrations','plugins/pelengkap'])if(fs.existsSync(path.join(ROOT,rel)))throw new Error('Existing integration directory: merge manually; refusing overwrite')
if(fs.existsSync(BACKUP))throw new Error('Rollback directory exists; refusing duplicate promotion')
fs.mkdirSync(BACKUP,{mode:0o700})
const restore=[]
try{
 for(const rel of changed){const to=path.join(ROOT,rel),from=path.join(STAGE,rel);if(!fs.existsSync(from))throw new Error('Missing verified source '+rel);if(fs.existsSync(to)){const backup=path.join(BACKUP,rel);fs.mkdirSync(path.dirname(backup),{recursive:true});fs.copyFileSync(to,backup);restore.push(rel)}fs.mkdirSync(path.dirname(to),{recursive:true});const temp=to+'.umi-next';fs.copyFileSync(from,temp);fs.renameSync(temp,to)}
 for(const rel of ['integrations','plugins/pelengkap']){fs.mkdirSync(path.dirname(path.join(ROOT,rel)),{recursive:true});fs.renameSync(path.join(STAGE,rel),path.join(ROOT,rel))}
 for(const rel of ['FEATURE_MIGRATION_REPORT.json','.env.groq.example'])fs.copyFileSync(path.join(STAGE,rel),path.join(ROOT,rel))
 // Tests and scripts are useful for future regression checks; original files are not replaced.
 for(const dir of ['tests','scripts']){const copy=(from,to)=>{fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){const src=path.join(from,entry.name),dst=path.join(to,entry.name);if(entry.isDirectory())copy(src,dst);else if(!fs.existsSync(dst))fs.copyFileSync(src,dst)}};copy(path.join(STAGE,dir),path.join(ROOT,dir))}
 fs.writeFileSync(path.join(BACKUP,'rollback-manifest.json'),JSON.stringify({changed,restore,added:['integrations','plugins/pelengkap'],runtime_data_modified:false},null,2),{mode:0o600})
 console.log(JSON.stringify({promoted:changed.length,addedPlugins:JSON.parse(fs.readFileSync(path.join(ROOT,'FEATURE_MIGRATION_REPORT.json'),'utf8')).features.filter(row=>row.status==='installed-static').length,rollback:'.umi-source-rollback-20261012',runtimeDataModified:false,restartRequired:true}))
}catch(error){for(const rel of restore)fs.copyFileSync(path.join(BACKUP,rel),path.join(ROOT,rel));throw error}
