// Request-local response tracking. Socket wrappers are installed once; concurrent
// messages/chats/Jadibot sessions never share a "has replied" flag.
import { AsyncLocalStorage } from 'node:async_hooks'
const key = Symbol.for('umi.message.response.v1')
if (!global[key]) global[key] = { context:new AsyncLocalStorage(), sockets:new WeakMap() }
const state = global[key]
if (!state.outbound) state.outbound = new WeakMap()
function rememberOutbound(conn, id) {
  if (typeof id !== 'string' || !id) return
  let ids=state.outbound.get(conn)
  if(!ids){ids=new Map();state.outbound.set(conn,ids)}
  const now=Date.now();ids.set(id,now)
  for(const [key,at] of ids){if(at<now-600000||ids.size>2048)ids.delete(key);else break}
}
export function isOwnOutboundEcho(conn,m) {
  const at=conn&&state.outbound.get(conn)?.get(m?.key?.id||m?.id)
  return Boolean((m?.fromMe||m?.key?.fromMe)&&at&&Date.now()-at<600000)
}
const META = new Set(['messageContextInfo','contextInfo','protocolMessage','reactionMessage','senderKeyDistributionMessage'])
function meaningful(method, value) {
  if (method === 'reply') return typeof value === 'string' ? Boolean(value.trim()) : Boolean(value)
  if (!value || typeof value !== 'object') return false
  if (method === 'sendMessage' && ('react' in value || 'delete' in value || 'edit' in value)) return false
  return Object.keys(value).some(k=>!META.has(k) && value[k] !== undefined && value[k] !== null && value[k] !== '')
}
async function track(ctx, eligible, send) {
  if (eligible) ctx.pending++
  try {
    const result = await send()
    if (eligible) ctx.sent = true
    return result
  } finally { if (eligible) ctx.pending-- }
}
function install(conn) {
  let record=state.sockets.get(conn)
  if(!record) { record={}; state.sockets.set(conn,record) }
  for(const method of ['sendMessage','relayMessage','reply']) {
    const original=conn[method]
    if(typeof original!=='function' || original===record[method])continue
    // The RPG flush wrapper may sit above our wrapper; do not grow a chain per message.
    let inner=original,installed=false
    for(let depth=0;inner&&depth<8;depth++){if(inner===record[method]){installed=true;break}inner=inner[Symbol.for('umi.rpg.outbound.original.v1')]}
    if(installed)continue
    const wrapper=function(...args) {
      const ctx=state.context.getStore()
      const eligible=Boolean(ctx && ctx.conn===conn && ctx.chat && args[0]===ctx.chat && meaningful(method,args[1]))
      // Keep the original return semantics when outside a handled request.
      const send=()=>{
        // Remember explicit relay IDs before send, and actual transport result IDs.
        rememberOutbound(conn,args[2]?.messageId)
        const remember=result=>{rememberOutbound(conn,result?.key?.id);return result}
        const result=original.apply(this,args)
        return result&&typeof result.then==='function'?result.then(remember):remember(result)
      }
      if(!eligible)return send()
      return track(ctx,true,send)
    }
    try { conn[method]=wrapper; if(conn[method]===wrapper)record[method]=wrapper } catch {}
  }
}
export function withMessageResponses(conn,callback) {
  install(conn)
  return state.context.run({conn,chat:null,message:null,sent:false,pending:0},callback)
}
export function bindResponseMessage(m) {
  const ctx=state.context.getStore()
  if(!ctx||!m)return
  ctx.chat=m.chat;ctx.message=m
  const original=m.reply
  if(typeof original==='function') {
    const wrapped=function(...args) {
      const active=state.context.getStore()
      const target=typeof args[1]==='string' && args[1].includes('@') ? args[1] : m.chat
      const eligible=Boolean(active && active===ctx && target===ctx.chat && meaningful('reply',args[0]))
      return eligible ? track(ctx,true,()=>original.apply(this,args)) : original.apply(this,args)
    }
    try { Object.defineProperty(m,'reply',{value:wrapped,writable:true,configurable:true,enumerable:true}) } catch {}
  }
}
export function hasMessageResponse(m) {
  const ctx=state.context.getStore()
  return Boolean(m?.__responseSent || (ctx && (!m || ctx.message===m) && (ctx.sent || ctx.pending>0)))
}
export function maySuggestCommand(m) {
  return Boolean(m && !m.__autoAIHandled && !m.__autoAIAnswer && !m.__autoAITargetPlugin && !m.__commandRecognized && !m.isCommand && !m.error && !hasMessageResponse(m))
}
