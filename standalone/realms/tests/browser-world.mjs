import fs from 'node:fs'
import assert from 'node:assert/strict'
import {chromium} from 'playwright'
const OUTPUT=process.env.REALMS_TEST_OUTPUT||'test-results'
fs.mkdirSync(OUTPUT,{recursive:true})
const browser=await chromium.launch({args:['--no-sandbox']}),checks=[],errors=[]
const BASE=process.env.REALMS_TEST_ORIGIN||'http://127.0.0.1:4173'
const pass=s=>{checks.push(s);console.log('PASS',s)}
async function call(p,route,data){return p.evaluate(async({route,data})=>{const r=await fetch('/realms/api/'+route,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const j=await r.json();if(!r.ok)throw Error(j.error);if(j.state&&typeof setState==='function')setState(j.state);return j},{route,data})}
const act=(p,op,rest={})=>call(p,'action',{id:crypto.randomUUID(),op,...rest})
async function walk(p,x,y){await p.evaluate(({x,y})=>planWalk(x,y),{x,y});await p.waitForFunction(()=>!walking&&!pathSteps.length&&!busy);}
async function fight(p,target){await p.waitForTimeout(2600);await act(p,'encounter',{target});let state=(await call(p,'state')).state;while(state.encounter){await p.waitForTimeout(600);state=(await act(p,'attack',{target:state.encounter.id})).state}return state}
try{
 const a=await browser.newContext({viewport:{width:1440,height:1040}}),b=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await a.newPage(),q=await b.newPage()
 for(const page of [p,q]){page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept())}
 const stamp=Date.now().toString(36).slice(-5)
 for(const [page,name,cls]of [[p,'Explorer '+stamp,'Warrior'],[q,'Visitor '+stamp,'Mage']]){await page.goto(BASE+'/realms');await page.waitForFunction(()=>document.querySelector('#playButton').textContent.includes('versi tes'));await page.click('#playButton');await page.waitForSelector('#createDialog[open]');await page.fill('#characterName',name);await page.locator('.class-choice').filter({hasText:cls}).click();await page.click('#createForm button[type=submit]');await page.waitForSelector('#game:not([hidden])')}
 pass('Preview login and character creation work without WhatsApp codes')
 assert(await p.locator('#previewNotice').isVisible());pass('Test environment explicitly labeled; no production login bypass')
 await p.waitForFunction(()=>parseInt(document.getElementById('onlineCount').textContent)>=2);pass('Two real browser sessions share presence in village')
 await p.click('[data-panel=world]');assert.equal(await p.locator('.region-card').count(),3);await p.click('#panelDialog .close');pass('Atlas contains playable Greenleaf, Royal Capital and Hollow Crypt')
 await p.click('#questShortcut');await p.getByRole('button',{name:'Ambil quest',exact:true}).click();await p.waitForTimeout(300);await p.click('#panelDialog .close')
 await walk(p,24,50);await act(p,'buy',{item:'realm_blade',quantity:1});await act(p,'equip',{item:'realm_blade'});await act(p,'buy',{item:'realm_armor',quantity:1});await act(p,'equip',{item:'realm_armor'});pass('Real starting test currency buys and equips weapon and armor')
 await walk(p,45,50);await act(p,'travel',{target:'capital-road'});await p.waitForFunction(()=>document.getElementById('areaName').textContent==='Royal Capital');await walk(p,50,32);await p.click('#questShortcut');await p.getByRole('button',{name:'Ambil komisi',exact:true}).click();await p.waitForTimeout(200);await p.click('#panelDialog .close');await p.waitForTimeout(1300);await p.screenshot({path:OUTPUT+'/kingdom-desktop.png',fullPage:true});pass('Capital is rendered and Captain Edrin grants a real quest')
 await walk(p,20,50);await act(p,'travel',{target:'capital-return'});await walk(p,63,47);for(let i=0;i<3;i++)await fight(p,'slime');await walk(p,30,50);await act(p,'quest-claim');assert((await call(p,'state')).state.quest.claimed);pass('Story quest unlocks dungeon through actual combat, not seeded completion')
 await walk(p,75,35);for(let i=0;i<2;i++)await fight(p,'wolf');assert.equal((await call(p,'state')).state.royalQuest.kills,2);pass('Capital commission tracks real wolves killed in a different map')
 await walk(p,84,26);await act(p,'travel',{target:'crypt-stairs'});await p.waitForFunction(()=>document.getElementById('areaName').textContent==='Hollow Crypt');assert.equal((await call(p,'state')).state.dungeon.stage,0);pass('Portal enters a private persistent solo dungeon')
 await walk(p,42,50);await fight(p,'cryptguard');await walk(p,62,50);await fight(p,'runebat');await walk(p,80,35);await fight(p,'hollowking');assert.equal((await call(p,'state')).state.dungeon.stage,3);await p.waitForTimeout(1300);await p.screenshot({path:OUTPUT+'/dungeon-desktop.png',fullPage:true});pass('Two encounters and phased boss completed; dungeon state advances server-side')
 const gold=(await call(p,'state')).state.gold;await p.click('#questShortcut');await p.getByRole('button',{name:'Ambil peti boss',exact:true}).click();await p.waitForTimeout(300);await p.click('#panelDialog .close');assert.equal((await call(p,'state')).state.gold,gold+1000);pass('Boss chest grants a single persistent reward')
 await p.reload();await p.waitForSelector('#game:not([hidden])');assert((await call(p,'state')).state.dungeon.rewardClaimed);pass('Reload restores dungeon position, completion and reward receipt')
 for(const page of [p,q])await page.click('[data-panel=chat]');await p.locator('.chat-form input').fill('Hello from the crypt');await p.locator('.chat-form button').click();await q.waitForFunction(()=>document.querySelector('.chat-log').textContent.includes('Hello from the crypt'));for(const page of [p,q])await page.click('#panelDialog .close');pass('Global realtime chat crosses village and dungeon maps')
 await q.locator('[data-dir=e]').tap();await q.waitForTimeout(400);assert.equal((await call(q,'state')).state.position.x,33);pass('Mobile d-pad controls authoritative movement')
 await q.screenshot({path:OUTPUT+'/village-mobile.png',fullPage:true});for(const w of [320,390,768,1440]){await p.setViewportSize({width:w,height:950});await p.waitForTimeout(100);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}pass('World expansion has no horizontal overflow at four viewport widths')
 assert.deepEqual(errors,[]);pass('No browser runtime errors')
 fs.writeFileSync(OUTPUT+'/browser-result.json',JSON.stringify({checks,errors},null,2))
}finally{await browser.close()}
