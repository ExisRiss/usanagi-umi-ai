import { unifiedRpg } from './rpg/unified-store.js'
import fs from 'node:fs'
/* Audited compatibility boundary for Usanagi plugins. No vendor accounts/keys. */
import { AsyncLocalStorage } from 'node:async_hooks'
import path from 'node:path'
const scope = new AsyncLocalStorage(), modules = new Map(), cooldowns = new Map()
export function createVendorConfig(source) {
  const emptyKeys = new Proxy({}, { get: () => '' })
  return new Proxy({}, { get(_target, key) {
    const ctx = scope.getStore() || {}, cfg = ctx.extra?.botConfig?.values || {}
    const botName = cfg.nameBot || cfg.botName || global.namebot || 'Usanagi Umi AI'
    const prefix = ctx.extra?.usedPrefix || '/'
    const objects = {
      bot: { name:botName, prefix, version:'10.1.0', developer:global.developer || 'AlzRiss', public:true },
      owner: { name:'Owner', number:String(global.owner?.[0]?.[0] || '').replace(/\D/g,''), numbers:(global.owner || []).map(v=>v[0]) },
      sticker: { packname:global.packname || botName, author:global.author || 'By AlzRiss - Usanagi Umi AI' },
      info: { website:'https://website-jadibot-by-alzriss.vercel.app' },
      saluran: { name:botName, id:global.newsletter?.jid || '', link:cfg.links?.channel || global.saluran || '' },
      APIkey:emptyKeys, apiKey:emptyKeys, apikey:emptyKeys,
      limits: { defaultLimit:50, maxFileSize:50*1024*1024 },
      energi: { default:50, max:100 },
      assets: { thumbnail:'./media/thumbnail.jpg', menu:'./media/menu.png', games:'./media/menu.png', rpg:'./media/menu.png', winner:'./media/menu.png' },
      features: { registration:false, autoRead:false }, mode:{public:true}, groupProtection:{},
      registration:{enabled:false}, bannedUsers:[], ui:{}, db:{}, donasi:{},
    }
    if (key in objects) return objects[key]
    if (key==='prefix') return prefix
    if (key==='name') return botName
    if (key==='version') return '10.1.0'
    if (key==='timezone') return 'Asia/Makassar'
    return undefined
  } })
}
function currentData() { return global.db?.data || {users:{},chats:{},settings:{},stats:{}} }
function userDefaults(jid) {
  const data = currentData(); data.users ||= {}; if (!data.users[jid]) data.users[jid] = {}; const user = data.users[jid]
  for (const [k,v] of Object.entries({exp:0,level:0,money:0,limit:50,registered:false,health:100,stamina:100,hunger:100})) user[k] ??= v
  return new Proxy(user, { get(t,k) {
    if (k==='koin'||k==='balance') return t.money
    if (k==='energi'||k==='energy') return t.importedEnergy ??= 100
    if (k==='name') return t.name || jid.split('@')[0]
    if (k==='premium') return Number(t.premiumTime || 0)>Date.now()
    return t[k]
  }, set(t,k,v) { if(k==='koin'||k==='balance') k='money';if(k==='energi'||k==='energy') k='importedEnergy';t[k]=v;return true } })
}
const dbBridge = {
  getUser: userDefaults,
  setUser(jid, patch) { const user=userDefaults(jid);Object.assign(user,patch||{});return user },
  getGroup(jid) { const d=currentData();d.chats ||= {};return d.chats[jid] ||= {} },
  setGroup(jid,patch) { return Object.assign(this.getGroup(jid),patch||{}) },
  getAllUsers() { return currentData().users || {} },getAllGroups() { return currentData().chats || {} },
  getUserCount() { return Object.keys(this.getAllUsers()).length },
  setting(key,value) { const d=currentData();d.importedSettings ||= {};const ctx=scope.getStore();const bucket=d.importedSettings[ctx?.extra?.botConfig?.scope || 'main'] ||= {};if(arguments.length>1) bucket[key]=value;return bucket[key] },
  getSettings() { const d=currentData();d.importedSettings ||= {};return d.importedSettings[scope.getStore()?.extra?.botConfig?.scope || 'main'] ||= {} },
  updateKoin(jid,amount) { const u=userDefaults(jid);u.koin=Math.max(0,Number(u.koin||0)+Number(amount||0));return u.koin },
  updateSaldo(jid,amount) { const u=userDefaults(jid);u.saldo=Math.max(0,Number(u.saldo||0)+Number(amount||0));return u.saldo },
  updateExp(jid,amount) { const u=userDefaults(jid);u.exp=Math.max(0,Number(u.exp||0)+Number(amount||0));return u.exp },
  updateEnergi(jid,amount) { const u=userDefaults(jid);u.energi=Math.max(0,Number(u.energi||0)+Number(amount||0));return u.energi },
  checkCooldown(jid,key,seconds=0) { const store=unifiedRpg(),id=store?.identity(jid); const last=id?store.read(id).legacy?.importedCooldowns?.[key]:cooldowns.get(jid+':'+key); return Math.max(0,(last||0)+Number(seconds)*1000-Date.now()) },
  setCooldown(jid,key) { const store=unifiedRpg(),id=store?.identity(jid); if(store&&!id)store.reject('Identitas RPG belum terverifikasi.');if(id){const u=store.read(id);u.legacy=u.legacy||{};u.legacy.importedCooldowns=u.legacy.importedCooldowns||{};Object.defineProperty(u.legacy.importedCooldowns,key,{value:Date.now(),enumerable:true,writable:true,configurable:true});store.write(id,u)}else cooldowns.set(jid+':'+key,Date.now()) },
  getTopUsers(field='exp',limit=10) {const seen=new Set();return Object.entries(this.getAllUsers()).filter(([jid])=>{if(!unifiedRpg())return true;const id=unifiedRpg().identity(jid);if(!id||seen.has(id))return false;seen.add(id);return true}).sort((a,b)=>Number(b[1][field]||0)-Number(a[1][field]||0)).slice(0,limit).map(([jid,u])=>({jid,...u}))},
  incrementStat(key) { const d=currentData();d.importedStats ||= {};d.importedStats[key]=(d.importedStats[key]||0)+1 },
  getStats() {return currentData().importedStats || {}},
  save() { global.db?.write?.()?.catch?.(()=>{});return true },write() {return this.save()},markDirty() {return true},flushAll() {return this.save()},readAll() {return true},
  deleteUser() {throw new Error('Penghapusan database melalui pelengkap diblokir.')},resetToDefaults() {throw new Error('Reset database melalui pelengkap diblokir.')},
  get users(){return currentData().users},get groups(){return currentData().chats},get settings(){return this.getSettings()},get stats(){return this.getStats()},
  get data(){const d=currentData();return {...d,groups:d.chats}},get db(){return {data:this.data}},
}
export function getImportedDatabase() { return dbBridge }
export class ImportedDatabase { constructor(){return dbBridge} }
export async function initImportedDatabase(){return dbBridge}
function sockAdapter(conn) {
  const media = async(jid,input,caption,quoted,options={}) => {
    if (caption && typeof caption==='object') {options=quoted||{};quoted=caption;caption=''}
    const type=options.type || (/\.(?:mp3|ogg|wav|m4a)(?:\?|$)/i.test(String(input))?'audio':/\.(?:mp4|webm)(?:\?|$)/i.test(String(input))?'video':'image')
    const data=Buffer.isBuffer(input)?input:{url:String(input)}
    const payload={ [type]:data,...(caption?{caption:String(caption)}:{}),...(type==='audio'?{mimetype:options.mimetype||'audio/mpeg',ptt:Boolean(options.ptt)}:{}),...(options.fileName?{fileName:options.fileName}:{}),...(options.contextInfo?{contextInfo:options.contextInfo}:{}),...(options.mentions?{mentions:options.mentions}:{}) }
    return conn.sendMessage(jid,payload,{quoted:quoted||undefined})
  }
  // Pembuat stiker dari gambar/video. Plugin impor Usanagi banyak yang
  // memanggil sock.sendVideoAsSticker / sendImageAsSticker, metode yang tidak
  // disediakan socket Baileys maupun lib/simple.js — dulu berujung
  // "sock.sendVideoAsSticker is not a function".
  const buatStiker = async(mediaInput,options={})=>{
    const [{writeExif},{fileTypeFromBuffer}]=await Promise.all([import('./exif.js'),import('file-type')])
    const data=Buffer.isBuffer(mediaInput)?mediaInput:Buffer.from(mediaInput)
    if(!data.length)throw new Error('Media stiker kosong.')
    const type=await fileTypeFromBuffer(data).catch(()=>null)
    const mimetype=type?.mime||'image/png'
    const buffer=await writeExif({mimetype,data,ext:type?.ext},{
      packName:String(options.packname||options.packName||'Umi Usanagi'),
      packPublish:String(options.author||options.packPublish||options.publisher||'Umi')
    })
    if(!buffer||!Buffer.isBuffer(buffer))throw new Error('Gagal membuat stiker. Pastikan ffmpeg terpasang di server.')
    return buffer
  }
  const kirimStiker=async(jid,mediaInput,quoted,options={})=>{
    const stickerBuffer=await buatStiker(mediaInput,options)
    const payload={sticker:stickerBuffer}
    if(options.isAnimated)payload.isAnimated=true
    return conn.sendMessage(jid,payload,{quoted:quoted||undefined})
  }
  const fallback={
    sendMedia:media,
    sendImageAsSticker:(jid,image,quoted,options={})=>kirimStiker(jid,image,quoted,options),
    sendVideoAsSticker:(jid,video,quoted,options={})=>kirimStiker(jid,video,quoted,{...options,isAnimated:true}),
    sendStickerAsSticker:(jid,stickerInput,quoted,options={})=>kirimStiker(jid,stickerInput,quoted,options),
    sendStickerPack:async(jid,buffers,quoted,options={})=>{
      const list=(Array.isArray(buffers)?buffers:[]).filter(Boolean).slice(0,30)
      const hasil=[]
      for(const item of list)hasil.push(await kirimStiker(jid,item,quoted,options))
      return hasil
    },
    sendText:(jid,text,quoted,opts={})=>conn.sendMessage(jid,{text:String(text),...opts},{quoted}),
    sendTextWithMentions:(jid,text,quoted,opts={})=>conn.sendMessage(jid,{text:String(text),mentions:[...String(text).matchAll(/@(\d{6,16})/g)].map(m=>m[1]+'@s.whatsapp.net'),...opts},{quoted}),
    sendPreview:(jid,opts,options={})=>conn.sendMessage(jid,{text:String(opts.caption||opts.description||opts.title||''),...(opts.jpegThumbnail?{contextInfo:{externalAdReply:{title:opts.title||'',body:opts.description||'',thumbnail:opts.jpegThumbnail,sourceUrl:opts.url||'',mediaType:1}}}:{})},options),
    decodeJid:jid=>String(jid||'').replace(/:\d+(?=@)/,''),
    sendImage:(jid,image,caption,quoted,opts)=>media(jid,image,caption,quoted,{...opts,type:'image'}),
    sendVideo:(jid,video,caption,quoted,opts)=>media(jid,video,caption,quoted,{...opts,type:'video'}),
    sendAudio:(jid,audio,quoted,opts)=>media(jid,audio,'',quoted,{...opts,type:'audio'}),
  }
  return new Proxy(conn,{get(t,k){if(k in fallback)return fallback[k];const value=t[k];return typeof value==='function'?value.bind(t):value}})
}
export async function runImportedFeature(source,file,meta,m,extra) {
  if(/^(?:spam|bomb|crash|bugwa)/i.test(path.basename(file)))return {success:false}
  const key=`${extra.botScope || extra.conn.user?.id}:${source}:${file}`
  const coolKey=`${key}:${m.chat}:${m.sender}`
  const remaining=Number(meta.cooldown||0)*1000-(Date.now()-(cooldowns.get(coolKey)||0))
  if(remaining>0) {await m.reply(`Tunggu ${Math.ceil(remaining/1000)} detik sebelum memakai fitur ini lagi.`);return {success:false}}
  const context={m,extra,source}
  return scope.run(context,async()=>{
    let failed=false
    const message=Object.create(m)
    const command=meta.aliasMap?.[extra.command]||String(extra.command||'').replace(new RegExp('^'+source+'-'),'')
    for(const [key,value] of Object.entries({text:extra.text||'',body:m.text,command,args:extra.args||[],prefix:extra.usedPrefix,isOwner:Boolean(extra.isOwner),isAdmin:Boolean(extra.isAdmin),isBotAdmin:Boolean(extra.isBotAdmin),isPremium:Boolean(extra.isPrems),pushName:m.pushName||m.name||'User',groupMetadata:extra.groupMetadata||m.groupMetadata||{},groupMembers:extra.participants||m.groupMembers||[]})) Object.defineProperty(message,key,{value,writable:true,configurable:true,enumerable:true})
    // PENTING: `message` dibuat dengan Object.create(m), sehingga mewarisi properti
    // dari prototype WebMessageInfo (lib/simple.js) yang didefinisikan TANPA
    // `writable` — alias read-only. Penugasan biasa (`message.reply = ...`) melempar
    // "Cannot assign to read only property 'reply'" di strict mode dan membunuh
    // SEMUA plugin impor sebelum handler-nya sempat jalan. Karena itu ketiga
    // properti ini wajib dipasang dengan Object.defineProperty, sama seperti
    // properti text/body/command di atas.
    Object.defineProperty(message,'reply',{value:async(text,opts)=>{if(typeof text==='string'&&/^(?:❌|☢|Error:|Gagal)/i.test(text.trim()))failed=true;return extra.conn.reply(m.chat,text,opts?.quoted===false?null:m,opts||{})},writable:true,configurable:true,enumerable:true})
    Object.defineProperty(message,'react',{value:async emoji=>{if(/[❌☢⚠]/u.test(String(emoji)))failed=true;try{return await extra.conn.sendMessage(m.chat,{react:{text:String(emoji),key:m.key}})}catch{return null}},writable:true,configurable:true,enumerable:true})
    Object.defineProperty(message,'limit',{value:{active:Number(meta.energi||meta.limit||0)>0,success(){return true},fail(){failed=true;return true}},writable:true,configurable:true,enumerable:true})
    try {
      let loaded=modules.get(key)
      if(!loaded){const url=new URL(`../integrations/${source}/${file}`,import.meta.url);url.searchParams.set('scope',String(extra.botScope||extra.conn.user?.id));loaded=await import(url.href);modules.set(key,loaded)}
      const handler=loaded.handler||loaded.default?.handler||(typeof loaded.default==='function'?loaded.default:null)
      if(typeof handler!=='function')throw new Error('Format handler pelengkap tidak didukung.')
      const result=await handler(message,{...extra,sock:sockAdapter(extra.conn),conn:extra.conn,store:extra.conn.store||{},config:createVendorConfig(source),plugins:global.plugins,db:dbBridge,isOwner:Boolean(extra.isOwner),isAdmin:Boolean(extra.isAdmin),isBotAdmin:Boolean(extra.isBotAdmin),isPremium:Boolean(extra.isPrems)})
      if(!failed&&result?.success!==false)cooldowns.set(coolKey,Date.now())
      return {success:!failed&&result?.success!==false}
    }catch(error){await m.reply(`Fitur ${source}/${meta.name}: ${String(error?.message||'gagal').replace(/(?:gsk_|ptlc_|vcp_|ghp_)[\w-]{16,}/g,'<redacted>').slice(0,180)}. Beberapa fitur memerlukan API pihak ketiga milik owner.`);return {success:false}}
  })
}

export function getImportedAssetBuffer() {
  for(const file of ['./media/thumbnail.jpg','./media/menu.png','./assets/image/menu.png']) {
    try {const target=path.resolve(process.cwd(),file);if(fs.statSync(target).size<4*1024*1024)return fs.readFileSync(target)}catch{}
  }
  return null
}
export async function preloadImportedAssets() { return true }
export function rejectImportedAssetUpdate() { throw new Error('Gunakan Settings/media native untuk mengubah aset bot; konfigurasi global dilindungi.') }

export function isImportedOwner(jid) {const ctx=scope.getStore();return Boolean(ctx?.extra?.isOwner && (!jid || String(jid).replace(/:\d+(?=@)/,'').split('@')[0]===String(ctx.m?.sender||'').replace(/:\d+(?=@)/,'').split('@')[0]))}
export function isImportedPremium(jid) {const ctx=scope.getStore();return Boolean(ctx?.extra?.isPrems && (!jid || String(jid).replace(/:\d+(?=@)/,'').split('@')[0]===String(ctx.m?.sender||'').replace(/:\d+(?=@)/,'').split('@')[0]))}
