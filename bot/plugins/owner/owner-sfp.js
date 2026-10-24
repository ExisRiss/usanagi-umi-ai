import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Root folder plugins
const PLUGINS_DIR = path.resolve(__dirname, '..')

function normalizePath(input) {
    return input
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\.?\//, '')
        .replace(/^plugins\//i, '')
}

function isInsidePlugins(target) {
    return (
        target === PLUGINS_DIR ||
        target.startsWith(PLUGINS_DIR + path.sep)
    )
}

// Scan semua file JS di plugins + subfolder
function findPlugin(filename) {
    let found = null

    function scan(folder) {
        if (found) return

        let entries

        try {
            entries = fs.readdirSync(folder, {
                withFileTypes: true
            })
        } catch {
            return
        }

        for (const entry of entries) {
            if (found) break

            const fullPath = path.join(folder, entry.name)

            if (entry.isDirectory()) {
                scan(fullPath)
                continue
            }

            if (
                entry.isFile() &&
                entry.name.toLowerCase() === filename.toLowerCase()
            ) {
                found = fullPath
            }
        }
    }

    scan(PLUGINS_DIR)

    return found
}

// Ambil kategori dari isi plugin
function detectCategory(code) {
    /*
     * Contoh:
     *
     * handler.tags = ['tools']
     * handler.tags = ['ai']
     * handler.tags = ['downloader']
     *
     * atau:
     * handler.tags = ['tools', 'owner']
     */

    const match = code.match(
        /handler\.tags\s*=\s*\[([\s\S]*?)\]/
    )

    if (!match) return null

    const content = match[1]

    const tags = [
        ...content.matchAll(
            /['"`]([^'"`]+)['"`]/g
        )
    ].map(v => v[1].trim())

    if (!tags.length) return null

    // Ambil tag pertama sebagai kategori utama
    const category = tags[0]

    // Bersihkan karakter aneh
    const clean = category
        .replace(/[<>:"|?*]/g, '')
        .replace(/\.\./g, '')
        .replace(/^[/\\]+|[/\\]+$/g, '')
        .trim()

    return clean || null
}

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        throw `uhm.. teksnya mana?

penggunaan:
${usedPrefix + command} <nama-plugin>

contoh:
${usedPrefix + command} test
${usedPrefix + command} tools/test
${usedPrefix + command} ai/autogpt`
    }

    if (!m.quoted?.text) {
        throw 'balas pesan nya!'
    }

    const code = m.quoted.text

    let pluginPath = normalizePath(text)

    // Pastikan ekstensi .js
    if (!pluginPath.toLowerCase().endsWith('.js')) {
        pluginPath += '.js'
    }

    /*
     * =========================================================
     * MODE 1
     * Input sudah memakai kategori
     *
     * contoh:
     * sfp tools/test
     * sfp ai/autogpt
     * =========================================================
     */

    const hasCategory = pluginPath.includes('/')

    let fullPath
    let mode

    if (hasCategory) {
        fullPath = path.resolve(
            PLUGINS_DIR,
            pluginPath
        )

        mode = 'manual'
    } else {
        /*
         * =====================================================
         * MODE 2
         * Input cuma nama plugin
         *
         * contoh:
         * sfp test
         *
         * Scan semua subfolder terlebih dahulu
         * =====================================================
         */

        const existing = findPlugin(pluginPath)

        if (existing) {
            fullPath = existing
            mode = 'existing'
        } else {
            /*
             * =================================================
             * Plugin belum ada.
             *
             * Deteksi kategori dari:
             *
             * handler.tags = ['tools']
             * handler.tags = ['ai']
             * =================================================
             */

            const category = detectCategory(code)

            if (category) {
                fullPath = path.resolve(
                    PLUGINS_DIR,
                    category,
                    pluginPath
                )

                mode = 'auto-category'
            } else {
                /*
                 * Tidak ada handler.tags
                 * Simpan langsung di plugins/
                 */
                fullPath = path.resolve(
                    PLUGINS_DIR,
                    pluginPath
                )

                mode = 'root'
            }
        }
    }

    /*
     * =========================================================
     * SECURITY CHECK
     * =========================================================
     */

    if (!isInsidePlugins(fullPath)) {
        throw 'path plugin tidak valid!'
    }

    /*
     * =========================================================
     * Pastikan hanya JS
     * =========================================================
     */

    if (!fullPath.toLowerCase().endsWith('.js')) {
        throw 'file plugin harus berekstensi .js!'
    }

    /*
     * =========================================================
     * Buat folder otomatis
     * =========================================================
     */

    const folder = path.dirname(fullPath)

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        })
    }

    /*
     * =========================================================
     * Simpan plugin
     * =========================================================
     */

    fs.writeFileSync(
        fullPath,
        code,
        'utf8'
    )

    /*
     * =========================================================
     * Path relatif
     * =========================================================
     */

    const relativePath = path
        .relative(
            path.resolve('.'),
            fullPath
        )
        .replace(/\\/g, '/')

    /*
     * =========================================================
     * Status
     * =========================================================
     */

    let status

    switch (mode) {
        case 'manual':
            status = '📂 Kategori manual'
            break

        case 'existing':
            status = '🔎 Plugin ditemukan otomatis'
            break

        case 'auto-category':
            status = '🤖 Kategori terdeteksi otomatis'
            break

        case 'root':
            status = '📁 Tidak ada kategori, masuk root'
            break

        default:
            status = '✅ Plugin tersimpan'
    }

    await m.reply(`╭─「 SFP 」─
│
│ ${status}
│
│ 📦 Plugin:
│ ${path.basename(fullPath)}
│
│ 📁 Path:
│ ${relativePath}
│
╰──────────────

✅ Plugin berhasil disimpan!`)
}

handler.help = ['sfp <text>']
handler.tags = ['owner']
handler.command = /^sfp$/i
handler.owner = true

export default handler