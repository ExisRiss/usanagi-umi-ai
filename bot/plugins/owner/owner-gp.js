import fs from 'fs'
import path from 'path'
import { AIRich } from '../../lib/ui/MessageBuilder.js'

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
  // EXACT PATH
  // gp info/main-menu
  // ==========================================

  const exact = plugins.find(plugin => {
    const relative = plugin.relative
      .replace(/\.js$/i, '')
      .toLowerCase()

    return relative === cleanTarget
  })

  if (exact) return exact

  // ==========================================
  // AUTO DETECT NAMA FILE
  // gp main-menu
  // ==========================================

  const sameName = plugins.filter(
    plugin =>
      plugin.nameLower === cleanTarget
  )

  if (!sameName.length) {
    return null
  }

  // Prioritaskan file yang langsung
  // berada di plugins/
  const rootPlugin = sameName.find(
    plugin =>
      !plugin.relative.includes('/')
  )

  if (rootPlugin) {
    return rootPlugin
  }

  return sameName[0]
}

let handler = async (
  m,
  {
    conn,
    isROwner,
    usedPrefix,
    command,
    text
  }
) => {
  if (!isROwner) return

  if (!text) {
    throw (
      `uhm.. where the text?\n\n` +
      `example:\n` +
      `${usedPrefix + command} main-menu\n\n` +
      `atau:\n` +
      `${usedPrefix + command} info/main-menu`
    )
  }

  await m.reply(global.wait)

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
    text
  )

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!plugin) {
    const allPlugins = getAllPlugins(
      pluginsRoot
    )

    const rich = new AIRich(conn)

    rich.addText(
      `❌ *PLUGIN NOT FOUND!*\n\n` +
      `🔎 Search: ${text}\n\n` +
      `📂 Plugin tersedia:`
    )

    rich.addCode(
      'text',
      allPlugins
        .map(v => v.relative)
        .join('\n')
    )

    return rich.send(
      m.chat,
      { quoted: m }
    )
  }

  // ==========================================
  // READ SOURCE
  // ==========================================

  let source

  try {
    source = fs.readFileSync(
      plugin.file,
      'utf8'
    )
  } catch (e) {
    return m.reply(
      `❌ Gagal membaca plugin:\n${e.message}`
    )
  }

  if (!source.trim()) {
    return m.reply(
      `⚠️ Plugin kosong!\n\n` +
      `📄 plugins/${plugin.relative}`
    )
  }

  // ==========================================
  // CATEGORY
  // ==========================================

  const category = plugin.relative.includes('/')
    ? plugin.relative.split('/')[0]
    : 'root'

  // ==========================================
  // AIRICH
  // ==========================================

  const rich = new AIRich(conn)

  rich.addText(
    `📦 *PLUGIN SOURCE*\n\n` +
    `📄 File : plugins/${plugin.relative}\n` +
    `📁 Category : ${category}\n` +
    `📦 Type : JavaScript (ESM)\n` +
    `🔎 Search : ${text}\n\n` +
    `Source code:`,
    {
      id: 'info'
    }
  )

  rich.addCode(
    'javascript',
    source.trim(),
    {
      insertAt: 'info',
      id: 'source'
    }
  )

  rich.addSuggest([
    'gp main-menu',
    'dfp main-menu'
  ])

  await rich.send(
    m.chat,
    { quoted: m }
  )
}

handler.help = [
  'getplugin <nama>',
  'gp <nama>'
]

handler.tags = ['owner']

handler.command = /^(getplugin|gp)$/i

handler.rowner = true

export default handler