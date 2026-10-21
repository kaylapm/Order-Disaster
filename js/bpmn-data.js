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
    story: 'Kekacauan total di Drive-thru! Barista menuang espresso ke meja kosong sebelum kasir menerima pesanan pelanggan, dan kasir bingung bagaimana membedakan penanganan bayar tunai dengan scan QRIS!',
    narrative: 'Proses bisnis dimulai ketika Mobil Pelanggan Tiba di loket pemesanan drive-thru (Start Event). Kasir segera melakukan Input Menu Pesanan pada sistem POS. Selanjutnya, kasir mengevaluasi pilihan metode bayar via Exclusive Gateway Metode Bayar Tunai?: jika pelanggan membayar TUNAI [Cash], kasir melakukan Terima Uang Tunai & Cetak Struk; jika memilih NON-TUNAI [QRIS], pelanggan melakukan Pindai Kode QRIS via smartphone. Setelah transaksi bayar tuntas terverifikasi, alur diteruskan ke Barista untuk melakukan Racik Kopi Espresso, dilanjutkan dengan Tuang Kopi Kemasan ke cup tahan panas. Alur proses berakhir tuntas saat Kopi Diterima Pelanggan di loket pengambilan (End Event).',
    
    pool: {
      name: 'POOL: KEDAI KOPI MARIO EXPRESS',
      subtitle: 'Alur Bisnis Pesan Kopi Drive-Thru & Transaksi Pembayaran'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan (Customer)', icon: '👤', role: 'Pembeli Drive-Thru', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'cashier', name: 'Kasir & POS System', icon: '💳', role: 'Input Menu & Transaksi Bayar', bg: '#fffbeb', border: '#d97706' },
      { id: 'barista', name: 'Barista (Dapur Racik)', icon: '☕', role: 'Produksi Kopi Espresso', bg: '#f0fdf4', border: '#16a34a' }
    ],

    // Definisi percabangan keputusan eksklusif (XOR) BPMN 2.0
    exclusiveBranch: {
      splitCardId: 'c5',            // Exclusive Gateway: Metode Bayar Tunai?
      branch1CardIds: ['c7'],       // Jalur [Tunai]: Terima Uang Tunai & Cetak Struk (Lane Kasir)
      branch1Label: '[Tunai]',
      branch2CardIds: ['c8'],       // Jalur [QRIS]: Pindai Kode QRIS (Lane Pelanggan)
      branch2Label: '[QRIS]',
      joinCardId: 'c4'              // Bertemu kembali saat pesanan masuk dapur: Racik Kopi Espresso
    },

    // Kunci Routing & Ports Visual Alur Bersih (Default Solution Ports)
    defaultEdgePorts: {
      // Step 1 -> Step 2 (Mobil Tiba -> Input Menu)
      'flow-arrow-0': { fromPort: 'bottom', toPort: 'left' },
      // Step 2 -> Step 3 (Input Menu -> Metode Bayar Tunai?)
      'flow-arrow-1': { fromPort: 'right', toPort: 'left' },
      // Split XOR -> QRIS (Step 3 -> Step 5 di Pelanggan)
      'flow-arrow-2-b2': { fromPort: 'top', toPort: 'left' },
      // Split XOR -> Tunai (Step 3 -> Step 4 di Kasir)
      'flow-arrow-2-b1': { fromPort: 'bottom', toPort: 'bottom' },
      // Tunai -> Racik Kopi (Step 4 -> Step 6 di Barista)
      'flow-arrow-3-join': { fromPort: 'right', toPort: 'left' },
      // QRIS -> Racik Kopi (Step 5 -> Step 6 di Barista)
      'flow-arrow-4-join': { fromPort: 'right', toPort: 'top' },
      // Racik Kopi -> Tuang Kopi (Step 6 -> Step 7 di Barista)
      'flow-arrow-5': { fromPort: 'right', toPort: 'left' },
      // Tuang Kopi -> Kopi Diterima (Step 7 -> Step 8 di Pelanggan)
      'flow-arrow-6': { fromPort: 'right', toPort: 'bottom' }
    },

    initialCards: [
      {
        id: 'c3',
        text: 'Tuang Kopi Kemasan',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Menuang kopi adalah Task operasional di Lane Barista, bukan Start Event di tangan pelanggan!'
      },
      {
        id: 'c1',
        text: 'Mobil Pelanggan Tiba',
        currentSymbol: 'task',
        laneId: 'cashier',
        bugNote: 'Titik awal pemicu kedatangan pelanggan harusnya Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'c5',
        text: 'Metode Bayar Tunai?',
        currentSymbol: 'task',
        laneId: 'cashier',
        bugNote: 'Pilihan cara bayar Tunai vs QRIS adalah Exclusive Gateway (XOR ◇), bukan task biasa!'
      },
      {
        id: 'c7',
        text: 'Terima Uang Tunai',
        currentSymbol: 'gateway',
        laneId: 'barista',
        bugNote: 'Menerima uang tunai berformat Verb-Object adalah Task (▢) di Lane Kasir untuk jalur bayar Tunai!'
      },
      {
        id: 'c8',
        text: 'Pindai Kode QRIS',
        currentSymbol: 'end',
        laneId: 'cashier',
        bugNote: 'Memindai QRIS dilakukan oleh pembeli (Task ▢ di Lane Pelanggan) jika memilih non-tunai!'
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
        bugNote: 'Hasil akhir saat kopi diserahkan tuntas adalah End Event (●) di Lane Pelanggan!'
      },
      {
        id: 'c4',
        text: 'Racik Kopi Espresso',
        currentSymbol: 'task',
        laneId: 'barista',
        bugNote: 'Barista meracik kopi (Task ▢ di Lane Barista) setelah kasir dan pelanggan menyelesaikan transaksi pembayaran.'
      }
    ],

    correctSequence: ['c1', 'c2', 'c5', 'c7', 'c8', 'c4', 'c3', 'c6'],

    correctSymbols: {
      'c1': 'start',   // Mobil Pelanggan Tiba (Start Event)
      'c2': 'task',    // Input Menu Pesanan (Task: Verb-Object)
      'c5': 'gateway', // Metode Bayar Tunai? (Exclusive Gateway XOR)
      'c7': 'task',    // Terima Uang Tunai (Task: Verb-Object - Branch Tunai)
      'c8': 'task',    // Pindai Kode QRIS (Task: Verb-Object - Branch QRIS)
      'c4': 'task',    // Racik Kopi Espresso (Task: Verb-Object)
      'c3': 'task',    // Tuang Kopi Kemasan (Task: Verb-Object)
      'c6': 'end'      // Kopi Diterima Pelanggan (End Event)
    },

    correctLanes: {
      'c1': 'customer',
      'c2': 'cashier',
      'c5': 'cashier',
      'c7': 'cashier',
      'c8': 'customer',
      'c4': 'barista',
      'c3': 'barista',
      'c6': 'customer'
    },

    explanations: {
      'c1': 'Langkah 1: Kedatangan mobil pelanggan memicu dimulainya proses di Lane Pelanggan (○ Start Event).',
      'c2': 'Langkah 2: Kasir mencatat pesanan format Verb-Object di Lane Kasir (▢ Task: Input Menu Pesanan).',
      'c5': 'Langkah 3: Kasir mengevaluasi pilihan metode bayar di Lane Kasir (◇ Exclusive Gateway XOR: Metode Bayar Tunai?).',
      'c7': 'Langkah 4A [Jalur Tunai]: Kasir menerima pembayaran uang fisik di Lane Kasir (▢ Task: Terima Uang Tunai).',
      'c8': 'Langkah 4B [Jalur QRIS]: Pelanggan memindai QR dinamis dengan ponsel di Lane Pelanggan (▢ Task: Pindai Kode QRIS).',
      'c4': 'Langkah 5: Setelah pembayaran tuntas, Barista meracik espresso di Lane Barista (▢ Task: Racik Kopi Espresso).',
      'c3': 'Langkah 6: Barista menuang kopi ke kemasan tahan panas di Lane Barista (▢ Task: Tuang Kopi Kemasan).',
      'c6': 'Langkah 7: Pelanggan menerima kopi di loket, siklus transaksi selesai tuntas di Lane Pelanggan (● End Event: Kopi Diterima Pelanggan).'
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
    story: 'Kekacauan di kedai boba! Koki dapur bingung pesanan mana yang harus ditambah pudding telur dan mana yang tanpa puding, sementara kasir lupa input catatan topping ke tiket dapur!',
    narrative: 'Proses bisnis dimulai ketika Pembeli Tiba Antre di loket pemesanan (Start Event di Lane Pelanggan). Kasir segera melakukan Input Pesanan Boba pada sistem POS. Selanjutnya, kasir mengevaluasi pilihan ekstra topping via Exclusive Gateway Tambah Topping Puding?: jika pelanggan memilih [Ya / Topping Puding], kasir melakukan Tambah Topping Puding pada rincian pesanan dan kasir mengenakan biaya tambahan; jika pelanggan memilih [Tidak / Boba Standar], kasir langsung melakukan Konfirmasi Pesanan Standar tanpa biaya ekstra. Setelah rincian order tervalidasi, tiket diteruskan ke Koki Dapur untuk melakukan Racik Teh Boba, dilanjutkan dengan Segel Cup Minuman menggunakan mesin sealer press. Siklus proses bisnis selesai tuntas saat Boba Diterima Pembeli di loket pengambilan (End Event).',
    
    pool: {
      name: 'POOL: PEACH BOBA MILK TEA LAB',
      subtitle: 'Alur Bisnis Pembuatan Minuman Boba & Kustomisasi Topping'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan Boba', icon: '🧋', role: 'Konsumen Pembeli', bg: '#fdf2f8', border: '#db2777' },
      { id: 'cashier', name: 'Kasir Pemesanan', icon: '🧾', role: 'Pencatatan Order & Kasir', bg: '#fffbeb', border: '#d97706' },
      { id: 'kitchen', name: 'Koki Racik Dapur', icon: '👩‍🍳', role: 'Pengocok Teh & Sealer Cup', bg: '#f0fdf4', border: '#16a34a' }
    ],

    // Definisi percabangan keputusan eksklusif (XOR) BPMN 2.0
    exclusiveBranch: {
      splitCardId: 'a3',            // Exclusive Gateway: Tambah Topping Puding?
      branch1CardIds: ['a7'],       // Jalur [Ya / Puding]: Tambah Topping Puding (Lane Kasir)
      branch1Label: '[Ya]',
      branch2CardIds: ['a8'],       // Jalur [Tidak / Standar]: Konfirmasi Pesanan Standar (Lane Kasir)
      branch2Label: '[Tidak]',
      joinCardId: 'a4'              // Bertemu kembali di dapur: Racik Teh Boba
    },

    // Kunci Routing & Ports Visual Alur Bersih (Default Solution Ports)
    defaultEdgePorts: {
      // Step 1 -> Step 2 (Pembeli Tiba [Right] -> Input Pesanan [Left])
      'flow-arrow-0': { fromPort: 'right', toPort: 'left' },
      // Step 2 -> Step 3 (Input Pesanan [Right] -> Tambah Topping Puding? [Left])
      'flow-arrow-1': { fromPort: 'right', toPort: 'left' },
      // Split XOR -> [Ya] (Step 3 [Right] -> Step 4 Tambah Topping Puding [Left])
      'flow-arrow-2-b1': { fromPort: 'right', toPort: 'left' },
      // Split XOR -> [Tidak] (Step 3 [Top] -> Step 5 Konfirmasi Menu Standar [Top])
      'flow-arrow-2-b2': { fromPort: 'top', toPort: 'top' },
      // [Ya] Tambah Topping Puding -> Step 6 Racik Teh Boba (Step 4 [Bottom] -> Step 6 [Left])
      'flow-arrow-3-join': { fromPort: 'bottom', toPort: 'left' },
      // [Tidak] Konfirmasi Menu Standar -> Step 6 Racik Teh Boba (Step 5 [Right] -> Step 6 [Top])
      'flow-arrow-4-join': { fromPort: 'right', toPort: 'top' },
      // Step 6 Racik Teh Boba -> Step 7 Segel Cup Minuman (Step 6 [Right] -> Step 7 [Left])
      'flow-arrow-5': { fromPort: 'right', toPort: 'left' },
      // Step 7 Segel Cup Minuman -> Step 8 Boba Diterima Pembeli (Step 7 [Right] -> Step 8 [Left])
      'flow-arrow-6': { fromPort: 'right', toPort: 'left' }
    },

    initialCards: [
      {
        id: 'a5',
        text: 'Segel Cup Minuman',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Menyegel cup plastik adalah Task operasional di Dapur, bukan Start Event di tangan pembeli!'
      },
      {
        id: 'a1',
        text: 'Pembeli Tiba Antre',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Titik kedatangan pembeli harus Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'a7',
        text: 'Tambah Topping Puding',
        currentSymbol: 'gateway',
        laneId: 'kitchen',
        bugNote: 'Menambah topping puding berformat Verb-Object adalah Task (▢) di Lane Kasir untuk jalur kondisi [Ya]!'
      },
      {
        id: 'a4',
        text: 'Racik Teh Boba',
        currentSymbol: 'end',
        laneId: 'cashier',
        bugNote: 'Meracik teh boba adalah Task operasional di Dapur, bukan penutup akhir proses!'
      },
      {
        id: 'a3',
        text: 'Tambah Topping Puding?',
        currentSymbol: 'task',
        laneId: 'cashier',
        bugNote: 'Evaluasi keputusan opsi topping adalah Exclusive Gateway (XOR ◇) di Lane Kasir!'
      },
      {
        id: 'a8',
        text: 'Konfirmasi Menu Standar',
        currentSymbol: 'task',
        laneId: 'customer',
        bugNote: 'Konfirmasi menu standar adalah Task (▢) di Lane Kasir untuk jalur kondisi [Tidak] tanpa ekstra puding!'
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

    correctSequence: ['a1', 'a2', 'a3', 'a7', 'a8', 'a4', 'a5', 'a6'],

    correctSymbols: {
      'a1': 'start',   // Pembeli Tiba Antre (Start Event)
      'a2': 'task',    // Input Pesanan Boba (Task: Verb-Object)
      'a3': 'gateway', // Tambah Topping Puding? (Exclusive Gateway XOR)
      'a7': 'task',    // Tambah Topping Puding (Task: Verb-Object - Branch Ya)
      'a8': 'task',    // Konfirmasi Menu Standar (Task: Verb-Object - Branch Tidak)
      'a4': 'task',    // Racik Teh Boba (Task: Verb-Object)
      'a5': 'task',    // Segel Cup Minuman (Task: Verb-Object)
      'a6': 'end'      // Boba Diterima Pembeli (End Event)
    },

    correctLanes: {
      'a1': 'customer',
      'a2': 'cashier',
      'a3': 'cashier',
      'a7': 'cashier',
      'a8': 'cashier',
      'a4': 'kitchen',
      'a5': 'kitchen',
      'a6': 'customer'
    },

    explanations: {
      'a1': 'Langkah 1: Pembeli datang ke outlet memicu dimulainya proses di Lane Pelanggan (○ Start Event).',
      'a2': 'Langkah 2: Kasir mencatat menu format Verb-Object di Lane Kasir (▢ Task: Input Pesanan Boba).',
      'a3': 'Langkah 3: Kasir mengevaluasi pilihan topping ekstra di Lane Kasir (◇ Exclusive Gateway XOR: Tambah Topping Puding?).',
      'a7': 'Langkah 4A [Jalur Ya / Puding]: Kasir menambahkan topping puding telur dan menghitung biaya ekstra di Lane Kasir (▢ Task: Tambah Topping Puding).',
      'a8': 'Langkah 4B [Jalur Tidak / Standar]: Kasir memproses pesanan standar tanpa tambahan topping di Lane Kasir (▢ Task: Konfirmasi Menu Standar).',
      'a4': 'Langkah 5: Tiket pesanan masuk dapur, koki meracik teh susu dan boba di Lane Koki Dapur (▢ Task: Racik Teh Boba).',
      'a5': 'Langkah 6: Cup minuman ditutup rapat dengan mesin press di Lane Koki Dapur (▢ Task: Segel Cup Minuman).',
      'a6': 'Langkah 7: Pembeli menerima pesanan minuman segar di loket serah terima, proses tuntas di Lane Pelanggan (● End Event: Boba Diterima Pembeli).'
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
    story: 'Kekacauan di dapur burger! Koki membungkus kertas kosong saat daging habis, dan kasir tetap menerima uang pelanggan padahal persediaan patty daging di gudang sedang kosong!',
    narrative: 'Proses bisnis dimulai saat Pesanan Kiosk Dimulai di layar mandiri restoran (Start Event di Lane Pelanggan). Pelanggan melakukan Pilih Paket Burger pada menu kiosk. Sistem POS & Inventory secara otomatis mengevaluasi ketersediaan bahan via Exclusive Gateway Stok Bahan Cukup?: jika [Cukup / Ada], sistem melakukan Terbitkan Tiket Masak ke dapur, koki melakukan Panggang Daging Patty, dilanjutkan dengan Kemas Paket Burger; jika [Habis / Kosong], sistem POS melakukan Tampilkan Notifikasi Habis dan otomatis menawarkan menu alternatif kepada pelanggan. Setelah burger matang dikemas rapi, seluruh siklus proses selesai tuntas saat Burger Diterima Pelanggan di loket pengambilan (End Event).',
    
    pool: {
      name: 'POOL: MARIO FAST-FOOD BURGER LAB',
      subtitle: 'Alur Bisnis Pemesanan Kiosk & Manajemen Stok Dapur'
    },
    lanes: [
      { id: 'customer', name: 'Pelanggan (Kiosk Layar Sentuh)', icon: '👤', role: 'Pemesanan Mandiri', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'pos', name: 'Sistem POS & Inventory', icon: '💻', role: 'Validasi Stok & Kasir', bg: '#fffbeb', border: '#d97706' },
      { id: 'kitchen', name: 'Koki Dapur (Kitchen Cook)', icon: '👨‍🍳', role: 'Pemanggangan & Packaging', bg: '#f0fdf4', border: '#16a34a' }
    ],

    // Definisi percabangan keputusan eksklusif (XOR) BPMN 2.0
    exclusiveBranch: {
      splitCardId: 'b2',            // Exclusive Gateway: Stok Bahan Cukup?
      branch1CardIds: ['b3'],       // Jalur [Cukup]: Terbitkan Tiket Masak (Lane POS)
      branch1Label: '[Cukup]',
      branch2CardIds: ['b7'],       // Jalur [Habis]: Tampilkan Menu Habis (Lane Pelanggan)
      branch2Label: '[Habis]',
      joinCardId: 'b5'              // Bertemu kembali ke proses berikutnya / serah terima
    },

    // Kunci Routing & Ports Visual Alur Bersih (Default Solution Ports)
    defaultEdgePorts: {
      // Step 1 -> Step 2 (Pesanan Kiosk [Bottom] -> Pilih Paket Burger [Left])
      'flow-arrow-0': { fromPort: 'right', toPort: 'left' },
      // Step 2 -> Step 3 (Pilih Paket Burger [Right] -> Stok Bahan Cukup? [Left])
      'flow-arrow-1': { fromPort: 'right', toPort: 'left' },
      // Split XOR -> [Cukup] (Step 3 [Right] -> Step 4 Terbitkan Tiket Masak [Left])
      'flow-arrow-2-b1': { fromPort: 'right', toPort: 'left' },
      // Split XOR -> [Habis] (Step 3 [Top] -> Step 5 Tampilkan Menu Habis [Top])
      'flow-arrow-2-b2': { fromPort: 'top', toPort: 'top' },
      // [Cukup] Terbitkan Tiket -> Panggang Daging Patty (Step 4 [Bottom] -> Step 6 [Left])
      'flow-arrow-3-join': { fromPort: 'bottom', toPort: 'left' },
      // [Habis] Tampilkan Menu Habis -> Panggang Daging / Alur Join (Step 5 [Right] -> Step 6 [Top])
      'flow-arrow-4-join': { fromPort: 'right', toPort: 'top' },
      // Panggang Daging Patty -> Kemas Paket Burger (Step 6 [Right] -> Step 7 [Left])
      'flow-arrow-5': { fromPort: 'right', toPort: 'left' },
      // Kemas Paket Burger -> Burger Diterima Pelanggan (Step 7 [Right] -> Step 8 [Left])
      'flow-arrow-6': { fromPort: 'right', toPort: 'left' }
    },

    initialCards: [
      {
        id: 'b4',
        text: 'Kemas Paket Burger',
        currentSymbol: 'start',
        laneId: 'customer',
        bugNote: 'Mengemas burger adalah Task operasional di Dapur, bukan Start Event di tangan pelanggan!'
      },
      {
        id: 'b1',
        text: 'Pesanan Kiosk Dimulai',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Awal mula transaksi di layar sentuh adalah Start Event (○) di Lane Pelanggan!'
      },
      {
        id: 'b8',
        text: 'Pilih Paket Burger',
        currentSymbol: 'gateway',
        laneId: 'kitchen',
        bugNote: 'Memilih paket menu adalah Task (▢) di Lane Pelanggan pada layar sentuh kiosk!'
      },
      {
        id: 'b3',
        text: 'Terbitkan Tiket Masak',
        currentSymbol: 'end',
        laneId: 'kitchen',
        bugNote: 'Menerbitkan tiket pesanan adalah Task (▢) di Lane Sistem POS saat stok bahan terverifikasi [Cukup]!'
      },
      {
        id: 'b2',
        text: 'Stok Bahan Cukup?',
        currentSymbol: 'task',
        laneId: 'customer',
        bugNote: 'Pemeriksaan stok bahan baku Cukup vs Habis adalah Exclusive Gateway (XOR ◇) di Sistem POS!'
      },
      {
        id: 'b7',
        text: 'Tampilkan Menu Habis',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Menampilkan peringatan stok kosong adalah Task (▢) di Lane Pelanggan jika kondisi stok [Habis]!'
      },
      {
        id: 'b5',
        text: 'Panggang Daging Patty',
        currentSymbol: 'gateway',
        laneId: 'pos',
        bugNote: 'Memanggang patty daging sapi berformat Verb-Object adalah Task (▢) di Lane Koki Dapur!'
      },
      {
        id: 'b6',
        text: 'Burger Diterima Pelanggan',
        currentSymbol: 'task',
        laneId: 'kitchen',
        bugNote: 'Penyerahan akhir dan selesainya order harus ditandai End Event (●) di Lane Pelanggan!'
      }
    ],

    correctSequence: ['b1', 'b8', 'b2', 'b3', 'b7', 'b5', 'b4', 'b6'],

    correctSymbols: {
      'b1': 'start',   // Pesanan Kiosk Dimulai (Start Event)
      'b8': 'task',    // Pilih Paket Burger (Task: Verb-Object)
      'b2': 'gateway', // Stok Bahan Cukup? (Exclusive Gateway XOR)
      'b3': 'task',    // Terbitkan Tiket Masak (Task: Verb-Object - Branch Cukup)
      'b7': 'task',    // Tampilkan Menu Habis (Task: Verb-Object - Branch Habis)
      'b5': 'task',    // Panggang Daging Patty (Task: Verb-Object)
      'b4': 'task',    // Kemas Paket Burger (Task: Verb-Object)
      'b6': 'end'      // Burger Diterima Pelanggan (End Event)
    },

    correctLanes: {
      'b1': 'customer',
      'b8': 'customer',
      'b2': 'pos',
      'b3': 'pos',
      'b7': 'customer',
      'b5': 'kitchen',
      'b4': 'kitchen',
      'b6': 'customer'
    },

    explanations: {
      'b1': 'Langkah 1: Pembeli menyentuh layar kiosk untuk memulai proses (○ Start Event di Lane Pelanggan).',
      'b8': 'Langkah 2: Pembeli memilih paket menu burger dan kentang di layar kiosk (▢ Task: Pilih Paket Burger di Lane Pelanggan).',
      'b2': 'Langkah 3: Sistem POS memeriksa data gudang real-time (◇ Exclusive Gateway XOR: Stok Bahan Cukup? di Lane POS).',
      'b3': 'Langkah 4A [Jalur Cukup]: Stok tersedia, sistem POS menerbitkan tiket pesanan ke dapur (▢ Task: Terbitkan Tiket Masak di Lane POS).',
      'b7': 'Langkah 4B [Jalur Habis]: Stok habis, sistem menampilkan notifikasi stok kosong di layar pembeli (▢ Task: Tampilkan Menu Habis di Lane Pelanggan).',
      'b5': 'Langkah 5: Koki memanggang patty daging sapi di atas grill (▢ Task: Panggang Daging Patty di Lane Koki Dapur).',
      'b4': 'Langkah 6: Koki membungkus burger rapi ke kemasan kertas tahan minyak (▢ Task: Kemas Paket Burger di Lane Koki Dapur).',
      'b6': 'Langkah 7: Pesanan diserahkan hangat ke pelanggan di loket pengambilan, proses tuntas (● End Event: Burger Diterima Pelanggan).'
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
    story: 'Apoteker menyerahkan obat keras sebelum dokter memverifikasi resep! Dokter bingung memeriksa riwayat alergi pasien, apakah harus mengganti racikan alternatif yang aman atau langsung mengonfirmasi resep standar!',
    narrative: 'Proses bisnis dimulai saat Resep Dokter Diterima di loket apotek (Start Event di Lane Pasien). Dokter di loket verifikasi segera melakukan Verifikasi Validitas Resep guna memeriksa keabsahan diagnosis dan takaran. Selanjutnya, dokter mengevaluasi riwayat rekam medis pasien via Exclusive Gateway Ada Riwayat Alergi?: jika pasien [Ada Alergi], dokter melakukan Ganti Resep Alternatif dengan formula senyawa yang aman bagi tubuh pasien; jika [Tidak Alergi], dokter melakukan Konfirmasi Formula Standar sesuai anjuran awal. Setelah resep tervalidasi aman, lembar instruksi diserahkan ke Apoteker untuk melakukan Racik Kapsul Obat dengan timbangan presisi, dilanjutkan dengan Tempel Etiket Dosis (aturan pakai 3x sehari) pada kemasan obat. Siklus pelayanan farmasi tuntas saat Obat Diterima Pasien di loket penyerahan (End Event).',
    
    pool: {
      name: 'POOL: TOAD PHARMACY & HEALING LAB',
      subtitle: 'Alur Bisnis Penebusan Resep Obat & Validasi Alergi Pasien'
    },
    lanes: [
      { id: 'patient', name: 'Pasien / Pembeli', icon: '🤒', role: 'Konsumen Resep', bg: '#f0f9ff', border: '#0284c7' },
      { id: 'doctor', name: 'Dokter / Verifikator Medis', icon: '🩺', role: 'Pemeriksaan Resep & Alergi', bg: '#fef3c7', border: '#d97706' },
      { id: 'pharmacist', name: 'Apoteker Racik Obat', icon: '💊', role: 'Peracikan & Etiket Dosis', bg: '#f0fdf4', border: '#16a34a' }
    ],

    // Definisi percabangan keputusan eksklusif (XOR) BPMN 2.0
    exclusiveBranch: {
      splitCardId: 'd3',            // Exclusive Gateway: Ada Riwayat Alergi?
      branch1CardIds: ['d7'],       // Jalur [Ada Alergi]: Ganti Resep Alternatif (Lane Dokter)
      branch1Label: '[Ada]',
      branch2CardIds: ['d8'],       // Jalur [Tidak Alergi]: Konfirmasi Formula Standar (Lane Dokter)
      branch2Label: '[Tidak]',
      joinCardId: 'd4'              // Bertemu kembali di laboratorium apoteker: Racik Kapsul Obat
    },

    // Kunci Routing & Ports Visual Alur Bersih (Default Solution Ports)
    defaultEdgePorts: {
      // Step 1 -> Step 2 (Resep Diterima -> Verifikasi Resep)
      'flow-arrow-0': { fromPort: 'bottom', toPort: 'left' },
      // Step 2 -> Step 3 (Verifikasi Resep -> Ada Riwayat Alergi?)
      'flow-arrow-1': { fromPort: 'right', toPort: 'left' },
      // Split XOR -> [Ada Alergi] (Step 3 -> Step 4 Ganti Resep Alternatif)
      'flow-arrow-2-b1': { fromPort: 'top', toPort: 'left' },
      // Split XOR -> [Tidak Alergi] (Step 3 -> Step 5 Konfirmasi Formula Standar)
      'flow-arrow-2-b2': { fromPort: 'bottom', toPort: 'left' },
      // [Ada] Ganti Resep -> Racik Kapsul Obat (Step 4 -> Step 6 di Apoteker)
      'flow-arrow-3-join': { fromPort: 'right', toPort: 'top' },
      // [Tidak] Konfirmasi -> Racik Kapsul Obat (Step 5 -> Step 6 di Apoteker)
      'flow-arrow-4-join': { fromPort: 'right', toPort: 'left' },
      // Racik Kapsul Obat -> Tempel Etiket Dosis (Step 6 -> Step 7 di Apoteker)
      'flow-arrow-5': { fromPort: 'right', toPort: 'left' },
      // Tempel Etiket Dosis -> Obat Diterima Pasien (Step 7 -> Step 8 di Pasien)
      'flow-arrow-6': { fromPort: 'right', toPort: 'bottom' }
    },

    initialCards: [
      {
        id: 'd4',
        text: 'Racik Kapsul Obat',
        currentSymbol: 'start',
        laneId: 'patient',
        bugNote: 'Meracik kapsul adalah Task operasional di Lane Apoteker, bukan Start Event di tangan pasien!'
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
        bugNote: 'Menempel etiket dosis adalah Task operasional di Lane Apoteker, bukan End Event di pasien!'
      },
      {
        id: 'd3',
        text: 'Ada Riwayat Alergi?',
        currentSymbol: 'task',
        laneId: 'doctor',
        bugNote: 'Evaluasi keputusan kondisi alergi pasien adalah Exclusive Gateway (XOR ◇) di Lane Dokter!'
      },
      {
        id: 'd7',
        text: 'Ganti Resep Alternatif',
        currentSymbol: 'gateway',
        laneId: 'pharmacist',
        bugNote: 'Mengganti resep obat berformat Verb-Object adalah Task (▢) di Lane Dokter jika kondisi [Ada Alergi]!'
      },
      {
        id: 'd8',
        text: 'Konfirmasi Formula Standar',
        currentSymbol: 'task',
        laneId: 'patient',
        bugNote: 'Mengonfirmasi formula standar berformat Verb-Object adalah Task (▢) di Lane Dokter jika kondisi [Tidak Alergi]!'
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
        bugNote: 'Penyerahan obat dan selesainya pelayanan farmasi adalah End Event (●) di Lane Pasien!'
      }
    ],

    correctSequence: ['d1', 'd2', 'd3', 'd7', 'd8', 'd4', 'd5', 'd6'],

    correctSymbols: {
      'd1': 'start',   // Resep Dokter Diterima (Start Event)
      'd2': 'task',    // Verifikasi Validitas Resep (Task: Verb-Object)
      'd3': 'gateway', // Ada Riwayat Alergi? (Exclusive Gateway XOR)
      'd7': 'task',    // Ganti Resep Alternatif (Task: Verb-Object - Branch Ada Alergi)
      'd8': 'task',    // Konfirmasi Formula Standar (Task: Verb-Object - Branch Tidak Alergi)
      'd4': 'task',    // Racik Kapsul Obat (Task: Verb-Object)
      'd5': 'task',    // Tempel Etiket Dosis (Task: Verb-Object)
      'd6': 'end'      // Obat Diterima Pasien (End Event)
    },

    correctLanes: {
      'd1': 'patient',
      'd2': 'doctor',
      'd3': 'doctor',
      'd7': 'doctor',
      'd8': 'doctor',
      'd4': 'pharmacist',
      'd5': 'pharmacist',
      'd6': 'patient'
    },

    explanations: {
      'd1': 'Langkah 1: Pasien datang menyerahkan lembar resep di loket (○ Start Event di Lane Pasien).',
      'd2': 'Langkah 2: Dokter memvalidasi keaslian resep dan takaran (▢ Task: Verifikasi Validitas Resep di Lane Dokter).',
      'd3': 'Langkah 3: Dokter mengevaluasi riwayat alergi obat pasien (◇ Exclusive Gateway XOR: Ada Riwayat Alergi? di Lane Dokter).',
      'd7': 'Langkah 4A [Jalur Ada Alergi]: Pasien memiliki alergi, dokter meresepkan senyawa obat pengganti yang aman (▢ Task: Ganti Resep Alternatif di Lane Dokter).',
      'd8': 'Langkah 4B [Jalur Tidak Alergi]: Pasien bebas dari alergi, dokter menyetujui resep formula standar (▢ Task: Konfirmasi Formula Standar di Lane Dokter).',
      'd4': 'Langkah 5: Apoteker meracik obat secara higienis di laboratorium farmasi (▢ Task: Racik Kapsul Obat di Lane Apoteker).',
      'd5': 'Langkah 6: Apoteker menempelkan label petunjuk dosis aturan pakai pada kemasan (▢ Task: Tempel Etiket Dosis di Lane Apoteker).',
      'd6': 'Langkah 7: Pasien menerima obat sembuh dengan aman, proses tuntas (● End Event: Obat Diterima Pasien di Lane Pasien).'
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
    narrative: 'Proses bisnis dimulai ketika Pesanan Web Diterima oleh sistem online (Start Event di Lane Pelanggan). Pelanggan bersama sistem melakukan Konfirmasi Menu Pesanan. Selanjutnya, alur memasuki Parallel Gateway Split (+) yang membagi proses menjadi DUA JALUR SERENTAK: di Lane Dapur, koki melakukan Panggang Adonan Pizza lalu tertahan oleh timer Tunggu 15 Menit Oven; secara bersamaan di Lane Kurir, kurir melakukan Siapkan Armada & Rute dengan menyiapkan motor dan rute jalan tercepat. Kedua alur serentak ini disatukan kembali oleh Parallel Gateway Join (+) setelah pizza matang DAN kurir siap berangkat. Koki segera melakukan Kemas Kotak Pizza, kurir bergegas melakukan Antar Pizza ke Alamat, dan alur selesai tuntas saat Pesanan Selesai Diterima oleh pelanggan (End Event).',
    
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
      branch1Label: '[Dapur]',
      branch2CardIds: ['p6'],       // Kurir: Siapkan Armada & Rute
      branch2Label: '[Kurir]',
      joinCardId: 'p7'              // Gabung Alur Paralel (+)
    },

    // Kunci Routing & Ports Visual Alur Bersih (Default Solution Ports)
    defaultEdgePorts: {
      // Step 1 -> Step 2 (Pesanan Web -> Konfirmasi Menu)
      'flow-arrow-0': { fromPort: 'right', toPort: 'left' },
      // Step 2 -> Step 3 (Konfirmasi Menu -> Cabang Alur Paralel)
      'flow-arrow-1': { fromPort: 'bottom', toPort: 'left' },
      // Split Paralel -> Dapur (Step 3 -> Step 4 Panggang Pizza)
      'flow-arrow-2-b1': { fromPort: 'right', toPort: 'left' },
      // Step 4 Panggang Pizza -> Step 5 Timer 15 Menit Oven
      'flow-arrow-3': { fromPort: 'right', toPort: 'left' },
      // Split Paralel -> Kurir (Step 3 -> Step 6 Siapkan Armada)
      'flow-arrow-2-b2': { fromPort: 'bottom', toPort: 'left' },
      // Step 5 Timer Oven -> Step 7 Gabung Paralel
      'flow-arrow-4-join': { fromPort: 'right', toPort: 'left' },
      // Step 6 Siapkan Armada -> Step 7 Gabung Paralel
      'flow-arrow-5-join': { fromPort: 'right', toPort: 'bottom' },
      // Step 7 Gabung Paralel -> Step 8 Kemas Kotak Pizza
      'flow-arrow-6': { fromPort: 'right', toPort: 'left' },
      // Step 8 Kemas Kotak Pizza -> Step 9 Antar Pizza ke Alamat
      'flow-arrow-7': { fromPort: 'bottom', toPort: 'left' },
      // Step 9 Antar Pizza ke Alamat -> Step 10 Pesanan Selesai Diterima
      'flow-arrow-8': { fromPort: 'right', toPort: 'bottom' }
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
