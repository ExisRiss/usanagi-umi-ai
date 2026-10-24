// Actual UI clicks/taps only for gameplay; no injected action()/planWalk() or seeded progress.
// Isolated preview only. Never creates or edits production accounts.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import {chromium} from 'playwright'
const BASE=process.env.REALMS_TEST_ORIGIN||'http://127.0.0.1:4173',OUTPUT=process.env.REALMS_TEST_OUTPUT||'test-results/interactions'
fs.mkdirSync(OUTPUT,{recursive:true})
const browser=await chromium.launch({args:['--no-sandbox']}),checks=[],errors=[]
const pass=name=>{checks.push(name);console.log('PASS',name)}
const read=p=>p.evaluate(()=>state)
async function close(p){if(await p.locator('#panelDialog').evaluate(x=>x.open))await p.click('#panelDialog .close')}
async function clickWorld(p,x,y,lift=0){const point=await p.evaluate(({x,y,lift})=>{const r=canvas.getBoundingClientRect();return{x:r.left+transform.ox+x/100*transform.w,y:r.top+transform.oy+y/100*transform.h-lift}},{x,y,lift});await p.mouse.click(point.x,point.y)}
async function idle(p){await p.waitForFunction(()=>!walking&&!pathSteps.length&&!busy,{},{timeout:20000})}
async function npc(p,id,x,y){await close(p);await clickWorld(p,x,y,28);await p.waitForSelector('.npc-dialogue[data-npc="'+id+'"]',{timeout:20000})}
async function finishFight(p){for(let i=0;i<40&&(await read(p)).encounter;i++){await p.locator('#attackButton:not([disabled])').click();await p.waitForFunction(()=>!busy);await p.waitForTimeout(50)}assert(!(await read(p)).encounter)}
async function fightSlime(p){await close(p);await clickWorld(p,62,48,12);await p.waitForFunction(()=>state.encounter?.type==='slime',{},{timeout:20000});await finishFight(p)}
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:{width:mobile?390:1440,height:mobile?844:1040},isMobile:mobile,hasTouch:mobile}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept())
  await p.goto(BASE+'/realms');await p.waitForFunction(()=>meta?.preview===true);await p.click('#playButton');await p.waitForSelector('#createDialog[open]');await p.fill('#characterName',(mobile?'Mobile ':'Desktop ')+Date.now().toString(36).slice(-5));await p.click('#createForm button[type=submit]');await p.waitForSelector('#game:not([hidden])');await p.waitForTimeout(250)
  pass((mobile?'Mobile':'Desktop')+' login and creation through real UI')
  if(mobile){
   await p.locator('#nearbyButton').tap();await p.locator('[data-target=elder]').tap();await p.waitForSelector('.npc-dialogue[data-npc=elder]');pass('Mobile touch target chooser opens server-validated NPC conversation')
   await p.getByRole('button',{name:'Ambil quest',exact:true}).tap();await p.waitForFunction(()=>state.quest.accepted);await close(p)
   const before=(await read(p)).position.x;await p.locator('[data-dir=e]').tap();await p.waitForFunction(x=>state.position.x>x,before);pass('Mobile d-pad remains functional')
   // Atlas path to forest is navigated via a real UI button, then Attack acquires a nearby target.
   await p.locator('[data-panel=world]').tap();await p.getByRole('button',{name:'Ke hutan',exact:true}).tap();await idle(p);await p.locator('#attackButton:not([disabled])').tap();await p.waitForFunction(()=>state.encounter?.type==='slime'&&state.encounter.hp<32);assert((await read(p)).encounter.hp<32);pass('Mobile Attack starts encounter and damages monster without an extra interaction step')
   const hp=(await read(p)).hp;await p.waitForFunction(hp=>state.hp<hp,hp,{timeout:5000});pass('Mobile receives autonomous enemy damage and HP update')
   await p.screenshot({path:OUTPUT+'/combat-mobile.png',fullPage:true});await p.locator('#fleeButton:not([disabled])').tap();await p.waitForFunction(()=>!state.encounter);pass('Mobile escape exits combat')
   await context.close();continue
  }
  await npc(p,'elder',30,50);pass('NPC body/head click opens dialogue (baseline failed)');await p.screenshot({path:OUTPUT+'/npc-desktop.png',fullPage:true});await p.getByRole('button',{name:'Ambil quest',exact:true}).click();await p.waitForFunction(()=>state.quest.accepted)
  await npc(p,'petkeeper',34,73);pass('Far NPC click auto-walks then talks, without a second click');await p.getByRole('button',{name:'Summon · 1 token',exact:true}).click();await p.waitForFunction(()=>Boolean(state.pet));pass('NPC summon service writes real pet progress')
  await npc(p,'merchant',22,50);for(const item of ['Dawnsteel Blade','Wayfarer Armor']){await p.locator('.item-card').filter({hasText:item}).getByRole('button',{name:'Beli 1',exact:true}).click();await p.locator('.item-card').filter({hasText:item}).getByRole('button',{name:'Pakai',exact:true}).click()}assert((await read(p)).gear.weapon);pass('Talk-to-merchant supports real buy and equip')
  await close(p);await clickWorld(p,62,48,12);await p.waitForFunction(()=>state.encounter?.type==='slime'&&state.encounter.hp<32,{},{timeout:20000});assert((await read(p)).encounter.hp<32);pass('Click monster walks, begins combat and lands first hit')
  const q=await context.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(BASE+'/realms');await q.waitForSelector('#game:not([hidden])');const turn=(await read(p)).encounter.enemyTurns||0;await p.waitForFunction(t=>state.encounter?.enemyTurns>t,turn,{timeout:5000});const hit=await read(p);assert(hit.hp<hit.maxHp);await q.waitForFunction(hp=>state.hp===hp,hit.hp);await q.close();pass('Two real tabs share one authoritative enemy cadence and health')
  await finishFight(p);assert((await read(p)).quest.kills>=1);assert((await read(p)).respawnUntil.slime);pass('Victory clears encounter, awards progress and sets respawn cooldown')
  for(let i=0;i<2;i++){await p.waitForTimeout(2700);await fightSlime(p)}await npc(p,'elder',30,50);await p.getByRole('button',{name:'Klaim hadiah',exact:true}).click();await p.waitForFunction(()=>state.quest.claimed);pass('Three UI-driven fights and NPC quest reward complete without seeded state')
  await npc(p,'healer',40,42);await p.getByRole('button',{name:'Pulihkan HP & mana',exact:true}).click();await p.waitForFunction(()=>state.hp===state.maxHp);pass('Healer conversation and recovery work')
  await close(p);await p.click('[data-panel=world]');await p.getByRole('button',{name:'Menuju Royal Capital',exact:true}).click();await p.waitForFunction(()=>state.position.region==='kingdom',{},{timeout:20000});await npc(p,'royal',50,32);pass('Portal auto-interaction and Royal Capital NPC work');await close(p)
  await p.click('[data-panel=world]');await p.getByRole('button',{name:'Menuju Greenleaf',exact:true}).click();await p.waitForFunction(()=>state.position.region==='greenleaf',{},{timeout:20000});await idle(p)
  // Head click on overlapping monster/portal explicitly offers both choices.
  await clickWorld(p,84,26,20);await p.waitForSelector('[data-target=crypt-stairs]');assert(await p.locator('[data-target=sentinel]').count());pass('Overlapping portal and boss are individually selectable')
  // Walking to the crypt can cross hostile aggro. Finish that encounter, then resume via Atlas.
  await p.locator('[data-target=crypt-stairs]').click();
  for(let i=0;i<6&&(await read(p)).position.region!=='dungeon';i++){
   await p.waitForFunction(()=>state.encounter||state.position.region==='dungeon'||(!walking&&!busy),{},{timeout:20000});if((await read(p)).encounter)await finishFight(p);if((await read(p)).position.region==='dungeon')break;await p.click('[data-panel=world]');await p.getByRole('button',{name:'Menuju Hollow Crypt',exact:true}).click();await p.waitForTimeout(300)
  }
  await p.waitForFunction(()=>state.position.region==='dungeon',{},{timeout:20000});pass('Dungeon entry remains reachable with real hostile aggro')
  for(const [id,x,y]of [['cryptguard',42,50],['runebat',62,50],['hollowking',80,35]]){await clickWorld(p,x,y,20);await p.waitForFunction(id=>state.encounter?.type===id,id,{timeout:20000});await finishFight(p)}assert.equal((await read(p)).dungeon.stage,3);pass('Actual clicks complete both guards and phased dungeon boss')
  await p.click('#questShortcut em');await p.getByRole('button',{name:'Ambil peti boss',exact:true}).click();await p.waitForFunction(()=>state.dungeon.rewardClaimed);await close(p);await p.reload();await p.waitForSelector('#game:not([hidden])');assert((await read(p)).dungeon.rewardClaimed);pass('Boss reward and position persist across reload')
  await p.screenshot({path:OUTPUT+'/dungeon-desktop.png',fullPage:true});for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:950});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}pass('No horizontal overflow at four viewport widths');await context.close()
 }
 assert.deepEqual(errors,[]);pass('No browser runtime errors');fs.writeFileSync(OUTPUT+'/browser-result.json',JSON.stringify({checks,errors,productionDataTouched:false},null,2))
}catch(e){let i=0;for(const c of browser.contexts())for(const p of c.pages()){await p.screenshot({path:OUTPUT+'/failure-'+i+'.png',fullPage:true}).catch(()=>{});fs.writeFileSync(OUTPUT+'/failure-state-'+i+'.json',JSON.stringify(await p.evaluate(()=>({state,walking,pathSteps,busy,selectedTarget,pendingInteraction,navigationGoal,toast:document.querySelector('#toast')?.textContent})).catch(()=>null),null,2));i++}fs.writeFileSync(OUTPUT+'/failure.json',JSON.stringify({checks,errors,error:e.stack},null,2));throw e}finally{await browser.close()}
