import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {shouldAutoAITrigger,isSelfAIRequest,planAutoAI,humanizeReply} from '../lib/auto-ai.js'
process.env.GROQ_API_KEY='fixture-key-not-a-real-credential'
const conn={user:{id:'999999999@s.whatsapp.net'}},botConfig={type:'jadibot',scope:'self-ai-test',registrationRequired:true}
function message(text='!!buka menu',extra={}){return {text,chat:'fixture@g.us',sender:conn.user.id,fromMe:true,key:{id:crypto.randomUUID(),fromMe:true},isGroup:true,mentionedJid:[],...extra}}
const menu=Object.assign(async()=>{}, {command:'menu',help:['menu'],tags:['info']})
function context(m,extra={}){return {m,conn,botConfig,activePrefix:'!',isOwner:true,isPrems:true,userData:{registered:true,limit:50},plugins:{'main/menu.js':menu},...extra}}
test('own Jadibot input requires literal !! at the beginning and nonempty text',()=>{for(const text of ['!!buka menu','!! siapa developer lu'])assert(shouldAutoAITrigger(message(text),conn,botConfig));for(const text of ['buka menu','!buka menu',' !!buka menu','halo !!buka menu','!!','!!  '])assert(!shouldAutoAITrigger(message(text),conn,botConfig));assert(!shouldAutoAITrigger(message(),conn,{type:'main'}));assert(isSelfAIRequest(message(),botConfig))})
test('generated echo, handled request, disabled AI and broadcast cannot trigger self AI',()=>{for(const overrides of [{isBaileys:true},{__autoAIHandled:true},{chat:'status@broadcast'},{chat:'fixture@newsletter'}])assert(!shouldAutoAITrigger(message(undefined,overrides),conn,botConfig));assert(!shouldAutoAITrigger(message(),conn,{...botConfig,autoAIEnabled:false}));assert(!shouldAutoAITrigger(message('!!buka menu',{fromMe:false,key:{fromMe:false},mentionedJid:[]}),conn,botConfig))})
test('!! menu dispatches despite ! or !! active prefix without calling model',async()=>{for(const activePrefix of ['!','!!','/']){const p=await planAutoAI(context(message(),{activePrefix}),{ignoreCooldown:true,callModel:async()=>{throw Error('must not call')}});assert.equal(p.kind,'command');assert.equal(p.command,'menu');assert.equal(p.args,'')}})
test('developer question is answered with AlzRiss without provider quota',async()=>{const p=await planAutoAI(context(message('!!siapa developer lu')),{ignoreCooldown:true,callModel:async()=>{throw Error('must not call')}});assert.equal(p.kind,'answer');assert.match(p.answer,/AlzRiss/);assert(!p.answer.startsWith('!!'))})
test('ordinary own reply/mention cannot activate AI without !!',()=>{assert(!shouldAutoAITrigger(message('siapa developer lu',{mentionedJid:[conn.user.id],quoted:{fromMe:true}}),conn,botConfig))})
test('duplicate message id is ignored even with a fresh serialized object',async()=>{const m=message();await planAutoAI(context(m),{ignoreCooldown:true});assert.equal((await planAutoAI(context({...m}),{ignoreCooldown:true})).kind,'skip')})
test('own AI is still denied disabled command and premium role rules',async()=>{const p=await planAutoAI(context(message(),{isOwner:false,isPrems:false,plugins:{'main/menu.js':Object.assign(async()=>{},menu,{premium:true})}}),{ignoreCooldown:true});assert.equal(p.kind,'answer');assert.match(p.answer,/premium/i)})
test('model response cannot preserve a leading self-trigger marker',()=>{assert.equal(humanizeReply('!! jawaban biasa'),'jawaban biasa')})

test('outbound socket IDs block a generated !! echo even when isBaileys is false',async()=>{
 const {withMessageResponses,isOwnOutboundEcho}=await import('../lib/command-response.js')
 const local={...conn,sendMessage:async()=>({key:{id:'generated-echo'}}),relayMessage:async()=>undefined}
 await withMessageResponses(local,async()=>{await local.sendMessage('fixture@g.us',{text:'!!buka menu'});await local.relayMessage('fixture@g.us',{}, {messageId:'relay-echo'})})
 for(const id of ['generated-echo','relay-echo']){const m=message('!!buka menu',{isBaileys:false,key:{id,fromMe:true}});assert(isOwnOutboundEcho(local,m));assert(!shouldAutoAITrigger(m,local,botConfig));assert(!isOwnOutboundEcho(conn,m))}
 assert(shouldAutoAITrigger(message(),local,botConfig))
})
