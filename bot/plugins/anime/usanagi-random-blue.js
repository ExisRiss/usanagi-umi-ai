
import axios from 'axios';
import {
    react,
    sendImage,
    trimText,
    formatNumber
} from '../../lib/awang-anime.js';

const UA = 'Usanagi Umi AI (https://awangofc.my.id)';

const normalizeStudent = (item) => {
    if (!item || typeof item !== 'object') return null;
    const image = item.photoUrl || item.avatar_url || item.avatarUrl || item.image || item.imageUrl || item.photo || item.avatar;
    const name = item.name || item.characterName || item.nickname;
    if (!image || !name) return null;
    return {
        name,
        school: item.school || item['学院'] || item.affiliation || '-',
        club: item.club || item['社团'] || item.hobbies || '-',
        birthday: item.birthday || '-',
        damage: item.damageType || item.attack_type || item['攻击类型'] || '-',
        armor: item.armorType || item.defense_type || item['防御类型'] || '-',
        role: item.role || item.position || item.function || '-',
        weapon: item.weapon || item.weaponType || item['武器类型'] || '-',
        rarity: item.rarity || '-',
        image
    };
};

const pickRandom = (payload) => {
    if (Array.isArray(payload)) return payload[Math.floor(Math.random() * payload.length)];
    if (Array.isArray(payload?.data)) return payload.data[Math.floor(Math.random() * payload.data.length)];
    if (Array.isArray(payload?.characters)) return payload.characters[Math.floor(Math.random() * payload.characters.length)];
    if (payload && typeof payload === 'object') {
        const values = Object.values(payload).filter((item) => item && typeof item === 'object' && (item.photoUrl || item.avatar_url || item.avatarUrl || item.name));
        if (values.length) return values[Math.floor(Math.random() * values.length)];
    }
    return payload?.data || payload?.character || payload;
};

const sources = [
    async () => {
        const { data } = await axios.get('https://raw.githubusercontent.com/skybird0714/blue-archive-character/main/characters_en.json', {
            timeout: 14000,
            headers: { 'User-Agent': UA, Accept: 'application/json' }
        });
        return normalizeStudent(pickRandom(data));
    },
    async () => {
        const { data } = await axios.get('https://api-blue-archive.vercel.app/api/character/random', {
            timeout: 14000,
            headers: { 'User-Agent': UA, Accept: 'application/json' }
        });
        return normalizeStudent(pickRandom(data));
    },
    async () => {
        const { data } = await axios.get('https://api-blue-archive.vercel.app/api/characters?page=1&perPage=20', {
            timeout: 14000,
            headers: { 'User-Agent': UA, Accept: 'application/json' }
        });
        return normalizeStudent(pickRandom(data));
    }
];

const handler = async function (m, { conn } = {}) {
    m.conn = conn || m.conn;
    await react(m, '⏳');
    try {
        let item = null;
        for (const source of sources) {
            try {
                item = await source();
                if (item?.image && item?.name) break;
            } catch {}
        }
        if (!item) throw new Error('EMPTY');
        const caption = `╭─〔 BLUE ARCHIVE 〕
│ Name     : ${trimText(item.name, 58)}
│ School   : ${trimText(item.school, 42)}
│ Club     : ${trimText(item.club, 42)}
│ Birthday : ${trimText(item.birthday, 34)}
│ Damage   : ${trimText(item.damage, 30)}
│ Armor    : ${trimText(item.armor, 30)}
│ Role     : ${trimText(item.role, 30)}
│ Weapon   : ${trimText(item.weapon, 30)}
│ Rarity   : ${formatNumber(item.rarity)}
╰──────────────`;
        await sendImage(m, item.image, caption);
        await react(m, '✅');
    } catch {
        await react(m, '❌');
        await m.reply('Gambar Blue Archive belum tersedia saat ini. Coba lagi sebentar.');
    }
};

handler.command = /^(bluearchive|blue-archive|baimg)$/i;
handler.help = ['bluearchive'];
handler.tags = ['anime'];

export default handler
