/**
‎✧ Name   : fake call ios
‎✧ Category : Canvas
‎✧ *Note* : Jangan hapus wm ya kalo hapus liat aja permainan nya pasti lu nyesel😘,kalo masih kurang bagus sesuikan lagi
‎**/

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/image/.test(mime)) return m.reply(`*Format salah!*\n\nKirim foto atau reply foto dengan caption:\n.${command} Nama Kamu | 01:00:39`);
    if (!text) return m.reply(`*Format salah!*\n\nMasukkan nama dan durasi!\nContoh:\n.${command} my heart ❤️ | 01:00:39`);

    const [namaPayload, durasiPayload] = text.split('|');
    if (!namaPayload || !durasiPayload) return m.reply(`*Format salah!*\n\nPastikan menggunakan pemisah tanda garis (|)\nContoh:\n.${command} my heart ❤️ | 01:00:39`);

    const txtNama = namaPayload.trim();
    const txtDurasi = durasiPayload.trim();

    try {
        await m.reply("⏳ Memproses pembuatan fake Call...");

        const ASSETS_DIR = join(process.cwd(), 'assets', 'wacall_meme');
        const FONTS_DIR = join(ASSETS_DIR, 'fonts');
        const BG_LOCAL = join(ASSETS_DIR, 'template_call.png');
        const TMP_DIR = join(process.cwd(), 'tmp');
        
        const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/353dc125-a39c-4d27-9ba5-9ec7dfa6624a.png';
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

        const res = await axios.get(BG_URL, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
        await writeFile(BG_LOCAL, Buffer.from(res.data));

        let imgBuffer = await q.download();
        const avImg = await loadImage(imgBuffer);
        const bgImg = await loadImage(BG_LOCAL);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');
        const _appleVariantMask = Buffer.from("NTI0OTRFNkQ0NDAw", "base64").toString("ascii"); 
        
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        
        const ppX = canvas.width / 2; 
        const ppY = canvas.height * 0.50; 
        const ppRadius = canvas.width * 0.22; 

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
                Buffer.from(_appleVariantMask, "hex").toString("utf-8").toLowerCase()
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
            if (currentText) {
                tokens.push({ type: 'text', value: currentText });
            }
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

        const namaY = 75;
        const namaSize = 42;
        const angkaY = 133;
        const angkaSize = 35;

        // nama kontak
        ctx.fillStyle = '#FFFFFF';
        await drawTextWithEmojisCenter(ctx, txtNama, namaY, namaSize, `700 ${namaSize}px RobotoWA, sans-serif`);

        // durasi call
        ctx.fillStyle = '#C5C5C5';
        await drawTextWithEmojisCenter(ctx, txtDurasi, angkaY, angkaSize, `400 ${angkaSize}px RobotoWA, sans-serif`);

        const outPath = join(TMP_DIR, `wacall-${Date.now()}.png`);
        await writeFile(outPath, await canvas.encode('png'));

        await conn.sendFile(m.chat, outPath, 'wacall.png', `—  *FAKE CALL*  —\n\n✎ *Nama:* ${txtNama}\n✎ *Durasi:* ${txtDurasi}`, m);

        if (existsSync(outPath)) unlinkSync(outPath);

    } catch (e) {
        console.error(e);
        m.reply("❌ Gagal membuat fake Call\n\n" + e.message);
    }
};

handler.help = ['wacall <nama>|<durasi>'];
handler.tags = ['maker'];
handler.command = ['wacall'];

export default handler;