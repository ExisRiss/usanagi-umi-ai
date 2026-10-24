// Real browser input, actual config persistence/settings functions; auth and WA transport are fixtures.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import {chromium} from '../../standalone/realms/node_modules/playwright/index.mjs'
import {loadJadibotConfig,saveJadibotConfig} from '../../bot/lib/bot-config.js'
const root=fs.mkdtempSync(path.join(os.tmpdir(),'umi-settings-ui-')),output=process.env.UI_TEST_OUTPUT||'/home/user/deploy-check/task60/browser'
fs.mkdirSync(output,{recursive:true})
const source=fs.readFileSync(new URL('../../bot/lib/jadibot-platform-api.js',import.meta.url),'utf8'),scope={saveJadibotConfig,lockedJadibotOwnerNumber:()=>'',normalizeJadibotOwners:x=>x,normalizeBotNumber:x=>String(x).replace(/\D/g,''),safeText:(s,n)=>String(s).slice(0,n),clearScopedPrefixes:()=>{},URL}
vm.createContext(scope);vm.runInContext(source.slice(source.indexOf('function profileSettings('),source.indexOf('\nfunction readSessionFiles(')),scope)
const checks=[],errors=[],browser=await chromium.launch({args:['--no-sandbox']});const pass=x=>{checks.push(x);console.log('PASS',x)}
try{for(const mobile of [false,true]){
 const ids=['990000000201','990000000202'],profiles=new Map(ids.map((id,i)=>{const p=loadJadibotConfig(id,path.join(root,(mobile?'m':'d')+id));p.ownerNumbers=['990000000299'];p.defaultPrefix=i?'!':'.';saveJadibotConfig(p);return[id,p]})),writes=[];let failToggle=false,delayA=false;
 const context=await browser.newContext({viewport:{width:mobile?390:1365,height:900},isMobile:mobile,hasTouch:mobile}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='https://studio.test')return route.abort();const json=(status,data)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});if(u.pathname.startsWith('/api/')){
 const body=route.request().method()==='POST'?route.request().postDataJSON():{};
 if(u.pathname==='/api/platform/auth/login')return json(200,{access_token:'fixture-access-123456789',refresh_token:'fixture-refresh-123456789',user:{id:'fixture-user',email:'fixture@example.test',username:'Fixture',roles:['user']}});
 if(u.pathname==='/api/platform/me')return json(200,{user:{id:'fixture-user',email:'fixture@example.test',username:'Fixture',roles:['user']}});
 if(u.pathname==='/api/sessions')return json(200,{sessions:[...profiles].map(([id,x])=>({sessionId:id,status:'connected',registered:true,auto_ai:x.values.autoAI.enabled}))});
 if(u.pathname==='/api/settings/get'){const id=u.searchParams.get('session_id'),settings=scope.profileSettings(profiles.get(id));if(delayA&&id===ids[0])await new Promise(r=>setTimeout(r,450));return json(200,{settings})}
 if(u.pathname==='/api/settings/apply'){if(failToggle)return json(503,{error:'Fixture unavailable'});const profile=profiles.get(body.session_id);if(!profile)return json(403,{error:'not yours'});writes.push(body);return json(200,{settings:scope.applySettings(profile,body),restarted:false})}
 if(u.pathname==='/api/backup/list')return json(200,{backups:[]});return json(404,{error:'fixture route missing'})}
 const rel=u.pathname==='/'?'index.html':u.pathname.slice(1);if(rel.includes('..'))return route.abort();const file=new URL('../public/'+rel,import.meta.url);if(!fs.existsSync(file))return route.fulfill({status:404,body:''});return route.fulfill({body:fs.readFileSync(file),contentType:rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.html')?'text/html':'application/octet-stream'})});
 await p.goto('https://studio.test/#login');await p.locator('#loginForm [name=identifier]').fill('fixture');await p.locator('#loginForm [name=password]').fill('fixture-password');await p.locator('#loginForm button[type=submit]').click();await p.waitForSelector('[data-action=auto-ai]');pass((mobile?'Mobile':'Desktop')+' cards show independent AutoAI buttons');
 const button=id=>p.locator(`[data-action=auto-ai][data-id="${id}"]`);await button(ids[0]).click();await p.waitForFunction(id=>document.querySelector(`[data-action=auto-ai][data-id="${id}"]`)?.dataset.enabled==='0',ids[0]);assert.equal(await button(ids[1]).getAttribute('data-enabled'),'1');assert.deepEqual(writes[0],{session_id:ids[0],auto_ai:false});pass('Toggle A sends only A and boolean, leaves B ON');
 await p.reload();await p.waitForSelector('[data-action=auto-ai]');assert.equal(await button(ids[0]).getAttribute('data-enabled'),'0');assert.equal(loadJadibotConfig(ids[0],path.dirname(profiles.get(ids[0]).file),{create:false}).values.autoAI.enabled,false);pass('Reload and disk config preserve OFF');
 failToggle=true;await button(ids[1]).click();await p.waitForSelector('#toast.error:not(.hidden)');assert.equal(await button(ids[1]).getAttribute('data-enabled'),'1');assert.equal(profiles.get(ids[1]).values.autoAI.enabled,true);failToggle=false;pass('Failed save never falsely flips the UI or another session');
 await p.locator(`[data-action=settings][data-id="${ids[0]}"]`).click();await p.waitForFunction(()=>window.state.settingsFor===window.state.selected);assert.equal(await p.locator('[name=auto_ai]').isChecked(),false);pass('Settings loads selected session status');
 delayA=true;await p.selectOption('#settingsSession',ids[1]);await p.waitForFunction(id=>window.state.settingsFor===id,ids[1]);await p.selectOption('#settingsSession',ids[0]);await p.selectOption('#settingsSession',ids[1]);await p.waitForFunction(id=>window.state.settingsFor===id,ids[1]);await p.waitForTimeout(550);assert.equal(await p.locator('[name=auto_ai]').isChecked(),true);assert.equal(await p.locator('[name=prefix]').inputValue(),'!');pass('Late A response cannot overwrite B settings');
 await p.locator('[name=auto_ai]').uncheck();await p.locator('[name=prefix]').fill('?');await p.locator('#settingsForm [type=submit]').click();await p.waitForFunction(()=>document.getElementById('toast').textContent.includes('Settings tersimpan'));assert.equal(profiles.get(ids[1]).values.autoAI.enabled,false);assert.equal(profiles.get(ids[1]).defaultPrefix,'?');assert.equal(profiles.get(ids[0]).defaultPrefix,'.');pass('Form save persists AutoAI and prefix to B only');
 await p.screenshot({path:output+'/'+(mobile?'mobile':'desktop')+'-settings.png',fullPage:true});await context.close()
 }assert.deepEqual(errors,[]);pass('Zero browser runtime errors');fs.writeFileSync(output+'/result.json',JSON.stringify({checks,errors,productionAccountsTouched:false},null,2))
}finally{await browser.close();fs.rmSync(root,{recursive:true,force:true})}
