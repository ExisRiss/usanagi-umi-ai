/**
 * Penyusun menu ringkas.
 *
 * Repo ini punya >2 000 plugin, dan banyak di antaranya adalah variasi dari
 * fitur yang sama (`brat`, `brat2`, `bratvid`, `bratvid2`, …) atau salinan
 * fitur yang dipasang di dua folder (`fb` ada di `download/` dan
 * `downloader/`). Menampilkan semuanya sekaligus membuat menu tidak terbaca.
 *
 * Berkas ini berisi tiga hal:
 *  1. `FEATURE_GROUPS` — keluarga fitur yang ditampilkan sebagai SATU baris
 *     menu; isinya "opsi" (cara pakai berbeda) dengan deskripsi masing-masing.
 *  2. `HIDDEN_COMMANDS` — variasi yang tidak perlu tampil sama sekali. Tetap
 *     bisa dipakai kalau diketik langsung (tidak ada fitur yang dihapus).
 *  3. `HIDDEN_CATEGORIES` — folder yang isinya salinan/varian (mis. `umi-extra`
 *     dan `pelengkap` berisi ratusan plugin yang menduplikasi kategori lain).
 */

/** Kategori yang tidak ditampilkan di menu (fiturnya tetap bisa dipanggil). */
export const HIDDEN_CATEGORIES = new Set(['umi-extra', 'pelengkap', 'data', 'notif', '_system'])

/**
 * Variasi yang tidak ditampilkan di menu mana pun.
 * Bisa tetap dijalankan dengan mengetik perintahnya (bridge plugin mencari
 * lewat `findItem`, yang tidak memakai daftar ini).
 */
export const HIDDEN_COMMANDS = new Set([
  // variasi brat yang membingungkan — cukup satu keluarga di menu
  'brat2', 'bratvid2', 'bratanya', 'bratpick', 'usanagi',
  'bratgreen', 'bratgura', 'kannabrat', 'bratcewek', 'bratextra', 'bratwhite',
  // salinan fitur di folder pelengkap/umi-extra
  'stikerwa', 'stickerwa', 'wasearch', 'wassticker', 'stkrwa',
  'savecontact', 'getcontact', 'bckpcontact',
  // perintah uji coba / internal
  'tes', 'bot', 'test', 'ping', 'ok',
])

/**
 * Keluarga fitur. `commands` = opsi yang ditampilkan, urut dari yang paling
 * umum dipakai. `notes` = deskripsi singkat per opsi (tanpa ini, deskripsi
 * diambil dari `handler.description` plugin).
 */
export const FEATURE_GROUPS = [
  {
    id: 'brat',
    label: 'Stiker tulisan (brat)',
    icon: '🎨',
    category: 'sticker',
    description: 'Bikin stiker dari teks yang kamu tulis.',
    commands: ['brat', 'bratvid', 'cewekbrat'],
    notes: {
      brat: 'Stiker teks hitam-putih biasa',
      bratvid: 'Stiker teks versi bergerak (animasi pendek)',
      cewekbrat: 'Stiker teks dengan gaya karakter perempuan',
    },
  },
  {
    id: 'stiker',
    label: 'Stiker dari gambar',
    icon: '🖼️',
    category: 'sticker',
    description: 'Ubah gambar, GIF, atau video jadi stiker.',
    commands: ['stiker', 'stickergif', 'stickermeme', 'reaksi', 'swm', 'toimg', 'tovideo'],
    notes: {
      stiker: 'Kirim/reply gambar → jadi stiker',
      stickergif: 'GIF jadi stiker bergerak',
      stickermeme: 'Tambah teks gaya meme ke gambar',
      reaksi: 'Stiker reaksi siap pakai',
      swm: 'Ganti watermark stiker milik orang lain',
      toimg: 'Stiker → gambar (png/jpg)',
      tovideo: 'Stiker bergerak → video mp4',
    },
  },
  {
    id: 'stikerpack',
    label: 'Paket stiker',
    icon: '📦',
    category: 'sticker',
    description: 'Cari dan ambil stiker dari katalog/komunitas.',
    commands: ['stickerpack', 'stickerly', 'telestick', 'linesticker', 'stikwiki', 'stickersearch'],
    notes: {
      stickerpack: 'Cari paket stiker dari kata kunci',
      stickerly: 'Ambil paket dari Stickerly (Link: stly)',
      telestick: 'Ambil paket stiker dari Telegram',
      linesticker: 'Ambil paket stiker dari LINE',
      stikwiki: 'Cari stiker di Sticker Wiki',
      stickersearch: 'Cari stiker dari nama',
    },
  },
  {
    id: 'unduh',
    label: 'Unduh video & audio',
    icon: '⬇️',
    category: 'downloader',
    description: 'Simpan video/lagu dari tautan. Kirim perintahnya lalu tempel link.',
    commands: ['fb', 'ig', 'tiktok', 'threadsdl', 'twitter', 'douyin', 'bilibili', 'ytmp4', 'ytmp3', 'ttmp3', 'igmp3', 'spotify', 'soundcloud', 'aio', 'mediafire', 'gdrive'],
    notes: {
      fb: 'Facebook (video/reel)',
      ig: 'Instagram (foto, video, reels)',
      tiktok: 'TikTok tanpa watermark',
      threadsdl: 'Threads',
      twitter: 'Twitter/X',
      douyin: 'Douyin (TikTok China)',
      bilibili: 'Bilibili',
      ytmp4: 'YouTube video (mp4)',
      ytmp3: 'YouTube audio (mp3)',
      ttmp3: 'TikTok audio (mp3)',
      igmp3: 'Instagram audio (mp3)',
      spotify: 'Spotify (lagu)',
      soundcloud: 'SoundCloud',
      aio: 'Serba bisa: tempel link apa saja',
      mediafire: 'MediaFire',
      gdrive: 'Google Drive',
    },
  },
  {
    id: 'musik',
    label: 'Musik & lagu',
    icon: '🎵',
    category: 'music',
    description: 'Cari, putar, atau kirim lagu.',
    commands: ['play', 'spotify', 'playncs', 'ringtone', 'yts', 'play2'],
    notes: {
      play: 'Cari lagu dari judul lalu kirim audio',
      spotify: 'Cari & kirim lagu dari Spotify (bisa juga /spotifysearch)',
      playncs: 'Musik NCS bebas royalti',
      ringtone: 'Nada dering',
      yts: 'Cari video YouTube (tanpa unduh)',
      play2: 'Pemutar cadangan kalau yang utama gagal',
    },
  },
  {
    id: 'aichat',
    label: 'AI tanya-jawab',
    icon: '🤖',
    category: 'ai',
    description: 'Model AI untuk menjawab pertanyaan atau menulis.',
    commands: ['ai', 'gemini', 'grok', 'deepseek', 'copilotthink', 'gita', 'jeeves'],
    notes: {
      ai: 'Asisten utama (default)',
      gemini: 'Google Gemini',
      grok: 'xAI Grok',
      deepseek: 'DeepSeek',
      copilotthink: 'GitHub Copilot (mode berpikir)',
      gita: 'Gita (bahasa Indonesia santai)',
      jeeves: 'Jeeves',
    },
  },
  {
    id: 'aigambar',
    label: 'AI gambar',
    icon: '🎨',
    category: 'ai',
    description: 'Bikin atau ubah gambar dengan AI.',
    commands: ['aiimg', 'flux', 'createimg', 'ghibli', 'upscale', 'remini', 'toprompt'],
    notes: {
      aiimg: 'Bikin gambar dari deskripsi teks',
      flux: 'FLUX (detail tinggi)',
      createimg: 'Generator gambar serbaguna',
      ghibli: 'Gaya studio Ghibli',
      upscale: 'Perbesar & pertajam gambar',
      remini: 'Perbaiki foto lama/blur',
      toprompt: 'Gambar → prompt teks',
    },
  },
  {
    id: 'fakechat',
    label: 'Pesan / layar palsu',
    icon: '💬',
    category: 'maker',
    description: 'Bikin tangkapan layar percakapan atau notifikasi palsu (untuk konten).',
    commands: ['qc', 'iqc', 'wacall', 'wq', 'ttqc', 'fakegc', 'faketele', 'faketweet', 'igstory', 'fakeml', 'fakestory'],
    notes: {
      qc: 'Kutipan chat WhatsApp',
      iqc: 'Kutipan chat iPhone',
      wacall: 'Panggilan WhatsApp palsu',
      wq: 'Kutipan chat WhatsApp (gaya lain)',
      ttqc: 'Kutipan komentar TikTok',
      fakegc: 'Tangkapan layar grup palsu',
      faketele: 'Chat Telegram palsu',
      faketweet: 'Tweet palsu',
      igstory: 'Story Instagram palsu',
      fakeml: 'Chat Mobile Legends palsu',
      fakestory: 'Story palsu (serbaguna)',
    },
  },
  {
    id: 'logo',
    label: 'Logo & teks keren',
    icon: '✨',
    category: 'maker',
    description: 'Bikin logo/poster dari teks.',
    commands: ['textlogo', 'logo3d', 'logoglow', 'logogold', 'logometal', 'sertifikatcinta', 'quotephoto', 'cinematic'],
    notes: {
      textlogo: 'Logo dari teks (banyak efek)',
      logo3d: 'Logo 3D',
      logoglow: 'Logo efek cahaya',
      logogold: 'Logo emas',
      logometal: 'Logo metal',
      sertifikatcinta: 'Sertifikat pasangan',
      quotephoto: 'Kuote di atas foto',
      cinematic: 'Poster sinematik',
    },
  },
  {
    id: 'anime',
    label: 'Anime & komik',
    icon: '🌸',
    category: 'anime',
    description: 'Streaming, jadwal, dan gambar anime.',
    commands: ['otakudesu', 'bacakomik', 'ongoing', 'animeinfo', 'animequotes', 'animerandom', 'animeimage'],
    notes: {
      otakudesu: 'Streaming & unduh anime subtitle Indonesia',
      bacakomik: 'Baca komik',
      ongoing: 'Anime yang sedang tayang',
      animeinfo: 'Info detail satu anime',
      animequotes: 'Kuote anime acak',
      animerandom: 'Rekomendasi anime acak',
      animeimage: 'Gambar anime acak',
    },
  },
]

/** Nama opsi yang enak dibaca: `logoglow` → `logo glow`. */
export function prettyCommand(command) {
  return String(command || '').replace(/_/g, ' ')
}
