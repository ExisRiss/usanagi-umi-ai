import axios from 'axios'
import cheerio from 'cheerio'

const game = `╔══「 *Kata Bersambung* 」
╟ Game Kata Bersambung adalah
║ permainan yang dimana setiap
║ pemainnya diharuskan membuat
║ kata dari akhir kata yang
║ berasal dari kata sebelumnya.
╚═════`.trim()

const rules = `╔══「 *PERATURAN* 」
╟ Jawaban merupakan kata dasar
╟ Tidak mengandung spasi/imbuhan
╟ Kata terpakai tidak boleh diulang
╟ Setiap pemain diberi *3 Nyawa*
╟ Ketik *nyerah* untuk keluar
╚═════`.trim()

// Cache untuk mempercepat permainan dan mencegah spam ke server KBBI
const validWordCache = new Set()
const invalidWordCache = new Set()

// Konfigurasi Scraper
const CONFIG = {
    BASE_URL: 'https://kbbi.web.id',
    USER_AGENT: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
    TIMEOUT: 10000 // 10 Detik
}

let handler = async (m, { conn, text, usedPrefix, command, isROwner }) => {
    conn.skata = conn.skata || {}
    let id = m.chat
    let room = conn.skata[id]
    let isDebug = /debug/i.test(command) && isROwner

    if (!room) {
        conn.skata[id] = {
            id,
            player: isDebug
                ? [
                    conn.user.jid,
                    m.sender
                ]
                : [m.sender],
            status: 'wait',
            curr: '',
            kata: '',
            waktu: null,
            usedWords: [], // Menampung kata yang sudah dipakai
            lives: {}      // Menampung sisa nyawa per pemain
        }

        room = conn.skata[id]

        return conn.reply(
            m.chat,
            `${game}\n\n${rules}\n\n╔═〘 Daftar Player 〙\n${room.player.map((v, i) => `╟ ${i + 1}. @${v.split('@')[0]}`).join('\n')}\n╚════\n\nKetik:\n*${usedPrefix + command}* → join\n*${usedPrefix + command} start* → mulai`,
            m,
            { mentions: room.player }
        )
    }

    if (room.status === 'wait') {
        if (text === 'start') {
            if (!room.player.includes(m.sender)) throw 'Kamu belum join dalam permainan ini.'
            if (room.player.length < 2) throw 'Permainan membutuhkan minimal 2 player.'

            room.status = 'play'
            room.curr = room.player[0]
            room.kata = genKata()
            room.usedWords = [room.kata]
            
            // Berikan 3 nyawa ke setiap pemain
            room.player.forEach(p => room.lives[p] = 3)

            return mulaiGame(conn, m, room)
        }

        if (room.player.includes(m.sender)) throw 'Kamu sudah join.'

        room.player.push(m.sender)

        return conn.reply(
            m.chat,
            `╔═〘 Daftar Player 〙\n${room.player.map((v, i) => `╟ ${i + 1}. @${v.split('@')[0]}`).join('\n')}\n╚════\n\nKetik:\n*${usedPrefix + command}* → join\n*${usedPrefix + command} start* → mulai`,
            m,
            { mentions: room.player }
        )
    }
}

handler.before = async function (m) {
    let conn = this
    conn.skata = conn.skata || {}
    let room = conn.skata[m.chat]

    if (!room || room.status !== 'play' || m.isBaileys || !m.text || m.sender !== room.curr) return

    let jawab = m.text.toLowerCase().trim()

    // Cek jika pemain menyerah
    if (jawab === 'nyerah') {
        clearTimeout(room.waktu)
        let currIdx = room.player.indexOf(m.sender)
        room.player = room.player.filter(v => v !== m.sender)
        delete room.lives[m.sender]

        await conn.reply(m.chat, `@${m.sender.split('@')[0]} menyerah!`, m, { mentions: [m.sender] })

        if (room.player.length <= 1) {
            await conn.reply(m.chat, `🏆 @${room.player[0].split('@')[0]} memenangkan permainan!`, m, { mentions: room.player })
            delete conn.skata[m.chat]
            return true
        }

        room.curr = room.player[currIdx] || room.player[0]
        return mulaiGame(conn, m, room)
    }

    let awalan = filter(room.kata).toLowerCase()
    
    // Abaikan chat jika tidak sesuai dengan suku kata awal 
    // (Biar pemain masih bisa ngetik chat biasa)
    if (!jawab.startsWith(awalan)) return

    clearTimeout(room.waktu) // Hentikan timer karena jawaban sedang diproses

    // Cek apakah kata sudah pernah digunakan
    if (room.usedWords.includes(jawab)) {
        room.lives[m.sender] -= 1
        let isEliminated = room.lives[m.sender] <= 0
        
        if (isEliminated) {
            await conn.reply(m.chat, `💀 @${m.sender.split('@')[0]} tereliminasi! Kata *"${jawab}"* sudah dipakai dan nyawa habis.`, m, { mentions: [m.sender] })
            let currIdx = room.player.indexOf(m.sender)
            room.player = room.player.filter(v => v !== m.sender)
            delete room.lives[m.sender]
            
            if (room.player.length <= 1) {
                await conn.reply(m.chat, `🏆 @${room.player[0].split('@')[0]} menang!`, m, { mentions: room.player })
                delete conn.skata[m.chat]
                return true
            }
            room.curr = room.player[currIdx] || room.player[0]
        } else {
            await conn.reply(m.chat, `❌ Kata *"${jawab}"* sudah dipakai! Nyawa @${m.sender.split('@')[0]} sisa ${room.lives[m.sender]}.`, m, { mentions: [m.sender] })
            let currIdx = room.player.indexOf(m.sender)
            room.curr = room.player[(currIdx + 1) % room.player.length]
        }
        
        return mulaiGame(conn, m, room)
    }

    // Cek kata di Cache atau KBBI Scraper
    let isValid = false;

    if (invalidWordCache.has(jawab)) {
        isValid = false;
    } else if (validWordCache.has(jawab)) {
        isValid = true;
    } else {
        const kbbiCheck = await cekKbbi(jawab);
        if (kbbiCheck.success) {
            validWordCache.add(jawab);
            isValid = true;
        } else {
            invalidWordCache.add(jawab);
            isValid = false;
        }
    }

    // Jika kata salah (Tidak ada di KBBI)
    if (!isValid) {
        room.lives[m.sender] -= 1
        let isEliminated = room.lives[m.sender] <= 0
        
        if (isEliminated) {
            await conn.reply(m.chat, `💀 @${m.sender.split('@')[0]} tereliminasi! Kata *"${jawab}"* salah & nyawa habis.`, m, { mentions: [m.sender] })
            let currIdx = room.player.indexOf(m.sender)
            room.player = room.player.filter(v => v !== m.sender)
            delete room.lives[m.sender]
            
            if (room.player.length <= 1) {
                await conn.reply(m.chat, `🏆 @${room.player[0].split('@')[0]} menang!`, m, { mentions: room.player })
                delete conn.skata[m.chat]
                return true
            }
            room.curr = room.player[currIdx] || room.player[0]
        } else {
            await conn.reply(m.chat, `❌ Kata *"${jawab}"* tidak ada di KBBI! Nyawa @${m.sender.split('@')[0]} sisa ${room.lives[m.sender]}.`, m, { mentions: [m.sender] })
            let currIdx = room.player.indexOf(m.sender)
            room.curr = room.player[(currIdx + 1) % room.player.length]
        }
        
        return mulaiGame(conn, m, room)
    }

    // Jika kata valid & belum dipakai
    room.usedWords.push(jawab)
    let currIdx = room.player.indexOf(m.sender)
    room.curr = room.player[(currIdx + 1) % room.player.length]
    room.kata = jawab

    return mulaiGame(conn, m, room)
}

handler.help = ['sambungkata']
handler.tags = ['game']
handler.command = /^s(ambung)?kata$/i
handler.group = true

export default handler

// --- FUNGSI PENDUKUNG ---

async function mulaiGame(conn, m, room) {
    clearTimeout(room.waktu)

    let lanjut = filter(room.kata).toUpperCase()
    await conn.reply(
        room.id,
        `Giliran @${room.curr.split('@')[0]}\nNyawa: ❤️ ${room.lives[room.curr]}\n\nKata Sebelumnya:\n*${room.kata.toUpperCase()}*\n\nLanjut:\n*${lanjut}...*\n\nKetik *nyerah* untuk menyerah.`,
        m,
        { mentions: [room.curr] }
    )

    room.waktu = setTimeout(() => waktuHabis(conn, m, room), 45000)
}

async function waktuHabis(conn, m, room) {
    if (!room || room.status !== 'play') return;

    let currPlayer = room.curr
    room.lives[currPlayer] -= 1
    let isEliminated = room.lives[currPlayer] <= 0
    let currIdx = room.player.indexOf(currPlayer)

    if (isEliminated) {
        await conn.reply(room.id, `⏱️ Waktu habis! @${currPlayer.split('@')[0]} tereliminasi karena nyawa habis.`, m, { mentions: [currPlayer] })
        room.player = room.player.filter(v => v !== currPlayer)
        delete room.lives[currPlayer]

        if (room.player.length <= 1) {
            await conn.reply(room.id, `🏆 @${room.player[0].split('@')[0]} menang!`, m, { mentions: room.player })
            delete conn.skata[room.id]
            return
        }
        room.curr = room.player[currIdx] || room.player[0]
    } else {
        await conn.reply(room.id, `⏱️ Waktu habis! Nyawa @${currPlayer.split('@')[0]} berkurang, sisa ${room.lives[currPlayer]}.`, m, { mentions: [currPlayer] })
        room.curr = room.player[(currIdx + 1) % room.player.length]
    }

    mulaiGame(conn, m, room)
}

// Fungsi Scraper KBBI 
async function cekKbbi(word) {
    const keyword = word.trim().toLowerCase();
    try {
        const response = await axios.get(`${CONFIG.BASE_URL}/${keyword}/ajax_53mk5`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': CONFIG.USER_AGENT,
                'Referer': `${CONFIG.BASE_URL}/${keyword}`
            },
            timeout: CONFIG.TIMEOUT
        });
        
        const data = response.data;
        if (!data || !Array.isArray(data) || data.length === 0) {
            return await scrapeHTMLFallback(keyword);
        }
        return { success: true };
    } catch (error) {
        try {
            return await scrapeHTMLFallback(keyword);
        } catch (err) {
            return { success: false };
        }
    }
}

async function scrapeHTMLFallback(word) {
    const response = await axios.get(`${CONFIG.BASE_URL}/${word}`, {
        headers: { 'User-Agent': CONFIG.USER_AGENT },
        timeout: CONFIG.TIMEOUT
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    const mainDef = $('article .container .row .col-md-8 .body-content');
    
    if (mainDef.length) {
        const definition = mainDef.find('p').text().trim();
        if (definition && !definition.includes('Entri tidak ditemukan')) {
            return { success: true };
        }
    }
    
    const scriptMatch = html.match(/var\s+data\s*=\s*(\[[\s\S]*?\]);/);
    if (scriptMatch) {
        try {
            const data = JSON.parse(scriptMatch[1]);
            if (Array.isArray(data) && data.length > 0) return { success: true };
        } catch {}
    }
    throw new Error('Not found');
}

// Generator awal kata
function genKata() {
    const starterWords = [
        'buku', 'ayam', 'kucing', 'mobil', 'motor', 'sepeda', 'kapal', 'pesawat',
        'meja', 'kursi', 'gelas', 'piring', 'sendok', 'garpu', 'pisau', 'pintu',
        'jendela', 'atap', 'lantai', 'dinding', 'lampu', 'kipas', 'kasur', 'bantal',
        'guling', 'selimut', 'lemari', 'kertas', 'pensil', 'penghapus', 'penggaris',
        'sepatu', 'sandal', 'baju', 'celana', 'topi', 'jaket', 'kacamata', 'jam'
    ];
    return starterWords[Math.floor(Math.random() * starterWords.length)];
}

// Ekstrak suku kata (awalan untuk lawan)
function filter(text) {
    let mati = ['q', 'w', 'r', 't', 'y', 'p', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']
    let misah

    if (text.length < 3) return text

    if (/([qwrtypsdfghjklzxcvbnm][qwrtypsdfhjklzxcvbnm])$/.test(text)) {
        return /([qwrtypsdfhjklzxcvbnm])$/.exec(text)[0]
    }
    else if (/([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.test(text)) {
        return /([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.exec(text)[0]
    }
    else if (/([aiueo][aiueo]([qwrtypsdfghjklzxcvbnm]|ng)?)$/i.test(text)) {
        if (/(ng)$/i.test(text)) return text.substring(text.length - 3)
        else if (/([qwrtypsdfghjklzxcvbnm])$/i.test(text)) return text.substring(text.length - 2)
        else return text.substring(text.length - 1)
    }
    else if (/n[gy]([aiueo]([qwrtypsdfghjklzxcvbnm])?)$/.test(text)) {
        let nyenye = /n[gy]/i.exec(text)[0]
        misah = text.split(nyenye)
        return nyenye + misah[misah.length - 1]
    }
    else {
        let res = Array.from(text).filter(v => mati.includes(v))
        let result = res[res.length - 1]

        for (let huruf of mati) {
            if (text.endsWith(huruf)) {
                result = res[res.length - 2]
            }
        }
        misah = text.split(result)
        if (text.endsWith(result)) {
            return result + misah[misah.length - 2] + result
        }
        return result + misah[misah.length - 1]
    }
}