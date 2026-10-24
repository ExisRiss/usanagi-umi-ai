import { AIRich } from '../../lib/ui/MessageBuilder.js'

// Watermark Khusus Owner & Bot
const WATERMARK = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'

// ==========================================
// POOL 10 PET (LINK GAMBAR CUSTOM)
// ==========================================
const PET_POOL = [
    // COMMON (60%)
    { type: 'Kucing', rarity: 'Common ⚪', rate: 60, element: 'Beast', image: 'https://u.pone.rs/amekbfbt.jpg' },
    { type: 'Kelinci', rarity: 'Common ⚪', rate: 60, element: 'Beast', image: 'https://u.pone.rs/wmgmityn.jpg' },
    { type: 'Baby Bebek', rarity: 'Common ⚪', rate: 60, element: 'Water', image: 'https://u.pone.rs/olvkhaps.jpg' },
    
    // RARE (30%)
    { type: 'Fox', rarity: 'Rare 🔵', rate: 30, element: 'Beast', image: 'https://u.pone.rs/foodpflx.jpg' },
    { type: 'Baby Beruang', rarity: 'Rare 🔵', rate: 30, element: 'Earth', image: 'https://u.pone.rs/hcbpmfqm.jpg' },
    { type: 'Baby Panda', rarity: 'Rare 🔵', rate: 30, element: 'Earth', image: 'https://u.pone.rs/uhevftlr.jpg' },
    
    // MYTHIC (8%)
    { type: 'Baby Naga', rarity: 'Mythic 🟣', rate: 8, element: 'Fire', image: 'https://u.pone.rs/lysiuvhg.jpg' },
    { type: 'Baby Pegasus', rarity: 'Mythic 🟣', rate: 8, element: 'Wind', image: 'https://u.pone.rs/zbjixdho.jpg' },
    { type: 'Baby Unicorn', rarity: 'Mythic 🟣', rate: 8, element: 'Light', image: 'https://u.pone.rs/ilseihpm.jpg' },
    
    // LEGENDARY (2%)
    { type: 'Baby Rubah Ekor 9 Es', rarity: 'Legendary 🟡', rate: 2, element: 'Legendary Ice', image: 'https://u.pone.rs/taffqvvu.jpg' }
]

function rollGacha() {
    let rand = Math.random() * 100
    if (rand <= 2) return PET_POOL[9] 
    if (rand <= 10) return PET_POOL[Math.floor(Math.random() * 3) + 6] 
    if (rand <= 40) return PET_POOL[Math.floor(Math.random() * 3) + 3] 
    return PET_POOL[Math.floor(Math.random() * 3)] 
}

let handler = async (m, { conn, command }) => {
    let user = global.db.data.users[m.sender] || {}
    
    // Inisialisasi data gacha & reroll user
    if (user.rerollCount === undefined) user.rerollCount = 3
    if (!user.tempPet) user.tempPet = null

    const isGacha = command === 'gachapet' || command === 'petgacha'
    const isReroll = command === 'reroll'

    // ==========================================
    // LOGIKA 1: FITUR GACHA & REROLL (MAKS 3X)
    // ==========================================
    if (isGacha || isReroll) {

        // Cek sisa kuota reroll
        if (isReroll && user.rerollCount <= 0) {
            return m.reply('❌ Kesempatan reroll kamu sudah habis! Pet terakhir sudah tersimpan permanen.')
        }

        let petResult = rollGacha()

        // Kurangi kesempatan jika menggunakan perintah reroll
        if (isReroll) {
            user.rerollCount -= 1
        } else if (!user.pet && user.rerollCount === 3) {
            user.rerollCount -= 1
        }

        // Simpan sementara di memori tempPet
        user.tempPet = {
            name: petResult.type,
            type: petResult.type,
            rarity: petResult.rarity,
            element: petResult.element,
            level: 1,
            exp: 0,
            maxExp: 100,
            hunger: 100,
            energy: 100,
            happiness: 100,
            image: petResult.image
        }

        user.pet = user.tempPet

        let rich = new AIRich(conn)

        rich.addImage(petResult.image, { width: 1080, height: 600 })

        rich.addSection({
            view_model: {
                primitive: {
                    __typename: 'GenAICompactEntityPrimitive',
                    title: `🎉 GACHA RESULT!`,
                    subtitle: `Mendapatkan: ${petResult.type}`,
                    secondary_subtitle: `✨ ${petResult.rarity} • ${WATERMARK}`,
                    entity_id: 867051314767696,
                    entity_url: global.links?.channelUrl || '',
                    entity_type: 'PAGE',
                    action_type: 'FOLLOW',
                    is_verified: true,
                    image: { url: petResult.image, url_fallback: petResult.image }
                },
                __typename: 'GenAISingleLayoutViewModel'
            }
        })

        rich.addText(
`✨ *HASIL GACHA PET* ✨

🐾 *Tipe Pet* : ${petResult.type}
🌟 *Rarity*   : ${petResult.rarity}
❄️ *Elemen*   : ${petResult.element}

🔄 *Sisa Kesempatan Reroll*: ${user.rerollCount}/3

Ketik *.reroll* jika ingin mengacak ulang pet ini.
Ketik *.mypet* untuk mengonfirmasi dan melihat status pet!

───────────────
❄️ ${WATERMARK}`
        )

        return await rich.send(m.chat, { quoted: m })
    }

    // ==========================================
    // LOGIKA 2: TAMPILAN STATUS PET (.mypet)
    // ==========================================
    if (!user.pet) {
        return m.reply('Kamu belum memiliki pet! Ketik *.gachapet* untuk melakukan gacha.')
    }

    let petData = user.pet
    let rich = new AIRich(conn)
    const bar = (val) => '🟩'.repeat(Math.floor(val / 20)) + '⬜'.repeat(5 - Math.floor(val / 20))

    rich.addImage(petData.image, { width: 1080, height: 600 })

    rich.addSection({
        view_model: {
            primitive: {
                __typename: 'GenAICompactEntityPrimitive',
                title: `🐾 ${petData.name} (${petData.type})`,
                subtitle: `⭐ Level ${petData.level} • EXP: ${petData.exp}/${petData.maxExp}`,
                secondary_subtitle: `✨ ${petData.rarity} • ${WATERMARK}`,
                entity_id: 867051314767696,
                entity_url: global.links?.channelUrl || '',
                entity_type: 'PAGE',
                action_type: 'FOLLOW',
                is_verified: true,
                image: { url: petData.image, url_fallback: petData.image }
            },
            __typename: 'GenAISingleLayoutViewModel'
        }
    })

    rich.addText(
`╭─ VIRTUAL PET STATUS ────
│ 🍖 Kenyang     : ${bar(petData.hunger)} (${petData.hunger}%)
│ ⚡ Stamina     : ${bar(petData.energy)} (${petData.energy}%)
│ ❤️ Kebahagiaan : ${bar(petData.happiness)} (${petData.happiness}%)
╰─────────────────────────

╭─ PERINTAH INTERAKTIF ───
│ 🥩 .feed   • Beri makan pet
│ ⚽ .play   • Ajak pet bermain
│ 💤 .sleep  • Istirahatkan pet
│ 🧼 .wash   • Mandikan pet
╰─────────────────────────

───────────────
❄️ ${WATERMARK}`
    )

    await rich.send(m.chat, { quoted: m })
}

handler.help = ['mypet', 'petstatus', 'gachapet', 'reroll']
handler.tags = ['game']
handler.command = /^(mypet|petstatus|pet|gachapet|petgacha|reroll)$/i

export default handler