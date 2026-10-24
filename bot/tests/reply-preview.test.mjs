import test from 'node:test'
import assert from 'node:assert/strict'
import fake from '../plugins/_system/_allfake.js'
import {rewriteOutgoingContent} from '../lib/prefix-rewrite.js'
async function socket(url=''){
 global.links={websiteUrl:url};global.scriptUrl=''
 const sent=[],conn={sendMessage:async(jid,content,options)=>{sent.push({jid,content,options});return {key:{id:'transport-result'}}}}
 await fake.all.call(conn,{},{});return {conn,sent}
}
for(const url of ['', 'https://example.test', 'https://example.test/'])test('preview does not prepend slash/URL/invisible padding, configured URL='+Boolean(url),async()=>{
 const f=await socket(url),text='Developerku AlzRiss. Mau dibantu apa?'
 const result=await f.conn.sendMessage('fixture@g.us',{text},{quoted:{key:{id:'incoming'}}})
 assert.equal(f.sent[0].content.text,text);assert(!f.sent[0].content.text.includes('\u2063'));assert.equal(result.key.id,'transport-result');assert.equal(f.sent[0].options.quoted.key.id,'incoming')
})
for(const text of ['/menu','Gunakan /realms login di chat pribadi.','https://example.test/a/b','/home/user/file.txt','Nilai 1/2 dan 0.5','Baris satu\n\nBaris dua'])test('legitimate command/URL/path/text remains intact: '+text,async()=>{
 const f=await socket();await f.conn.sendMessage('fixture@g.us',{text});assert.equal(f.sent[0].content.text,text)
})
test('caller metadata, mentions and existing link preview are not discarded',async()=>{
 const f=await socket(),content={text:'Halo @111111111',mentions:['111111111@s.whatsapp.net'],contextInfo:{forwardingScore:1},custom:'kept'};await f.conn.sendMessage('fixture@g.us',content)
 assert.deepEqual(f.sent[0].content.mentions,content.mentions);assert.deepEqual(f.sent[0].content.contextInfo,content.contextInfo);assert.equal(f.sent[0].content.custom,'kept');assert(!Object.hasOwn(content,'linkPreview'))
 const explicit={text:'Already has preview',linkPreview:{title:'caller'}};await f.conn.sendMessage('fixture@g.us',explicit);assert.equal(f.sent[1].content,explicit)
})
test('media/control payloads and caption slash are not blindly stripped',async()=>{
 const f=await socket();for(const content of [{image:Buffer.from('image'),caption:'/menu contoh'},{react:{text:'👍',key:{id:'incoming'}}},{delete:{id:'incoming'}},{text:'buttons',buttons:[{buttonId:'/menu'}]}]){await f.conn.sendMessage('fixture@g.us',content);assert.equal(f.sent.at(-1).content,content)}
})
test('wrapper is installed once and multiple destinations preserve body',async()=>{
 const f=await socket();const first=f.conn.sendMessage;await fake.all.call(f.conn,{},{});assert.equal(f.conn.sendMessage,first);await f.conn.sendMessage(['a@g.us','b@g.us'],{text:'Halo'});assert.equal(f.sent.length,2);assert(f.sent.every(x=>x.content.text==='Halo'))
})
test('configured command hints still rewrite while ordinary answer stays untouched',async()=>{
 global.plugins={menu:Object.assign(async()=>{},{command:'menu',help:['menu']})}
 const f=await socket();await f.conn.sendMessage('fixture@g.us',rewriteOutgoingContent({text:'Halo, ketik .menu'},'!'));assert.equal(f.sent[0].content.text,'Halo, ketik !menu')
})
test.after(()=>{delete global.links;delete global.scriptUrl;delete global.plugins})
