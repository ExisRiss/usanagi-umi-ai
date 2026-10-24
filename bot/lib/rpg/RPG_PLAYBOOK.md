<div align="center">

# 📖 USANAGI UMI AI — RPG PLAYBOOK

**Catatan main, referensi fitur, dan cara ngerti sistem RPG tanpa ribet 😁**

</div>

-----------------------------------------

<div align="center">

### 🗿 BUKA DULU, JANGAN LANGSUNG GAS

</div>

> File ini buat lu yang udah nyoba RPG Usanagi terus pengin ngerti,
> “sebenernya fitur-fiturnya nyambung ke mana sih?”
>
> Gak perlu hafal 152 command sekaligus. Dunia RPG ini lebih enak dipahami per kelompok.
> Baca bagian yang lu butuhin, terus langsung coba command-nya.

> Catatan: contoh command di bawah pakai prefix `.`. Kalau prefix Usanagi di tempat lu beda, tinggal ganti `.` dengan prefix yang dipakai bot.

-----------------------------------------

<div align="center">

### 🎯 LOGIKA DASAR RPG USANAGI

</div>

```text
KARAKTER
   ↓
RESOURCE
   ↓
AKTIVITAS
   ↓
HASIL
   ↓
INVENTORY / KOIN / EXP
   ↓
LEVEL & STAT
   ↓
FITUR BARU
```

✨ Jangan mikir RPG cuma soal “command mana yang paling menghasilkan”. Yang lebih penting adalah hubungan antar-resource.

Contoh sederhana:

```text
.berburu
   ↓
Dapat loot + EXP + koin
   ↓
.inventory
   ↓
.shop / craft / use
   ↓
stat & progres karakter berkembang
```

-----------------------------------------

<div align="center">

### ❤️ JAGA KONDISI KARAKTER

</div>

**HP** itu kondisi kesehatan.

**Stamina** adalah bahan bakar aktivitas. Banyak command memakai stamina, jadi jangan habiskan semuanya pada satu jenis aktivitas.

**Mana** dipakai fitur yang memang menggunakan mana.

**EXP** adalah bahan progression level.

**Koin** adalah resource ekonomi yang bisa dipakai untuk transaksi dan kebutuhan RPG lain.

> 💡 Rule gampang: **sebelum aktivitas penting, cek profile dulu.**

```text
.rpgprofile
```

Kalau kondisi karakter aman, baru tentukan mau gathering, kerja, crafting, quest, atau battle.

-----------------------------------------

<div align="center">

### 🧺 RESOURCE: JANGAN ASAL JUAL

</div>

Material hasil aktivitas belum tentu lebih bagus kalau langsung dijual.

Ada bahan yang lebih berguna kalau disimpan untuk crafting, alchemy, cooking, bait, trap, refine, smelt, atau fitur lanjutan.

Contoh jalur:

```text
MINING
→ ROCK / COAL / IRON / GOLD / DIAMOND
→ CRAFT / SMELT / REFINE
→ EQUIPMENT / MATERIAL BARU
```

Contoh lain:

```text
FISHING
→ FISH / PRAWN / OCTOPUS / SHARK / WHALE
→ JUAL
→ ATAU PAKAI DI FITUR YANG MEMBUTUHKAN ITEM
```

> 🎒 Biasakan cek inventory sebelum menjual semua resource. Command `sellall` memang praktis, tapi bukan berarti semua item otomatis lebih baik dijual sekarang.

-----------------------------------------

<div align="center">

### 🔨 CRAFTING: UBAH BAHAN JADI NILAI

</div>

Jalur crafting utama yang tersedia:

```text
.craft
.alchemy
.blacksmith
.enchant
.refine
.smelt
.tannery
.mill
.salvage
.blueprint
.artifactforge
.relic
.relicforge
.dismantle
```

🧱 Contoh pola pikir:

```text
BAHAN MENTAH
   ↓
PROSES
   ↓
MATERIAL / EQUIPMENT
   ↓
DIPAKAI
   ↓
PROGRES LEBIH JAUH
```

> ⚒️ Kalau suatu bahan punya fungsi crafting, jangan langsung habiskan semuanya untuk dijual cuma karena saldo terlihat enak.

-----------------------------------------

<div align="center">

### 🏋️ TRAINING: PILIH STAT SESUAI GAYA MAIN

</div>

Saat membuka:

```text
.training
```

lu akan lihat pilihan stat yang memang tersedia:

```text
attack
 defense
 health
 speed
 luck
```

Masing-masing training punya biaya stamina dan bonus berbeda.

⚔️ **Attack** — fokus kekuatan serang.

🛡️ **Defense** — bantu arah pertahanan.

❤️ **Health** — memperkuat sisi HP.

💨 **Speed** — fokus speed.

🍀 **Luck** — fokus luck.

> 🎯 Jangan merasa harus menaikkan semuanya sekaligus. Pilih stat yang paling masuk akal buat fitur yang paling sering lu mainkan.

-----------------------------------------

<div align="center">

### 💼 WORK + PROFESSION

</div>

```text
.profession
```

Dipakai untuk melihat jalur profession.

Lalu:

```text
.work
```

buat masuk shift kerja.

Sistem kerja di source menyediakan jalur seperti Petani, Koki, Programmer, Dokter, Polisi, Penambang, Nelayan, Blacksmith, dan profesi lainnya.

> 💼 Profession dan work bukan sekadar label. Profile RPG ikut membaca profession sehingga identitas karakter lu juga bisa terasa lebih nyambung.

-----------------------------------------

<div align="center">

### 🗺️ DUNIA RPG: JANGAN CUMA BERKELILING

</div>

Mulai dari:

```text
.worldmap
```

Lanjutkan dengan fitur eksplorasi yang tersedia:

```text
.adventure
.scout
.voyage
.landmark
.survey
.archaeology
.museum
.expedition
.expeditionlog
.outpost
.sanctuary
```

Ada juga jalur khusus seperti:

```text
.campfire
.shrine
.portal
.tower
.ascension
```

🧭 Cara mikirnya:

```text
MAP
 ↓
EXPLORE
 ↓
DISCOVERY
 ↓
REWARD / PROGRESS
 ↓
BUKA JALUR BARU
```

-----------------------------------------

<div align="center">

### ⚔️ COMBAT: JANGAN CUMA LIHAT REWARD

</div>

Combat di RPG bukan cuma “menang dapat hadiah”. Perhatikan juga kondisi HP, stamina, resource, dan risiko aktivitas.

Fitur yang berhubungan langsung dengan pertarungan antara lain:

```text
.arena
.duel
.boss
.bossrush
.gauntlet
.colosseum
.trials
.challenge
.dungeonkey
.dungeonrun
```

👑 **Boss / Boss Rush**

Cocok buat jalur pertarungan dan hadiah lebih besar.

🏟️ **Arena / Duel / Colosseum**

Fokus ke tantangan melawan player atau mode kompetitif tertentu.

🗝️ **Dungeon Key → Dungeon Run**

Jangan lupa bedakan akses dengan run. Keduanya memang dibuat sebagai tahapan berbeda.

-----------------------------------------

<div align="center">

### 🐾 PET: RAWAT, BUKAN CUMA KOLEKSI

</div>

Mulai dari:

```text
.pet
```

Kelanjutannya:

```text
.petshop
.petcare
.petheal
.petbond
.petskill
.pettalent
.petarena
.breeding
```

🐾 Jalurnya bisa dipahami sebagai:

```text
DAPATKAN PET
 ↓
RAWAT
 ↓
NAIKKAN BOND / SKILL
 ↓
KEMBANGKAN
 ↓
GUNAKAN DI FITUR PET
```

-----------------------------------------

<div align="center">

### 🏰 GUILD, NPC & PARTY

</div>

Untuk kelompok:

```text
.guild
.party
.partytrain
```

Untuk NPC:

```text
.npc
.talk
.friendship
.giftnpc
.recruit
```

💬 Jalur sosial cocok buat lu yang pengin RPG terasa punya dunia, bukan sekadar menu transaksi.

-----------------------------------------

<div align="center">

### 💰 EKONOMI: PISAHKAN “UANG MASUK” DAN “UANG BERGUNA”

</div>

Fitur ekonomi:

```text
.shop
.merchant
.market
.auction
.bid
.tradehouse
.transfer
.bank
.loan
.repay
.insurance
.merchantroute
.sellall
.buykoin
```

🪙 **Uang masuk** bisa datang dari pekerjaan, reward, aktivitas, jual item, dan jalur lain.

🛒 **Uang keluar** biasanya dipakai untuk belanja, crafting, transaksi, dan kebutuhan progression.

> ⚠️ Jangan bikin saldo habis hanya karena semua barang terlihat menarik. Simpan sebagian untuk kebutuhan yang memang muncul kemudian.

-----------------------------------------

<div align="center">

### 🎰 FITUR BERISIKO

</div>

Usanagi juga punya fitur yang memakai konsep peluang/risiko:

```text
.casino
.slot
.coinflip
.dice
.lottery
```

Ada juga aksi kriminal:

```text
.rob
.steal
.maling
.crime
```

> 🎲 Anggap semua ini sebagai fitur berisiko, bukan sumber penghasilan yang pasti. Hasilnya memang bisa berubah-ubah sesuai mekanik masing-masing.

-----------------------------------------

<div align="center">

### 🎁 REWARD BERKALA & PROGRESSION

</div>

Hadiah berkala:

```text
.daily
.hourly
.weekly
```

Progression dan pencatatan:

```text
.achievement
.codex
.titles
.reputation
.milestone
.collection
.leaderboard
.journal
```

🌟 Kebiasaan bagus:

```text
CLAIM REWARD
→ CEK PROFILE
→ CEK INVENTORY
→ LIHAT TARGET BERIKUTNYA
```

-----------------------------------------

<div align="center">

### 🧾 BEDAKAN “INFO”, “PROSES”, DAN “HASIL”

</div>

Ini penting supaya lu gak mengira bot mengirim response dua kali tanpa alasan.

📘 **Info**

Contoh: command tanpa parameter, petunjuk, format, daftar pilihan.

⏳ **Proses**

Contoh: `berburu`, `fishing`, `mining`, `training`, `work`, `adventure` sedang berjalan.

🖼️ **Hasil**

Setelah proses selesai, hasil final bisa ditampilkan lewat canvas/UI bila fitur tersebut memang cocok untuk visual.

✅ Jadi alurnya sengaja dibuat seperti:

```text
INPUT
 ↓
VALIDASI
 ↓
PROSES
 ↓
HASIL
```

Bukan:

```text
INPUT
 ↓
SEMUA LANGSUNG JADI GAMBAR
```

-----------------------------------------

<div align="center">

### 📋 DAFTAR FITUR RPG YANG ADA

</div>

> Total plugin RPG yang dibaca dari source Stage V4: **152 fitur**.
> Daftar di bawah dibuat dari command dan description yang memang ada di plugin, jadi bukan tebakan dari nama folder.

### 🧭 Dunia & Petualangan

- 🧭 **`.adventure`** — Masuk ke lokasi acak dan ambil risiko perjalanan untuk mengejar EXP serta koin.
- 🧭 **`.worldmap`** — Lihat peta dunia RPG dan kenali wilayah yang bisa dijelajahi.
- 🧭 **`.scout`** — Lakukan scouting untuk mencari petunjuk atau temuan lapangan.
- 🧭 **`.voyage`** — Jalankan perjalanan laut dan eksplorasi rute perjalanan.
- 🧭 **`.campfire`** — campfire
- 🧭 **`.shrine`** — shrine
- 🧭 **`.portal`** — portal
- 🧭 **`.landmark`** — landmark
- 🧭 **`.survey`** — survey
- 🧭 **`.archaeology`** — archaeology
- 🧭 **`.museum`** — museum
- 🧭 **`.tower`** — tower
- 🧭 **`.ascension`** — ascension
- 🧭 **`.expedition`** — Kirim ekspedisi otomatis untuk mencari item.
- 🧭 **`.expeditionlog`** — expeditionlog
- 🧭 **`.outpost`** — outpost
- 🧭 **`.sanctuary`** — sanctuary

### ⚔️ Battle & Tantangan

- ⚔️ **`.arena`** — Masuk ke arena PvP dan hadapi pemain lain.
- ⚔️ **`.duel`** — Tantang player lain untuk duel dengan taruhan koin.
- ⚔️ **`.boss`** — Hadapi boss untuk mengejar hadiah yang lebih besar.
- ⚔️ **`.bossrush`** — bossrush
- ⚔️ **`.gauntlet`** — gauntlet
- ⚔️ **`.colosseum`** — colosseum
- ⚔️ **`.trials`** — trials
- ⚔️ **`.challenge`** — Tantangan harian untuk hadiah spesial
- ⚔️ **`.dungeonkey`** — Urus akses/kunci dungeon sebelum masuk ke run.
- ⚔️ **`.dungeonrun`** — Jalankan dungeon room-by-room dan hadapi risiko di setiap tahap.
- ⚔️ **`.treasure`** — Buka peti harta untuk hadiah acak.
- ⚔️ **`.lottery`** — Putar gacha/undian untuk mendapat hadiah acak.
- ⚔️ **`.coinflip`** — Tebak heads/tails dan terima hasil taruhan.
- ⚔️ **`.dice`** — Tebak hasil mata dadu dan lihat hasil roll.
- ⚔️ **`.slot`** — Putar mesin slot untuk mengejar kombinasi hadiah.
- ⚔️ **`.casino`** — Buka permainan kasino yang tersedia di sistem RPG.

### 🌾 Gathering & Aktivitas

- 🌾 **`.berburu`** — Masuk hutan, berburu hewan, lalu bawa pulang loot, EXP, dan koin sesuai hasil.
- 🌾 **`.hunt`** — Fitur berburu lain di dunia RPG untuk mencari hasil buruan.
- 🌾 **`.fishing`** — Lempar kail dan cari ikan, udang, gurita, hiu, paus, atau bahkan sampah.
- 🌾 **`.mining`** — Menambang untuk mencari batu, batubara, besi, emas, berlian, dan emerald.
- 🌾 **`.garden`** — Berkebun dan memanen tanaman
- 🌾 **`.berladang`** — Berladang untuk mendapat hasil panen
- 🌾 **`.woodcut`** — Menebang pohon untuk mendapatkan kayu
- 🌾 **`.ranch`** — ranch
- 🌾 **`.milk`** — milk
- 🌾 **`.shear`** — shear
- 🌾 **`.irrigate`** — irrigate
- 🌾 **`.fertilizer`** — fertilizer
- 🌾 **`.baitshop`** — baitshop
- 🌾 **`.trapcraft`** — trapcraft

### 🔨 Crafting, Item & Equipment

- 🔨 **`.inventory`** — Cek isi tas dan kumpulan item yang sudah dimiliki.
- 🔨 **`.use`** — Gunakan consumable atau buka crate sesuai item yang tersedia di inventory.
- 🔨 **`.craft`** — Buat item dari material yang sudah dikumpulkan.
- 🔨 **`.alchemy`** — Racik potion dari herba dan bahan alkimia yang tersedia.
- 🔨 **`.blacksmith`** — Tempa senjata atau armor memakai material yang sesuai.
- 🔨 **`.enchant`** — Tingkatkan equipment dengan enchantment.
- 🔨 **`.refine`** — refine
- 🔨 **`.smelt`** — smelt
- 🔨 **`.tannery`** — tannery
- 🔨 **`.mill`** — mill
- 🔨 **`.salvage`** — salvage
- 🔨 **`.blueprint`** — blueprint
- 🔨 **`.artifactforge`** — artifactforge
- 🔨 **`.relic`** — relic
- 🔨 **`.relicforge`** — relicforge
- 🔨 **`.dismantle`** — dismantle

### 💰 Ekonomi & Perdagangan

- 💰 **`.shop`** — Buka toko, lihat barang, beli item, atau jual barang yang memang diterima toko.
- 💰 **`.merchant`** — Jual beli item ke NPC merchant
- 💰 **`.market`** — market
- 💰 **`.auction`** — auction
- 💰 **`.bid`** — bid
- 💰 **`.tradehouse`** — tradehouse
- 💰 **`.transfer`** — Kirim koin atau item kepada player lain sesuai aturan command.
- 💰 **`.bank`** — Simpan koin di bank agar tidak semuanya berada di saldo yang siap dipakai.
- 💰 **`.loan`** — loan
- 💰 **`.repay`** — repay
- 💰 **`.insurance`** — insurance
- 💰 **`.buykoin`** — Menukar EXP menjadi Koin
- 💰 **`.sellall`** — Menjual semua item yang bisa dijual sekaligus
- 💰 **`.merchantroute`** — merchantroute

### 💼 Kerja & Profesi

- 💼 **`.training`** — Pilih latihan Attack, Defense, Health, Speed, atau Luck lalu pakai stamina untuk menaikkan stat.
- 💼 **`.work`** — Ambil pekerjaan, bayar stamina, lalu dapat gaji dan EXP setelah shift selesai.
- 💼 **`.profession`** — Pilih jalur profesi untuk memberi konteks profesi pada perkembangan karakter.
- 💼 **`.freelance`** — Mengerjakan project freelance online
- 💼 **`.jualan`** — Berdagang asongan keliling
- 💼 **`.ngojek`** — Narik ojek online untuk mendapat uang
- 💼 **`.kurir`** — Mengantar paket, waspada anjing galak
- 💼 **`.parkir`** — Jadi tukang parkir minimarket
- 💼 **`.ngamen`** — Ngamen di jalanan untuk mencari koin
- 💼 **`.ngemis`** — Mengemis dengan peluang dapat nasi bungkus (tambah stamina)
- 💼 **`.mulung`** — Memulung untuk mengumpulkan barang bekas
- 💼 **`.nyapu`** — Menyapu jalan, siapa tahu menemukan barang jatuh
- 💼 **`.nulis`** — Menulis cerpen atau artikel untuk dapat royalti
- 💼 **`.streamer`** — Live streaming untuk mendapat donasi (risiko dibanned)
- 💼 **`.nambalban`** — Membuka jasa tambal ban
- 💼 **`.maling`** — Mencopet orang di pasar (lebih berisiko dari crime)
- 💼 **`.rob`** — Merampok koin player lain (berisiko)
- 💼 **`.steal`** — Mencuri dari NPC untuk gold
- 💼 **`.crime`** — Melakukan kejahatan membobol ATM (risiko tinggi)
- 💼 **`.beg`** — Meminta sedekah di jalanan

### 🎯 Quest, Status & Progression

- 🎯 **`.profile`** — Lihat identitas karakter, level, EXP, koin, HP, mana, stamina, stats, job, pet, guild, buff, dan riwayat aktivitas.
- 🎯 **`.leveluprpg`** — Toggle notifikasi level up RPG
- 🎯 **`.quest`** — Ambil dan selesaikan misi untuk mengejar reward tambahan.
- 🎯 **`.achievement`** — Lihat pencapaian yang sudah dicapai atau dikejar.
- 🎯 **`.codex`** — Buka catatan/codex pengetahuan RPG.
- 🎯 **`.titles`** — Lihat title yang bisa dikoleksi atau dipakai.
- 🎯 **`.milestone`** — milestone
- 🎯 **`.collection`** — Lihat koleksi yang sudah berhasil dikumpulkan.
- 🎯 **`.reputation`** — Cek reputasi yang sudah dibangun di dunia RPG.
- 🎯 **`.journal`** — journal
- 🎯 **`.season`** — Lihat musim aktif dan bonus yang sedang berjalan.
- 🎯 **`.weather`** — Lihat kondisi cuaca dunia RPG.
- 🎯 **`.daily`** — Klaim hadiah harian.
- 🎯 **`.hourly`** — Klaim hadiah per jam saat cooldown sudah selesai.
- 🎯 **`.weekly`** — Klaim hadiah mingguan yang nilainya lebih besar dari daily.
- 🎯 **`.bountyboard`** — bountyboard
- 🎯 **`.bountyclaim`** — bountyclaim

### 🐾 Pet, Guild & Sosial

- 🐾 **`.pet`** — Lihat dan kelola pet yang sudah dimiliki.
- 🐾 **`.petshop`** — Lihat dan beli pet dari toko pet.
- 🐾 **`.breeding`** — Breeding pet untuk mendapat pet baru
- 🐾 **`.petcare`** — petcare
- 🐾 **`.petheal`** — petheal
- 🐾 **`.petbond`** — petbond
- 🐾 **`.petskill`** — petskill
- 🐾 **`.pettalent`** — pettalent
- 🐾 **`.petarena`** — Bawa pet ke arena khusus pet.
- 🐾 **`.guild`** — Kelola atau ikut sistem guild/clan dan bangun progres bersama anggota.
- 🐾 **`.marry`** — Menikahi player lain dan membuka jalur sosial pasangan.
- 🐾 **`.divorce`** — Mengakhiri hubungan pasangan.
- 🐾 **`.gift`** — Kirim hadiah ke pasangan untuk meningkatkan hubungan.
- 🐾 **`.npc`** — npc
- 🐾 **`.talk`** — talk
- 🐾 **`.friendship`** — friendship
- 🐾 **`.giftnpc`** — giftnpc
- 🐾 **`.recruit`** — recruit
- 🐾 **`.party`** — party
- 🐾 **`.partytrain`** — partytrain

### 🍳 Masak & Recovery

- 🍳 **`.cook`** — Memasak makanan otomatis untuk menambah health
- 🍳 **`.cooking`** — Memasak resep untuk stamina, HP, dan mana
- 🍳 **`.heal`** — Memulihkan HP dan stamina dengan istirahat gratis
- 🍳 **`.meditation`** — Bermeditasi untuk memulihkan HP, mana, dan stamina
- 🍳 **`.stamina`** — Cek dan memulihkan stamina
- 🍳 **`.tavern`** — tavern
- 🍳 **`.inn`** — inn
- 🍳 **`.library`** — library
- 🍳 **`.study`** — study

### 🎉 Event & Lifestyle

- 🎉 **`.eventboard`** — eventboard
- 🎉 **`.eventjoin`** — eventjoin
- 🎉 **`.eventscore`** — eventscore
- 🎉 **`.eventredeem`** — eventredeem
- 🎉 **`.festival`** — festival
- 🎉 **`.house`** — house
- 🎉 **`.furnish`** — furnish


-----------------------------------------

<div align="center">

### 🧪 TIPS MAIN BIAR GAK BERANTAKAN

</div>

**🧠 01 — Cek kondisi dulu**

```text
.rpgprofile
```

**🎒 02 — Cek resource**

```text
.inventory
```

**⚡ 03 — Jangan habiskan stamina di satu fitur**

Campur aktivitas supaya progres lu tetap fleksibel.

**🪙 04 — Jangan jual semua bahan**

Lihat kemungkinan crafting sebelum `sellall`.

**⚔️ 05 — Jangan buru-buru battle berat**

Pastikan kondisi karakter masuk akal dulu.

**🧭 06 — Pakai world feature buat memperluas progres**

Jangan berhenti di work dan shop saja.

**🐾 07 — Rawat pet**

Kalau lu sudah masuk jalur pet, lanjutkan ke bond/skill/talent.

**🏆 08 — Kejar achievement dan milestone**

Biar progres gak cuma terasa dari jumlah koin.

-----------------------------------------

<div align="center">

### 🛠️ SAAT ADA MASALAH

</div>

**Command gak kebaca**

> Cek prefix. Contoh dokumentasi ini memakai `.`.

**Fitur minta parameter**

> Jalankan command dasarnya dulu supaya bot menunjukkan format pemakaian.

**Cooldown masih aktif**

> Tunggu sampai waktunya selesai. Jangan spam command yang sama.

**Stamina habis**

> Pakai jalur recovery seperti `heal`, `meditation`, atau recovery lain yang memang tersedia.

**Inventory terasa aneh**

> Cek `.inventory` dan pastikan item yang mau dipakai memang ada.

**Hasil aktivitas belum muncul**

> Bedakan proses dengan hasil final. Fitur bertimer memang menyelesaikan proses dulu baru menampilkan hasil akhir.

-----------------------------------------

<div align="center">

### 💜 PENUTUP

</div>

> Lu gak harus hafal semua command.
> Yang penting ngerti hubungan antar fiturnya.
>
> Kalau sudah paham **Profile → Resource → Aktivitas → Inventory → Economy → Progression → Battle**, sebagian besar sistem RPG Usanagi bakal jauh lebih gampang dipahami.

**SELAMAT NGE-RPG. PELAN-PELAN, YANG PENTING PROGRES. 😁🗿**

-----------------------------------------

By AlzRiss - Usanagi Umi AI
