/**
 * Rich Game Hub - Interactive game menu carousel
 * Menu game interaktif dengan carousel cards
 * 
 * Commands:
 *   .gamehub / .games / .richgame - Tampilkan menu game interaktif
 *   .playgame <nama>              - Mainkan game dari hub
 * 
 * By AlzRiss - Usanagi Umi AI (clean-room build)
 */

import { proto, generateWAMessageFromContent, prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'
import fs from 'node:fs'
import path from 'node:path'

const GAME_LIST = [
  { key: 'empire', cmd: 'empire', title: '🎩 Property Empire', desc: 'Bangun kota, beli petak, jadi raja properti! (multiplayer)', emoji: '🎩' },
  { key: 'uno', cmd: 'uno', title: '🃏 UNO Web', desc: 'Main UNO bareng teman lewat browser', emoji: '🃏' },
  { key: 'snake', cmd: 'ular', title: '🐍 Ular Rimba', desc: 'Classic snake game dengan kontrol D-pad', emoji: '🐍' },
  { key: 'tetris', cmd: 'tetris', title: '🧩 Tetris', desc: 'Block puzzle legend, geser & jatuhkan!', emoji: '🧩' },
  { key: 'chess', cmd: 'chess', title: '♟️ Catur', desc: 'Mini chess melawan AI', emoji: '♟️' },
  { key: 'flappy', cmd: 'flapfy', title: '🐦 Flappy Bird', desc: 'Terbang melewati rintangan!', emoji: '🐦' },
  { key: 'tictactoe', cmd: 'tictactoe', title: '❌ Tic Tac Toe', desc: 'Main bersama teman atau bot', emoji: '❌' },
  { key: 'minesweeper', cmd: 'minesweeper', title: '💣 Minesweeper', desc: 'Hindari ranjau, buka semua kotak!', emoji: '💣' },
  { key: 'caklontong', cmd: 'caklontong', title: '🎯 Cak Lontong', desc: 'Tebak jawaban kocak!', emoji: '🎯' },
  { key: 'family100', cmd: 'family100', title: '👨‍👩‍👧‍👦 Family 100', desc: 'Tebak jawaban terpopuler!', emoji: '👨‍👩‍👧‍👦' },
  { key: 'tebaklagu', cmd: 'tebaklagu', title: '🎵 Tebak Lagu', desc: 'Dengarkan & tebak lagu!', emoji: '🎵' },
  { key: 'tebakgambar', cmd: 'tebakgambar', title: '🖼️ Tebak Gambar', desc: 'Tebak dari gambar!', emoji: '🖼️' },
  { key: 'siapakahaku', cmd: 'siapakahaku', title: '🤔 Siapakah Aku', desc: 'Tebak siapa dari petunjuk!', emoji: '🤔' },
  { key: 'susunkata', cmd: 'susunkata', title: '📝 Susun Kata', desc: 'Susun huruf jadi kata!', emoji: '📝' },
  { key: 'suit', cmd: 'suit', title: '✊ Suit Jepang', desc: 'Batu Gunting Kertas!', emoji: '✊' },
  { key: 'slot', cmd: 'slot', title: '🎰 Slot Machine', desc: 'Jackpot atau zonk!', emoji: '🎰' },
  { key: 'math', cmd: 'math', title: '🔢 Math Battle', desc: 'Hitung cepat, adu otak!', emoji: '🔢' },
  { key: 'tebakbendera', cmd: 'tebakbendera', title: '🏳️ Tebak Bendera', desc: 'Kenali bendera negara!', emoji: '🏳️' },
  { key: 'tebakkimia', cmd: 'tebakkimia', title: '⚗️ Tebak Kimia', desc: 'Tebak simbol unsur!', emoji: '⚗️' },
  { key: 'tebakkata', cmd: 'tebakkata', title: '📖 Tebak Kata', desc: 'Tebak kata dari definisi!', emoji: '📖' },
  { key: 'tebaklirik', cmd: 'tebaklirik', title: '🎤 Tebak Lirik', desc: 'Lanjutkan lirik lagu!', emoji: '🎤' },
]

function getGameEmoji(index) {
  const emojis = ['🎮', '🕹️', '🎲', '🏆', '⭐']
  return emojis[index % emojis.length]
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const cmd = command.toLowerCase()
  
  if (cmd === 'playgame' || cmd === 'maingame') {
    if (!text) {
      const list = GAME_LIST.map(g => `• *${usedPrefix}${g.cmd}* - ${g.title}`).join('\n')
      return m.reply(`🎮 *Pilih Game:*\n\n${list}\n\nKetik command game untuk mulai!`)
    }
    const game = GAME_LIST.find(g => g.key === text.trim().toLowerCase() || g.cmd === text.trim().toLowerCase())
    if (!game) return m.reply(`❌ Game "${text}" tidak ditemukan. Ketik .gamehub untuk lihat daftar.`)
    return m.reply(`🎮 Mainkan: *${game.title}*\nKetik: *${usedPrefix}${game.cmd}*`)
  }

  // Build carousel cards
  const cards = []
  const batchSize = 5 // WhatsApp max carousel cards
  
  for (let i = 0; i < Math.min(GAME_LIST.length, 10); i += batchSize) {
    const batch = GAME_LIST.slice(i, i + batchSize)
    
    for (const game of batch) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `${game.desc}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: `Ketik .${game.cmd} untuk main`
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: game.title,
          hasMediaAttachment: false
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: `▶️ Main ${game.emoji}`,
              sections: [{
                title: 'Mulai Game',
                rows: [{
                  header: game.title,
                  title: `Mainkan ${game.title}`,
                  description: game.desc,
                  id: `${usedPrefix}${game.cmd}`
                }]
              }]
            })
          }]
        })
      })
    }
  }

  if (!cards.length) return m.reply('❌ Tidak ada game tersedia.')

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `🎮 *USANAGI GAME HUB*\n\nGeser kartu untuk pilih game favoritmu!\nTersedia ${GAME_LIST.length} game seru 🕹️`
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: '🎮 Usanagi Umi AI Games'
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards
          })
        })
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['gamehub', 'games', 'richgame', 'playgame <nama>']
handler.tags = ['game']
handler.command = /^(gamehub|games|richgame|playgame|maingame)$/i
handler.limit = false

export default handler