#!/usr/bin/env bash
#
# Update aman untuk Usanagi Umi di VPS.
#
# Alur: backup dulu -> tarik kode -> pasang dependency -> tes -> restart.
# Kalau tes gagal, script berhenti SEBELUM restart, jadi bot yang sedang
# jalan tidak terganggu oleh kode yang rusak.
#
# Pakai:  sudo bash deploy/bot/update.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/usanagi-umi}"
BRANCH="${BRANCH:-main}"
SERVICE_KIND="${SERVICE_KIND:-pm2}"     # pm2 | systemd
SERVICE_NAME="${SERVICE_NAME:-usanagi-umi}"

cd "${APP_DIR}"

echo "==> 1/5 Backup state sebelum update"
bash deploy/bot/backup.sh

echo "==> 2/5 Verifikasi working tree bersih"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "!! Ada perubahan lokal yang belum di-commit:" >&2
  git status --short >&2
  echo "!! Commit, stash, atau hapus dulu sebelum update." >&2
  exit 1
fi

echo "==> 3/5 Menarik kode terbaru (${BRANCH})"
git fetch origin "${BRANCH}"
git merge --ff-only "origin/${BRANCH}"

echo "==> 4/5 Memasang dependency & menjalankan tes"
( cd bot && npm ci --omit=dev --no-audit --no-fund )
node deploy/scripts/preflight.mjs --bot || {
  echo "!! Preflight gagal. Bot TIDAK direstart. Perbaiki dulu." >&2
  exit 1
}
( cd bot && npm run test:auto-ai )

echo "==> 5/5 Restart layanan (${SERVICE_KIND}: ${SERVICE_NAME})"
case "${SERVICE_KIND}" in
  pm2)
    pm2 restart "${SERVICE_NAME}" --update-env
    pm2 save
    ;;
  systemd)
    systemctl restart "${SERVICE_NAME}"
    systemctl --no-pager --lines=20 status "${SERVICE_NAME}" || true
    ;;
  none)
    echo "    SERVICE_KIND=none -> tidak ada yang direstart. Jalankan bot manual."
    ;;
  *)
    echo "!! SERVICE_KIND tidak dikenal: ${SERVICE_KIND}" >&2
    exit 1
    ;;
esac

echo
echo "Update selesai. Cek log untuk memastikan bot tersambung ke WhatsApp."
