import fs from 'fs'
import path from 'path'

const handler = async (m, { text }) => {
  if (!text) {
    throw 'Masukin keyword\nContoh: .grepplugin conn.'
  }

  const dir = path.resolve('./plugins')
  const keyword = text.trim()
  const results = []

  function scan(folder) {
    let files

    try {
      files = fs.readdirSync(folder, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of files) {
      const fullPath = path.join(folder, entry.name)

      // Scan semua subfolder
      if (entry.isDirectory()) {
        scan(fullPath)
        continue
      }

      // Hanya file JavaScript
      if (!entry.isFile() || !entry.name.endsWith('.js')) {
        continue
      }

      let data

      try {
        data = fs.readFileSync(fullPath, 'utf8')
      } catch {
        continue
      }

      const lines = data.split(/\r?\n/)

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          // Path dibuat relatif dari folder plugins
          const relativePath = path.relative(dir, fullPath)

          results.push({
            file: relativePath,
            line: index + 1,
            text: line.trim()
          })
        }
      })
    }
  }

  if (!fs.existsSync(dir)) {
    return m.reply('❌ Folder plugins tidak ditemukan.')
  }

  scan(dir)

  if (!results.length) {
    return m.reply(`❌ Tidak ditemukan keyword: ${keyword}`)
  }

  let res = `📦 *Hasil Grep Plugin*\n`
  res += `🔎 Keyword: *${keyword}*\n`
  res += `📁 Folder: *plugins/*\n`
  res += `📊 Ditemukan: *${results.length} baris*\n\n`

  results.forEach((item, index) => {
    res += `${index + 1}. 📄 *plugins/${item.file}*\n`
    res += `   └─ Baris ${item.line}\n`
  })

  await m.reply(res)
}

handler.help = ['grepplugin <keyword>']
handler.tags = ['tools']
handler.command = /^grepplugin$/i
handler.owner = true
handler.limit = false

export default handler