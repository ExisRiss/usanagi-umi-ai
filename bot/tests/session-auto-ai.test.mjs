import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import vm from 'node:vm'
import {loadJadibotConfig,saveJadibotConfig,runWithBotConfig,getCurrentBotConfig} from '../lib/bot-config.js'
import {shouldAutoAITrigger,planAutoAI} from '../lib/auto-ai.js'
const root=fs.mkdtempSync(path.join(os.tmpdir(),'umi-session-ai-'))
const make=id=>loadJadibotConfig(id,path.join(root,id))
const api=fs.readFileSync(new URL('../lib/jadibot-platform-api.js',import.meta.url),'utf8')
const functions=api.slice(api.indexOf('function profileSettings('),api.indexOf('\nfunction readSessionFiles('))
const scope={saveJadibotConfig,lockedJadibotOwnerNumber:()=>'',normalizeJadibotOwners:x=>x,safeText:(s,n)=>String(s).slice(0,n),clearScopedPrefixes:()=>{},normalizeBotNumber:s=>String(s).replace(/\D/g,''),URL}
vm.createContext(scope);vm.runInContext(functions,scope)
const message={text:'halo',chat:'990000000001@s.whatsapp.net',sender:'990000000002@s.whatsapp.net',quoted:{fromMe:true}}
const conn={user:{id:'990000000003@s.whatsapp.net'}}
test('legacy sessions default ON; two sessions never share setting objects',()=>{const a=make('990000000101'),b=make('990000000102');assert.equal(a.values.autoAI.enabled,true);a.values.autoAI.enabled=false;assert.equal(b.values.autoAI.enabled,true)})
test('real settings apply/get roundtrip, disk reload and other fields preserved',()=>{const a=make('990000000103'),b=make('990000000104');a.defaultPrefix='!';a.values.autoTyping.enabled=false;const before=JSON.stringify(b);assert.equal(scope.applySettings(a,{auto_ai:false}).auto_ai,false);assert.equal(make(a.number).values.autoAI.enabled,false);assert.equal(make(a.number).defaultPrefix,'!');assert.equal(make(a.number).values.autoTyping.enabled,false);assert.equal(JSON.stringify(b),before);assert.equal(scope.applySettings(a,{auto_ai:true}).auto_ai,true);assert.equal(make(a.number).values.autoAI.enabled,true)})
for(const value of ['false',0,1,null,{},[]])test('non-boolean toggle rejected before any profile mutation: '+JSON.stringify(value),()=>{const a=make('990000000105'),before=JSON.stringify(a);assert.throws(()=>scope.applySettings(a,{auto_ai:value,bot_name:'wrong'}),e=>e.status===400);assert.equal(JSON.stringify(a),before)})
test('unrelated settings saves do not re-enable disabled AutoAI',()=>{const a=make('990000000106');scope.applySettings(a,{auto_ai:false});scope.applySettings(a,{bot_name:'Session A'});assert.equal(scope.profileSettings(a).auto_ai,false);assert.equal(make(a.number).values.autoAI.enabled,false)})
test('OFF blocks mention, reply and own !! while another session remains ON',()=>{const a=make('990000000107'),b=make('990000000108');scope.applySettings(a,{auto_ai:false});for(const m of [message,{...message,quoted:null,mentionedJid:[conn.user.id]},{...message,fromMe:true,text:'!!buka menu'}]){assert.equal(shouldAutoAITrigger(m,conn,a),false);assert.equal(shouldAutoAITrigger(m,conn,b),true)}})
test('disabled planner never calls Groq; normal session policy still applies',async()=>{const a=make('990000000109');scope.applySettings(a,{auto_ai:false});const r=await planAutoAI({m:message,conn,botConfig:a,plugins:{}},{ignoreCooldown:true});assert.equal(r.kind,'skip')})
test('async per-session context stays separate during concurrent requests',async()=>{const a=make('990000000110'),b=make('990000000111');scope.applySettings(a,{auto_ai:false});const result=await Promise.all([a,b].map(botConfig=>runWithBotConfig({botConfig},async()=>{await new Promise(r=>setTimeout(r,5));return getCurrentBotConfig().values.autoAI.enabled})));assert.deepEqual(result,[false,true])})
test('global emergency OFF remains respected without writing per-session config',()=>{const a=make('990000000112'),previous=global.umiAutoAI;global.umiAutoAI={enabled:false};try{assert.equal(shouldAutoAITrigger(message,conn,a),false);assert.equal(a.values.autoAI.enabled,true)}finally{global.umiAutoAI=previous}})
test('legacy explicit root OFF migrates to persisted scoped setting',()=>{const id='990000000113',dir=path.join(root,id);fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'bot-config.json'),JSON.stringify({autoAIEnabled:false}));assert.equal(make(id).values.autoAI.enabled,false)})
test('toggle route enforces ownership before config access and avoids socket restart',async()=>{
 const route=api.slice(api.indexOf("    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id)",api.indexOf("if (pathname === '/api/settings/apply'")),api.indexOf("\n  if (pathname === '/api/settings/reset'"));
 const body=route.slice(0,route.lastIndexOf('\n  }'));const a=make('990000000114');let saved=0,restarts=0,deny=false;
 const context={...scope,req:{},res:{},bodyJson:async()=>({session_id:a.number,auto_ai:false}),ownedSession:()=>{if(deny)throw Object.assign(Error('not yours'),{status:403})},user:{email:'fixture@example.test'},path,SESSION_DIR:root,loadJadibotConfig:()=>{saved++;return a},getSubBot:()=>({botConfig:a}),Object,global:{},fs:{readFileSync:()=>'{"registered":true}'},applySettings:scope.applySettings,appendSessionLog:()=>{},restartSubBot:async()=>restarts++,send:(_r,status,data)=>({status,data})};
 const run=vm.runInNewContext('(async()=>{'+body+'})',context);const r=await run();assert.equal(r.status,200);assert.equal(r.data.settings.auto_ai,false);assert.equal(r.data.restarted,false);assert.equal(restarts,0);deny=true;const before=saved;await assert.rejects(run(),e=>e.status===403);assert.equal(saved,before)
})
test.after(()=>fs.rmSync(root,{recursive:true,force:true}))
