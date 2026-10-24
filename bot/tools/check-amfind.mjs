// Read-only network diagnostic; never connects/sends to WhatsApp or changes user data.
// Usage: node tools/check-amfind.mjs https://vt.tiktok.com/EXAMPLE/
import {findAmPresets,normalizeTikTokInput} from '../lib/amfind.js'
import handler from '../plugins/tools/amfind.js'
const url=normalizeTikTokInput(process.argv[2])
const started=Date.now(),result=await findAmPresets(url),replies=[]
await handler({chat:'diagnostic',key:{id:'diagnostic'},reply:async text=>replies.push(text)},{conn:{sendMessage:async(_jid,content)=>{if(!content.react)throw Error('Unexpected diagnostic transport call')}},usedPrefix:'/',command:'amfind',text:url})
const output={status:result.status,elapsedMs:Date.now()-started,presets:result.items.filter(x=>x.kind==='preset'),otherLinkKinds:result.items.filter(x=>x.kind!=='preset').map(x=>x.kind),inspected:result.inspected,replies:result.replies,pages:result.pages,pluginReplyCount:replies.length,pluginReplyContainsAllLinks:result.items.every(x=>replies[0]?.includes(x.url)),physicalWhatsAppAcceptance:false,productionDataWrites:false}
console.log(JSON.stringify(output))
if(result.status!=='found'||!output.pluginReplyContainsAllLinks)process.exitCode=2
