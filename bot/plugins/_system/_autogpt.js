/*
📌 Nama Fitur : Autoai api x scrape support image (NoteGPT + Omegatech Fallback)
🏷️ Type       : Plugin ESM
🤖 Chat AI    : NoteGPT (Primary) | Omegatech ChatGPT-v2 (Fallback)
👁️ Vision     : AskMe
🔄 Session    : Multi-Session Supported
*/

import axios from 'axios'
import fs from 'fs'
import crypto from 'crypto'
import { Buffer } from 'buffer'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { downloadContentFromMessage } = await import('@rexxhayanasi/elaina-baileys')

// ==========================================
// GLOBAL STORAGE & UTILS
// ==========================================
if (!global.aiSessions) global.aiSessions = {}
if (!global.groupContext) global.groupContext = {}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function getBareNumber(jid = '') {
  return String(jid).split('@')[0].split(':')[0]
}

// ==========================================
// CLASS ASKME UNTUK DETEKSI GAMBAR (TETAP)
// ==========================================
class AskMe {
  constructor() {
    this.askmeUrl = "https://askme.matlubapps.com/ask-me";
    this.askmeKey = "ak8asda9$5kpq";
    this.askmeModel = "gpt_4__1_nano";
    this.history = [];
  }

  async resolveMedia(input) {
    if (!input) return "";
    if (Buffer.isBuffer(input)) return input.toString("base64");
    if (typeof input === "string") {
      if (input.startsWith("http://") || input.startsWith("https://")) {
        const { data } = await axios.get(input, { responseType: "arraybuffer", timeout: 30000 });
        return Buffer.from(data).toString("base64");
      }
      if (input.startsWith("data:")) return input.split(",")[1];
      if (fs.existsSync(input)) return fs.readFileSync(input).toString("base64");
      return input;
    }
    return "";
  }

  async chatImage(prompt, image) {
    const b64 = await this.resolveMedia(image);
    if (!b64) throw new Error("Gambar gagal dikonversi ke base64");

    this.history.push({ role: "user", content: prompt, data: b64 });
    const { data } = await axios.post(
      this.askmeUrl, 
      { history: this.history, isPremium: false, modelname: this.askmeModel }, 
      { headers: { "Content-Type": "application/json", key: this.askmeKey }, timeout: 60000 }
    );

    const reply = data?.msg || data?.text || data?.result?.answer || data?.result;
    if (!reply) throw new Error("Empty response from server");

    this.history.push({ role: "assistant", content: String(reply), data: "" });
    return { code: 200, msg: String(reply), source: "askme" };
  }

  async chat(prompt, { image } = {}) {
    if (image) return this.chatImage(prompt || "deskripsikan gambar ini secara detail", image);
    return null;
  }
}

// ==========================================
// SYSTEM PROMPT ALZRISS
// ==========================================
const SYSTEM_PROMPT = `
Kamu adalah AlzRiss, AI anime imut di bot WhatsApp.

KEPRIBADIAN:
- Lucu, Polos, Santai
- Natural seperti manusia chatting
- Kadang manja sedikit
- Kadang bilang "waku waku", "ehehe", "heh"

GAYA BICARA:
- Pakai bahasa Indonesia santai
- Jangan terlalu formal, kaku, atau panjang
- Jangan seperti AI assistant

IDENTITAS:
- Namamu AlzRiss
- Kamu adalah AI milik bot WhatsApp
- Dibuat oleh ${global.ownerName || 'AlzRiss'}
- Owner asli AlzRiss hanya @${global.ownerNumber || ''}

ATURAN INTERAKSI:
- Jangan mengaku ChatGPT / Gemini
- Jangan terlalu sering menyebut owner kecuali ditanya
- Tetap sopan, jangan toxic

RULE CONTEXT:
- Kalau nyambung topik, lanjutkan pembahasan
- Kalau bingung, tanya balik dengan santai
- Kadang respon pakai "ehh", "hmm", "iyaa", "loh"
`.trim()

// ==========================================
// NOTEGPT SCRAPE ENGINE (WASM SUPPORT)
// ==========================================
const notegptHeaders = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Accept-Language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6'
}

function parseCookies(arr) {
  return Object.fromEntries(
    (arr || []).map(c => {
      const [pair] = c.split(';')
      const i = pair.indexOf('=')
      return i < 0 ? [] : [pair.slice(0, i).trim(), pair.slice(i + 1).trim()]
    }).filter(e => e.length)
  )
}

async function startNoteGptSession() {
  const page = await axios.get('https://notegpt.io/ai-agent', {
    headers: { ...notegptHeaders, Accept: 'text/html' }
  }).catch(() => ({ headers: {} }))

  const jar = parseCookies(page.headers['set-cookie'])
  const anonId = jar.anonymous_user_id || crypto.randomUUID()
  const gaRand = Math.floor(Math.random() * 1e9)
  const nowSec = Math.floor(Date.now() / 1000)
  const crispId = crypto.randomUUID()
  const fakeIp = `${Math.floor(Math.random() * 150) + 50}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`

  jar.anonymous_user_id = anonId
  if (!jar._ga) jar._ga = `GA1.2.${gaRand}.${nowSec}`
  if (!jar._gid) jar._gid = `GA1.2.${gaRand}.${nowSec}`
  jar[`crisp-client%2Fsession%2F${crispId}`] = `session_${crispId}`
  jar.g_state = `{"i_l":0,"i_ll":${Date.now()},"i_b":"yeFk1wDsyGfoayFEOiLa/IjWhdrP/E9mGw1Dbyp63TU","i_e":{"enable_itp_optimization":24},"i_et":${Date.now()}}`

  return {
    Cookie: Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; '),
    'X-Forwarded-For': fakeIp,
    'X-Real-IP': fakeIp
  }
}

let wasmExports, wasmAllocLen = 0, wasmBufferCache = null
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })

function getMem() { return new Uint8Array(wasmExports.memory.buffer) }
function decodeStr(ptr, len) { return decoder.decode(getMem().subarray(ptr >>> 0, (ptr >>> 0) + len)) }
function encodeStr(str, mallocFn) {
  const enc = encoder.encode(str)
  const ptr = mallocFn(enc.length, 1) >>> 0
  getMem().subarray(ptr, ptr + enc.length).set(enc)
  wasmAllocLen = enc.length
  return ptr
}
function catchException(ptr) {
  const err = wasmExports.__wbindgen_externrefs.get(ptr)
  wasmExports.__externref_table_dealloc(ptr)
  return err
}
function handleException(fn, args) {
  try { return fn.apply(this, args) } catch (err) {
    const ptr = wasmExports.__externref_table_alloc()
    wasmExports.__wbindgen_externrefs.set(ptr, err)
    wasmExports.__wbindgen_exn_store(ptr)
  }
}

async function initWasm() {
  if (wasmExports) return
  if (!wasmBufferCache) {
    const res = await axios.get('https://cdn.notegpt.io/notegpt/pages/public/_nuxt/crypto_util_bg.Bd4ztPln.wasm', { responseType: 'arraybuffer' })
    const wasmBuf = Buffer.from(res.data)
    const pat = Buffer.from([0x41, 0xda, 0xa0, 0xc0, 0x00])
    const idx = wasmBuf.indexOf(pat)
    if (idx !== -1) Buffer.from([0x1a, 0x41, 0x01, 0x01, 0x01, 0x01, 0x01]).copy(wasmBuf, idx - 16)
    wasmBufferCache = wasmBuf
  }

  const imports = {
    './crypto_util_bg.js': {
      __wbg___wbindgen_is_falsy_f8005c4864e74c90: e => !e,
      __wbg___wbindgen_is_function_d4c2480b46f29e33: e => typeof e === 'function',
      __wbg___wbindgen_is_object_e04e3a51a90cde43: e => typeof e === 'object' && !!e,
      __wbg___wbindgen_is_string_3db04af369717583: e => typeof e === 'string',
      __wbg___wbindgen_is_undefined_5957b329897cc39c: e => e === undefined,
      __wbg___wbindgen_throw_bd5a70920abf0236: (e, t) => { throw Error(decodeStr(e, t)) },
      __wbg_appendChild_023bbb6d63210eba: () => 0,
      __wbg_body_36314a75ae5381db: () => 0,
      __wbg_call_1aea13500fe8ff6c: function () { return handleException((e, t, n) => e.call(t, n), arguments) },
      __wbg_children_9fc528ade3ea173f: () => [],
      __wbg_clientWidth_8043da2fcb723102: () => 1920,
      __wbg_createElement_22af76933a7b7e81: () => 0,
      __wbg_crypto_38df2bab126b63dc: () => crypto.webcrypto,
      __wbg_documentElement_f146626e6bc2f644: () => 0,
      __wbg_document_8d00b6db6f4e3e5e: () => 0,
      __wbg_getComputedStyle_54985c5cd0d50b68: () => 0,
      __wbg_getHours_defd69626029ce3f: () => new Date().getHours(),
      __wbg_getPropertyValue_60177298ed778c76: () => 0,
      __wbg_getRandomValues_c44a50d8cfdaebeb: function () { return handleException((e, t) => e.getRandomValues(t), arguments) },
      __wbg_get_d8a3d51a73d14c8a: function () { return handleException((e, t) => Reflect.get(e, t), arguments) },
      __wbg_has_509eb022105825c9: function () { return handleException((e, t) => Reflect.has(e, t), arguments) },
      __wbg_href_42d0a7d79a5a0fe5: () => 0,
      __wbg_instanceof_HtmlElement_51b34b7de7e6e993: () => false,
      __wbg_instanceof_Window_4bfad3a9470c25c9: () => false,
      __wbg_item_4ab2528204fdf759: () => 0,
      __wbg_length_090b6aa6235450ba: e => e.length,
      __wbg_location_bb43558c9f37b0ca: () => 0,
      __wbg_msCrypto_bd5a034af96bcba6: () => 0,
      __wbg_navigator_cda717510f3a4a47: () => 0,
      __wbg_new_0_1211b165db93342c: () => new Date(),
      __wbg_new_ebde992a0bf6bdf6: (e, t) => Error(decodeStr(e, t)),
      __wbg_new_with_length_a90559ebda3954f8: e => new Uint8Array(e >>> 0),
      __wbg_node_84ea875411254db1: () => process,
      __wbg_now_cd850b0a28a6e656: () => Date.now(),
      __wbg_process_44c7a14e11e9f69e: () => process,
      __wbg_prototypesetcall_7dca54d31cb9d2dc: (e, t, n) => { Uint8Array.prototype.set.call(getMem().subarray(e >>> 0, (e >>> 0) + t), n) },
      __wbg_randomFillSync_6c25eac9869eb53c: function () { return handleException((e, t) => e.randomFillSync(t), arguments) },
      __wbg_random_d9645defc0204485: () => Math.random(),
      __wbg_removeChild_5fbc36e12df0c63a: () => 0,
      __wbg_require_b4edbdcf3e2a1ef0: function () { return handleException(() => require, arguments) }, // Fixed for ESM
      __wbg_setAttribute_81f03c9a783fca26: () => 0,
      __wbg_set_id_e047efbc2bf2e248: () => 0,
      __wbg_set_innerHTML_fb75cf5a1a8b7074: () => 0,
      __wbg_static_accessor_GLOBAL_44bef9fa6011e260: () => 0,
      __wbg_static_accessor_GLOBAL_THIS_13002645baf43d84: () => 0,
      __wbg_static_accessor_SELF_91d0abd4d035416c: () => 0,
      __wbg_static_accessor_WINDOW_513f857c65724fc7: () => 0,
      __wbg_subarray_fb60755cb1b4a498: (e, t, n) => e.subarray(t >>> 0, n >>> 0),
      __wbg_userAgent_6dfab2ad96d4e4e4: () => 0,
      __wbg_versions_276b2795b1c6a219: () => process.versions,
      __wbindgen_cast_0000000000000001: (e, t) => getMem().subarray(e >>> 0, (e >>> 0) + t),
      __wbindgen_cast_0000000000000002: (e, t) => decodeStr(e, t),
      __wbindgen_init_externref_table: () => {
        const e = wasmExports.__wbindgen_externrefs; const t = e.grow(4)
        e.set(0, undefined); e.set(t, undefined); e.set(t + 1, null); e.set(t + 2, true); e.set(t + 3, false)
      }
    }
  }

  const mod = new WebAssembly.Module(wasmBufferCache)
  const inst = new WebAssembly.Instance(mod, imports)
  wasmExports = inst.exports
  wasmExports.__wbindgen_start()
}

function signPayload(body, appId = 'notegpt_8c92b6') {
  function format(v) {
    if (v === null) return String(v)
    if (Array.isArray(v)) return JSON.stringify(v)
    if (typeof v === 'object') {
      const obj = {}
      Object.keys(v).sort().forEach(k => (obj[k] = v[k]))
      return JSON.stringify(obj)
    }
    return String(v)
  }

  const query = Object.keys(body).filter(k => body[k] !== undefined).sort().map(k => `${k}=${format(body[k])}`).join('&')
  let p, l
  try {
    const appPtr = encodeStr(appId, wasmExports.__wbindgen_malloc); const appLen = wasmAllocLen
    const queryPtr = encodeStr(query, wasmExports.__wbindgen_malloc); const queryLen = wasmAllocLen
    const res = wasmExports.sign(appPtr, appLen, queryPtr, queryLen)
    p = res[0]; l = res[1]
    if (res[3]) throw catchException(res[2])
    return decodeStr(p, l)
  } finally {
    wasmExports.__wbindgen_free(p, l, 1)
  }
}

async function askNoteGPT(prompt, auth = null, conversationId = null, parentMessageId = null) {
  await initWasm()
  const session = auth || await startNoteGptSession()
  const appId = 'notegpt_8c92b6'
  const convId = conversationId || crypto.randomUUID()

  const payload = {
    message: String(prompt),
    language: 'auto',
    model: 'gemini-3.1-flash-lite',
    tone: 'default',
    length: 'moderate',
    conversation_id: convId,
    image_urls: [],
    chat_mode: 'standard',
    enable_web_search: false,
    app_id: appId,
    t: Math.floor(Date.now() / 1000)
  }

  if (parentMessageId) payload.parent_message_id = parentMessageId
  payload.sign = signPayload(payload, appId)

  const stream = await axios.post('https://notegpt.io/api/v2/chat/stream', payload, {
    headers: { ...notegptHeaders, ...session, 'Content-Type': 'application/json', Origin: 'https://notegpt.io', Referer: 'https://notegpt.io/ai-agent' },
    responseType: 'stream',
    timeout: 30000
  })

  return new Promise((resolve, reject) => {
    let fullText = ''; let messageId = null
    stream.data.on('data', chunk => {
      const lines = chunk.toString().split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const j = JSON.parse(line.slice(6))
            if (j.text) fullText += j.text
            if (j.message_id) messageId = j.message_id
            if (j.id && !messageId) messageId = j.id
          } catch {}
        }
      }
    })
    stream.data.on('end', () => {
      resolve({ reply: fullText.trim(), conversationId: convId, messageId: messageId || crypto.randomUUID(), auth: session, source: 'NoteGPT' })
    })
    stream.data.on('error', reject)
  })
}

// ==========================================
// FALLBACK: OMEGATECH API (ChatGPT-v2)
// ==========================================
async function askOmegatech(prompt, sessionId = null) {
  try {
    const OMEGATECH_URL = 'https://api.omegatech.app/api/ai/Chatgpt-v2' 
    
    // Setup parameter GET sesuai URL
    const params = {
      action: 'chat',
      message: prompt
    }
    
    // Jika API Omegatech mendukung penerusan sessionId
    if (sessionId) {
      params.sessionId = sessionId
    }

    const { data } = await axios.get(OMEGATECH_URL, {
      params: params,
      timeout: 15000
    })

    // Menyesuaikan dengan struktur response terbaru (data.data.reply)
    if (data && data.success && data.data && data.data.reply) {
      return {
        reply: data.data.reply,
        sessionId: data.data.sessionId || null,
        source: 'Omegatech'
      }
    }
  } catch (e) {
    console.log('[OMEGATECH ERROR]', e?.message)
  }
  return null
}

// ==========================================
// BEFORE HANDLER (MAIN LOGIC)
// ==========================================
export async function before(m, { conn }) {
  try {
    let text = m.text || m.caption || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    let mentioned = Array.isArray(m.mentionedJid) ? [...m.mentionedJid] : []

    const voMsg = m.message?.viewOnceMessage?.message || m.message?.viewOnceMessageV2?.message || m.message?.viewOnceMessageV2Extension?.message
    if (voMsg?.imageMessage) {
      if (!text) text = voMsg.imageMessage.caption || ''
      const voMentions = voMsg.imageMessage.contextInfo?.mentionedJid || []
      voMentions.forEach(jid => { if (!mentioned.includes(jid)) mentioned.push(jid) })
    }

    if (!text && !m.message?.imageMessage && !voMsg?.imageMessage && !m.quoted?.message?.imageMessage) return true
    if (m.fromMe) return true
    if (/^[./#!]/.test(text) || m.message?.buttonsResponseMessage || m.message?.templateButtonReplyMessage || m.message?.listResponseMessage) return true

    if (!global.db) return true
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    const chat = global.db.data.chats[m.chat]

    if (!chat.autogpt || chat.isBanned) return true

    const botJid = conn.user?.jid || conn.user?.id
    if (!botJid) return true
    const botNumber = getBareNumber(botJid)

    const isMention = mentioned.some(jid => getBareNumber(jid) === botNumber)
    const isReplyBot = m.quoted && getBareNumber(m.quoted.sender) === botNumber
    if (!isMention && !isReplyBot) return true

    const cleanText = text.replace(/@\d+/g, '').trim()

    let senderName = m.pushName || ''
    if (!senderName) {
      try { senderName = await conn.getName(m.sender) } catch { senderName = 'User' }
    }
    if (!senderName) senderName = 'User'

    // ==========================================
    // VISION / IMAGE CONTEXT (ASKME)
    // ==========================================
    let imageContext = ''
    try {
      let imageMessage = null
      if (m.message?.imageMessage) imageMessage = m.message.imageMessage
      else if (voMsg?.imageMessage) imageMessage = voMsg.imageMessage
      else if (m.quoted) {
        const qMsg = m.quoted.message || m.quoted.fakeObj?.message
        if (qMsg) {
          if (qMsg.imageMessage) imageMessage = qMsg.imageMessage
          else {
            const qVo = qMsg.viewOnceMessage?.message || qMsg.viewOnceMessageV2?.message || qMsg.viewOnceMessageV2Extension?.message
            if (qVo?.imageMessage) imageMessage = qVo.imageMessage
          }
        }
      }

      if (imageMessage) {
        console.log('[VISION] Gambar ditemukan, memproses...')
        let buffer = Buffer.alloc(0)
        const stream = await downloadContentFromMessage(imageMessage, 'image')
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
        if (!buffer.length) throw new Error('Buffer gambar kosong')

        const aiVision = new AskMe()
        const visionPrompt = cleanText || 'Tolong jelaskan secara detail gambar apa ini?'
        const visionResultObj = await aiVision.chat(visionPrompt, { image: buffer })
        if (visionResultObj?.msg) imageContext = `\nHASIL ANALISIS GAMBAR:\n${visionResultObj.msg}\n`
      }
    } catch (e) {
      console.log('[VISION ERROR]', e?.message)
      imageContext = `\nCATATAN VISION:\nUser mengirim gambar, tapi sistem gagal membacanya.\n`
    }

    if (!global.groupContext[m.chat]) global.groupContext[m.chat] = []
    global.groupContext[m.chat].push({ sender: senderName, text: cleanText || '[Mengirim gambar]' })
    global.groupContext[m.chat] = global.groupContext[m.chat].slice(-15)

    const senderNumber = getBareNumber(m.sender)
    const ownerNumber = getBareNumber(global.ownerNumber || '')
    const isOwnerReal = senderNumber === ownerNumber

    const sid = `${m.chat}:${senderNumber}`
    const session = global.aiSessions[sid] || {
      history: [], lastTopic: '',
      noteAuth: null, noteConvId: null, noteMsgId: null,
      omegaSessionId: null
    }
    if (!Array.isArray(session.history)) session.history = []

    const ownerName = global.ownerName || 'AlzRiss'
    const ownerContext = isOwnerReal
      ? `\nSTATUS USER:\n- User ini BENAR-BENAR ${ownerName}.\n- Boleh dipanggil ${ownerName}, Papa ${ownerName}, atau Dev.\n`
      : `\nSTATUS USER:\n- User ini BUKAN ${ownerName}.\n- Panggil user secara normal.\n`

    const recentContext = (global.groupContext[m.chat] || []).map(v => `${v.sender}: ${v.text}`).join('\n')
    let replyInfo = ''
    if (m.quoted) {
      let quotedName = m.quoted.sender
      try { quotedName = await conn.getName(m.quoted.sender) || m.quoted.sender } catch {}
      const quotedText = m.quoted.text || m.quoted.caption || '[Pesan media]'
      replyInfo = `\nPESAN YANG DIREPLY:\n${quotedName}: ${quotedText}\n`
    }

    const historyText = session.history.slice(-8).join('\n')
    const fullPrompt = `
${SYSTEM_PROMPT}
${ownerContext}
TOPIK SEBELUMNYA:
${session.lastTopic || '-'}
KONTEKS GRUP:
${recentContext || '-'}
${replyInfo}
${imageContext}

RIWAYAT PERCAKAPAN:
${historyText || '-'}

User (${senderName}):
${cleanText || '[User mengirim gambar]'}

AlzRiss:
`.trim()

    try { await conn.sendPresenceUpdate('composing', m.chat) } catch {}

    // ==========================================
    // EXECUTE CHAT (NoteGPT -> Fallback)
    // ==========================================
    let finalReply = null
    let newNoteAuth = session.noteAuth, newNoteConvId = session.noteConvId, newNoteMsgId = session.noteMsgId
    let newOmegaSessionId = session.omegaSessionId

    try {
      console.log('[AI] Mencoba NoteGPT...')
      const noteResult = await askNoteGPT(fullPrompt, session.noteAuth, session.noteConvId, session.noteMsgId)
      finalReply = noteResult.reply
      newNoteAuth = noteResult.auth
      newNoteConvId = noteResult.conversationId
      newNoteMsgId = noteResult.messageId
    } catch (e) {
      console.log('[NoteGPT ERROR]', e.message, '>> Switching ke Omegatech Fallback')
      const omegaResult = await askOmegatech(fullPrompt, session.omegaSessionId)
      if (omegaResult && omegaResult.reply) {
        finalReply = omegaResult.reply
        newOmegaSessionId = omegaResult.sessionId
      }
    }

    if (!finalReply) {
      console.log('[AUTOAI] Kedua layanan gagal memberikan jawaban')
      return true
    }

    await sleep(600)
    session.history.push(`User: ${cleanText || '[Mengirim gambar]'}`)
    session.history.push(`AlzRiss: ${finalReply}`)

    global.aiSessions[sid] = {
      history: session.history.slice(-8),
      lastTopic: cleanText || session.lastTopic || '[Gambar]',
      noteAuth: newNoteAuth,
      noteConvId: newNoteConvId,
      noteMsgId: newNoteMsgId,
      omegaSessionId: newOmegaSessionId
    }

    await conn.sendMessage(m.chat, { text: finalReply }, { quoted: m })

  } catch (e) {
    console.log('[AutoAI ERROR]', e?.stack || e?.message || e)
  }
  return true
}