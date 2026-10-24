import { exec } from 'child_process';
import { promisify } from 'util';
import { unlinkSync, existsSync, statSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, '../../tmp');
try {
  mkdirSync(tmpDir, { recursive: true });
  console.log(`Directory TMP dipastikan: ${tmpDir}`);
} catch (error) {
  console.error('Kesalahan saat membuat directory tmp:', error);
}

const execAsync = promisify(exec);

class Success {
  constructor(data) {
    this.success = true;
    this.data = data;
  }
}

class ErrorResponse {
  constructor(error) {
    this.success = false;
    this.error = error;
  }
}

const convertToMp4WithFfmpeg = async (inputPath, outputPath) => {
  try {
    console.log(`Converting ${inputPath} to ${outputPath} using FFmpeg...`);
    
    const convertCommand = `ffmpeg -i "${inputPath}" -c:v libx264 -c:a aac -movflags +faststart -y "${outputPath}"`;
    
    await execAsync(convertCommand, { timeout: 600000 });
    
    if (existsSync(outputPath)) {
      console.log(`Conversion successful: ${outputPath}`);
      return outputPath;
    } else {
      throw new Error('FFmpeg conversion failed');
    }
  } catch (error) {
    console.error('FFmpeg conversion error:', error);
    throw new Error(`FFmpeg conversion failed: ${error.message}`);
  }
};

const detectPlatform = (url) => {
  const platforms = {
    'tiktok': ['tiktok.com', 'vm.tiktok', 'vt.tiktok'],
    'youtube': ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
    'instagram': ['instagram.com', 'instagr.am', 'ig.me'],
    'twitter': ['twitter.com', 'x.com', 't.co'],
    'facebook': ['facebook.com', 'fb.com', 'fb.watch'],
    'pinterest': ['pinterest.com', 'pin.it'],
    'likee': ['likee.video', 'likee.com'],
    'dailymotion': ['dailymotion.com', 'dai.ly'],
    'reddit': ['reddit.com', 'v.redd.it'],
    'linkedin': ['linkedin.com'],
    'twitch': ['twitch.tv', 'clips.twitch.tv'],
    'vimeo': ['vimeo.com'],
    'soundcloud': ['soundcloud.com'],
    'tumblr': ['tumblr.com'],
    'bilibili': ['bilibili.com', 'b23.tv'],
    'douyin': ['douyin.com'],
    'kuaishou': ['kuaishou.com'],
    'threads': ['threads.net'],
    'snapchat': ['snapchat.com'],
    'whatsapp': ['whatsapp.com']
  };

  for (const [platform, domains] of Object.entries(platforms)) {
    if (domains.some(domain => url.includes(domain))) {
      return platform;
    }
  }
  return 'unknown';
};

const qualitySupportedPlatforms = ['youtube', 'dailymotion', 'vimeo', 'bilibili'];
const universalUserAgent = '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" --add-header "Accept-Language:en-US,en;q=0.9"';

const getPlatformSpecificOptions = (platform, url) => {
  const options = {
    'tiktok': `${universalUserAgent} --referer "https://www.tiktok.com/"`,
    'instagram': `${universalUserAgent} --cookies-from-browser chrome --add-header "Referer: https://www.instagram.com/"`,
    'twitter': `${universalUserAgent} --add-header "Referer: https://twitter.com/"`,
    'facebook': `${universalUserAgent} --add-header "Referer: https://www.facebook.com/"`,
    'reddit': `${universalUserAgent} --add-header "Referer: https://www.reddit.com/"`,
    'youtube': `${universalUserAgent}`,
    'default': universalUserAgent
  };

  return options[platform] || options['default'];
};

export const ytdl = async (url, quality = null) => {
  let tempFilePath = null;
  let finalFilePath = null;
  
  try {
    if (!url || !url.startsWith('http')) {
      return new ErrorResponse({
        message: "URL tidak valid!"
      });
    }

    const platform = detectPlatform(url);
    const platformOptions = getPlatformSpecificOptions(platform, url);
    if (quality) {
      const validQuality = ["144", "240", "360", "480", "720", "1080", "1440", "2160", "best"];
      
      if (!validQuality.includes(quality)) {
        return new ErrorResponse({
          message: "Quality tidak valid! Gunakan: " + validQuality.join(", ")
        });
      }

      if (!qualitySupportedPlatforms.includes(platform)) {
        console.log(`Platform ${platform} tidak mendukung quality selection, menggunakan best quality`);
        quality = "best";
      }
    } else {
      quality = "best"; 
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const tempFileName = `temp_${timestamp}_${randomStr}`;
    const outputFileName = `download_${timestamp}_${randomStr}.mp4`;
    
    tempFilePath = path.join(tmpDir, tempFileName);
    finalFilePath = path.join(tmpDir, outputFileName);

    let downloadCommand;

    console.log(`Detected platform: ${platform}`);
    console.log(`Using quality: ${quality}`);

    if (qualitySupportedPlatforms.includes(platform) && quality !== "best") {
      downloadCommand = `yt-dlp -f "best[height<=${quality}]" --merge-output-format mp4 ${platformOptions} -o "${tempFilePath}.%(ext)s" "${url}" --no-warnings --quiet --ignore-errors --no-check-certificate`;
    } else {
      downloadCommand = `yt-dlp -f "best" --merge-output-format mp4 ${platformOptions} -o "${tempFilePath}.%(ext)s" "${url}" --no-warnings --quiet --ignore-errors --no-check-certificate`;
    }

    console.log(`Downloading from: ${url} (Platform: ${platform})`);
    console.log(`Command: ${downloadCommand}`);

    try {
      await execAsync(downloadCommand, { timeout: 300000 });
    } catch (dlError) {
      console.log('First attempt failed, trying alternative...');
      const fallbackCommand = `yt-dlp -f "best" ${platformOptions} -o "${tempFilePath}.%(ext)s" "${url}" --no-warnings`;
      await execAsync(fallbackCommand, { timeout: 300000 });
    }

    // Temukan file yang diunduh
    const possibleExtensions = ['mp4', 'mkv', 'webm', 'flv', 'avi', 'mov'];
    let downloadedFile = null;
    
    for (const ext of possibleExtensions) {
      const filePath = `${tempFilePath}.${ext}`;
      if (existsSync(filePath)) {
        downloadedFile = filePath;
        console.log(`Found downloaded file: ${downloadedFile}`);
        break;
      }
    }

    if (!downloadedFile) {
      return new ErrorResponse({
        message: "File tidak berhasil didownload. Mungkin link tidak valid atau butuh login."
      });
    }

    if (path.extname(downloadedFile).toLowerCase() !== '.mp4') {
      console.log(`Converting ${downloadedFile} to MP4...`);
      await convertToMp4WithFfmpeg(downloadedFile, finalFilePath);
      
      // Bersihkan file asli
      try {
        unlinkSync(downloadedFile);
      } catch (cleanupError) {
        console.error('Error cleaning up original file:', cleanupError);
      }
    } else {
      finalFilePath = downloadedFile;
    }

    if (!existsSync(finalFilePath)) {
      return new ErrorResponse({
        message: "Gagal memproses file setelah download."
      });
    }

    // Dapatkan info berkas
    const fileStats = statSync(finalFilePath);
    const fileSizeBytes = fileStats.size;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    // Dapatkan judul video
    let videoTitle = `Video_${timestamp}`;
    try {
      const titleCommand = `yt-dlp --get-title "${url}" --no-warnings`;
      const { stdout } = await execAsync(titleCommand, { timeout: 30000 });
      videoTitle = stdout.trim() || videoTitle;
      videoTitle = videoTitle.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
    } catch (infoError) {
      console.log('Could not get video title');
    }

    console.log(`Download completed: ${videoTitle} (${fileSizeMB.toFixed(2)}MB)`);

    const metadata = {
      title: videoTitle,
      downloadUrl: finalFilePath,
      quality: quality,
      type: "mp4",
      size: formatBytes(fileSizeBytes),
      tempFile: true,
      fileSizeBytes: fileSizeBytes,
      fileSizeMB: fileSizeMB,
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      supportsQuality: qualitySupportedPlatforms.includes(platform)
    };
    
    return new Success(metadata);
    
  } catch (error) {
    console.error('Download error:', error);
    if (tempFilePath) {
      const filesToClean = [
        tempFilePath,
        finalFilePath,
        ...['mp4', 'mkv', 'webm', 'flv', 'avi', 'mov'].map(ext => `${tempFilePath}.${ext}`)
      ];
      
      for (const file of filesToClean) {
        if (file && existsSync(file)) {
          try {
            unlinkSync(file);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        }
      }
    }
    
    if (error.message.includes('command not found')) {
      if (error.message.includes('yt-dlp')) {
        return new ErrorResponse({
          message: "yt-dlp belum terinstall. Jalankan: pip install yt-dlp"
        });
      } else if (error.message.includes('ffmpeg')) {
        return new ErrorResponse({
          message: "FFmpeg belum terinstall. Download dari ffmpeg.org"
        });
      }
    }
    
    if (error.message.includes('Video not available')) {
      return new ErrorResponse({
        message: "Video tidak tersedia atau dihapus. Coba link yang lain."
      });
    }
    
    return new ErrorResponse({
      message: error.message || "Terjadi kesalahan saat download"
    });
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes";
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const cleanupFile = (filePath) => {
  if (filePath && existsSync(filePath)) {
    try {
      unlinkSync(filePath);
      console.log(`✅ Berhasil menghapus file: ${filePath}`);
    } catch (cleanupError) {
      console.error('❌ Gagal menghapus file:', cleanupError);
    }
  }
};

export async function handler(m, { text, conn }) {
    if (!text) return m.reply(`🎬 *YouTube DL Plus - Multi Platform Downloader*

📌 *Cara Penggunaan:*
.ytdlp <url> [quality]

*Contoh untuk platform yang support quality:*
.ytdlp https://youtube.com/watch?v=abc 720
.ytdlp https://vimeo.com/12345 1080

*Contoh untuk platform lain:*
.ytdlp https://tiktok.com/video/123
.ytdlp https://instagram.com/p/abc123

*Quality:* 144, 240, 360, 480, 720, 1080, 1440, 2160, best
*Platform support quality:* YouTube, Vimeo, Dailymotion, Bilibili

*📱 Platform yang Didukung:*
• TikTok, YouTube, Instagram, Twitter/X
• Facebook, Pinterest, Likee, DailyMotion
• Reddit, LinkedIn, Twitch, Vimeo
• Bilibili, Douyin, Kuaishou, Threads
• Snapchat dan 1000+ situs lainnya

*💡 Tips:* 
- Gunakan 'best' untuk kualitas terbaik
- File besar (>50MB) akan dikirim sebagai dokumen
- File otomatis terhapus setelah dikirim`);

    const args = text.split(" ");
    const url = args[0];
    let quality = args[1]?.replace(/p$/, '') || null;
    
    if (!url.startsWith("http")) {
        return m.reply("❌ *URL tidak valid!* Pastikan URL dimulai dengan http:// atau https://");
    }

    if (quality) {
      const validQualities = ["144", "240", "360", "480", "720", "1080", "1440", "2160", "best"];
      if (!validQualities.includes(quality)) {
        return m.reply(`❌ *Quality tidak valid!*\nGunakan: ${validQualities.join(", ")}`);
      }
    }
    
    let tempFilePath = null;
    
    try {
        const platform = detectPlatform(url);
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

        let statusMessage = `⏳ *Mendownload dari ${platformName}...*\n`;
        
        if (quality && qualitySupportedPlatforms.includes(platform)) {
          statusMessage += `*Quality: ${quality}*\n`;
        } else if (quality) {
          statusMessage += `*Quality: best* (${platformName} tidak support quality selection)\n`;
        } else {
          statusMessage += `*Quality: best*\n`;
        }
        
        statusMessage += `*Tunggu sebentar...*`;
        
        m.reply(statusMessage);
        
        const result = await ytdl(url, quality);
        
        if (!result.success) {
          let errorMessage = `❌ *Gagal download video*`;
          console.log(result.error.message)
          if (result.error.message.includes('Video tidak tersedia')) {
            errorMessage += '\n\n💡 *Tips:* Coba gunakan link yang berbeda atau pastikan video masih tersedia.';
          } else if (result.error.message.includes('yt-dlp belum terinstall')) {
            errorMessage += '\n\n💡 *Tips:* Install yt-dlp dengan: `pip install yt-dlp`';
          }
          
          return m.reply(errorMessage);
        }
        
        const { title, downloadUrl, size, fileSizeMB, platform: detectedPlatform, supportsQuality, quality: actualQuality } = result.data;
        tempFilePath = downloadUrl;
        
        let qualityInfo = actualQuality;
        if (!supportsQuality) {
          qualityInfo = `${actualQuality} (auto)`;
        }
        
        const caption = `
🎬 *${detectedPlatform} Video*
📝 *Judul:* ${title}
📊 *Quality:* ${qualityInfo}
📦 *Size:* ${size}
`.trim();

        if (fileSizeMB > 50) {
            m.reply(`📄 *File besar (${fileSizeMB.toFixed(1)}MB), mengirim sebagai dokumen...*`);
            
            await conn.sendMessage(m.chat, {
                document: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                caption
             }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl, mimetype: 'video/mp4' },
                caption,
                mentions: [m.sender]
            }, { quoted: m });
        }
    } catch (err) {
        console.error(err);
        m.reply("❌ *Error saat download. Coba lagi atau gunakan link yang berbeda.*");
    } finally {
        if (tempFilePath && existsSync(tempFilePath)) {
            setTimeout(() => {
                cleanupFile(tempFilePath);
            }, 5000); 
        }
    }
}

handler.command = /^(ytdlp)$/i;
handler.help = ["ytdlp <url> [quality]"];
handler.tags = ["downloader"];
handler.limit = true;
handler.premium = false;

export default handler;