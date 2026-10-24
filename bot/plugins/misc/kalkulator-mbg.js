function hitungMBG(uang) {
  const pengeluaranPerHari = 319600000000
  const hargaPorsi = 15000

  const hariFloat = uang / pengeluaranPerHari

  const tahun = Math.floor(hariFloat / 365)
  const bulan = Math.floor((hariFloat % 365) / 30)
  const hari = Math.floor(hariFloat % 30)

  const jam = Math.floor((hariFloat % 1) * 24)
  const menit = Math.floor(((hariFloat * 24) % 1) * 60)
  const detik = (((hariFloat * 24 * 60) % 1) * 60)

  const porsi = Math.floor(uang / hargaPorsi)

  const umrDKI = 5400000
  const umrJateng = 2040000
  const guruHonorer = 300000

  const persenDKI = ((uang / umrDKI) * 100).toFixed(1)
  const persenJateng = ((uang / umrJateng) * 100).toFixed(1)
  const kaliGuru = (uang / guruHonorer).toFixed(1)

  const pemain = [
    { nama: "Cristiano Ronaldo (Al Nassr)", gaji: 4500000000000 },
    { nama: "Lionel Messi (Inter Miami)", gaji: 2100000000000 },
    { nama: "Karim Benzema (Al-Ittihad)", gaji: 1700000000000 },
    { nama: "Kylian Mbappé (Real Madrid)", gaji: 1500000000000 },
    { nama: "Erling Haaland (Man City)", gaji: 1300000000000 },
    { nama: "Vinícius Jr. (Real Madrid)", gaji: 960000000000 },
    { nama: "Mohamed Salah (Liverpool)", gaji: 880000000000 },
    { nama: "Sadio Mané (Al Nassr)", gaji: 864000000000 },
    { nama: "Jude Bellingham (Real Madrid)", gaji: 704000000000 },
    { nama: "Lamine Yamal (Barcelona)", gaji: 688000000000 }
  ]

  const perbandinganPemain = pemain.map(p => {
    const persen = ((uang / p.gaji) * 100)
    return {
      nama: p.nama,
      gaji: p.gaji,
      persen: persen < 0.0001 ? "0%" : persen.toFixed(4) + "%"
    }
  })

  return {
    durasi: {
      tahun,
      bulan,
      hari,
      jam,
      menit,
      detik: detik.toFixed(2)
    },
    pengeluaran: pengeluaranPerHari,
    porsi,
    gajiIndonesia: {
      dki: persenDKI + "%",
      jateng: persenJateng + "%",
      guru: kaliGuru + "x"
    },
    pemain: perbandinganPemain
  }
}

function formatRupiah(angka) {
  const formatted = angka.toLocaleString('id-ID')
  return angka < 1000 ? `${formatted} Perak` : formatted
}

let handler = async (m, { conn, args, command }) => {
  try {
    if (!args[0]) return m.reply(`Example : .${command} 1000000`)

    m.reply(global.wait)

    const uang = Number(args[0].replace(/[^0-9]/g, ''))
    const data = hitungMBG(uang)

    let teks = `*Dana :* ${formatRupiah(uang)}

*Durasi MBG*
${data.durasi.tahun} TAHUN
${data.durasi.bulan} BULAN
${data.durasi.hari} HARI
${data.durasi.jam} JAM
${data.durasi.menit} MENIT
${data.durasi.detik} DETIK
Berdasarkan laju pengeluaran ~Rp ${(data.pengeluaran / 1000000000).toFixed(1)} M/hari

*Setara Porsi Makan*
${data.porsi} porsi
@ Rp 15.000/porsi

*Perbandingan Gaji Indonesia*
UMR DKI Jakarta
Rp 5,4 Jt/bulan
${data.gajiIndonesia.dki}
UMR Jawa Tengah
Rp 2,04 Jt/bulan
${data.gajiIndonesia.jateng}
Gaji Guru Honorer
Rp 300.000/bulan
${data.gajiIndonesia.guru}

*Perbandingan Gaji Pesepakbola*`

    for (let p of data.pemain) {
      teks += `

${p.nama}
Rp ${p.gaji.toLocaleString('id-ID')}/tahun
${p.persen}`
    }

    m.reply(teks)
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['kalkulatormbg <jumlah_uang>', 'kkmbg <jumlah_uang>']
handler.command = ['kalkulatormbg', 'kkmbg']
handler.tags = ['tools']

export default handler