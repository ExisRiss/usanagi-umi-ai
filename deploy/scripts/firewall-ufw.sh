#!/usr/bin/env bash
#
# Firewall untuk VPS yang menjalankan Usanagi Umi.
#
# Tujuan utama: port API internal Jadibot (0.0.0.0:2144 / 3854) TIDAK boleh
# bisa diakses langsung dari internet. Yang boleh terbuka hanya SSH, HTTP,
# dan HTTPS — sisanya lewat reverse proxy nginx.
#
# Jalankan sebagai root:  sudo bash deploy/scripts/firewall-ufw.sh
#
set -euo pipefail

SSH_PORT="${SSH_PORT:-22}"
API_PORT="${API_PORT:-3854}"     # 3854 = contoh di config.example.js, 2144 = default kode
API_PORT_ALT="${API_PORT_ALT:-2144}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Script ini harus dijalankan sebagai root (pakai sudo)." >&2
  exit 1
fi

if ! command -v ufw >/dev/null 2>&1; then
  echo "ufw belum terpasang. Pasang dulu:  apt-get update && apt-get install -y ufw"
  exit 1
fi

echo "==> Kebijakan dasar"
ufw --force default deny incoming
ufw --force default allow outgoing

echo "==> Mengizinkan SSH (${SSH_PORT}/tcp)"
ufw allow "${SSH_PORT}/tcp" comment 'SSH'

echo "==> Mengizinkan HTTP/HTTPS untuk reverse proxy & website"
ufw allow 80/tcp comment 'HTTP - certbot & redirect'
ufw allow 443/tcp comment 'HTTPS - reverse proxy bot API'

echo "==> Menolak akses langsung ke port API internal"
for port in "${API_PORT}" "${API_PORT_ALT}"; do
  ufw deny "${port}/tcp" comment "BLOCKED: API internal Jadibot, hanya via reverse proxy"
  echo "    port ${port} -> DENY dari publik"
done

echo "==> Mengaktifkan firewall"
ufw --force enable

echo
echo "==> Status akhir"
ufw status verbose

cat <<'NOTE'

Catatan penting:
  1. Port 2144/3854 masih listen di 0.0.0.0 di dalam server. Firewall hanya
     memblokir dari luar. Reverse proxy nginx-lah yang meneruskan permintaan
     yang sah (lihat deploy/nginx/umi-bot-api.conf).
  2. Uji dari luar:  nmap -Pn -p 3854 <IP_SERVER>   -> harus "filtered".
  3. Uji lewat proxy: curl -s https://api.domainmu.com/api/health  -> harus ok.
  4. Kalau bot berjalan di dalam container/Pterodactyl, atur firewall di host,
     bukan di dalam container.
NOTE
