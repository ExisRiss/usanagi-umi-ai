/*
╭──────────────────────────────────────────────╮
│              USANAGI UMI AI — CUACA                 │
│                                              │
│  API      : Nexray API                      │
│  Endpoint : /information/cuaca?kota=        │
│  Type     : Plugin ESM                      │
│                                              │
│  Feature:                                    │
│  • Cuaca per kota                            │
│  • Cuaca 38 provinsi                        │
│  • Gambar cuaca otomatis                    │
│  • Auto notification                         │
│  • Subscriber JSON                           │
╰──────────────────────────────────────────────╯
*/

import fs from 'fs'
import path from 'path'

/*
╭──────────────────────────────────────────────╮
│                    CONFIG                    │
╰──────────────────────────────────────────────╯
*/

const API_BASE =
    'https://api.nexray.eu.cc/information/cuaca'

const DATA_DIR =
    './data'

const DATA_FILE =
    path.join(DATA_DIR, 'cuaca-subscribers.json')

/*
3 jam sekali
*/

const AUTO_INTERVAL =
    3 * 60 * 60 * 1000

/*
Delay antar request kota.
*/

const CITY_DELAY =
    350

/*
Delay antar grup.
*/

const GROUP_DELAY =
    1200

/*
Timeout API
*/

const API_TIMEOUT =
    20000

/*
╭──────────────────────────────────────────────╮
│             38 PROVINSI INDONESIA            │
╰──────────────────────────────────────────────╯
*/

const PROVINCES = [
    {
        provinsi: 'Aceh',
        kota: 'Banda Aceh'
    },
    {
        provinsi: 'Sumatera Utara',
        kota: 'Medan'
    },
    {
        provinsi: 'Sumatera Barat',
        kota: 'Padang'
    },
    {
        provinsi: 'Riau',
        kota: 'Pekanbaru'
    },
    {
        provinsi: 'Kepulauan Riau',
        kota: 'Tanjung Pinang'
    },
    {
        provinsi: 'Jambi',
        kota: 'Jambi'
    },
    {
        provinsi: 'Sumatera Selatan',
        kota: 'Palembang'
    },
    {
        provinsi: 'Kepulauan Bangka Belitung',
        kota: 'Pangkal Pinang'
    },
    {
        provinsi: 'Bengkulu',
        kota: 'Bengkulu'
    },
    {
        provinsi: 'Lampung',
        kota: 'Bandar Lampung'
    },
    {
        provinsi: 'DKI Jakarta',
        kota: 'Jakarta'
    },
    {
        provinsi: 'Jawa Barat',
        kota: 'Bandung'
    },
    {
        provinsi: 'Banten',
        kota: 'Serang'
    },
    {
        provinsi: 'Jawa Tengah',
        kota: 'Semarang'
    },
    {
        provinsi: 'DI Yogyakarta',
        kota: 'Yogyakarta'
    },
    {
        provinsi: 'Jawa Timur',
        kota: 'Surabaya'
    },
    {
        provinsi: 'Bali',
        kota: 'Denpasar'
    },
    {
        provinsi: 'Nusa Tenggara Barat',
        kota: 'Mataram'
    },
    {
        provinsi: 'Nusa Tenggara Timur',
        kota: 'Kupang'
    },
    {
        provinsi: 'Kalimantan Barat',
        kota: 'Pontianak'
    },
    {
        provinsi: 'Kalimantan Tengah',
        kota: 'Palangka Raya'
    },
    {
        provinsi: 'Kalimantan Selatan',
        kota: 'Banjarmasin'
    },
    {
        provinsi: 'Kalimantan Timur',
        kota: 'Samarinda'
    },
    {
        provinsi: 'Kalimantan Utara',
        kota: 'Tanjung Selor'
    },
    {
        provinsi: 'Sulawesi Utara',
        kota: 'Manado'
    },
    {
        provinsi: 'Sulawesi Tengah',
        kota: 'Palu'
    },
    {
        provinsi: 'Sulawesi Selatan',
        kota: 'Makassar'
    },
    {
        provinsi: 'Sulawesi Tenggara',
        kota: 'Kendari'
    },
    {
        provinsi: 'Gorontalo',
        kota: 'Gorontalo'
    },
    {
        provinsi: 'Sulawesi Barat',
        kota: 'Mamuju'
    },
    {
        provinsi: 'Maluku',
        kota: 'Ambon'
    },
    {
        provinsi: 'Maluku Utara',
        kota: 'Sofifi'
    },
    {
        provinsi: 'Papua',
        kota: 'Jayapura'
    },
    {
        provinsi: 'Papua Barat',
        kota: 'Manokwari'
    },
    {
        provinsi: 'Papua Selatan',
        kota: 'Merauke'
    },
    {
        provinsi: 'Papua Tengah',
        kota: 'Nabire'
    },
    {
        provinsi: 'Papua Pegunungan',
        kota: 'Wamena'
    },
    {
        provinsi: 'Papua Barat Daya',
        kota: 'Sorong'
    }
]

/*
╭──────────────────────────────────────────────╮
│                   UTILITY                    │
╰──────────────────────────────────────────────╯
*/

const sleep = ms =>
    new Promise(resolve =>
        setTimeout(resolve, ms)
    )

function ensureDatabase() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        })
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                {
                    groups: {}
                },
                null,
                2
            )
        )
    }
}

function readDatabase() {
    ensureDatabase()

    try {
        const data = JSON.parse(
            fs.readFileSync(
                DATA_FILE,
                'utf8'
            )
        )

        if (
            !data ||
            typeof data !== 'object'
        ) {
            return {
                groups: {}
            }
        }

        if (!data.groups) {
            data.groups = {}
        }

        return data

    } catch {
        return {
            groups: {}
        }
    }
}

function saveDatabase(data) {
    ensureDatabase()

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            data,
            null,
            2
        )
    )
}

/*
╭──────────────────────────────────────────────╮
│             CARI URL GAMBAR API              │
╰──────────────────────────────────────────────╯

Tidak bergantung pada satu nama field.
Kalau Nexray menggunakan:
gambar / image / icon / thumbnail /
image_url / icon_url / dll,
akan dicoba otomatis.
*/

function findImageUrl(data) {
    const possibleKeys = [
        'gambar',
        'image',
        'img',
        'icon',
        'icon_url',
        'image_url',
        'url_gambar',
        'url_image',
        'thumbnail',
        'thumbnail_url',
        'weather_image',
        'weatherImage',
        'picture',
        'photo'
    ]

    const visited = new WeakSet()

    function scan(value) {
        if (!value) {
            return null
        }

        if (
            typeof value === 'string'
        ) {
            if (
                /^https?:\/\//i.test(value) &&
                /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(value)
            ) {
                return value
            }

            return null
        }

        if (
            typeof value !== 'object'
        ) {
            return null
        }

        if (visited.has(value)) {
            return null
        }

        visited.add(value)

        /*
        Coba key yang kemungkinan besar
        merupakan URL gambar terlebih dahulu.
        */

        for (
            const key of possibleKeys
        ) {
            const current =
                value[key]

            if (
                typeof current === 'string' &&
                /^https?:\/\//i.test(current)
            ) {
                return current
            }
        }

        /*
        Recursive scan
        */

        for (
            const child of Object.values(value)
        ) {
            const found =
                scan(child)

            if (found) {
                return found
            }
        }

        return null
    }

    return scan(data)
}

/*
╭──────────────────────────────────────────────╮
│              EMOJI CUACA                     │
╰──────────────────────────────────────────────╯
*/

function weatherEmoji(weather = '') {
    const text =
        String(weather)
            .toLowerCase()

    if (
        text.includes('petir') ||
        text.includes('badai')
    ) {
        return '⛈️'
    }

    if (
        text.includes('hujan lebat') ||
        text.includes('hujan deras')
    ) {
        return '🌧️'
    }

    if (
        text.includes('hujan') ||
        text.includes('gerimis')
    ) {
        return '🌦️'
    }

    if (
        text.includes('berawan') ||
        text.includes('awan')
    ) {
        return '☁️'
    }

    if (
        text.includes('cerah')
    ) {
        return '☀️'
    }

    if (
        text.includes('kabut')
    ) {
        return '🌫️'
    }

    return '🌤️'
}

/*
╭──────────────────────────────────────────────╮
│               API REQUEST                    │
╰──────────────────────────────────────────────╯
*/

async function getWeather(city) {
    const url =
        `${API_BASE}?kota=${encodeURIComponent(city)}`

    const controller =
        new AbortController()

    const timeout =
        setTimeout(
            () => controller.abort(),
            API_TIMEOUT
        )

    try {
        const response =
            await fetch(
                url,
                {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        Accept:
                            'application/json',
                        'User-Agent':
                            'Usanagi-Umi-AI-Weather/1.0'
                    }
                }
            )

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            )
        }

        const json =
            await response.json()

        if (
            !json ||
            typeof json !== 'object'
        ) {
            throw new Error(
                'Response API bukan JSON object'
            )
        }

        /*
        Simpan seluruh response supaya
        field gambar bisa dicari dari
        struktur apa pun.
        */

        return json

    } finally {
        clearTimeout(timeout)
    }
}

/*
╭──────────────────────────────────────────────╮
│              NORMALIZE RESPONSE              │
╰──────────────────────────────────────────────╯
*/

function normalizeWeatherResponse(
    city,
    json
) {
    /*
    Beberapa API menggunakan:
    result.forecasts

    Kalau struktur berubah,
    coba beberapa kemungkinan.
    */

    const result =
        json?.result ||
        json?.data ||
        json

    let forecasts =
        result?.forecasts ||
        result?.forecast ||
        result?.data?.forecasts ||
        []

    if (!Array.isArray(forecasts)) {
        forecasts = []
    }

    const location =
        result?.location ||
        result?.lokasi ||
        {}

    const image =
        findImageUrl(
            json
        )

    return {
        success: true,

        city,

        provinsi:
            location?.provinsi ||
            location?.province ||
            '-',

        kota:
            location?.kota ||
            location?.city ||
            city,

        desa:
            location?.desa ||
            '-',

        kecamatan:
            location?.kecamatan ||
            '-',

        forecasts,

        image,

        raw: json
    }
}

/*
╭──────────────────────────────────────────────╮
│             GET SATU KOTA                    │
╰──────────────────────────────────────────────╯
*/

async function getCityReport(city) {
    try {
        const json =
            await getWeather(city)

        return normalizeWeatherResponse(
            city,
            json
        )

    } catch (error) {
        return {
            success: false,
            city,
            error:
                error?.name === 'AbortError'
                    ? 'Request timeout'
                    : error?.message ||
                      'Unknown error'
        }
    }
}

/*
╭──────────────────────────────────────────────╮
│          GET 38 PROVINSI                     │
╰──────────────────────────────────────────────╯
*/

async function getIndonesiaWeather() {
    const results = []

    for (
        const province of PROVINCES
    ) {
        const result =
            await getCityReport(
                province.kota
            )

        results.push({
            ...province,
            ...result
        })

        /*
        Jangan terlalu cepat request
        ke API.
        */

        await sleep(
            CITY_DELAY
        )
    }

    return results
}

/*
╭──────────────────────────────────────────────╮
│             FORMAT FORECAST                  │
╰──────────────────────────────────────────────╯
*/

function formatForecast(
    forecasts,
    limit = 4
) {
    if (
        !Array.isArray(forecasts) ||
        !forecasts.length
    ) {
        return 'Data prakiraan tidak tersedia.'
    }

    return forecasts
        .slice(0, limit)
        .map(item => {

            const cuaca =
                item?.cuaca ||
                item?.weather ||
                '-'

            const suhu =
                item?.suhu ||
                item?.temperature ||
                '-'

            const kelembaban =
                item?.kelembaban ||
                item?.humidity ||
                '-'

            const angin =
                item?.kecepatan_angin ||
                item?.wind_speed ||
                '-'

            const arah =
                item?.arah_angin ||
                item?.wind_direction ||
                ''

            const waktu =
                item?.waktu ||
                item?.time ||
                '-'

            return [
                `╭─ ${weatherEmoji(cuaca)} *${waktu}*`,
                `│ Cuaca      : ${cuaca}`,
                `│ Suhu       : ${suhu}`,
                `│ Kelembapan : ${kelembaban}`,
                `│ Angin      : ${angin} ${arah}`,
                `╰──────────────`
            ].join('\n')

        })
        .join('\n')
}

/*
╭──────────────────────────────────────────────╮
│          WAKTU INDONESIA                     │
╰──────────────────────────────────────────────╯
*/

function getIndonesiaDate() {
    return new Date()
        .toLocaleString(
            'id-ID',
            {
                timeZone:
                    'Asia/Jakarta',
                dateStyle:
                    'full',
                timeStyle:
                    'short'
            }
        )
}

/*
╭──────────────────────────────────────────────╮
│       BUAT CAPTION 38 PROVINSI               │
╰──────────────────────────────────────────────╯
*/

function createIndonesiaMessage(
    results
) {
    const success =
        results.filter(
            x => x.success
        )

    const failed =
        results.filter(
            x => !x.success
        )

    let text = [
        `╭━━━〔 🌦️ *CUACA INDONESIA* 〕━━━╮`,
        `┃`,
        `┃ 📅 ${getIndonesiaDate()}`,
        `┃ 🇮🇩 ${success.length}/${results.length} wilayah`,
        `┃`,
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        ``
    ].join('\n')

    /*
    Semua provinsi
    */

    for (
        const item of results
    ) {
        if (!item.success) {
            continue
        }

        const forecast =
            item.forecasts?.[0]

        if (!forecast) {
            text += [
                `*${item.provinsi}*`,
                `└─ 📍 ${item.kota}`,
                `   ⚠️ Data prakiraan kosong`,
                ``
            ].join('\n')

            continue
        }

        const cuaca =
            forecast?.cuaca ||
            forecast?.weather ||
            '-'

        const suhu =
            forecast?.suhu ||
            forecast?.temperature ||
            '-'

        const kelembaban =
            forecast?.kelembaban ||
            forecast?.humidity ||
            '-'

        const angin =
            forecast?.kecepatan_angin ||
            forecast?.wind_speed ||
            '-'

        const arah =
            forecast?.arah_angin ||
            forecast?.wind_direction ||
            ''

        text += [
            `*${item.provinsi}*`,
            `└─ 📍 ${item.kota}`,
            `   ${weatherEmoji(cuaca)} ${cuaca}`,
            `   🌡️ ${suhu}`,
            `   💧 ${kelembaban}`,
            `   💨 ${angin} ${arah}`,
            ``
        ].join('\n')
    }

    /*
    Kota yang gagal
    */

    if (failed.length) {
        text += [
            `╭─ ⚠️ *DATA GAGAL*`,
            `│`,
            `│ ${failed
                .map(
                    x => x.kota
                )
                .join(', ')}`,
            `│`,
            `╰──────────────`
        ].join('\n')
    }

    text += [
        ``,
        `━━━━━━━━━━━━━━━━━━━━`,
        `_🌐 Data dari Nexray API_`,
        `_❀ USANAGI UMI AI ❀_`
    ].join('\n')

    return text
}

/*
╭──────────────────────────────────────────────╮
│         CARI GAMBAR UTAMA                    │
╰──────────────────────────────────────────────╯
*/

function getMainWeatherImage(
    results
) {
    /*
    Prioritas:
    1. gambar dari Jakarta
    2. gambar dari kota pertama
    3. gambar kota mana pun
    */

    const jakarta =
        results.find(
            x =>
                x.success &&
                x.kota
                    ?.toLowerCase()
                    .includes('jakarta') &&
                x.image
        )

    if (jakarta?.image) {
        return jakarta.image
    }

    const first =
        results.find(
            x =>
                x.success &&
                x.image
        )

    return first?.image || null
}

/*
╭──────────────────────────────────────────────╮
│          BUAT PESAN SATU KOTA                │
╰──────────────────────────────────────────────╯
*/

function createCityMessage(
    result
) {
    const location = [
        result.desa,
        result.kecamatan,
        result.provinsi
    ]
        .filter(
            x =>
                x &&
                x !== '-'
        )
        .join(', ')

    return [
        `╭━━━〔 🌦️ *CUACA* 〕━━━╮`,
        `┃`,
        `┃ 📍 *${result.kota}*`,
        `┃ 🗺️ ${location || '-'}`,
        `┃`,
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        ``,
        formatForecast(
            result.forecasts
        ),
        ``,
        `━━━━━━━━━━━━━━━━━━━━`,
        `_🌐 Data dari Nexray API_`,
        `_❀ USANAGI UMI AI ❀_`
    ].join('\n')
}

/*
╭──────────────────────────────────────────────╮
│          SEND WEATHER IMAGE                  │
╰──────────────────────────────────────────────╯
*/

async function sendWeatherReport(
    conn,
    jid,
    message,
    image = null,
    quoted = null
) {
    /*
    Kalau ada gambar dari API,
    kirim image + caption.
    */

    if (image) {
        try {
            await conn.sendMessage(
                jid,
                {
                    image: {
                        url: image
                    },
                    caption: message
                },
                {
                    quoted
                }
            )

            return true

        } catch (error) {
            console.error(
                '[CUACA] Image send failed:',
                error?.message
            )
        }
    }

    /*
    Fallback ke text.
    */

    await conn.sendMessage(
        jid,
        {
            text: message
        },
        {
            quoted
        }
    )

    return true
}

/*
╭──────────────────────────────────────────────╮
│            AUTO NOTIFICATION                 │
╰──────────────────────────────────────────────╯
*/

let weatherSending =
    false

async function sendAutoWeather(
    conn
) {
    if (weatherSending) {
        console.log(
            '[CUACA] Proses sebelumnya masih berjalan.'
        )

        return
    }

    weatherSending = true

    try {
        const db =
            readDatabase()

        const groups =
            Object.keys(
                db.groups || {}
            )

        if (!groups.length) {
            return
        }

        console.log(
            `[CUACA] Mengambil data 38 provinsi untuk ${groups.length} grup...`
        )

        const results =
            await getIndonesiaWeather()

        const message =
            createIndonesiaMessage(
                results
            )

        const image =
            getMainWeatherImage(
                results
            )

        /*
        Kirim ke semua subscriber.
        */

        for (
            const jid of groups
        ) {
            /*
            Pastikan masih aktif.
            */

            const latestDB =
                readDatabase()

            if (
                !latestDB.groups?.[jid]
            ) {
                continue
            }

            try {
                await sendWeatherReport(
                    conn,
                    jid,
                    message,
                    image
                )

                console.log(
                    `[CUACA] Terkirim → ${jid}`
                )

            } catch (error) {
                console.error(
                    `[CUACA] Gagal → ${jid}`,
                    error?.message
                )
            }

            await sleep(
                GROUP_DELAY
            )
        }

    } catch (error) {
        console.error(
            '[CUACA] Auto notification error:',
            error
        )

    } finally {
        weatherSending =
            false
    }
}

/*
╭──────────────────────────────────────────────╮
│                SCHEDULER                    │
╰──────────────────────────────────────────────╯
*/

function startWeatherScheduler(
    conn
) {
    /*
    Hindari interval ganda.
    */

    if (
        global.__anyaWeatherScheduler
    ) {
        return
    }

    global.__anyaWeatherScheduler =
        true

    console.log(
        '[CUACA] Weather scheduler started.'
    )

    /*
    Jalankan setiap 3 jam.
    */

    global.__anyaWeatherInterval =
        setInterval(
            async () => {
                try {
                    await sendAutoWeather(
                        conn
                    )
                } catch (error) {
                    console.error(
                        '[CUACA] Scheduler:',
                        error
                    )
                }
            },
            AUTO_INTERVAL
        )
}

/*
╭──────────────────────────────────────────────╮
│                  HANDLER                     │
╰──────────────────────────────────────────────╯
*/

let handler = async (
    m,
    {
        conn,
        args,
        usedPrefix,
        command
    }
) => {
    const action =
        (
            args[0] || ''
        )
            .toLowerCase()
            .trim()

    /*
    ─────────────────────────────────────────
    HELP
    ─────────────────────────────────────────
    */

    if (!action) {
        return m.reply(
            [
                `╭━━━〔 🌦️ *CUACA ALZRISS* 〕━━━╮`,
                `┃`,
                `┃ ${usedPrefix + command} Jakarta`,
                `┃ ${usedPrefix + command} Bandung`,
                `┃`,
                `┃ 🇮🇩 ${usedPrefix + command}all`,
                `┃`,
                `┃ 🔔 Auto Notification`,
                `┃ ${usedPrefix + command} on`,
                `┃ ${usedPrefix + command} off`,
                `┃ ${usedPrefix + command} status`,
                `┃`,
                `╰━━━━━━━━━━━━━━━━━━━━╯`
            ].join('\n')
        )
    }

    /*
    ─────────────────────────────────────────
    STATUS
    ─────────────────────────────────────────
    */

    if (
        action === 'status'
    ) {
        const db =
            readDatabase()

        const active =
            Boolean(
                db.groups?.[m.chat]
            )

        const total =
            Object.keys(
                db.groups || {}
            ).length

        return m.reply(
            [
                `╭━━━〔 🌦️ *CUACA STATUS* 〕━━━╮`,
                `┃`,
                `┃ Status : ${active ? '🟢 Aktif' : '🔴 Nonaktif'}`,
                `┃ Interval : 3 jam`,
                `┃ Wilayah : 38 Provinsi`,
                `┃ Subscriber : ${total} grup`,
                `┃ Gambar : 🖼️ Otomatis`,
                `┃`,
                `╰━━━━━━━━━━━━━━━━━━━━╯`
            ].join('\n')
        )
    }

    /*
    ─────────────────────────────────────────
    ON
    ─────────────────────────────────────────
    */

    if (
        action === 'on' ||
        action === 'aktif'
    ) {
        if (!m.isGroup) {
            return m.reply(
                '❌ Auto-notif cuaca hanya bisa diaktifkan di grup.'
            )
        }

        const db =
            readDatabase()

        db.groups[m.chat] = {
            enabled: true,
            createdAt:
                Date.now()
        }

        saveDatabase(db)

        /*
        Start scheduler.
        */

        startWeatherScheduler(
            conn
        )

        return m.reply(
            [
                `╭━━━〔 🌦️ *AUTO CUACA* 〕━━━╮`,
                `┃`,
                `┃ ✅ Berhasil diaktifkan.`,
                `┃`,
                `┃ 🇮🇩 Wilayah : 38 Provinsi`,
                `┃ ⏱️ Interval : 3 jam`,
                `┃ 🖼️ Gambar : Otomatis`,
                `┃`,
                `┃ Bot akan mengirim laporan`,
                `┃ cuaca secara otomatis.`,
                `┃`,
                `╰━━━━━━━━━━━━━━━━━━━━╯`
            ].join('\n')
        )
    }

    /*
    ─────────────────────────────────────────
    OFF
    ─────────────────────────────────────────
    */

    if (
        action === 'off' ||
        action === 'mati'
    ) {
        if (!m.isGroup) {
            return m.reply(
                '❌ Auto-notif cuaca hanya bisa digunakan di grup.'
            )
        }

        const db =
            readDatabase()

        delete db.groups[
            m.chat
        ]

        saveDatabase(db)

        return m.reply(
            [
                `🌦️ *AUTO CUACA*`,
                ``,
                `🔕 Auto-notifikasi berhasil dimatikan.`,
                ``,
                `Bot tidak akan lagi mengirim`,
                `laporan cuaca ke grup ini.`
            ].join('\n')
        )
    }

    /*
    ─────────────────────────────────────────
    CUACA SEMUA INDONESIA
    ─────────────────────────────────────────
    */

    if (
        action === 'all' ||
        action === 'semua' ||
        action === 'indonesia'
    ) {
        await m.reply(
            [
                `🌦️ *CUACA INDONESIA*`,
                ``,
                `⏳ Mengambil data 38 provinsi...`,
                `🖼️ Menyiapkan gambar cuaca...`,
                ``,
                `Mohon tunggu sebentar.`
            ].join('\n')
        )

        try {
            const results =
                await getIndonesiaWeather()

            const message =
                createIndonesiaMessage(
                    results
                )

            const image =
                getMainWeatherImage(
                    results
                )

            return sendWeatherReport(
                conn,
                m.chat,
                message,
                image,
                m
            )

        } catch (error) {
            console.error(
                '[CUACA ALL]',
                error
            )

            return m.reply(
                [
                    `❌ *Gagal mengambil data cuaca.*`,
                    ``,
                    error?.message ||
                        'Unknown error'
                ].join('\n')
            )
        }
    }

    /*
    ─────────────────────────────────────────
    SATU KOTA
    ─────────────────────────────────────────
    */

    const city =
        args
            .join(' ')
            .trim()

    if (!city) {
        return m.reply(
            `Contoh:\n${usedPrefix + command} Jakarta`
        )
    }

    await m.reply(
        `🌦️ Mengambil cuaca *${city}*...`
    )

    try {
        const result =
            await getCityReport(
                city
            )

        if (!result.success) {
            return m.reply(
                [
                    `❌ *Gagal mengambil cuaca*`,
                    ``,
                    `📍 Kota : ${city}`,
                    `⚠️ Error : ${result.error}`
                ].join('\n')
            )
        }

        const message =
            createCityMessage(
                result
            )

        return sendWeatherReport(
            conn,
            m.chat,
            message,
            result.image,
            m
        )

    } catch (error) {
        console.error(
            '[CUACA]',
            error
        )

        return m.reply(
            [
                `❌ Terjadi kesalahan.`,
                ``,
                error?.message ||
                    'Unknown error'
            ].join('\n')
        )
    }
}

/*
╭──────────────────────────────────────────────╮
│                  COMMAND                     │
╰──────────────────────────────────────────────╯
*/

handler.help = [
    'cuaca <kota>',
    'cuacaall',
    'cuaca on',
    'cuaca off',
    'cuaca status'
]

handler.tags = [
    'info'
]

handler.command = [
    'cuaca',
    'cuacaall'
]

/*
╭──────────────────────────────────────────────╮
│             GROUP SCHEDULER                  │
╰──────────────────────────────────────────────╯
*/

handler.before =
    async function () {
        try {
            /*
            this = conn
            */

            if (
                this?.user?.jid
            ) {
                startWeatherScheduler(
                    this
                )
            }

        } catch {}
    }

export default handler