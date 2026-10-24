#!/usr/bin/env bash
#
# Deploy website Jadibot ke Vercel.
#
# Script ini sengaja TIDAK menyimpan kredensial. Nilai rahasia dibaca dari
# environment variable saat dijalankan, jadi tidak pernah masuk ke shell
# history file maupun ke repo.
#
# Pakai:
#   export UMI_CONFIG_GIST_URL='https://gist.githubusercontent.com/.../raw/umi-server-config.json'
#   export UMI_API_ORIGIN='https://api.domainmu.com'
#   export BACKUP_CRON_SECRET="$(openssl rand -hex 32)"
#   export BOT_BACKUP_EXPORT_SECRET="$(openssl rand -hex 32)"
#   bash deploy/scripts/vercel-deploy.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
WEBSITE_DIR="${APP_DIR}/website"
PROJECT_NAME="${PROJECT_NAME:-usanagi-umi-jadibot}"

cd "${WEBSITE_DIR}"

command -v vercel >/dev/null 2>&1 || {
  echo "Vercel CLI belum ada. Pasang: npm i -g vercel" >&2
  exit 1
}

echo "==> 0/4 Preflight lokal"
node "${APP_DIR}/deploy/scripts/preflight.mjs" --website || {
  echo "!! Preflight website gagal. Perbaiki dulu (atau lewati bila hanya soal file .env lokal)." >&2
}

echo "==> 1/4 Menyiapkan tautan project (${PROJECT_NAME})"
vercel link --yes --project "${PROJECT_NAME}"

# ---------------------------------------------------------------------------
# Daftar environment variable. Yang opsional hanya ditambahkan bila diisi.
# ---------------------------------------------------------------------------
REQUIRED=(UMI_CONFIG_GIST_URL UMI_API_ORIGIN BACKUP_CRON_SECRET BOT_BACKUP_EXPORT_SECRET)
OPTIONAL=(BLOB_READ_WRITE_TOKEN SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY TRIPAY_PRIVATE_KEY TRIPAY_MERCHANT_CODE)

missing=()
for key in "${REQUIRED[@]}"; do
  [[ -n "${!key:-}" ]] || missing+=("${key}")
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo
  echo "!! Environment variable wajib belum diisi: ${missing[*]}" >&2
  echo "   Export dulu sebelum menjalankan script ini." >&2
  echo "   Contoh:" >&2
  echo "     export UMI_CONFIG_GIST_URL='https://gist.githubusercontent.com/.../raw/umi-server-config.json'" >&2
  echo "     export UMI_API_ORIGIN='https://api.domainmu.com'" >&2
  echo "     export BACKUP_CRON_SECRET=\"\$(openssl rand -hex 32)\"" >&2
  echo "     export BOT_BACKUP_EXPORT_SECRET=\"\$(openssl rand -hex 32)\"" >&2
  exit 1
fi

echo "==> 2/4 Mengunggah environment variable ke semua environment Vercel"
for env_name in production preview development; do
  for key in "${REQUIRED[@]}" "${OPTIONAL[@]}"; do
    value="${!key:-}"
    [[ -n "${value}" ]] || continue
    # Hapus dulu supaya idempoten, lalu tambahkan ulang.
    vercel env rm "${key}" "${env_name}" --yes >/dev/null 2>&1 || true
    printf '%s' "${value}" | vercel env add "${key}" "${env_name}" >/dev/null
    echo "    ${env_name}: ${key}"
  done
done

echo "==> 3/4 Deploy production"
vercel --prod --yes

echo "==> 4/4 Verifikasi health endpoint"
DEPLOY_URL="$(vercel ls "${PROJECT_NAME}" --prod 2>/dev/null | grep -oE 'https://[a-z0-9.-]+\.vercel\.app' | head -1 || true)"

if [[ -z "${DEPLOY_URL}" ]]; then
  echo "Tidak bisa mendeteksi URL deploy otomatis. Cek manual: <domain>/api/health"
  exit 0
fi

echo "    URL: ${DEPLOY_URL}"
for attempt in 1 2 3 4 5; do
  BODY="$(curl -fsS --max-time 15 "${DEPLOY_URL}/api/health" || true)"
  if [[ -n "${BODY}" ]]; then
    echo "    /api/health -> ${BODY}"
    echo
    echo "Jika body di atas menampilkan ok: true dan origin bot API benar, integrasi selesai."
    exit 0
  fi
  echo "    percobaan ${attempt} gagal, menunggu 5 detik..."
  sleep 5
done

echo "!! /api/health belum merespons. Periksa UMI_CONFIG_GIST_URL / UMI_API_ORIGIN dan status bot di VPS." >&2
exit 1
