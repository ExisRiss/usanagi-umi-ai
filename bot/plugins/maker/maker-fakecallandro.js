/**
‎✧ Name   : fake call andro
 * By AlzRiss - Usanagi Umi AI
‎✧ Category : Canvas
‎✧ *Note* : Jangan hapus wm ya kalo hapus liat aja permainan nya pasti lu nyesel😘,kalo masih kurang bagus sesuikan lagi
‎**/


import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

let handler = async (m, { conn, text, command, prefix }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/.test(mime)) return m.reply(`*Format salah!*\n\nSilahkan reply/balas foto yang mau dijadikan Foto Profil dengan caption:\n.${command} Sayangku | 01:32:04`);

    if (!text) return m.reply(`*Format salah!*\n\nMasukkan teks nama dan durasi!\nContoh:\n.${command} Sayangku | 01:32:04`);

    const [namaPayload, durasiPayload] = text.split('|');
    if (!namaPayload || !durasiPayload) return m.reply(`*Format salah!*\n\nPastikan menggunakan pemisah tanda garis (|)\nContoh:\n.${command} Sayangku | 01:32:04`);

    const txtNama = namaPayload.trim();
    const txtDurasi = durasiPayload.trim();

    try {
        await m.reply("⏳ Memproses Fake Call...");

        const ASSETS_DIR = join(process.cwd(), 'assets', 'wacall_meme');
        const FONTS_DIR = join(ASSETS_DIR, 'fonts');
        const BG_LOCAL = join(ASSETS_DIR, 'template_call_new.png');
        const TMP_DIR = join(process.cwd(), 'tmp');

        const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/3b1a98bd-2ebd-4035-a645-f42556300408.png';
        const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json';
        const APPLE_EMOJI_JSON_LOCAL = join(FONTS_DIR, 'emoji-apple-image.json');

        await mkdir(FONTS_DIR, { recursive: true });
        await mkdir(TMP_DIR, { recursive: true });

        const fontConfigs = [
            { url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2', name: 'Roboto-Bold.ttf', family: 'RobotoWA' },
            { url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2', name: 'Roboto-Regular.ttf', family: 'RobotoWA' }
        ];

        for (const f of fontConfigs) {
            const fPath = join(FONTS_DIR, f.name);
            if (!existsSync(fPath)) {
                const fRes = await axios.get(f.url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
                await writeFile(fPath, Buffer.from(fRes.data));
            }
            GlobalFonts.registerFromPath(fPath, f.family);
        }

        if (!existsSync(APPLE_EMOJI_JSON_LOCAL)) {
            const eRes = await axios.get(APPLE_EMOJI_JSON_URL, { responseType: 'arraybuffer' });
            await writeFile(APPLE_EMOJI_JSON_LOCAL, Buffer.from(eRes.data));
        }
        const appleEmojiMap = JSON.parse(readFileSync(APPLE_EMOJI_JSON_LOCAL, 'utf-8'));
        const emojiCache = new Map();

        if (!existsSync(BG_LOCAL)) {
            const res = await axios.get(BG_URL, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
            await writeFile(BG_LOCAL, Buffer.from(res.data));
        }

        // Dowld poto
        const ppBuffer = await q.download();
        const avImg = await loadImage(ppBuffer);
        const bgImg = await loadImage(BG_LOCAL);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const ppX = canvas.width / 2;
        const ppY = 728;
        const ppRadius = 220;

        const namaY = 75;
        const namaSize = 42;

        const durasiY = 130;
        const durasiSize = 30;

        // buat pepeh
        ctx.save();
        ctx.beginPath();
        ctx.arc(ppX, ppY, ppRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avImg, ppX - ppRadius, ppY - ppRadius, ppRadius * 2, ppRadius * 2);
        ctx.restore();

        const EMOJI_DETECTOR = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;

        function emojiToUnicode(emoji) {
            return [...emoji].map(c => c.codePointAt(0).toString(16).padStart(4, '0')).join('-');
        }

        async function getEmojiImage(emoji) {
            if (emojiCache.has(emoji)) return emojiCache.get(emoji);
            const base = emojiToUnicode(emoji);
            const variants = [
                base,
                base.replace(/-fe0f/gi, ''),
                `${base.replace(/-fe0f/gi, '')}-fe0f`,
                base.toUpperCase(),
                base.replace(/-fe0f/gi, '').toUpperCase(),
                base.replace(/-fe0f/gi, '').toUpperCase() + '-FE0F',
            ];
            let b64 = null;
            for (const v of variants) {
                if (appleEmojiMap[v]) { b64 = appleEmojiMap[v]; break; }
            }
            if (!b64) return null;
            const img = await loadImage(Buffer.from(b64, 'base64'));
            emojiCache.set(emoji, img);
            return img;
        }

        function parseTextAndEmojis(textStr) {
            const tokens = [];
            const chars = [...textStr];
            let currentText = "";

            for (let i = 0; i < chars.length; i++) {
                if (EMOJI_DETECTOR.test(chars[i])) {
                    if (currentText) {
                        tokens.push({ type: 'text', value: currentText });
                        currentText = "";
                    }
                    let emojiVal = chars[i];
                    if (chars[i + 1] === '\uFE0F') {
                        emojiVal += chars[i + 1];
                        i++;
                    }
                    tokens.push({ type: 'emoji', value: emojiVal });
                } else {
                    currentText += chars[i];
                }
            }
            if (currentText) tokens.push({ type: 'text', value: currentText });
            return tokens;
        }

        function measureTextCustom(context, tokens, fontSize) {
            let totalWidth = 0;
            for (const token of tokens) {
                if (token.type === 'emoji') {
                    totalWidth += fontSize * 1.05;
                } else {
                    totalWidth += context.measureText(token.value).width;
                }
            }
            return totalWidth;
        }

        async function drawTextWithEmojisCenter(context, textStr, yPos, fontSize, fontString) {
            context.font = fontString;
            context.textBaseline = 'top';

            const tokens = parseTextAndEmojis(textStr);
            const totalWidth = measureTextCustom(context, tokens, fontSize);
            let currentX = (canvas.width / 2) - (totalWidth / 2);

            for (const token of tokens) {
                if (token.type === 'emoji') {
                    const emojiSize = fontSize * 1.05;
                    const img = await getEmojiImage(token.value);
                    if (img) {
                        context.drawImage(img, currentX, yPos + (fontSize - emojiSize) / 2, emojiSize, emojiSize);
                    } else {
                        context.fillText(token.value, currentX, yPos);
                    }
                    currentX += emojiSize;
                } else {
                    context.fillText(token.value, currentX, yPos);
                    currentX += context.measureText(token.value).width;
                }
            }
        }

        ctx.fillStyle = '#FFFFFF';
        await drawTextWithEmojisCenter(ctx, txtNama, namaY, namaSize, `700 ${namaSize}px RobotoWA, sans-serif`);

        ctx.fillStyle = '#AEBAC1';
        await drawTextWithEmojisCenter(ctx, txtDurasi, durasiY, durasiSize, `400 ${durasiSize}px RobotoWA, sans-serif`);

        const outPath = join(TMP_DIR, `wacall-${Date.now()}.png`);
        await writeFile(outPath, await canvas.encode('png'));

        await conn.sendFile(m.chat, outPath, 'fakecall.png', `— *FAKE CALL* —\n\n✎ *Nama:* ${txtNama}\n✎ *Durasi:* ${txtDurasi}`, m);

        if (existsSync(outPath)) unlinkSync(outPath);

    } catch (e) {
        console.error(e);
        m.reply("❌ Gagal membuat canvas fakecall\n\n" + e.message);
    }
};

handler.help = ['fakecall2 <nama>|<durasi>'];
handler.tags = ['maker'];
handler.command = ['fakecall2', 'fakecal'];

export default handler;