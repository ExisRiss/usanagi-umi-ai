// Run in one panel allocation: `node scripts/role-start.mjs bot|game`.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawn} from 'node:child_process'
const role=process.argv[2],root=process.cwd(),children=new Set();let stopping=false
if(!['bot','game'].includes(role))throw Error('Choose bot or game role')
process.umask(0o077)
const status=phase=>fs.writeFileSync('deployment-status.json',JSON.stringify({role,phase,node:process.version,at:new Date().toISOString()}),{mode:0o600})
function log(tag,data){const s='['+tag+'] '+data.toString();process.stdout.write(s);try{if(fs.existsSync('server.log')&&fs.statSync('server.log').size>8*1024*1024)fs.renameSync('server.log','server.previous.log');fs.appendFileSync('server.log',s,{mode:0o600})}catch{}}
for(const name of ['.deployment.env','.backup-export.env','.error-report.env','.owner-console-relay.env','.env.groq']){
 if(!fs.existsSync(name))continue;fs.chmodSync(name,0o600)
 for(const line of fs.readFileSync(name,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].trim().replace(/^(['"])(.*)\1$/,'$2')}
}
if(fs.existsSync('game-token.txt')){const key=fs.readFileSync('game-token.txt','utf8').trim();process.env.UMI_GAME_TOKEN=key;process.env.GAME_TOKEN=key;fs.chmodSync('game-token.txt',0o600)}
if(role==='game')process.env.GAME_PORT=process.env.SERVER_PORT||process.env.GAME_PORT||'4470'
function run(tag,cmd,args,restart=false){const child=spawn(cmd,args,{cwd:root,env:process.env,stdio:['inherit','pipe','pipe']});children.add(child);child.stdout.on('data',d=>log(tag,d));child.stderr.on('data',d=>log(tag,d));child.on('error',e=>log(tag,e.message+'\n'));child.on('close',code=>{children.delete(child);if(restart&&!stopping)setTimeout(()=>run(tag,cmd,args,true),5000)});return child}
async function once(tag,cmd,args){const child=run(tag,cmd,args);const code=await new Promise(resolve=>child.once('close',resolve));if(code!==0)throw Error(tag+' exited '+code)}
status('preparing')
if(role==='bot'){
 const lockHash=crypto.createHash('sha256').update(fs.readFileSync('package-lock.json')).digest('hex');let old='';try{old=fs.readFileSync('node_modules/.umi-lock-sha','utf8')}catch{}
 if(old!==lockHash){status('installing-dependencies');await once('npm','npm',['ci','--omit=dev','--no-audit','--no-fund']);fs.writeFileSync('node_modules/.umi-lock-sha',lockHash)}
}
if(!fs.existsSync('cloudflared'))throw Error('Verified cloudflared binary not uploaded')
fs.chmodSync('cloudflared',0o700);fs.chmodSync('tunnel-creds.json',0o600)
run('tunnel',path.join(root,'cloudflared'),['tunnel','--no-autoupdate','--config',path.join(root,'tunnel.yml'),'run'],true)
run(role,process.execPath,role==='bot'?['scripts/boot.js']:['game.js'],true)
status('services-started')
function stop(){if(stopping)return;stopping=true;status('stopping');for(const c of children)c.kill('SIGTERM');setTimeout(()=>process.exit(0),4000)}
process.on('SIGTERM',stop);process.on('SIGINT',stop)
