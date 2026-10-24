import fs from 'node:fs'
import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import os from 'node:os'
import path from 'node:path'
const ARTIFACTS=process.env.REALMS_TEST_ARTIFACTS||fs.mkdtempSync(path.join(os.tmpdir(),'realms-browser-'))
fs.mkdirSync(ARTIFACTS,{recursive:true})
const codes=JSON.parse(fs.readFileSync(process.env.REALMS_TEST_LOGIN_FILE||'/home/user/.secrets/task46-test-login.json','utf8'))
const browser=await chromium.launch({args:['--no-sandbox']}),errors=[],failures=[],checks=[]
const record=s=>{checks.push(s);console.log('PASS',s)}
async function call(page,route,data){return page.evaluate(async({route,data})=>{const r=await fetch('/realms/api/'+route,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const j=await r.json();if(!r.ok)throw Error(j.error);return j},{route,data})}
async function act(page,op,args={}){return call(page,'action',{id:crypto.randomUUID(),op,...args})}
async function move(page,d,count){for(let i=0;i<count;i++){await act(page,'move',{direction:d});await page.waitForTimeout(170)}}
try{
 const a=await browser.newContext({viewport:{width:1440,height:1000}}),b=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
 const p=await a.newPage(),q=await b.newPage()
 for(const page of [p,q]){page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=500)failures.push(r.url())});page.on('dialog',d=>d.accept())}
 await p.goto('http://127.0.0.1:4173/realms');await p.screenshot({path:path.join(ARTIFACTS,'landing-desktop.png'),fullPage:true});record('Landing and artwork load')
 for(const[page,code,name,cls]of [[p,codes[0],'Aster QA','Warrior'],[q,codes[1],'Lyra QA','Mage']]){
  if(page===q)await q.goto('http://127.0.0.1:4173/realms');await page.click('#playButton');await page.fill('#loginCode',code);await page.click('#loginForm button[type=submit]');await page.waitForSelector('#createDialog[open]');await page.fill('#characterName',name);await page.locator('.class-choice').filter({hasText:cls}).click();await page.click('#createForm button[type=submit]');await page.waitForSelector('#game:not([hidden])');await page.waitForTimeout(1400)
 }
 record('Two isolated browsers authenticate with one-use code and create characters')
 await p.waitForFunction(()=>document.getElementById('onlineCount').textContent.includes('2 adventurers'))
 record('Genuine SSE presence shows two players in same map')
 for(const page of [p,q])await page.click('[data-panel=chat]')
 await p.locator('.chat-form input').fill('Hello Greenleaf <img src=x onerror=alert(1)> 6281234567890');await p.locator('.chat-form button').click();await q.waitForFunction(()=>document.querySelector('.chat-log')?.textContent.includes('Hello Greenleaf'))
 const chat=await q.locator('.chat-log').textContent();assert(!chat.includes('6281234567890'));assert(chat.includes('[nomor disembunyikan]'));assert.equal(await q.locator('.chat-log img').count(),0);record('Realtime global chat across two browsers; HTML rendered as text and phone redacted')
 for(const page of [p,q])await page.click('#panelDialog .close')
 await p.click('#questShortcut');await p.getByRole('button',{name:'Ambil quest',exact:true}).click();await p.waitForTimeout(250);await p.click('#panelDialog .close')
 await move(p,'n',2);await move(p,'e',10)
 record('Authoritative movement follows walkable village-to-forest path')
 for(let kill=0;kill<3;kill++){
  await p.waitForTimeout(2600);let r=await act(p,'encounter',{target:'slime'}),enc=r.state.encounter
  if(kill===0){await p.waitForFunction(()=>!document.getElementById('attackButton').disabled);await p.click('#attackButton');await p.waitForTimeout(650);enc=(await call(p,'state')).state.encounter}
  while(enc){await p.waitForTimeout(600);r=await act(p,'attack',{target:enc.id});enc=r.state.encounter}
 }
 let state=(await call(p,'state')).state;assert.equal(state.quest.kills,3);assert.equal(state.inventory.herb,3);assert.equal(state.exp,420);record('Three actual turn-based combat victories grant server loot and quest progress')
 await p.reload();await p.waitForSelector('#game:not([hidden])');assert.equal((await call(p,'state')).state.quest.kills,3);record('Reload and SSE reconnect retain saved progress')
 await move(p,'w',10);await p.click('#questShortcut');await p.getByRole('button',{name:'Klaim hadiah',exact:true}).click();await p.waitForTimeout(300);await p.click('#panelDialog .close');state=(await call(p,'state')).state;assert.equal(state.quest.claimed,true);assert.equal(state.exp,1020);record('Quest reward claimed after returning to Elder; state persisted')
 await move(p,'e',1);await move(p,'s',7);await p.click('[data-panel=pets]');await p.getByRole('button',{name:'Summon · 1 token',exact:true}).click();await p.waitForTimeout(350);state=(await call(p,'state')).state;assert(state.pet);assert.equal(state.tokens,1);record('Confirmed summon consumes earned token and stores real compatible pet')
 await p.click('#panelDialog .close');await move(p,'n',6);await act(p,'buy',{item:'potion',quantity:1});state=(await call(p,'state')).state;assert.equal(state.inventory.potion,3);record('Shop transaction debits shared currency and persists inventory')
 await p.waitForTimeout(1500);await p.screenshot({path:path.join(ARTIFACTS,'game-desktop.png'),fullPage:true});await q.screenshot({path:path.join(ARTIFACTS,'game-mobile.png'),fullPage:true})
 for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:900});await p.waitForTimeout(150);const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow,'overflow at '+width)}record('320/390/768/1440px viewport checks: no horizontal overflow')
 await q.locator('[data-dir=e]').tap();await q.waitForTimeout(350);assert.equal((await call(q,'state')).state.position.x,33);record('Touch d-pad dispatches real movement');
 for(const panel of ['inventory','pets','leaderboard']){await q.click('[data-panel='+panel+']');await q.waitForTimeout(250);assert((await q.locator('#panelContent').textContent()).length>10);await q.click('#panelDialog .close')}record('Mobile inventory, pet collection and leaderboard dialogs usable')
 assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(failures.length,0,JSON.stringify(failures));record('No page errors or HTTP 5xx during browser test')
 fs.writeFileSync(path.join(ARTIFACTS,'browser-result.json'),JSON.stringify({checks,errors,failures},null,2))
}finally{await browser.close()}
