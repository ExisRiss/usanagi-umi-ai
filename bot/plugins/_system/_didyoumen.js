import { parseCommandInput } from '../../lib/command-parser.js'
import { commandAliases } from '../../lib/auto-ai.js'
import { maySuggestCommand } from '../../lib/command-response.js'

const handler = m => m
function accepts(plugin, command) {
  const check = entry => {
    if (!(entry instanceof RegExp)) return String(entry || '').toLowerCase() === command
    const last = entry.lastIndex
    try { entry.lastIndex=0; return entry.test(command) } finally { entry.lastIndex=last }
  }
  return Array.isArray(plugin.command) ? plugin.command.some(check) : check(plugin.command)
}
function similarity(a,b) {
  let row=Array.from({length:b.length+1},(_,i)=>i)
  for(let i=1;i<=a.length;i++) {
    const next=[i]
    for(let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1))
    row=next
  }
  return 1-row[b.length]/Math.max(a.length,b.length)
}

// Called by the dispatcher only AFTER all handlers/AI had a chance to respond.
// No before hook: a suggestion must never race the actual rich HTML reply.
handler.unknownCommand = async function(m,{usedPrefix,botConfig={},isCommandDisabled=()=>false}={}) {
  if(!maySuggestCommand(m) || !m.text || typeof usedPrefix!=='string' || !usedPrefix) return
  if(!m.text.startsWith(usedPrefix)) return
  const command=parseCommandInput(m.text.slice(usedPrefix.length)).command
  if(command.length<3 || command.length>64)return
  const aliases=new Set()
  for(const [name,plugin] of Object.entries(global.plugins || {})) {
    if(typeof plugin!=='function' || plugin.disabled || isCommandDisabled(name))continue
    if(name.startsWith('custom/') && (botConfig.type!=='jadibot' || !botConfig.enabledCustomPlugins?.includes(name)))continue
    const namespaced=name.split('/').pop().startsWith('usanagi-')
    const actual=namespaced && command.startsWith('usanagi-') ? command.slice(8) : command
    // Exact matches with arguments, case differences or regex-only aliases are not typos.
    if(accepts(plugin,actual))return
    for(const alias of commandAliases(plugin)) {
      if(!isCommandDisabled(name,alias))aliases.add(alias)
      if(namespaced && command.startsWith('usanagi-') && !isCommandDisabled(name,alias))aliases.add('usanagi-'+alias)
    }
  }
  let mean='',score=.65
  for(const alias of aliases) {
    if(Math.abs(alias.length-command.length)>Math.ceil(Math.max(alias.length,command.length)*.35))continue
    const value=similarity(command,alias)
    if(value>score) {mean=alias;score=value}
  }
  if(!mean || mean===command || !maySuggestCommand(m))return
  await this.sendMessage(m.chat,{
    text:`Perintah belum dikenal. Mungkin maksud kamu:\n\n❀ *${usedPrefix}${mean}*\n\nKemiripan: ${Math.round(score*100)}%`,
  },{quoted:m})
}
export default handler
