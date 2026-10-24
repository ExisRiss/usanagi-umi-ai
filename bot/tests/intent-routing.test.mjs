import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import { planAutoAI, buildCommandCatalog, searchCatalog } from '../lib/auto-ai.js'
import { recordGroqUsage } from '../lib/groq-client.js'
import webgame from '../plugins/game/game-webmultiplayer.js'

// Use metadata from real plugin files; don't invent menu/group/RPG aliases.
function metadata(file) {
  const source=fs.readFileSync(new URL('../plugins/'+file,import.meta.url),'utf8')
  const start=source.search(/^handler\.(?:help|command|tags)\s*=/m)
  assert(start>=0,file)
  const tail=source.slice(start).split('export default')[0]
  const constants=(source.match(/^const COMMANDS = .*$/m)||[''])[0]
  return new Function('handler',constants+'\n'+tail+';return handler')(async()=>{})
}
export const plugins={
  '_system/_allmenu.js':metadata('_system/_allmenu.js'),
  'main/usanagi-menu.js':metadata('main/usanagi-menu.js'),
  'main/usanagi-allmenu.js':metadata('main/usanagi-allmenu.js'),
  'main/usanagi-kategori.js':metadata('main/usanagi-kategori.js'),
  'rpg/rpg-open.js':metadata('rpg/rpg-open.js'),
  'rpg/usanagi-use.js':metadata('rpg/usanagi-use.js'),
  'pelengkap/umi/group/umi-open.js':metadata('pelengkap/umi/group/umi-open.js'),
  'pelengkap/umi/group/umi-close.js':metadata('pelengkap/umi/group/umi-close.js'),
  'pelengkap/umi/sticker/umi-bratvid2.js':metadata('pelengkap/umi/sticker/umi-bratvid2.js'),
  'game/game-ular-tangga-wa.js':metadata('game/game-ular-tangga-wa.js'),
  'game/game-webmultiplayer.js':webgame,
  'maker/brat2.js':metadata('maker/brat2.js'),
  'quote.js':Object.assign(async()=>{}, {command:'quote',help:['quote <teks>'],description:'Gambar quote dari teks'}),
  'assets/html.js':'<!DOCTYPE html><title>UMI TRADE</title>',
}
let id=0
export function context(text,overrides={}) {
  return {m:{text:'@111 '+text,isGroup:true,chat:'test@g.us',sender:'222@s.whatsapp.net',mentionedJid:['111@s.whatsapp.net'],key:{id:'intent-'+(++id)}},
    conn:{user:{id:'111@s.whatsapp.net'}}, botConfig:{scope:'test',registrationRequired:false},activePrefix:'!',plugins,
    userData:{registered:true,limit:1000,level:100},isOwner:false,isROwner:false,isAdmin:true,isBotAdmin:true,isPrems:true,...overrides}
}
const noModel=async()=>{throw Error('Unexpected model call')}
const opts={ignoreCooldown:true,callModel:noModel}
const json=commands=>async()=>({content:JSON.stringify({reply:'sudah berhasil',commands})})
for(const [text,command,plugin] of [
  ['tolong dong aku pengen lihat menu yang lengkap','allmenu','_system/_allmenu.js'],
  ['bisa tampilkan pilihan menunya?','menu','main/usanagi-menu.js'],
  ['tampilin allmenu','allmenu','_system/_allmenu.js'],['buka menu','menu','main/usanagi-menu.js'],
  ['tolong tampilkan semua menu','allmenu','_system/_allmenu.js'],['menu lengkap dong','allmenu','_system/_allmenu.js'],
  ['lihat daftar fitur','allmenu','_system/_allmenu.js'],['kirim menunya dong','menu','main/usanagi-menu.js'],
  ['menu dong','menu','main/usanagi-menu.js'],['open menu','menu','main/usanagi-menu.js'],
  ['buka grup','umi-group-open','pelengkap/umi/group/umi-open.js'],
  ['tutup grup','umi-group-close','pelengkap/umi/group/umi-close.js'],
  ['jalanin command empire','empire','game/game-webmultiplayer.js'],
  ['bikin room empire','empire','game/game-webmultiplayer.js'],
  ['main monopoli','monopoli','game/game-webmultiplayer.js'],
  ['buat room uno flip','unoflip','game/game-webmultiplayer.js'],
  ['main ular tangga langsung di chat','ular','game/game-ular-tangga-wa.js'],
]) test('local route: '+text,async()=>{const p=await planAutoAI(context(text),opts);assert.equal(p.kind,'command',JSON.stringify(p));assert.equal(p.command,command);assert.equal(p.plugin,plugin);assert.equal(p.args,'')})
test('menu ranking beats RPG/group open',()=>{const c=context('buka menu');const rows=searchCatalog(buildCommandCatalog(plugins,c),'buka menu');assert.equal(rows[0].command,'menu');assert(!rows.slice(0,2).some(e=>e.command==='open'))})
test('specific group handler, not RPG',()=>{const c=context('buka grup');assert.equal(searchCatalog(buildCommandCatalog(plugins,c),'buka grup')[0].command,'umi-group-open')})
test('non-admin rejected on zero-token router',async()=>{const p=await planAutoAI(context('buka grup',{isAdmin:false}),opts);assert.equal(p.kind,'answer');assert.match(p.answer,/admin/i)})
test('missing menu does not invent dispatch target',async()=>{const p=await planAutoAI(context('buka menu',{plugins:{}}),opts);assert.equal(p.kind,'answer')})
test('disabled menu stays disabled including namespace',()=>{const c=context('buka menu',{isCommandDisabled:(n,cmd)=>cmd==='menu'});assert(!buildCommandCatalog(plugins,c).some(e=>e.aliases.includes('usanagi-menu')))})
test('unknown command cannot fuzzy-match an existing feature',async()=>{const p=await planAutoAI(context('tolong tampilkan pilihan'),{...opts,callModel:json([{command:'allmenux',args:''}])});assert.equal(p.kind,'answer');assert.doesNotMatch(p.answer,/berhasil/)})
test('mismatched plugin rejected',async()=>{const p=await planAutoAI(context('ingin lihat beberapa opsi'),{...opts,callModel:json([{command:'menu',plugin:'rpg/rpg-open.js',args:'create'}])});assert.equal(p.kind,'answer')})
test('quoted content does not trigger menu router; exact text preserved',async()=>{const p=await planAutoAI(context('bikin quote teks buka menu'),{...opts,callModel:json([{command:'quote',plugin:'quote.js',args:'buka menu'}])});assert.equal(p.command,'quote');assert.equal(p.args,'buka menu')})
test('negation and questions do not trigger room/menu',async()=>{for(const t of ['jangan buka menu','apa itu empire','kenapa menu error']){let calls=0;const p=await planAutoAI(context(t),{...opts,callModel:async()=>{calls++;return{content:JSON.stringify({reply:'penjelasan singkat'})}}});assert.equal(calls,1);assert.equal(p.kind,'answer')}})
test('real room join args never erased',async()=>{const p=await planAutoAI(context('gabung room empire ABC123'),{...opts,callModel:json([{command:'empire',plugin:'game/game-webmultiplayer.js',args:'join ABC123'}])});assert.equal(p.command,'empire');assert.equal(p.args,'join ABC123')})
test('scheduled sequence retained, group alias not open RPG',async()=>{const p=await planAutoAI(context('tutup grup lalu buka 5 detik kemudian'),{...opts,callModel:json([{command:'umi-group-close',args:'',delay:0},{command:'umi-group-open',args:'',delay:5}])});assert.equal(p.kind,'steps');assert.deepEqual(p.steps.map(s=>[s.command,s.delayMs]),[['umi-group-close',0],['umi-group-open',5000]]);assert.equal(p.note,'')})
test('model open RPG cannot hijack group request',async()=>{const p=await planAutoAI(context('tolong grup ini dibuka lagi dong'),{...opts,callModel:json([{command:'open',args:'create'}])});assert.equal(p.kind,'answer')})
test('prefix namespaces and arguments remain exact',async()=>{const p=await planAutoAI(context('jalanin command usanagi-menu'),opts);assert.equal(p.command,'usanagi-menu');assert.equal(p.plugin,'main/usanagi-menu.js')})
test('bratvid2 payload remains verbatim',async()=>{const p=await planAutoAI(context('buat bratvid2 teks Ayam Goreng!'),{...opts,callModel:json([{command:'bratvid2',args:'Ayam Goreng!'}])});assert.equal(p.command,'bratvid2');assert.equal(p.args,'Ayam Goreng!')})
test('local menu works even when Groq budget exhausted',async()=>{recordGroqUsage('test',{total_tokens:8000});const p=await planAutoAI(context('buka menu'),{ignoreCooldown:true});assert.equal(p.command,'menu')})

test('actual allmenu handler skips HTML/string/null assets and sends menu with active prefix',async()=>{
  let source=fs.readFileSync(new URL('../plugins/_system/_allmenu.js',import.meta.url),'utf8')
  // Keep the real rendering/handler code; stub imports and WhatsApp transport only.
  source=source.replace(/^import .*$/gm,'').replace(/const \{\s*generateWAMessageFromContent,\s*proto\s*\} = \(await import\([^\n]+\n/,'')
    .replace('export default handler','global.handler = handler')
  const sends=[],errors=[]
  const sandbox={global:{plugins:{...plugins,nil:null,number:12},db:{data:{users:{}}}},os,path,fs,fsPromises:fs.promises,promisify,_exec:exec,
    process,console:{error:(...x)=>errors.push(x)},translator:{getChatLanguage:()=> 'id'},readMenuMedia:()=>({type:'image',data:Buffer.from('fixture'),mimetype:'image/png'}),setTimeout:f=>f()}
  vm.runInNewContext(source,sandbox)
  await sandbox.global.handler({chat:'test@g.us',sender:'user',pushName:'Test'},{usedPrefix:'!',conn:{user:{jid:'bot'},getName:async()=> 'Test',sendMessage:async(c,p)=>{sends.push(p);return{key:{id:'a'}}},relayMessage:async()=>{},reply:async(c,t)=>errors.push(t)}})
  assert.equal(errors.length,0,JSON.stringify(errors))
  const caption=sends.find(p=>p.caption)?.caption
  assert(caption,'actual renderer must send a menu')
  assert(caption.includes('!'),'active user prefix must be included')
  assert(!caption.includes('<!DOCTYPE'))
})

test('close then reopen is local and needs no Groq tokens',async()=>{const p=await planAutoAI(context('tutup grup lalu buka 5 detik kemudian'),opts);assert.equal(p.kind,'steps');assert.deepEqual(p.steps.map(s=>s.delayMs),[0,5000])})
