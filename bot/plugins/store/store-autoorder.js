/**
 * Store Auto-Order System
 * Fitur: Tambah produk digital dengan stok, user beli via saldo, auto-deliver
 * 
 * Commands:
 *   .addproduct <nama>|<harga>|<stok>|<deskripsi> - Tambah produk (owner)
 *   .addstock <nama>|<isi1>|<isi2>|...            - Tambah stok (owner)
 *   .delproduct <nama>                            - Hapus produk (owner)
 *   .produk / .product / .shop                    - Lihat katalog
 *   .buy <nama>                                   - Beli produk
 *   .orders / .riwayatorder                       - Riwayat order (owner)
 *   .cekorder <id>                                - Cek status order
 *   .restock <nama>|<jumlah>                      - Cek stok produk
 * 
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const DATA_DIR = path.join(process.cwd(), 'tmp', 'store-data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function loadJSON(file, fallback = {}) {
  ensureDir(DATA_DIR)
  try {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, JSON.stringify(fallback, null, 2)); return fallback }
    const raw = fs.readFileSync(file, 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch { return fallback }
}

function saveJSON(file, data) {
  ensureDir(DATA_DIR)
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, file)
}

function getProducts() { return loadJSON(PRODUCTS_FILE, {}) }
function getOrders() { return loadJSON(ORDERS_FILE, []) }
function saveProducts(p) { saveJSON(PRODUCTS_FILE, p) }
function saveOrders(o) { saveJSON(ORDERS_FILE, o) }

function fmtRp(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID')
}

function shortId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const cmd = command.toLowerCase()
  const products = getProducts()
  const orders = getOrders()
  const isOwner = global.owner?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || m.isOwner

  // === ADD PRODUCT (owner) ===
  if (cmd === 'addproduct' || cmd === 'addproduk') {
    if (!isOwner) return m.reply('❌ Khusus Owner.')
    if (!text) return m.reply(`Format: *${usedPrefix}addproduct nama|harga|stok|deskripsi*\nContoh:\n${usedPrefix}addproduct Netflix Premium|25000|10|Akun Netflix 1 bulan`)
    
    const parts = text.split('|').map(s => s.trim())
    if (parts.length < 3) return m.reply('❌ Format kurang! Minimal: nama|harga|stok')
    
    const [name, priceStr, stockStr, ...descParts] = parts
    const price = parseInt(priceStr)
    const stock = parseInt(stockStr)
    const desc = descParts.join('|') || 'Produk digital'
    
    if (!name || isNaN(price) || price < 0) return m.reply('❌ Nama/harga tidak valid.')
    if (isNaN(stock) || stock < 0) return m.reply('❌ Stok harus angka >= 0.')
    
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (products[key]) return m.reply(`❌ Produk "${name}" sudah ada. Gunakan .delproduct dulu.`)
    
    products[key] = {
      name,
      price,
      stock: 0,
      items: [], // actual items to deliver
      description: desc,
      totalSold: 0,
      createdAt: Date.now()
    }
    
    saveProducts(products)
    return m.reply(`✅ Produk *${name}* berhasil ditambahkan!\n💰 Harga: ${fmtRp(price)}\n📦 Stok: 0 (isi dengan .addstock)\n📝 ${desc}`)
  }

  // === ADD STOCK (owner) ===
  if (cmd === 'addstock' || cmd === 'isi') {
    if (!isOwner) return m.reply('❌ Khusus Owner.')
    if (!text) return m.reply(`Format: *${usedPrefix}addstock nama|item1|item2|...*\nContoh:\n${usedPrefix}addstock netflix-premium|user:pass1|user:pass2`)
    
    const pipeIdx = text.indexOf('|')
    if (pipeIdx < 0) return m.reply('❌ Format salah! Gunakan | sebagai pemisah.')
    
    const key = text.slice(0, pipeIdx).trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    const itemsRaw = text.slice(pipeIdx + 1)
    
    if (!products[key]) return m.reply(`❌ Produk "${key}" tidak ditemukan.`)
    
    const newItems = itemsRaw.split('|').map(s => s.trim()).filter(Boolean)
    if (!newItems.length) return m.reply('❌ Tidak ada item yang ditambahkan.')
    
    products[key].items.push(...newItems)
    products[key].stock = products[key].items.length
    saveProducts(products)
    
    return m.reply(`✅ Berhasil menambahkan ${newItems.length} item ke *${products[key].name}*\n📦 Total stok sekarang: ${products[key].stock}`)
  }

  // === DELETE PRODUCT (owner) ===
  if (cmd === 'delproduct' || cmd === 'delproduk') {
    if (!isOwner) return m.reply('❌ Khusus Owner.')
    if (!text) return m.reply(`Format: *${usedPrefix}delproduct <nama>*`)
    
    const key = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (!products[key]) return m.reply(`❌ Produk "${text}" tidak ditemukan.`)
    
    const name = products[key].name
    delete products[key]
    saveProducts(products)
    return m.reply(`🗑️ Produk *${name}* berhasil dihapus.`)
  }

  // === PRODUCT CATALOG ===
  if (cmd === 'produk' || cmd === 'product' || cmd === 'shop' || cmd === 'katalog' || cmd === 'catalog') {
    const keys = Object.keys(products)
    if (!keys.length) return m.reply('📦 Belum ada produk.\nOwner bisa tambah dengan .addproduct')
    
    let teks = '╔══ *KATALOG PRODUK* ══╗\n\n'
    for (const key of keys) {
      const p = products[key]
      const stockEmoji = p.stock > 0 ? '🟢' : '🔴'
      teks += `${stockEmoji} *${p.name}*\n`
      teks += `   💰 ${fmtRp(p.price)}\n`
      teks += `   📦 Stok: ${p.stock}\n`
      teks += `   📝 ${p.description}\n`
      teks += `   🔑 \`.buy ${key}\`\n\n`
    }
    teks += '╚═══════════════╝\n\n'
    teks += `💡 Ketik *.buy <nama>* untuk membeli\n💳 Pastikan saldo mencukupi!`
    
    return m.reply(teks)
  }

  // === BUY PRODUCT ===
  if (cmd === 'buy' || cmd === 'beli') {
    if (!text) return m.reply(`Format: *${usedPrefix}buy <nama-produk>*\nLihat produk: ${usedPrefix}produk`)
    
    const key = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (!products[key]) return m.reply(`❌ Produk "${text}" tidak ditemukan.\nGunakan .produk untuk lihat daftar.`)
    
    const product = products[key]
    if (product.stock <= 0) return m.reply(`❌ *${product.name}* stok habis!`)
    
    // Check user balance
    const user = global.db?.data?.users?.[m.sender]
    if (!user) return m.reply('❌ Data user tidak ditemukan.')
    
    const balance = user.balance || user.money || user.saldo || 0
    if (balance < product.price) {
      return m.reply(`❌ Saldo tidak cukup!\n💰 Saldo: ${fmtRp(balance)}\n🛒 Harga: ${fmtRp(product.price)}\n📉 Kurang: ${fmtRp(product.price - balance)}`)
    }
    
    // Deduct balance
    if (user.balance !== undefined) user.balance -= product.price
    else if (user.money !== undefined) user.money -= product.price
    else if (user.saldo !== undefined) user.saldo -= product.price
    
    // Take item from stock
    const item = product.items.shift()
    product.stock = product.items.length
    product.totalSold = (product.totalSold || 0) + 1
    
    // Create order record
    const orderId = `ORD-${shortId()}`
    const order = {
      id: orderId,
      product: product.name,
      productKey: key,
      buyer: m.sender,
      price: product.price,
      item,
      status: 'DELIVERED',
      createdAt: Date.now()
    }
    orders.push(order)
    
    saveProducts(products)
    saveOrders(orders)
    
    // Auto-deliver
    let deliverText = `╔══ *ORDER BERHASIL* ══╗\n\n`
    deliverText += `🆔 Order: *${orderId}*\n`
    deliverText += `🛒 Produk: *${product.name}*\n`
    deliverText += `💰 Harga: ${fmtRp(product.price)}\n\n`
    deliverText += `📦 *Detail Produk:*\n\`\`\`${item}\`\`\`\n\n`
    deliverText += `✅ Transaksi selesai!\n`
    deliverText += `⚠️ Simpan baik-baik, data tidak dikirim ulang.\n`
    deliverText += `╚═══════════════╝`
    
    await conn.reply(m.chat, deliverText, m)
    
    // Notify owner
    const ownerJid = global.owner?.[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (ownerJid && ownerJid !== m.sender) {
      try {
        await conn.reply(ownerJid, `📢 *Order Baru!*\n\n🆔 ${orderId}\n🛒 ${product.name}\n💰 ${fmtRp(product.price)}\n👤 ${m.sender.split('@')[0]}\n📦 Sisa stok: ${product.stock}`, m)
      } catch {}
    }
    
    return
  }

  // === ORDERS LIST (owner) ===
  if (cmd === 'orders' || cmd === 'riwayatorder' || cmd === 'orderlist') {
    if (!isOwner) return m.reply('❌ Khusus Owner.')
    
    const recent = orders.slice(-20).reverse()
    if (!recent.length) return m.reply('📋 Belum ada order.')
    
    let teks = '╔══ *RIWAYAT ORDER* ══╗\n\n'
    for (const o of recent) {
      const time = new Date(o.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      teks += `🆔 ${o.id}\n🛒 ${o.product} | 💰 ${fmtRp(o.price)}\n👤 ${o.buyer?.split('@')[0] || '?'}\n📅 ${time}\n\n`
    }
    teks += `📊 Total: ${orders.length} order\n╚═══════════════╝`
    
    return m.reply(teks)
  }

  // === CHECK ORDER ===
  if (cmd === 'cekorder' || cmd === 'checkorder') {
    if (!text) return m.reply(`Format: *${usedPrefix}cekorder <order-id>*`)
    
    const orderId = text.trim().toUpperCase()
    const order = orders.find(o => o.id === orderId || o.id === `ORD-${orderId}`)
    if (!order) return m.reply(`❌ Order "${text}" tidak ditemukan.`)
    
    // Only owner or buyer can check
    if (!isOwner && order.buyer !== m.sender) return m.reply('❌ Bukan order kamu.')
    
    let teks = `╔══ *DETAIL ORDER* ══╗\n\n`
    teks += `🆔 ${order.id}\n🛒 ${order.product}\n💰 ${fmtRp(order.price)}\n📊 ${order.status}\n📅 ${new Date(order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n`
    
    if (isOwner || order.buyer === m.sender) {
      teks += `\n📦 *Detail:*\n\`\`\`${order.item}\`\`\`\n`
    }
    
    teks += `╚═══════════════╝`
    return m.reply(teks)
  }

  // === RESTOCK INFO ===
  if (cmd === 'restock' || cmd === 'cekstok') {
    if (!text) {
      // Show all stock info (owner only)
      if (!isOwner) return m.reply('❌ Khusus Owner.')
      const keys = Object.keys(products)
      if (!keys.length) return m.reply('📦 Tidak ada produk.')
      
      let teks = '📦 *INFO STOK*\n\n'
      for (const key of keys) {
        const p = products[key]
        teks += `${p.stock > 0 ? '🟢' : '🔴'} *${p.name}*: ${p.stock} item | Terjual: ${p.totalSold || 0}\n`
      }
      return m.reply(teks)
    }
    
    const key = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (!products[key]) return m.reply(`❌ Produk "${text}" tidak ditemukan.`)
    const p = products[key]
    return m.reply(`📦 *${p.name}*\nStok: ${p.stock}\nTerjual: ${p.totalSold || 0}\nHarga: ${fmtRp(p.price)}`)
  }
}

handler.help = [
  'produk', 'buy <nama>', 'addproduct', 'addstock', 
  'delproduct', 'orders', 'cekorder', 'restock'
]
handler.tags = ['store']
handler.command = /^(addproduct|addproduk|addstock|isi|delproduct|delproduk|produk|product|shop|katalog|catalog|buy|beli|orders|riwayatorder|orderlist|cekorder|checkorder|restock|cekstok)$/i
handler.limit = false

export default handler