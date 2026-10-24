/**
 * YTMP3 & YTMP4 Downloader (ymcdn scraper)
 * Type : Plugins ESM
 * YTMP4 : Auto Compress + WhatsApp Compatible
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function extractVideoId(url) {
    if (!url) return null;
    let match = null;
    
    if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/')) {
        match = /\/([a-zA-Z0-9\-_]{11})/.exec(url);
    } else if (url.includes('youtube.com')) {
        match = /v=([a-zA-Z0-9\-_]{11})/.exec(url);
    } else {
        match = /[a-zA-Z0-9\-_]{11}/.exec(url);
    }
    
    return match ? match[1] : null;
}

/**
 * Scrape YTMP3/YTMP4
 */
async function scrapeYtmp3(youtubeUrl, format = 'mp3') {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
        throw new Error('Invalid YouTube URL: Could not extract video ID.');
    }
    
    const lowerFormat = format.toLowerCase();
    if (lowerFormat !== 'mp3' && lowerFormat !== 'mp4') {
        throw new Error('Invalid format: Must be either "mp3" or "mp4".');
    }
    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://id.ytmp3.mobi',
        'Referer': 'https://id.ytmp3.mobi/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
    };

    try {
        // ==============================
        // 1. INIT SESSION
        // ==============================
        const initUrl = `https://a.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`;
        const initRes = await fetch(initUrl, { headers });
        
        if (!initRes.ok) {
            throw new Error(`Init request failed with status code ${initRes.status}`);
        }
        
        const initJson = await initRes.json();
        if (initJson.error > 0) {
            throw new Error(`Init API returned error: ${initJson.error}`);
        }

        // ==============================
        // 2. REQUEST CONVERSION
        // ==============================
        let convertUrl = initJson.convertURL;
        let convertRequestUrl = `${convertUrl}&v=${videoId}&f=${lowerFormat}&_=${Math.random()}`;
        let convertJson;
        
        while (true) {
            const convertRes = await fetch(convertRequestUrl, { headers });
            if (!convertRes.ok) {
                throw new Error(`Convert request failed with status code ${convertRes.status}`);
            }
            
            convertJson = await convertRes.json();
            if (convertJson.error > 0) {
                throw new Error(`Convert API returned error: ${convertJson.error}`);
            }
            
            if (convertJson.redirect > 0 && convertJson.redirectURL) {
                convertRequestUrl = `${convertJson.redirectURL}&v=${videoId}&f=${lowerFormat}&_=${Math.random()}`;
                continue;
            }
            break;
        }

        const progressUrl = convertJson.progressURL;
        const downloadUrl = convertJson.downloadURL;
        let title = convertJson.title || 'YouTube';

        if (!progressUrl) {
            throw new Error('API conversion response is missing progress URL.');
        }
        if (!downloadUrl) {
            throw new Error('API conversion response is missing download URL.');
        }

        // ==============================
        // 3. POLLING PROGRESS
        // ==============================
        let progress = 0;
        let pollCount = 0;
        const maxPolls = 60;
        
        while (progress < 3 && pollCount < maxPolls) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            pollCount++;
            
            const progressRes = await fetch(progressUrl, { headers });
            if (!progressRes.ok) {
                throw new Error(`Progress request failed with status code ${progressRes.status}`);
            }
            
            const progressJson = await progressRes.json();
            if (progressJson.error > 0) {
                throw new Error(`Progress API returned error: ${progressJson.error}`);
            }
            
            progress = progressJson.progress;
            if (progressJson.title) {
                title = progressJson.title;
            }
        }

        if (progress < 3) {
            throw new Error('Conversion process timed out (exceeded 60 seconds).');
        }

        return {
            status: 'success',
            videoId,
            title,
            format: lowerFormat,
            downloadUrl
        };
    } catch (error) {
        return {
            status: 'error',
            message: error?.message || String(error)
        };
    }
}

/**
 * Clean filename
 */
function cleanName(name = 'file') {
    return String(name)
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 150);
}

/**
 * Download URL -> Buffer
 */
async function downloadBuffer(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://id.ytmp3.mobi/'
        }
    });
    
    if (!res.ok) {
        throw new Error(`Gagal mengunduh file, status: ${res.status}`);
    }
    
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Cek FFmpeg
 */
function checkFFmpeg() {
    return new Promise(resolve => {
        const ffmpeg = spawn('ffmpeg', ['-version']);
        ffmpeg.on('error', () => {
            resolve(false);
        });
        ffmpeg.on('close', code => {
            resolve(code === 0);
        });
    });
}

/**
 * Compress MP4
 *
 * Output:
 * - H.264
 * - AAC
 * - yuv420p
 * - faststart
 * - max 720p
 * - bitrate ringan
 */
function compressMP4(inputBuffer) {
    return new Promise((resolve, reject) => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usanagi-ytmp4-'));
        const inputPath = path.join(tempDir, 'input.mp4');
        const outputPath = path.join(tempDir, 'output.mp4');

        try {
            fs.writeFileSync(inputPath, inputBuffer);
            const args = [
                '-y', 
                '-i', inputPath, 
                // Video: Max 720p, tetap mempertahankan rasio
                '-c:v', 'libx264', 
                '-vf', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease:force_divisible_by=2', 
                // Quality / bitrate
                '-preset', 'veryfast', 
                '-crf', '28', 
                // Audio
                '-c:a', 'aac', 
                '-b:a', '96k', 
                // Compatibility
                '-pix_fmt', 'yuv420p', 
                // Streaming / WhatsApp
                '-movflags', '+faststart', 
                // Remove metadata
                '-map_metadata', '-1', 
                outputPath
            ];

            const ffmpeg = spawn('ffmpeg', args);
            let stderr = '';

            ffmpeg.stderr.on('data', data => {
                stderr += data.toString();
            });

            ffmpeg.on('error', error => {
                cleanup();
                reject(new Error(`FFmpeg gagal dijalankan: ${error.message}`));
            });

            ffmpeg.on('close', code => {
                if (code !== 0) {
                    cleanup();
                    reject(new Error(`FFmpeg gagal mengompres video (code ${code})`));
                    return;
                }
                try {
                    if (!fs.existsSync(outputPath)) {
                        cleanup();
                        reject(new Error('File hasil kompresi tidak ditemukan.'));
                        return;
                    }
                    const result = fs.readFileSync(outputPath);
                    cleanup();
                    resolve(result);
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            });

            function cleanup() {
                try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
                try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
                try { fs.rmdirSync(tempDir); } catch {}
            }
        } catch (error) {
            try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
            try { fs.rmdirSync(tempDir); } catch {}
            reject(error);
        }
    });
}

/**
 * Main Handler
 */
let handler = async (m, { conn, text, command }) => {
    if (!text) {
        return m.reply(
            `Masukkan URL YouTube!\n\n` + 
            `Contoh:\n` + 
            `.${command} https://youtu.be/xxxx`
        );
    }
    
    await m.reply('_✨ otw..._');

    try {
        // ==============================
        // FORMAT
        // ==============================
        const isVideo = /^(ytv|ytmp4)$/i.test(command);
        const format = isVideo ? 'mp4' : 'mp3';

        // ==============================
        // SCRAPE
        // ==============================
        const res = await scrapeYtmp3(text.trim(), format);
        if (res.status === 'error') {
            throw new Error(res.message);
        }
        
        const { title, downloadUrl } = res;
        const safeTitle = cleanName(title || 'YouTube');

        // ==============================
        // DOWNLOAD
        // ==============================
        const mediaBuffer = await downloadBuffer(downloadUrl);

        // ==============================
        // MP4
        // ==============================
        if (format === 'mp4') {
            let finalBuffer = mediaBuffer;
            
            // Cek FFmpeg
            const hasFFmpeg = await checkFFmpeg();
            if (!hasFFmpeg) {
                throw new Error('FFmpeg tidak ditemukan di server.');
            }

            // ==============================
            // COMPRESS MP4
            // ==============================
            try {
                finalBuffer = await compressMP4(mediaBuffer);
            } catch (compressError) {
                console.error('[YTMP4 COMPRESS]', compressError);
                throw new Error('Gagal mengompres video: ' + (compressError?.message || compressError));
            }

            // ==============================
            // SEND VIDEO
            // ==============================
            await conn.sendMessage(
                m.chat, 
                { 
                    video: finalBuffer, 
                    mimetype: 'video/mp4', 
                    fileName: `${safeTitle}.mp4`, 
                    caption: `🎬 *${title}*\n\n` + `❀ USANAGI UMI AI ❀` 
                }, 
                { quoted: m }
            );
            return;
        }

        // ==============================
        // MP3
        // ==============================
        await conn.sendMessage(
            m.chat, 
            { 
                audio: mediaBuffer, 
                mimetype: 'audio/mpeg', 
                fileName: `${safeTitle}.mp3` 
            }, 
            { quoted: m }
        );

    } catch (e) {
        console.error('[YTMP3/YTMP4]', e);
        return m.reply('❌ Gagal: ' + (e?.message || e));
    }
}

handler.help = ['yta', 'ytmp3', 'ytv', 'ytmp4'];
handler.tags = ['downloader'];
handler.command = /^(yta|ytmp3|ytv|ytmp4)$/i;
handler.limit = true;

export default handler;