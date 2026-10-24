import fs from 'fs'
import path from 'path'

function getAllPlugins(root) {
  const results = []

  function scan(folder) {
    let files

    try {
      files = fs.readdirSync(folder, {
        withFileTypes: true
      })
    } catch {
      return
    }

    for (const entry of files) {
      const fullPath = path.join(folder, entry.name)

      if (entry.isDirectory()) {
        scan(fullPath)
        continue
      }

      if (!entry.isFile()) continue
      if (!entry.name.endsWith('.js')) continue

      const relative = path
        .relative(root, fullPath)
        .split(path.sep)
        .join('/')

      results.push({
        file: fullPath,
        relative,
        name: entry.name.replace(/\.js$/i, ''),
        nameLower: entry.name
          .replace(/\.js$/i, '')
          .toLowerCase()
      })
    }
  }

  scan(root)

  return results
}

function findPlugin(root, target) {
  const plugins = getAllPlugins(root)

  const cleanTarget = target
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^\.\/+/, '')
    .replace(/\.js$/i, '')
    .toLowerCase()

  // ==========================================
  // 1. EXACT PATH
  // contoh: info/main-menu
  // ==========================================

  let found = plugins.find(plugin => {
    const relative = plugin.relative
      .replace(/\.js$/i, '')
      .toLowerCase()

    return relative === cleanTarget
  })

  if (found) return found

  // ==========================================
  // 2. NAMA FILE SAJA
  // contoh: main-menu
  // ==========================================

  const sameName = plugins.filter(
    plugin =>
      plugin.nameLower === cleanTarget
  )

  if (!sameName.length) {
    return null
  }

  // ==========================================
  // 3. PRIORITASKAN ROOT
  // ==========================================

  const rootPlugin = sameName.find(
    plugin =>
      !plugin.relative.includes('/')
  )

  if (rootPlugin) {
    return rootPlugin
  }

  // Kalau ada duplicate di subfolder,
  // ambil yang pertama ditemukan
  return sameName[0]
}

let handler = async (m, { usedPrefix, args }) => {
  const target = String(
    args?.[0] || ''
  )
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^\.\/+/, '')

  if (!target) {
    throw (
      `uhm.. where the text?\n\n` +
      `example:\n` +
      `${usedPrefix}dfp main-menu\n\n` +
      `atau:\n` +
      `${usedPrefix}dfp info/main-menu`
    )
  }

  const pluginsRoot = path.resolve(
    process.cwd(),
    'plugins'
  )

  if (!fs.existsSync(pluginsRoot)) {
    return m.reply(
      '❌ Folder plugins tidak ditemukan!'
    )
  }

  // ==========================================
  // AUTO DETECT
  // ==========================================

  const plugin = findPlugin(
    pluginsRoot,
    target
  )

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!plugin) {
    const allPlugins = getAllPlugins(
      pluginsRoot
    )

    return m.reply(
      `*🗃️ PLUGIN NOT FOUND!*\n` +
      `==================================\n\n` +
      `🔎 Search : ${target}\n\n` +
      `📂 Plugin tersedia:\n\n` +
      allPlugins
        .map(v => `• ${v.relative}`)
        .join('\n')
    )
  }

  // ==========================================
  // DELETE FILE
  // ==========================================

  try {
    fs.unlinkSync(plugin.file)

    // Hapus dari global.plugins kalau
    // loader masih menyimpan path tersebut
    const possibleKeys = [
      plugin.relative,
      plugin.relative.replace(/\\/g, '/'),
      plugin.relative.startsWith('./')
        ? plugin.relative
        : `./${plugin.relative}`
    ]

    for (const key of possibleKeys) {
      delete global.plugins[key]
    }

    await m.reply(
      `✅ *Berhasil menghapus plugin!*\n\n` +
      `📄 File : plugins/${plugin.relative}\n` +
      `📁 Path : ${plugin.relative}`
    )

  } catch (e) {
    throw `Gagal menghapus plugin: ${e.message}`
  }
}

handler.help = [
  'dfp <nama-plugin>'
]

handler.tags = ['owner']

handler.command = /^dfp$/i

handler.owner = true

export default handler