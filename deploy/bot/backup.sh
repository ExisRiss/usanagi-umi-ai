#!/usr/bin/env bash
#
# Backup state bot: config, sesi WhatsApp, database runtime, dan bot-config.json.
#
# Yang di-backup HARUS tetap privat: file arsip ini berisi kredensial sesi.
# Simpan di luar repo, permission 600, dan jangan pernah di-upload ke GitHub.
#
# Pakai:
#   bash deploy/bot/backup.sh                  # simpan ke ~/usanagi-backups
#   BACKUP_DIR=/mnt/backup bash deploy/...     # tujuan lain
#   KEEP=30 bash deploy/bot/backup.sh          # simpan 30 arsip terakhir
#
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
BOT_DIR="${BOT_DIR:-${APP_DIR}/bot}"
BACKUP_DIR="${BACKUP_DIR:-${HOME}/usanagi-backups}"
KEEP="${KEEP:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="${BACKUP_DIR}/usanagi-umi-${STAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

cd "${BOT_DIR}"

INCLUDE=()
for item in config.js bot-config.json database.json sessions jadibot; do
  [[ -e "${item}" ]] && INCLUDE+=("${item}")
done

if [[ ${#INCLUDE[@]} -eq 0 ]]; then
  echo "Tidak ada yang bisa di-backup di ${BOT_DIR}" >&2
  exit 1
fi

echo "==> Membuat arsip: ${ARCHIVE}"
echo "    Isi: ${INCLUDE[*]}"
tar -czf "${ARCHIVE}" "${INCLUDE[@]}"
chmod 600 "${ARCHIVE}"

SIZE="$(du -h "${ARCHIVE}" | cut -f1)"
echo "    Ukuran: ${SIZE}"

echo "==> Menghapus arsip lama (sisakan ${KEEP} terbaru)"
# shellcheck disable=SC2012
ls -1t "${BACKUP_DIR}"/usanagi-umi-*.tar.gz 2>/dev/null | tail -n "+$((KEEP + 1))" | while read -r old; do
  echo "    hapus $(basename "${old}")"
  rm -f "${old}"
done

cat <<'NOTE'

Pengingat keamanan:
  - Arsip ini berisi sesi WhatsApp + kredensial. Perlakukan seperti password.
  - Jangan simpan di folder repo (bisa ikut ter-commit).
  - Untuk backup terenkripsi:
      gpg -c --cipher-algo AES256 <arsip>
  - Untuk menyalin ke server lain:
      rsync -avz --chmod=600 <arsip> user@host:/path/backup/
NOTE
