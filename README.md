# 🍄 THE ORDER DISASTER! (Digital Drag & Drop + Fix the BPMN Bug)
> **Game Edukasi Interaktif BPMN dengan Gaya Retro 8-Bit Super Mario Bros untuk Smartboard & Touchscreen**

---

## 🎮 Konsep Permainan
Pemain (kelompok mahasiswa / siswa di depan Smartboard) dihadapkan pada alur proses bisnis yang **kacau balau (The Disaster)**. Tugas mereka adalah berkolaborasi di depan layar sentuh untuk:
1. **Menyusun urutan alur aktivitas yang logis** (Drag & Drop atau Smartboard Tap-to-Swap).
2. **Memilih simbol standar BPMN 2.0 yang benar** (Circle = Start/End Event, Box = Activity/Task, Diamond = Gateway Decision).
3. **Menguji alur dengan tombol "RUN & VERIFY FLOW!"**: Karakter Mario 8-bit akan berlari melintasi alur pipa proses bisnis. Jika terdapat bug, Mario akan menabrak rintangan dan sistem memberikan diagnosa kesalahan. Jika alur 100% benar, Mario melompat meraih tiang bendera, kembang api meletus, dan tim mendapatkan skor efisiensi 100%!

---

## ⏱️ Alur Sesi Permainan (Sesuai Format 6 Menit)

| Waktu | Tahap | Deskripsi & Aktivitas |
|---|---|---|
| **Menit 0 – 1** | **Briefing Kilat BPMN** | Pop-up modal interaktif menjelaskan 3 simbol kunci: 🟢 Circle (Start/End), 🟦 Box (Task), 🔶 Diamond (Gateway XOR). |
| **Menit 1 – 4.5** | **Kolaborasi & Perbaikan Alur** | Tim berdiskusi & memindahkan kartu di Smartboard. Tersedia petunjuk bug (tombol `[?] HINT`), visualisasi slot pipa, dan tombol ganti simbol cepat. |
| **Menit 4.5 – 6** | **Check & Reveal / Verifikasi** | Tekan **"RUN & VERIFY FLOW!"**. Karakter Mario melakukan simulasi pengetesan proses. Fasilitator dapat menekan **"BUKA SOLUSI"** untuk review kunci alur bersama kelas. |

---

## 🌟 5 Skenario Bencana Proses Bisnis (The 5 Disaster Worlds)

### LEVEL 1: PEMULA (Dasar Start Event, Task Verb-Object, & End Event)
1. **WORLD 1-1: Kedai Kopi Mario Drive-Thru**
   - *Kekacauan:* Barista menuangkan kopi panas ke cup sebelum kasir menginput pesanan, dan kasir menagih pembayaran setelah mobil pergi.
   - *Simbol:* ○ Start Event ➔ ▢ Task Input Menu ➔ ◇ Exclusive Gateway (XOR: Tunai?) ➔ ▢ Task Racik Kopi ➔ ▢ Task Tuang Cup ➔ ● End Event.
2. **WORLD 1-2: Boba Milk Tea Tumpah Berantakan!**
   - *Kekacauan:* Pelanggan diberi sedotan sebelum cup disegel plastik! Koki memasak boba setelah pelanggan pulang, dan kasir minta bayar sebelum menu dicatat!
   - *Simbol:* ○ Start Event ➔ ▢ Task Input Pesanan Boba ➔ ◇ Exclusive Gateway (XOR: Topping?) ➔ ▢ Task Racik Teh Boba ➔ ▢ Task Segel Cup Minuman ➔ ● End Event.

### LEVEL 2: MENENGAH (Cross-Lane Handover & Quality Control)
3. **WORLD 2-1: Dapur Burger Mario Terbakar!**
   - *Kekacauan:* Koki membungkus kertas kosong dengan kantong plastik sebelum daging digoreng.
   - *Simbol:* ○ Start Event ➔ ▢ Input Pesanan Kiosk ➔ ◇ Exclusive Gateway (XOR: Cek Stok) ➔ ▢ Panggang Daging Patty ➔ ▢ Kemas Burger Rapi ➔ ● End Event.
4. **WORLD 2-2: Ramen Panas Tanpa Kuah!**
   - *Kekacauan:* Pelanggan sudah menyeruput mangkuk padahal kuah kaldu belum disiram, dan kasir belum mencetak struk tagihan!
   - *Simbol:* ○ Start Event ➔ ▢ Pilih Menu Ramen ➔ ◇ Exclusive Gateway (XOR: Level Pedas?) ➔ ▢ Rebus Mi Ramen ➔ ▢ Tuang Kaldu Panas ➔ ● End Event.

### LEVEL 3: BOSS STAGE / ADVANCED (BPMN 2.0 Parallel Execution & Timer Event)
5. **WORLD 3-1: Operasi Kilat Luigi Pizza Delivery (10 Langkah)**
   - *Kekacauan:* Driver kurir nongkrong menunggu pizza selesai, padahal harusnya menyiapkan thermal bag & rute secara **paralel bersamaan** selagi koki memanggang pizza di oven!
   - *Penerapan Nyata:*
     - **AND Split (+)** memecah proses menjadi dua jalur serentak:
       - **Jalur Dapur:** ▢ Panggang Adonan Pizza ➔ ◎ Intermediate Timer Event (⏱ Tunggu 15 Menit Oven).
       - **Jalur Kurir (Serentak):** ▢ Siapkan Armada & Rute.
     - **AND Join (+)** menyatukan kembali kedua alur setelah pizza matang DAN kurir siap berangkat!
     - Dilanjutkan dengan ▢ Kemas Kotak Pizza ➔ ▢ Antar Pizza ke Alamat ➔ ● Pesanan Selesai Diterima.

---

## 🌟 Fitur Visualisasi BPMN 2.0: Pool & Swimlanes Live Engine
Game ini sekarang dilengkapi dengan **Live BPMN 2.0 Pool & Swimlane Visualizer** berstandar internasional:
1. **Pool Header (Vertical Bar)**: Menampilkan nama organisasi/proses bisnis (misal: `POOL: KEDAI KOPI MARIO EXPRESS`).
2. **Swimlane Rows (Horizontal Lanes)**:
   - Menampilkan peran operasional (*Actors / Roles*) nyata:
     - 👤 **Lane Pelanggan (Customer)**: Titik mula (*Start Event*) dan serah terima akhir (*End Event*).
     - 💳 **Lane Kasir & POS System**: Pencatatan menu (*Task*) dan keputusan cara bayar Tunai vs QRIS (*Gateway XOR*).
     - ☕ **Lane Barista / Dapur**: Peracikan bahan (*Task*) dan penuangan ke cup (*Task*).
3. **Orthogonal Sequence Flow Connectors (SVG Panah Dinamis)**:
   - Garis panah sequence flow BPMN standar menghubungkan satu aktivitas ke aktivitas berikutnya.
   - Jika alur berpindah departemen/peran (misal dari Pelanggan ke Kasir, atau Kasir ke Barista), panah otomatis berbelok orthogonal melintasi swimlane dengan label `➔ CROSS-LANE`.
   - Menampilkan status alur: hijau solid jika urutan tepat, atau garis putus-putus merah `⚠️ BUG` jika terjadi lompatan logika bisnis.
4. **Mario Cross-Lane Path Runner**:
   - Mario 8-bit bergerak langsung **melintasi diagram BPMN di dalam swimlane** dari node ke node!
   - Jika terjadi bug pada suatu lane, Mario menabrak rintangan di swimlane tersebut dan memunculkan balon dialog komik retro yang menjelaskan kesalahan spesifik departemen tersebut.

---

## 👆 Fitur Unggulan Smartboard & Layar Sentuh
- **Dual Interaction Mode**:
  - **HTML5 Drag & Drop**: Tarik dan geser kartu balok antar slot.
  - **Smartboard Tap-to-Swap**: Sentuh kartu A (bercahaya biru), lalu sentuh kartu B untuk langsung bertukar posisi secara mulus (menghindari masalah drag yang tersendat pada beberapa tipe smartboard).
- **Quick Symbol Popover**: Klik badge simbol pada tiap kartu untuk memilih:
  - 🟢 **Start Event** (Circle tipis)
  - 🟦 **Activity / Task** (Kotak melengkung)
  - 🔶 **Exclusive Gateway** (Belah ketupat keputusan)
  - 🔴 **End Event** (Circle tebal merah)
- **Retro Chiptune Sound Synthesizer (Web Audio API)**:
  - Efek lompatan Mario (Jump SFX), suara koin `[🪙]`, powerup, tabrakan rintangan (Bump/Hit SFX), jingle kemenangan *Course Clear Fanfare*, dan BGM chiptune Mario.
  - 100% tanpa file MP3 eksternal (menggunakan Web Audio API sintetis), bebas CORS, dan langsung bersuara secara instan.
- **Teacher / Facilitator Toolbar**:
  - Tombol **⏱️ +1 MENIT** (Menambah waktu jika diskusi kelas sedang seru).
  - Tombol **⏸ PAUSE / RESUME** timer.
  - Tombol **💡 BUKA SOLUSI** (Check & Reveal instan untuk sesi evaluasi bersama).
  - Tombol **⤢ FULLSCREEN** (Tampilan layar penuh interaktif untuk proyektor/smartboard).

---

## ⌨️ Shortcut Keyboard untuk Presenter
- `Spasi` : Jalankan pengetesan (**RUN & VERIFY FLOW**)
- `M` : Mute / Unmute Efek Suara
- `B` : Toggle Musik Latar (BGM)
- `R` : Reset Balok Alur
- `F` : Layar Penuh (Fullscreen)
- `Esc` : Tutup Modal / Popover

---

## 📁 Struktur Direktori Proyek

```text
Bedah Lab/
├── assets/                  # Seluruh aset gambar, favicon, dan ikon web
│   ├── favicon.ico          # Favicon multi-resolusi
│   ├── favicon.png          # Favicon PNG 32x32
│   ├── favicon.svg          # Favicon SVG pixel art Super Mushroom
│   └── apple-touch-icon.png # Icon perangkat mobile & iOS
├── css/                     # Berkas styling stylesheet
│   └── style.css            # Stylesheet utama, visualizer swimlane, retro 8-bit & responsive
├── js/                      # Seluruh logika JavaScript & script aplikasi
│   ├── audio.js             # Web Audio API 8-bit retro sound synthesizer (SFX & BGM)
│   ├── bpmn-data.js         # Master data 5 skenario kasus, aturan BPMN, & kunci evaluasi
│   ├── bpmn-diagram.js      # BPMN 2.0 Pool, Swimlane, Orthogonal Arrows, & Mario runner
│   ├── game.js              # State machine game, interaksi drag-swap, timer, & popovers
│   └── mario-canvas.js      # Modul animasi pixel retro
├── index.html               # Halaman utama aplikasi (Single Page Application)
├── package.json             # Konfigurasi npm & preview scripts
├── vercel.json              # Konfigurasi deployment Vercel (routing, headers, caching)
├── .gitignore               # Aturan ignore file git & build cache
└── README.md                # Dokumentasi lengkap proyek
```

---

## 🚀 Cara Menjalankan & Deploy

### A. Menjalankan di Komputer Lokal
1. Bisa langsung dibuka di browser apa pun:
   - Klik ganda file [index.html](file:///c:/Users/kayla/Documents/Side%20Project/Bedah%20Lab/index.html) di Google Chrome, Microsoft Edge, atau browser Smartboard.
2. Atau jalankan via server lokal:
   ```bash
   npm start
   # atau
   npx serve -l 3000
   ```
   Lalu buka `http://localhost:3000`.

---

### 🌐 B. Deploy ke Vercel (Gratis & Cepat)

Project ini sudah dilengkapi konfigurasi [vercel.json](file:///c:/Users/kayla/Documents/Side%20Project/Bedah%20Lab/vercel.json) dan [package.json](file:///c:/Users/kayla/Documents/Side%20Project/Bedah%20Lab/package.json), sehingga 100% siap dideploy ke Vercel:

#### Opsi 1: Lewat Git / GitHub (Direkomendasikan)
1. Push project ini ke repository GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: ready for Vercel deployment"
   git push origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com) dan klik **"Add New..."** ➔ **"Project"**.
3. Pilih repository GitHub Anda, lalu klik **"Import"**.
4. Biarkan konfigurasi default (Framework Preset: **Other** / Static).
5. Klik **"Deploy"** — web game langsung aktif dengan domain gratis seperti `https://the-order-disaster.vercel.app`!

#### Opsi 2: Langsung Menggunakan Vercel CLI
Jalankan perintah ini di terminal:
```bash
npx vercel
```
Ikuti instruksi login dan konfirmasi di terminal, project akan langsung ter-deploy dalam beberapa detik. Untuk deploy langsung ke production:
```bash
npx vercel --prod
```

---

## 📄 Lisensi & Hak Cipta
© 2026 **The Order Disaster!** • All Rights Reserved by **Kayla Putri Maharani**.

