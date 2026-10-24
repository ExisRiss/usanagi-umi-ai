#!/usr/bin/env bash
#
# Startup script untuk Pterodactyl.
#
# Pasang sebagai Startup Command egg (Script Configuration -> Startup Command):
#     bash start-pterodactyl.sh
#
# Pterodactyl secara default memakai /mnt/server sebagai working directory.
# Script ini menyiapkan folder runtime, memastikan config ada, lalu menjalankan
# bot sebagai proses utama supaya panel bisa memantau statusnya.
#
set -euo pipefail

SERVER_DIR="${SERVER_DIR:-/mnt/server}"
BOT_DIR="${BOT_DIR:-${SERVER_DIR}/bot}"
NODE_BIN="${NODE_BIN:-node}"

cd "${BOT_DIR}"

echo "[ptero] workdir : $(pwd)"
echo "[ptero] node    : $(${NODE_BIN} -v)"

if [[ ! -f package.json ]]; then
  echo "[ptero] FATAL: package.json tidak ditemukan di ${BOT_DIR}" >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "[ptero] node_modules belum ada, menjalankan npm ci..."
  npm ci --omit=dev --no-audit --no-fund
fi

if [[ ! -f config.js ]]; then
  if [[ -f config.example.js ]]; then
    cp config.example.js config.js
    echo "[ptero] config.js dibuat dari config.example.js"
    echo "[ptero] !! WAJIB diisi dulu: owner, jadibotPlatform.supabaseUrl/AnonKey, apiPort"
    echo "[ptero] !! Hentikan server, isi config.js, lalu start lagi."
    sleep 5
  else
    echo "[ptero] FATAL: config.js dan config.example.js tidak ada" >&2
    exit 1
  fi
fi

mkdir -p sessions tmp jadibot logs

# Pterodactyl mendefinisikan SERVER_PORT untuk alokasi utama. Jadibot API
# memakai apiPort dari config.js. Kalau kamu ingin menyamakannya dengan
# alokasi panel, set global.jadibotPlatform.apiPort ke nilai SERVER_PORT.
if [[ -n "${SERVER_PORT:-}" ]]; then
  echo "[ptero] alokasi panel SERVER_PORT=${SERVER_PORT}"
  echo "[ptero] apiPort di config.js harus dibuka di firewall host, BUKAN diekspos ke publik tanpa TLS."
fi

export TZ="${TZ:-Asia/Makassar}"
export NODE_ENV="${NODE_ENV:-production}"

echo "[ptero] menjalankan bot..."
exec "${NODE_BIN}" main.js
