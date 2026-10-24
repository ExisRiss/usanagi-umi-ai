/* By AlzRiss - Usanagi Umi AI
 *
 * Game HTML/Rich WhatsApp — diadaptasi dari paket game Rimuru MD
 * (sumber: Rimuru_MD_Latest_Update.zip, folder `plugins/rich`).
 * Kredit sumber dipertahankan di header tiap berkas dalam lib/rich-games/.
 *
 * Kenapa dipisah dari plugin game biasa:
 *   Game di sini dikirim sebagai pesan "AI Rich" (richResponseMessage) —
 *   WhatsApp merendernya sebagai halaman HTML interaktif, bukan teks/gambar.
 *   Nama perintahnya diberi awalan `html` supaya tidak bentrok dengan game
 *   chat lama (`.catur`, `.snake`, `.tetris`, dan seterusnya tetap seperti dulu).
 *
 * Daftar: .htmlgames
 * Pakai : .htmlflappy  .htmlsnake  .htmlpacman  ...
 */

import * as angryBirds from '../../lib/rich-games/angry_birds.js'
import * as balap from '../../lib/rich-games/balap.js'
import * as breakout from '../../lib/rich-games/breakout.js'
import * as catur from '../../lib/rich-games/catur.js'
import * as colorBlock from '../../lib/rich-games/color_block_puzzle.js'
import * as dino from '../../lib/rich-games/dino.js'
import * as flappy from '../../lib/rich-games/flappy.js'
import * as mahjong from '../../lib/rich-games/mahjong-shinobu.js'
import * as memoryMatch from '../../lib/rich-games/memory_match.js'
import * as mortalKombat from '../../lib/rich-games/mortal_kombat.js'
import * as nixel from '../../lib/rich-games/nixelgames.js'
import * as pacMan from '../../lib/rich-games/pac_man.js'
import * as pinz from '../../lib/rich-games/pinz.js'
import * as slot2 from '../../lib/rich-games/slot2.js'
import * as slotui from '../../lib/rich-games/slotui.js'
import * as snake from '../../lib/rich-games/snake.js'
import * as sonik from '../../lib/rich-games/sonik.js'
import * as speedyDash from '../../lib/rich-games/speedydash.js'
import * as stickman from '../../lib/rich-games/stickman.js'
import * as superMario from '../../lib/rich-games/supermario.js'
import * as tetris from '../../lib/rich-games/tetris.js'

/** Ambil config & handler dari modul game (bentuk ekspornya tidak seragam). */
function pick(module) {
  const config = module.config || module.gameConfig || module.default?.config || {}
  const handler = module.handler || module.default?.handler
  return { config, handler }
}

const REGISTRY = [
  ['angrybirds', 'Angry Birds', angryBirds, ['abirds']],
  ['balap', 'Vortex Blue (balap)', balap, ['racing', 'turborace']],
  ['breakout', 'Breakout', breakout, ['arrowbreakout']],
  ['catur', 'Catur (papan HTML)', catur, ['chess']],
  ['colorblock', 'Color Block Puzzle', colorBlock, ['cbp']],
  ['dino', 'Dino Run', dino, ['dinorun']],
  ['flappy', 'Flappy Bird', flappy, ['flappybird']],
  ['mahjong', 'Mahjong Shinobu', mahjong, ['mjong']],
  ['memory', 'Memory Match', memoryMatch, ['memorymatch', 'mmatch']],
  ['mortal', 'Mortal Kombat', mortalKombat, ['mortalkombat', 'mk']],
  ['minigames', 'Nixel Mini Games', nixel, ['nixel']],
  ['pacman', 'Pac-Man', pacMan, []],
  ['pinz', 'Pinz', pinz, []],
  ['slot2', 'Slot 2', slot2, ['slots2']],
  ['slotui', 'Slot Fruit Bonanza', slotui, ['fruitbonanza']],
  ['snake', 'Snake', snake, ['ular']],
  ['sonik', 'Sonic Dash', sonik, ['dash', 'speeddash']],
  ['speedydash', 'Speedy Dash', speedyDash, []],
  ['stickman', 'Stickman', stickman, ['stick']],
  ['mario', 'Super Mario', superMario, ['supermario']],
  ['tetris', 'Tetris', tetris, ['tetri']],
].map(([key, title, module, aliases]) => ({ key, title, aliases, ...pick(module) }))

const BY_KEY = new Map()
for (const game of REGISTRY) {
  BY_KEY.set(game.key, game)
  for (const alias of game.aliases) if (!BY_KEY.has(alias)) BY_KEY.set(alias, game)
}

const LIST = REGISTRY.map(g => `• \`html${g.key}\` — ${g.title}`).join('\n')

let handler = async (m, { conn, command, text: rawText, usedPrefix }) => {
  const cmd = String(command || '').toLowerCase()
  const text = String(rawText || '').trim()

  // Daftar game
  if (cmd === 'htmlgames' || cmd === 'htmlgame' || cmd === 'richgames') {
    return m.reply(
      `🕹️ *GAME HTML (AI RICH)*\n\n${LIST}\n\n` +
      `Pakai: \`${usedPrefix || '.'}htmlflappy\`\n` +
      `Game dikirim sebagai halaman HTML interaktif — butuh WhatsApp terbaru yang mendukung pesan AI Rich.`,
    )
  }

  let game = null
  if (cmd === 'html' || cmd === 'rich') {
    const key = text.split(/\s+/)[0].toLowerCase()
    game = BY_KEY.get(key) || null
    if (!game) return m.reply(`Game "${key || '-'}" tidak ada.\n\n${LIST}`)
  } else {
    const key = cmd.replace(/^(html|rich)/, '')
    game = BY_KEY.get(key) || null
  }
  if (!game) return m.reply(`Game tidak dikenali. Lihat \`.htmlgames\`.`)
  if (typeof game.handler !== 'function') {
    return m.reply(`❌ Game *${game.title}* gagal dimuat dari modul sumber.`)
  }

  // Framework ini mengirim socket lewat `conn`; modul sumber memakai `sock`.
  // Beberapa handler juga membaca `m.text` / `m.prefix`, jadi dilengkapi dulu.
  m.text = text
  m.prefix = usedPrefix || '.'

  if (!conn?.relayMessage) {
    return m.reply('❌ Perangkat ini tidak mendukung pesan HTML interaktif (relayMessage tidak tersedia).')
  }

  try {
    await game.handler(m, { sock: conn, conn, text, command: cmd })
  } catch (error) {
    return m.reply(`❌ *${game.title}* gagal dibuka: ${String(error?.message || error).slice(0, 200)}`)
  }
}

handler.help = ['htmlgames', 'html<game>', 'html <game>']
handler.tags = ['game']
handler.command = /^(htmlgames|htmlgame|richgames|html|rich|html[a-z0-9]+|rich[a-z0-9]+)$/i
handler.description = 'Game HTML interaktif (Rich Message) — 21 game'
handler.cooldown = 5

export default handler
