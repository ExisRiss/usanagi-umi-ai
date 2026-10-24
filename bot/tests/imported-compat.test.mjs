import test from 'node:test'
import assert from 'node:assert/strict'
import {runImportedFeature,getImportedDatabase} from '../lib/imported-compat.js'
global.db={data:{users:{'fixture@s.whatsapp.net':{registered:true,limit:50,money:25}},chats:{},settings:{}}}
function extra(botScope,text){const sent=[];const conn={user:{id:botScope+'@s.whatsapp.net'},reply:async()=>{},sendMessage:async(_chat,payload)=>sent.push(JSON.parse(payload.text))};return{sent,ctx:{conn,botScope,botConfig:{scope:botScope,values:{nameBot:botScope}},text,args:[text],command:'unique-long-command',usedPrefix:'/',isOwner:false,isPrems:false}}}
const meta={name:'fixture',aliasMap:{'unique-long-command':'original-command'},cooldown:0}
const message={sender:'fixture@s.whatsapp.net',chat:'fixture@g.us',text:'raw command',key:{id:'fixture'},reply:async()=>{}}
test('unique command namespace is mapped back to the vendor command',async()=>{const x=extra('first','hello');assert((await runImportedFeature('unit-fixture','../../tests/fixtures/imported-feature.js',meta,message,x.ctx)).success);assert.equal(x.sent[0].command,'original-command');assert.equal(x.sent[0].text,'hello')})
test('RPG energy cannot decrement or mint native quota',()=>{assert.equal(global.db.data.users[message.sender].limit,50);assert.equal(global.db.data.users[message.sender].importedEnergy,90);assert.equal(getImportedDatabase().getUser(message.sender).energi,90)})
test('settings and branding remain isolated between Jadibots',async()=>{const x=extra('second','world');await runImportedFeature('unit-fixture','../../tests/fixtures/imported-feature.js',meta,message,x.ctx);assert.equal(x.sent[0].setting,'world');assert.equal(x.sent[0].botName,'second');assert.equal(global.db.data.importedSettings.first['test-value'],'hello');assert.equal(global.db.data.importedSettings.second['test-value'],'world')})
