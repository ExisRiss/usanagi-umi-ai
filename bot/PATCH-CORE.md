# Patch inti (handler.js & lib/jadibot-platform-api.js) — Task135 lanjutan

Dua berkas ini **tidak** ditimpa ke GitHub karena salinan di repo (`bot/handler.js`,
`bot/lib/jadibot-platform-api.js`) lebih kecil daripada salinan server — menimpanya akan
menghapus perubahan orang lain. Yang dipakai server = versi lokal kita; di bawah ini
potongan persis yang ditambahkan, supaya bisa diterapkan ulang kapan saja.

## 1. `handler.js`

### a. Import (di bagian atas, setelah import lain)

```js
import { powerNyala, perintahPower, scopeDariConfig, setPower, powerInfo } from './lib/bot-power.js'
```

### b. Gerbang saklar bot — ditaruh tepat setelah `const isMods = ...`

```js
try {
    const _scopePower = scopeDariConfig(botConfig)
    if (!powerNyala(_scopePower)) {
        const _aksiPower = perintahPower(m.text)
        const _bolehPower = Boolean(isROwner || isOwner || m.fromMe)
        if (!_bolehPower) return
        if (_aksiPower === 'on') {
            setPower(_scopePower, true, String(m.sender || '').split('@')[0])
            await this.reply(m.chat, `✅ Bot *ON* untuk sesi ${_scopePower}.\nSemua perintah dijawab lagi.`, m)
            return
        }
        if (_aksiPower === 'off') { /* ... */ return }
        if (_aksiPower === 'status') { /* ... */ return }
        return
    }
} catch (powerError) {
    console.log(`[bot-power] gagal memeriksa saklar: ${powerError?.message || powerError}`)
}
```

### c. Prefix ganda — ditaruh tepat sebelum `const aiDispatchText = ...`

```js
try {
    const _teksPrefix = String(m.text || '')
    const _lebih = _teksPrefix.match(/^([.\/!#]{2,})(?=[A-Za-z0-9_-])/)
    if (_lebih) {
        m.__richRequest = true
        m.text = `${activePrefix}${_teksPrefix.slice(_lebih[1].length)}`
    }
} catch (prefixError) { }
```

## 2. `lib/jadibot-platform-api.js`

```js
import { setPower, powerInfo, scopeDariNomor } from './bot-power.js'
```

- `profileSettings()` → tambah `bot_power: powerInfo(`jadibot:${profile.number}`).enabled,`
- `applySettings()` → validasi `input.bot_power` harus boolean
- Route `/api/settings/apply` → `if (input.bot_power !== undefined) setPower(`jadibot:${number}`, input.bot_power, user?.email || 'website')`
- Route baru `/api/studio` (menyajikan `public/studio.html`) dan `/api/studio/config`.
  Catatan: proxy Vercel punya daftar path yang diizinkan, jadi `/api/studio` tidak bisa
  diakses lewat domain jadibot. Halaman dipindah ke server tunnel: `https://tunel.gwenna.my.id/studio`.


## 3. Tambahan Task136 — penanda rich untuk plugin non-menu

Di dalam blok `if (incomingNormalized.rich) { ... }`, tambahkan satu baris:

```js
    m.__richRequest = true
```

Alasannya: `..statusmc` / `..mcmenu` tidak pernah dibalas rich message karena
plugin memeriksa `m.__richRequest`, sementara handler hanya memasang
`m.__richMenu` (dan blok yang memasang `__richRequest` berjalan setelah teks
sudah dinormalkan, jadi tidak pernah cocok).


## 4. Tambahan Task136b — gerbang "aksi yang menunggu balasan berkas"

Import di bagian atas:

```js
import { cariAksi } from './lib/pending-aksi.js'
```

Ditaruh TEPAT setelah blok `const isStatus = ...; if (isStatus) return` dan
SEBELUM blok `// 🚫 PRIVATE CHAT`:

```js
try {
    const _aksiPending = cariAksi(m)
    if (_aksiPending) {
        const _hasilPending = await _aksiPending.jalankan.call(this, m)
        if (_hasilPending !== false) return
    }
} catch (_pendingError) {
    console.log(`[pending] gagal memproses: ${_pendingError?.message || _pendingError}`)
}
```

Alasan: di chat pribadi, pesan **tanpa prefix** langsung `return` di gerbang
`if (!isGroup) { ... if (!hasPrefix && ...) return }`. Berkas .zip / .html yang
dikirim sebagai dokumen tidak punya prefix → handler berhenti sebelum hook
plugin, jadi bot seolah tidak membalas. Gerbang ini harus berada di atasnya.
