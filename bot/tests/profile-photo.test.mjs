import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import {profilePhoto} from '../lib/profile-photo.js'
const jpeg=Buffer.from([255,216,255,224,1,2,3]),url='https://pps.whatsapp.net/avatar',conn={profilePictureUrl:async()=>url}
const image=()=>new Response(jpeg,{headers:{'content-type':'image/jpeg'}})
test('private/missing profile returns no image without requesting a fake URL',async()=>{let calls=0;assert.equal(await profilePhoto({profilePictureUrl:async()=>{throw Error('private')}},'fixture',{fetchImpl:()=>calls++}),undefined);assert.equal(calls,0)})
test('real profile fetched as a bounded buffer before delivery',async()=>{let options;const b=await profilePhoto(conn,'fixture',{fetchImpl:async(u,o)=>{assert.equal(String(u),url);options=o;return image()}});assert.deepEqual(b,jpeg);assert.equal(options.redirect,'error')})
for(const status of [404,403,500])test('avatar HTTP '+status+' degrades to text profile',async()=>assert.equal(await profilePhoto(conn,'fixture',{fetchImpl:async()=>new Response('error',{status})}),undefined))
test('network failure returns no image',async()=>assert.equal(await profilePhoto(conn,'fixture',{fetchImpl:async()=>{throw Error('offline')}}),undefined))
for(const value of ['http://pps.whatsapp.net/a','https://i.ibb.co/profile.jpg','https://pps.whatsapp.net.attacker.test/x','https://user:pass@pps.whatsapp.net/x','https://127.0.0.1/x'])test('untrusted avatar origin not fetched: '+new URL(value).hostname,async()=>{let calls=0;assert.equal(await profilePhoto({profilePictureUrl:async()=>value},'fixture',{fetchImpl:()=>calls++}),undefined);assert.equal(calls,0)})
test('HTML masquerading as JPEG is rejected',async()=>assert.equal(await profilePhoto(conn,'fixture',{fetchImpl:async()=>new Response('<html>',{headers:{'content-type':'image/jpeg'}})}),undefined))
test('oversized declared image rejected before reading',async()=>assert.equal(await profilePhoto(conn,'fixture',{fetchImpl:async()=>new Response(jpeg,{headers:{'content-type':'image/jpeg','content-length':'3000000'}})}),undefined))
test('oversized chunked body rejected and cancelled',async()=>assert.equal(await profilePhoto(conn,'fixture',{fetchImpl:async()=>new Response(Buffer.alloc(2100000),{headers:{'content-type':'image/jpeg'}})}),undefined))
test('stalled profile URL and stalled image download are bounded',async()=>{for(const c of [{profilePictureUrl:()=>new Promise(()=>{})},conn]){const t=Date.now();assert.equal(await profilePhoto(c,'fixture',{timeoutMs:15,fetchImpl:()=>new Promise(()=>{})}),undefined);assert(Date.now()-t<300)}})
test('actual profile handler sends complete text once when photo is private',async()=>{
 const source=fs.readFileSync(new URL('../plugins/economy/xp-profile.js',import.meta.url),'utf8').replace(/^import .+$/gm,'').replace('export default handler','handler')
 const sent=[],user={registered:true,name:'Fixture',level:3,exp:123,limit:20,premiumTime:0},m={sender:'990000000001@s.whatsapp.net',chat:'fixture@g.us',raw:{key:{id:'quoted'}},reply:async()=>{throw Error('unexpected')}}
 const context={global:{db:{data:{users:{[m.sender]:user}}}},profilePhoto,PhoneNumber:()=>({getNumber:()=>'+fixture'}),moment:()=>({tz:()=>({format:()=> 'fixture'})}),resolveTargetPhoneNumber:async()=>'',checkOwner:async()=>false,calculateAge:()=>null,formatBirthday:()=>'-',parseBirthday:()=>null,Buffer}
 const handler=vm.runInNewContext(source,context),socket={profilePictureUrl:async()=>{throw Error('private')},fetchStatus:async()=>({status:'hello'}),getName:async()=> 'Fixture',sendMessage:async(...args)=>sent.push(args)}
 await handler(m,{conn:socket,usedPrefix:'.'});assert.equal(sent.length,1);assert.match(sent[0][1].text,/Fixture/);assert.match(sent[0][1].text,/123/);assert.match(sent[0][1].text,/\.setbirthday/);assert.equal(sent[0][1].image,undefined);assert.equal(sent[0][2].quoted,m.raw)
 socket.sendMessage=async()=>{throw Error('transport rejected')};await assert.rejects(handler(m,{conn:socket,usedPrefix:'!'}),/transport rejected/)
})
