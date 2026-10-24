/**
 * Konfigurasi PM2 untuk Usanagi Umi — jalur VPS biasa.
 *
 * Pakai:
 *   cd /opt/usanagi-umi
 *   pm2 start deploy/bot/ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * Untuk Pterodactyl, JANGAN pakai PM2 — panel sudah menangani proses.
 * Pakai start-pterodactyl.sh sebagai Startup Command egg.
 */
module.exports = {
  apps: [
    {
      name: 'usanagi-umi',
      script: 'main.js',
      cwd: '/opt/usanagi-umi/bot',

      // Bot ini menangani koneksi WhatsApp + ratusan plugin: jangan
      // biarkan PM2 memulai ulang terlalu cepat dalam loop.
      autorestart: true,
      max_restarts: 10,
      min_uptime: '60s',
      restart_delay: 5000,
      exp_backoff_restart_delay: 1000,

      // Mainkan batas memori sesuai RAM VPS. Bot + canvas/Jimp bisa
      // memakan 400-800 MB saat memproses gambar.
      max_memory_restart: '900M',

      // Satu instance saja: dua proses = dua sesi WhatsApp bentrok.
      instances: 1,
      exec_mode: 'fork',

      watch: false,
      time: true,
      merge_logs: true,
      out_file: '/var/log/usanagi-umi/out.log',
      error_file: '/var/log/usanagi-umi/error.log',
      pid_file: '/var/log/usanagi-umi/usanagi-umi.pid',

      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Makassar',
        // Isi nomor pairing di sini ATAU di bot/config.js.
        // PAIRING_NUMBER: '628xxxxxxxxxx',
        // FFMPEG_PATH: '/usr/bin/ffmpeg',
      },
    },
  ],
}
