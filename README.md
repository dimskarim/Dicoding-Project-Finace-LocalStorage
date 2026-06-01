# 📊 Personal Finance Dashboard - Freelance Edition

Aplikasi pencatatan keuangan pribadi berbasis *web* yang dirancang khusus dengan antarmuka bergaya *developer dashboard*. Proyek ini merupakan implementasi dari Vanilla JavaScript, Manipulasi DOM tingkat lanjut, dan pengelolaan *state* lokal.

Aplikasi ini dibangun dengan pendekatan **Offline-First**. Dengan memanfaatkan Web Storage API secara maksimal, aplikasi dapat beroperasi dengan performa tinggi tanpa hambatan jaringan, sekaligus menghindari beban penyimpanan data pada perangkat keras tambahan atau server. Seluruh data pengguna tersimpan secara aman dan efisien langsung di dalam peramban (*browser*).

## ✨ Fitur Utama (Advanced Level)

- **Dasbor Analitik Real-time:** Kalkulasi otomatis untuk total saldo, pemasukan, dan pengeluaran setiap kali terjadi perubahan data.
- **Manajemen Transaksi Penuh (CRUD):**
  - Menambahkan catatan pemasukan dan pengeluaran baru.
  - Mengubah (*edit*) detail transaksi yang sudah ada.
  - Menghapus transaksi.
  - Mengubah tipe transaksi (memindahkan dari Pemasukan ke Pengeluaran, atau sebaliknya).
- **Pencarian Cepat:** Fitur penyaringan dinamis yang memperbarui daftar transaksi secara *real-time* saat pengguna mengetik, sangat berguna ketika riwayat catatan sudah panjang.
- **Validasi Data yang Ketat:** Memastikan integritas data dengan menolak input kosong atau nilai nominal yang tidak valid (kurang dari 1).
- **Arsitektur Berbasis *Event*:** Menggunakan *Custom Events* (`dispatchEvent`) sebagai pemicu tunggal (*single source of truth*) untuk memperbarui antarmuka pengguna, memastikan sinkronisasi yang sempurna antara logika data dan tampilan HTML.

## 🛠️ Teknologi yang Digunakan

- **HTML5:** Struktur semantik standar dengan penerapan atribut pengujian (`data-testid`).
- **CSS3:** Tata letak berbasis Flexbox/Grid dengan desain *dashboard dark-mode* yang terinspirasi dari antarmuka LMS modern.
- **Vanilla JavaScript (ES6+):** Logika utama tanpa intervensi *library* eksternal (Tanpa jQuery, React, atau Vue).
- **Web Storage API (LocalStorage):** Penyimpanan data persisten di sisi klien.

## 📂 Struktur Berkas

Berikut adalah struktur direktori utama pada proyek ini:

📁 personal-finance-dashboard/
├── 📄 index.html      # Struktur antarmuka utama aplikasi (memuat atribut data-testid wajib)
├── 📄 main.js         # Inti dari seluruh logika JavaScript (Manipulasi DOM & Web Storage)
├── 📄 style.css       # Gaya visual untuk mewujudkan tema developer dashboard
└── 📄 README.md       # Dokumentasi proyek (berkas ini)
