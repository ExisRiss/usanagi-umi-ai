import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../',import.meta.url)),loader=path.join(root,'tests/realms-sqlite-loader.mjs')
// Isolated process: real runtime boot, real SQLite, no production files or network.
test('opt-in boot backs up before conversion, mounts aliases, and supports a consistent data-only snapshot',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'umi-unified-boot-'))
 try{
  const script=`import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
  import {initializeUnifiedRpg,backupUnifiedRpg} from ${JSON.stringify(new URL('../lib/rpg/unified-runtime.js',import.meta.url).href)};
  import {getDb,dbPath,cleanup} from ${JSON.stringify(new URL('./fixtures/realms-sqlite.mjs',import.meta.url).href)};
  global.db={data:{users:{'111111111@s.whatsapp.net':{money:5,exp:20},'999999999@lid':{money:4},'888888888@lid':{name:'Held user'}},chats:{}}};
  assert.equal(initializeUnifiedRpg(),null);
  fs.writeFileSync('.rpg-unification.enabled','RPG_ONLY_1_TO_1',{mode:0o600});
  const store=initializeUnifiedRpg();assert.equal(store.status().canonicalUsers,1);assert.equal(store.status().heldRecords,2);
  // Execute the actual main.js boot repair against real held + canonical proxies.
  const mainSource=fs.readFileSync(${JSON.stringify(fileURLToPath(new URL('../main.js',import.meta.url)))},'utf8');
  const repair=mainSource.slice(mainSource.indexOf("console.log('Repairing database...');"),mainSource.indexOf('console.log(\`Repair selesai'));
  assert(repair.includes('for (const id in global.db.data.users)'));
  new Function('unifiedRpgStore',repair)(store);
  assert.equal(global.db.data.users['888888888@lid'].exp,undefined);
  assert.equal(global.db.data.users['999999999@lid'].money,4);
  assert.equal(global.db.data.users['888888888@lid'].lastclaim,undefined);
  assert.equal(global.db.data.users['888888888@lid'].limit,50);
  assert.equal(store.status().heldRecords,2);
  assert.equal(store.status().canonicalUsers,1);
  assert.equal(global.db.data.users['111111111@s.whatsapp.net'].exp,20);
  assert.equal(global.db.data.users['111111111@s.whatsapp.net'].money,5);
  const backups=path.join(path.dirname(dbPath),'unification-backups');const before=fs.readdirSync(backups).find(x=>x.startsWith('before-unify-'));assert(before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(backups,before,'database.json'))).users['111111111@s.whatsapp.net'].money,5);
  assert.equal(fs.statSync(path.join(backups,before,'database.sqlite')).mode&511,384);
  global.db.data.users['111111111@s.whatsapp.net'].balance+=2;
  const result=await backupUnifiedRpg();assert.equal(result.containsWhatsAppAuth,false);assert(fs.existsSync(path.join(process.cwd(),result.directory.slice(1),'database.sqlite')));
  assert.equal(JSON.parse(JSON.stringify(global.db.data)).users['111111111@s.whatsapp.net'].money,undefined);
  assert.equal(getDb().pragma('integrity_check',{simple:true}),'ok');cleanup();`
  // Root here is bot/, not the repository root.
  const r=spawnSync(process.execPath,['--loader',loader,'--input-type=module','-e',script],{cwd:dir,encoding:'utf8',timeout:20000})
  assert.equal(r.status,0,r.stderr+'\n'+r.stdout)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
