/**
 * BPMN Game Scenarios & Educational Data
 * "The Order Disaster!" (Digital Drag & Drop + Fix the Bug)
 * 5 Complete Cases: 2 Level 1 (Beginner), 2 Level 2 (Intermediate), 1 Level 3 (Boss)
 */

const BPMN_SYMBOLS = {
  START: {
    id: 'start',
    name: 'Start Event',
    shortLabel: 'Start',
    shape: 'Lingkaran Garis Tipis',
    color: '#22c55e',
    icon: '○',
    svgType: 'circle-start',
    description: 'Pemicu dimulainya proses bisnis (Trigger kedatangan pelanggan atau pesan masuk).'
  },
  TASK: {
    id: 'task',
    name: 'Task (Aktivitas)',
    shortLabel: 'Task',
    shape: 'Kotak Rounded (Verb-Object)',
    color: '#3b82f6',
    icon: '▢',
    svgType: 'box-task',
    description: 'Unit kerja terkecil berformat Kata Kerja + Objek (Verb-Object), misal: "Input Menu Pesanan".'
  },
  GATEWAY: {
    id: 'gateway',
    name: 'Exclusive Gateway (XOR)',
    shortLabel: 'XOR',
    shape: 'Belah Ketupat (✕)',
    color: '#eab308',
    icon: '◇',
    svgType: 'diamond-gateway',
    description: 'Percabangan keputusan eksklusif: hanya satu jalur alternatif yang dipilih berdasarkan kondisi.'
  },
  PARALLEL: {
    id: 'parallel',
    name: 'Parallel Gateway (AND)',
    shortLabel: 'AND',
    shape: 'Belah Ketupat (+)',
    color: '#eab308',
    icon: '◇',
    svgType: 'diamond-gateway',
    description: 'Percabangan paralel: menjalankan dua atau lebih aktivitas secara serentak/bersamaan.'
  },
  TIMER: {
    id: 'timer',
    name: 'Intermediate Timer Event',
    shortLabel: 'Timer',
    shape: 'Lingkaran Ganda (⏱)',
    color: '#8b5cf6',
    icon: '◎',
    svgType: 'circle-timer',
    description: 'Menahan alur proses hingga jeda waktu atau durasi tertentu tercapai (contoh: tunggu oven 15 menit).'
  },
  END: {
    id: 'end',
    name: 'End Event',
    shortLabel: 'End',
    shape: 'Lingkaran Garis Tebal',
    color: '#ef4444',
    icon: '●',
    svgType: 'circle-end',
    description: 'Titik akhir proses saat seluruh siklus pekerjaan berhasil diselesaikan.'
  }
};

const DISASTER_LEVELS = [
  // =========================================================================
  // LEVEL 1: PEMULA (2 KASUS)
  // =========================================================================
  {
    id: 'kopi-drivethru',
    levelTier: 1,
    tierLabel: 'LEVEL 1: PEMULA',
    world: 'WORLD 1-1',
    title: 'Kopi Drive-Thru Bikin Bangkrut!',
    theme: 'Kedai Kopi Mario Express',
    difficulty: 'Mudah / Pemula',
    timeLimit: 300, // 5 menit
    story: 'Kekacauan total di Drive-thru! Barista menuang espresso ke meja kosong sebelum kasir menerima pesanan pelanggan, dan kasir minta bayaran saat mobil sudah pergi!',
    narrative: 'Proses bisnis dimulai ketika Mobil Pelanggan Tiba di konter pemesanan drive-thru. Kasir segera mencatat pesanan dengan Input Menu Pesanan pada sistem POS. Selanjutnya, kasir mengevaluasi pilihan cara bayar via gateway Metode Bayar Tunai? untuk menentukan pembayaran tunai atau QRIS. Setelah divalidasi, pesanan diteruskan ke Barista untuk memproses Racik Kopi Espresso. Barista kemudian melakukan Tuang Kopi Kemasan ke cup tahan panas. Alur proses berakhir tuntas saat Kopi Diterima Pelanggan di loket pengambilan.',
    
    pool: {
      name: 'POOL: KEDAI KOPI MARIO EXPRESS',
      subtitle: 'Alur Bisnis Pesan Kopi Drive-Thru'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan (Customer)', icon: '👤', role: 'Pembeli Drive-Thru', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'cashier', name: 'Kasir & POS System', icon: '💳', role: 'Input Menu & Transaksi', bg: '#fffbeb', border: '#d97706' },
      { id: 'barista', name: 'Barista (Dapur Racik)', icon: '☕', role: 'Produksi Kopi Espresso', bg: '#f0fdf4', border: '#16a34a' }
    ],

    initialCards: [
      {
        id: 'c3',
        text: 'Tuang Kopi Kemasan',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Menuang kopi adalah Task di Lane Barista, bukan Start Event di tangan pelanggan!'
      },
      {
        id: 'c1',
        text: 'Mobil Pelanggan Tiba',
        currentSymbol: 'task',
        laneId: 'cashier',
        bugNote: 'Titik awal kedatangan pelanggan harusnya Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'c5',
        text: 'Metode Bayar Tunai?',
        currentSymbol: 'task',
        laneId: 'cashier',
        bugNote: 'Pilihan cara bayar Tunai vs QRIS adalah Exclusive Gateway (XOR ◇), bukan task biasa!'
      },
      {
        id: 'c2',
        text: 'Input Menu Pesanan',
        currentSymbol: 'end',
        laneId: 'barista',
        bugNote: 'Input menu berformat Verb-Object adalah Task (▢) di Lane Kasir, bukan End Event di dapur!'
      },
      {
        id: 'c6',
        text: 'Kopi Diterima Pelanggan',
        currentSymbol: 'gateway',
        laneId: 'barista',
        bugNote: 'Hasil akhir saat kopi diserahkan adalah End Event (●) di Lane Pelanggan!'
      },
      {
        id: 'c4',
        text: 'Racik Kopi Espresso',
        currentSymbol: 'task',
        laneId: 'barista',
        bugNote: 'Barista meracik kopi setelah kasir selesai input pesanan dan konfirmasi pembayaran.'
      }
    ],

    correctSequence: ['c1', 'c2', 'c5', 'c4', 'c3', 'c6'],

    correctSymbols: {
      'c1': 'start',   // Mobil Pelanggan Tiba (Start Event)
      'c2': 'task',    // Input Menu Pesanan (Task: Verb-Object)
      'c5': 'gateway', // Metode Bayar Tunai? (Exclusive Gateway XOR)
      'c4': 'task',    // Racik Kopi Espresso (Task: Verb-Object)
      'c3': 'task',    // Tuang Kopi Kemasan (Task: Verb-Object)
      'c6': 'end'      // Kopi Diterima Pelanggan (End Event)
    },

    correctLanes: {
      'c1': 'customer',
      'c2': 'cashier',
      'c5': 'cashier',
      'c4': 'barista',
      'c3': 'barista',
      'c6': 'customer'
    },

    explanations: {
      'c1': 'Langkah 1: Kedatangan pelanggan memicu alur proses di Lane Pelanggan (○ Start Event).',
      'c2': 'Langkah 2: Kasir mencatat pesanan format Verb-Object di Lane Kasir (▢ Task: Input Menu Pesanan).',
      'c5': 'Langkah 3: Kasir mengevaluasi pilihan metode bayar di Lane Kasir (◇ Exclusive Gateway XOR: Metode Bayar Tunai?).',
      'c4': 'Langkah 4: Barista memproses peracikan kopi di Lane Barista (▢ Task: Racik Kopi Espresso).',
      'c3': 'Langkah 5: Barista menuang kopi ke kemasan tahan panas di Lane Barista (▢ Task: Tuang Kopi Kemasan).',
      'c6': 'Langkah 6: Pelanggan menerima kopi panas, siklus transaksi selesai di Lane Pelanggan (● End Event: Kopi Diterima Pelanggan).'
    }
  },

  {
    id: 'boba-drink',
    levelTier: 1,
    tierLabel: 'LEVEL 1: PEMULA',
    world: 'WORLD 1-2',
    title: 'Boba Milk Tea Tumpah Berantakan!',
    theme: 'Peach Boba Milk Tea Lab',
    difficulty: 'Mudah / Pemula',
    timeLimit: 300,
    story: 'Pelanggan diberi sedotan sebelum gelas boba disegel plastik! Koki memasak boba setelah pelanggan pulang, dan kasir minta bayar sebelum menu dicatat!',
    narrative: 'Proses bisnis diawali saat Pembeli Tiba Antre di depan konter boba. Petugas kasir melayani dengan Input Pesanan Boba ke mesin kasir. Kasir kemudian mengajukan pilihan evaluasi via gateway Tambah Topping Puding? untuk menyesuaikan racikan. Di area dapur, koki melakukan Racik Teh Boba sesuai tingkat kemanisan yang dipesan. Gelas boba yang telah terisi diproses ke mesin untuk Segel Cup Minuman agar tertutup rapat dan higienis. Siklus proses bisnis selesai tuntas saat Boba Diterima Pembeli.',
    
    pool: {
      name: 'POOL: PEACH BOBA MILK TEA LAB',
      subtitle: 'Alur Bisnis Pembuatan Minuman Boba'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan Boba', icon: '🧋', role: 'Konsumen Pembeli', bg: '#fdf2f8', border: '#db2777' },
      { id: 'cashier', name: 'Kasir Pemesanan', icon: '🧾', role: 'Pencatatan Order & Kasir', bg: '#fffbeb', border: '#d97706' },
      { id: 'kitchen', name: 'Koki Racik Dapur', icon: '👩‍🍳', role: 'Pengocok Teh & Sealer Cup', bg: '#f0fdf4', border: '#16a34a' }
    ],

    initialCards: [
      {
        id: 'a5',
        text: 'Segel Cup Minuman',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Menyegel cup plastik adalah Task di Dapur, bukan Start Event di tangan pembeli!'
      },
      {
        id: 'a1',
        text: 'Pembeli Tiba Antre',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Titik kedatangan pembeli harus Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'a4',
        text: 'Racik Teh Boba',
        currentSymbol: 'end',
        laneId: 'cashier',
        bugNote: 'Meracik teh boba adalah Task di Dapur, bukan penutup akhir proses!'
      },
      {
        id: 'a3',
        text: 'Tambah Topping Puding?',
        currentSymbol: 'task',
        laneId: 'cashier',
        bugNote: 'Pertanyaan kondisi topping tambahan adalah Exclusive Gateway (XOR ◇)!'
      },
      {
        id: 'a2',
        text: 'Input Pesanan Boba',
        currentSymbol: 'gateway',
        laneId: 'kitchen',
        bugNote: 'Input pesanan berformat Verb-Object adalah Task (▢) di Lane Kasir!'
      },
      {
        id: 'a6',
        text: 'Boba Diterima Pembeli',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Penyerahan akhir ke pembeli adalah End Event (●) di Lane Pelanggan!'
      }
    ],

    correctSequence: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],

    correctSymbols: {
      'a1': 'start',   // Pembeli Tiba Antre (Start Event)
      'a2': 'task',    // Input Pesanan Boba (Task: Verb-Object)
      'a3': 'gateway', // Tambah Topping Puding? (Exclusive Gateway XOR)
      'a4': 'task',    // Racik Teh Boba (Task: Verb-Object)
      'a5': 'task',    // Segel Cup Minuman (Task: Verb-Object)
      'a6': 'end'      // Boba Diterima Pembeli (End Event)
    },

    correctLanes: {
      'a1': 'customer',
      'a2': 'cashier',
      'a3': 'cashier',
      'a4': 'kitchen',
      'a5': 'kitchen',
      'a6': 'customer'
    },

    explanations: {
      'a1': 'Langkah 1: Pembeli datang ke outlet memicu alur di Lane Pelanggan (○ Start Event).',
      'a2': 'Langkah 2: Kasir mencatat pesanan di Lane Kasir (▢ Task: Input Pesanan Boba).',
      'a3': 'Langkah 3: Kasir mengevaluasi pilihan topping ekstra di Lane Kasir (◇ Exclusive Gateway XOR).',
      'a4': 'Langkah 4: Dapur meracik teh susu dan boba hangat di Lane Koki (▢ Task: Racik Teh Boba).',
      'a5': 'Langkah 5: Minuman ditutup rapat dengan mesin cup sealer di Lane Koki (▢ Task: Segel Cup Minuman).',
      'a6': 'Langkah 6: Pembeli menerima pesanan boba siap minum di Lane Pelanggan (● End Event: Boba Diterima Pembeli).'
    }
  },

  // =========================================================================
  // LEVEL 2: MENENGAH (2 KASUS)
  // =========================================================================
  {
    id: 'burger-kitchen',
    levelTier: 2,
    tierLabel: 'LEVEL 2: MENENGAH',
    world: 'WORLD 2-1',
    title: 'Dapur Burger Hangus Terbakar!',
    theme: 'Mario Fast-Food Burger Lab',
    difficulty: 'Menengah',
    timeLimit: 300,
    story: 'Koki membungkus kertas kosong dengan kantong plastik sebelum dagingnya digoreng! Dapur berasap dan pelanggan menunggu 2 jam!',
    narrative: 'Proses operasional terpicu ketika Pesanan Kiosk Dimulai di layar mandiri restoran. Pelanggan melakukan Pilih Paket Burger pada menu kiosk. Sistem POS secara otomatis mengevaluasi gateway Bahan Patty Tersedia? untuk memastikan persediaan daging mencukupi. Setelah divalidasi, koki dapur bergegas Panggang Daging Patty hingga matang merata di grill. Koki kemudian melakukan Kemas Paket Burger rapi dengan kertas pembungkus tahan minyak. Alur proses selesai saat Burger Diterima Pelanggan di loket pengambilan.',
    
    pool: {
      name: 'POOL: MARIO FAST-FOOD BURGER LAB',
      subtitle: 'Alur Bisnis Pemesanan & Dapur Kiosk'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan (Kiosk Layar Sentuh)', icon: '👤', role: 'Pemesanan Mandiri', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'pos', name: 'Sistem POS & Inventory', icon: '💻', role: 'Validasi Stok & Kasir', bg: '#fffbeb', border: '#d97706' },
      { id: 'kitchen', name: 'Koki Dapur (Kitchen Cook)', icon: '👨‍🍳', role: 'Pemanggangan & Packaging', bg: '#f0fdf4', border: '#16a34a' }
    ],

    initialCards: [
      {
        id: 'b4',
        text: 'Kemas Paket Burger',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Mengemas burger adalah Task di Dapur, bukan Start Event di tangan pelanggan!'
      },
      {
        id: 'b1',
        text: 'Pesanan Kiosk Dimulai',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Awal mula transaksi di layar sentuh adalah Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'b3',
        text: 'Panggang Daging Patty',
        currentSymbol: 'end',
        laneId: 'kitchen',
        bugNote: 'Memanggang patty daging adalah Task operasional dapur, bukan End Event!'
      },
      {
        id: 'b2',
        text: 'Stok Bahan Cukup?',
        currentSymbol: 'task',
        laneId: 'customer',
        bugNote: 'Pemeriksaan stok Ya/Tidak adalah Exclusive Gateway (XOR ◇) di Sistem POS!'
      },
      {
        id: 'b5',
        text: 'Inspeksi Kematangan Burger',
        currentSymbol: 'gateway',
        laneId: 'pos',
        bugNote: 'Pemeriksaan QC kematangan berformat Verb-Object adalah Task (▢) di Lane Dapur!'
      },
      {
        id: 'b6',
        text: 'Burger Diterima Pelanggan',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Penyerahan akhir dan selesainya order harus ditandai End Event (●) di Lane Pelanggan!'
      }
    ],

    correctSequence: ['b1', 'b2', 'b3', 'b5', 'b4', 'b6'],

    correctSymbols: {
      'b1': 'start',   // Pesanan Kiosk Dimulai (Start Event)
      'b2': 'gateway', // Stok Bahan Cukup? (Exclusive Gateway XOR)
      'b3': 'task',    // Panggang Daging Patty (Task: Verb-Object)
      'b5': 'task',    // Inspeksi Kematangan Burger (Task: Verb-Object)
      'b4': 'task',    // Kemas Paket Burger (Task: Verb-Object)
      'b6': 'end'      // Burger Diterima Pelanggan (End Event)
    },

    correctLanes: {
      'b1': 'customer',
      'b2': 'pos',
      'b3': 'kitchen',
      'b5': 'kitchen',
      'b4': 'kitchen',
      'b6': 'customer'
    },

    explanations: {
      'b1': 'Langkah 1: Pembeli menyentuh layar kiosk untuk memulai pesanan (○ Start Event di Lane Pelanggan).',
      'b2': 'Langkah 2: Sistem POS mengevaluasi ketersediaan stok bahan baku (◇ Exclusive Gateway XOR di Lane POS).',
      'b3': 'Langkah 3: Koki memanggang patty daging sapi di grill (▢ Task: Panggang Daging Patty di Lane Dapur).',
      'b5': 'Langkah 4: Koki menginspeksi kematangan dan saus (▢ Task: Inspeksi Kematangan Burger di Lane Dapur).',
      'b4': 'Langkah 5: Koki membungkus burger rapi ke kantong pesan (▢ Task: Kemas Paket Burger di Lane Dapur).',
      'b6': 'Langkah 6: Makanan diserahkan hangat ke pelanggan (● End Event: Burger Diterima Pelanggan).'
    }
  },

  {
    id: 'apotek-obat',
    levelTier: 2,
    tierLabel: 'LEVEL 2: MENENGAH',
    world: 'WORLD 2-2',
    title: 'Apotek Obat Kilat Malpraktik!',
    theme: 'Toad Pharmacy & Clinic',
    difficulty: 'Menengah',
    timeLimit: 300,
    story: 'Apoteker menyerahkan obat keras sebelum dokter memverifikasi resep! Pasien disuruh meracik kapsul sendiri di ruang tunggu!',
    narrative: 'Proses bisnis bermula saat Pasien Serahkan Resep ke petugas loket penerimaan apotek. Dokter atau verifikator medis menjalankan Verifikasi Resep Dokter untuk memeriksa kecocokan dosis dan riwayat alergi. Sistem kemudian mengevaluasi kondisi gateway Stok Obat Tersedia? untuk memastikan ketersediaan bahan farmasi. Setelah terkonfirmasi lengkap, apoteker di laboratorium racik melakukan Racik Kapsul Obat dengan takaran presisi. Apoteker lalu Cetak Etiket Dosis pada bungkus obat sebelum diserahkan. Siklus layanan farmasi tuntas saat Obat Diterima Pasien di loket penyerahan.',
    
    pool: {
      name: 'POOL: TOAD PHARMACY & HEALING LAB',
      subtitle: 'Alur Bisnis Penebusan Resep Obat Farmasi'
    },
    lanes: [
      { id: 'patient', name: 'Pasien / Pembeli', icon: '🤒', role: 'Konsumen Resep', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'doctor', name: 'Dokter / Verifikator Medis', icon: '🩺', role: 'Pemeriksaan Resep & Alergi', bg: '#fef3c7', border: '#d97706' },
      { id: 'pharmacist', name: 'Apoteker Racik Obat', icon: '💊', role: 'Peracikan & Etiket Dosis', bg: '#f0fdf4', border: '#16a34a' }
    ],

    initialCards: [
      {
        id: 'd4',
        text: 'Racik Kapsul Obat',
        currentSymbol: 'start',
        laneId: 'patient',
        bugNote: 'Meracik kapsul adalah Task di Lane Apoteker, bukan Start Event di tangan pasien!'
      },
      {
        id: 'd1',
        text: 'Resep Dokter Diterima',
        currentSymbol: 'task',
        laneId: 'pharmacist',
        bugNote: 'Penyerahan resep oleh pasien adalah titik pemicu awal (○ Start Event di Lane Pasien)!'
      },
      {
        id: 'd5',
        text: 'Tempel Etiket Dosis',
        currentSymbol: 'end',
        laneId: 'patient',
        bugNote: 'Menempel etiket dosis adalah Task di Lane Apoteker, bukan End Event di pasien!'
      },
      {
        id: 'd3',
        text: 'Ada Riwayat Alergi?',
        currentSymbol: 'task',
        laneId: 'doctor',
        bugNote: 'Pemeriksaan kondisi alergi pasien adalah Exclusive Gateway (XOR ◇) di Lane Dokter!'
      },
      {
        id: 'd2',
        text: 'Verifikasi Validitas Resep',
        currentSymbol: 'gateway',
        laneId: 'patient',
        bugNote: 'Verifikasi resep berformat Verb-Object adalah Task (▢) di Lane Dokter!'
      },
      {
        id: 'd6',
        text: 'Obat Diterima Pasien',
        currentSymbol: 'task',
        laneId: 'doctor',
        bugNote: 'Penyerahan obat dan selesainya pengobatan adalah End Event (●) di Lane Pasien!'
      }
    ],

    correctSequence: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'],

    correctSymbols: {
      'd1': 'start',   // Resep Dokter Diterima (Start Event)
      'd2': 'task',    // Verifikasi Validitas Resep (Task: Verb-Object)
      'd3': 'gateway', // Ada Riwayat Alergi? (Exclusive Gateway XOR)
      'd4': 'task',    // Racik Kapsul Obat (Task: Verb-Object)
      'd5': 'task',    // Tempel Etiket Dosis (Task: Verb-Object)
      'd6': 'end'      // Obat Diterima Pasien (End Event)
    },

    correctLanes: {
      'd1': 'patient',
      'd2': 'doctor',
      'd3': 'doctor',
      'd4': 'pharmacist',
      'd5': 'pharmacist',
      'd6': 'patient'
    },

    explanations: {
      'd1': 'Langkah 1: Pasien datang menyerahkan lembar resep di loket (○ Start Event di Lane Pasien).',
      'd2': 'Langkah 2: Dokter memvalidasi keaslian dosis obat (▢ Task: Verifikasi Validitas Resep di Lane Dokter).',
      'd3': 'Langkah 3: Dokter mengevaluasi riwayat alergi obat pasien (◇ Exclusive Gateway XOR di Lane Dokter).',
      'd4': 'Langkah 4: Apoteker meracik obat secara higienis (▢ Task: Racik Kapsul Obat di Lane Apoteker).',
      'd5': 'Langkah 5: Apoteker menempelkan label petunjuk dosis 3x sehari (▢ Task: Tempel Etiket Dosis di Lane Apoteker).',
      'd6': 'Langkah 6: Pasien menerima obat sembuh dengan aman (● End Event: Obat Diterima Pasien di Lane Pasien).'
    }
  },

  // =========================================================================
  // LEVEL 3: BOSS STAGE / ADVANCED (1 KASUS)
  // Penerapan Nyata BPMN 2.0 Parallel Execution (AND Split & AND Join):
  // Menjalankan 2 Task bersamaan: Dapur memanggang pizza & Kurir menyiapkan armada!
  // =========================================================================
  {
    id: 'pizza-delivery',
    levelTier: 3,
    tierLabel: 'LEVEL 3: BOSS STAGE (LANJUTAN)',
    world: 'WORLD 3-1',
    title: 'Operasi Kilat Luigi Pizza Delivery',
    theme: 'Luigi Pizzeria & Ekspedisi Kilat',
    difficulty: 'Boss Stage / Paralel & Timer (10 Langkah)',
    timeLimit: 360,
    story: 'Pesanan web membludak! Driver kurir malah nongkrong menunggu pizza selesai, padahal harusnya menyiapkan thermal bag & rute kurir secara paralel bersamaan saat koki memanggang pizza di oven!',
    narrative: 'Siklus proses bisnis dimulai ketika Pesanan Web Diterima secara digital oleh sistem aplikasi. Pelanggan bersama sistem melakukan Konfirmasi Menu Pesanan dan titik lokasi pengantaran. Alur proses kemudian memasuki gateway Cabang Alur Paralel (+) yang memecah alur menjadi dua jalur yang berjalan serentak: di Lane Dapur, koki melakukan Panggang Adonan Pizza lalu proses tertahan oleh timer Tunggu 15 Menit Oven; di saat yang bersamaan di Lane Kurir, kurir melakukan Siapkan Armada & Rute dengan mengecek GPS dan memanaskan motor. Kedua jalur serentak ini disatukan kembali oleh gateway Gabung Alur Paralel (+) setelah pizza matang DAN kurir siap berangkat. Koki segera melakukan Kemas Kotak Pizza ke dalam kemasan thermal khusus. Kurir kemudian bergegas Antar Pizza ke Alamat tujuan pelanggan. Seluruh siklus proses tuntas saat Pesanan Selesai Diterima oleh pelanggan dengan hangat.',
    
    pool: {
      name: 'POOL: LUIGI PIZZERIA & DELIVERY ONLINE',
      subtitle: 'Alur Bisnis Pemesanan, Timer Oven, & Pengantaran Serentak'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan & Aplikasi Mobile', icon: '📱', role: 'Pemesanan & Serah Terima', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'kitchen', name: 'Dapur Pizzeria (Chef Oven)', icon: '🍕', role: 'Produksi, Timer Oven & Packing', bg: '#f0fdf4', border: '#16a34a' },
      { id: 'courier', name: 'Kurir / Ekspedisi Delivery', icon: '🛵', role: 'Penjemputan & Pengantaran Motor', bg: '#fffbeb', border: '#d97706' }
    ],

    // Definisi percabangan paralel BPMN 2.0 untuk live visualizer
    parallelBranch: {
      splitCardId: 'p3',
      branch1CardIds: ['p4', 'p5'], // Dapur: Panggang Pizza -> Timer 15 Menit
      branch2CardIds: ['p6'],       // Kurir: Siapkan Armada & Rute
      joinCardId: 'p7'              // Gabung Alur Paralel (+)
    },

    initialCards: [
      {
        id: 'p5',
        text: 'Tunggu 15 Menit Oven',
        currentSymbol: 'task',
        laneId: 'courier',
        bugNote: 'Jeda oven adalah Intermediate Timer Event (◎ ⏱) di Dapur, bukan task kurir di awal!'
      },
      {
        id: 'p8',
        text: 'Kemas Kotak Pizza',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Mengemas pizza berformat Verb-Object adalah Task (▢) di Lane Dapur setelah alur paralel selesai!'
      },
      {
        id: 'p6',
        text: 'Siapkan Armada & Rute',
        currentSymbol: 'parallel',
        laneId: 'kitchen',
        bugNote: 'Kurir menyiapkan motor & rute adalah Task (▢) di Lane Kurir yang berjalan paralel bersama koki!'
      },
      {
        id: 'p1',
        text: 'Pesanan Web Diterima',
        currentSymbol: 'task',
        laneId: 'courier',
        bugNote: 'Titik awal datangnya pesanan pelanggan dari web harus Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'p3',
        text: 'Cabang Alur Paralel (+)',
        currentSymbol: 'gateway',
        laneId: 'customer',
        bugNote: 'Memecah alur menjadi dua jalur serentak harus memakai Parallel Gateway Split (Belah Ketupat +) di Lane Dapur!'
      },
      {
        id: 'p9',
        text: 'Antar Pizza ke Alamat',
        currentSymbol: 'timer',
        laneId: 'kitchen',
        bugNote: 'Mengantar pesanan pizza ke alamat tujuan adalah Task operasional aktif (▢) di Lane Kurir!'
      },
      {
        id: 'p4',
        text: 'Panggang Adonan Pizza',
        currentSymbol: 'end',
        laneId: 'courier',
        bugNote: 'Koki memanggang pizza adalah Task kerja aktif (▢) di Lane Dapur, bukan End Event di kurir!'
      },
      {
        id: 'p7',
        text: 'Gabung Alur Paralel (+)',
        currentSymbol: 'task',
        laneId: 'customer',
        bugNote: 'Menyatukan kembali kedua cabang alur paralel harus memakai Parallel Gateway Join (Belah Ketupat +) di Lane Dapur!'
      },
      {
        id: 'p2',
        text: 'Konfirmasi Menu Pesanan',
        currentSymbol: 'gateway',
        laneId: 'kitchen',
        bugNote: 'Konfirmasi rincian pesanan berformat Verb-Object adalah Task (▢) di Lane Pelanggan!'
      },
      {
        id: 'p10',
        text: 'Pesanan Selesai Diterima',
        currentSymbol: 'task',
        laneId: 'courier',
        bugNote: 'Serah terima pesanan ke tangan pelanggan adalah penutup akhir (● End Event) di Lane Pelanggan!'
      }
    ],

    correctSequence: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],

    correctSymbols: {
      'p1': 'start',    // Pesanan Web Diterima (Start Event)
      'p2': 'task',     // Konfirmasi Menu Pesanan (Task: Verb-Object)
      'p3': 'parallel', // Cabang Alur Paralel (+) (Parallel Gateway AND Split)
      'p4': 'task',     // Panggang Adonan Pizza (Task: Jalur Paralel 1 Dapur)
      'p5': 'timer',    // Tunggu 15 Menit Oven (Intermediate Timer Event di Jalur Dapur)
      'p6': 'task',     // Siapkan Armada & Rute (Task: Jalur Paralel 2 Kurir - Serentak!)
      'p7': 'parallel', // Gabung Alur Paralel (+) (Parallel Gateway AND Join)
      'p8': 'task',     // Kemas Kotak Pizza (Task: Verb-Object)
      'p9': 'task',     // Antar Pizza ke Alamat (Task: Verb-Object)
      'p10': 'end'      // Pesanan Selesai Diterima (End Event)
    },

    correctLanes: {
      'p1': 'customer',
      'p2': 'customer',
      'p3': 'kitchen',
      'p4': 'kitchen',
      'p5': 'kitchen',
      'p6': 'courier',
      'p7': 'kitchen',
      'p8': 'kitchen',
      'p9': 'courier',
      'p10': 'customer'
    },

    explanations: {
      'p1': 'Langkah 1: Pesanan digital pelanggan masuk ke sistem aplikasi (○ Start Event di Lane Pelanggan).',
      'p2': 'Langkah 2: Aplikasi dan user mengonfirmasi rincian menu pesanan (▢ Task: Konfirmasi Menu Pesanan di Lane Pelanggan).',
      'p3': 'Langkah 3: Parallel Gateway Split (Belah Ketupat +) memecah alur menjadi dua jalur yang berjalan serentak (Dapur & Kurir).',
      'p4': 'Langkah 4 (Jalur Paralel 1): Koki memanggang adonan pizza di oven suhu tinggi (▢ Task: Panggang Adonan Pizza di Lane Dapur).',
      'p5': 'Langkah 5 (Jalur Paralel 1): Alur dapur tertahan durasi pemanggangan oven (◎ Intermediate Timer Event ⏱ di Lane Dapur).',
      'p6': 'Langkah 6 (Jalur Paralel 2): Di saat yang bersamaan, Kurir mengecek rute GPS & memanaskan motor pengantaran (▢ Task: Siapkan Armada & Rute di Lane Kurir).',
      'p7': 'Langkah 7: Parallel Gateway Join (Belah Ketupat +) menyatukan kembali kedua cabang setelah pizza matang DAN kurir siap berangkat.',
      'p8': 'Langkah 8: Pizza matang dimasukkan rapat ke boks thermal higienis (▢ Task: Kemas Kotak Pizza di Lane Dapur).',
      'p9': 'Langkah 9: Kurir meluncur mengantar paket pizza hangat ke alamat (▢ Task: Antar Pizza ke Alamat di Lane Kurir).',
      'p10': 'Langkah 10: Pelanggan menerima pizza lezat di rumah, alur proses selesai tuntas (● End Event di Lane Pelanggan).'
    }
  }
];
