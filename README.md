---

````markdown
# 🤖 PiBot Node JS | Pi Multi-Wallet Sweeper



**PiBot Node JS** adalah sebuah skrip otomasi *open-source* yang dirancang untuk mengelola dan melakukan *sweep* (transfer terkonsolidasi) saldo dari banyak dompet Pi Network ke satu alamat dompet utama. Dibangun dengan Node.js dan Stellar SDK, bot ini menawarkan efisiensi, keandalan, dan kemudahan konfigurasi untuk mengelola aset Pi Anda dalam skala besar.

[![made-with-nodejs](https://img.shields.io/badge/Made%20with-Node.js-1f425f.svg)](https://nodejs.org/en/)
[![Stellar SDK](https://img.shields.io/badge/Uses-Stellar%20SDK-blueviolet)](https://github.com/stellar/js-stellar-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/zendshost/PiBot-Node-JS?style=social)](https://github.com/zendshost/PiBot-Node-JS)

---

## 📖 Daftar Isi

- [Fitur Unggulan](#-fitur-unggulan)
- [Bagaimana Cara Kerjanya?](#-bagaimana-cara-kerjanya)
- [⚠️ Peringatan Kritis](#️-peringatan-kritis)
- [Prasyarat](#️-prasyarat)
- [Instalasi Cepat](#-instalasi-cepat)
- [Konfigurasi Detail](#-konfigurasi-detail)
- [Menjalankan Bot](#️-menjalankan-bot)
- [Struktur Proyek](#-struktur-proyek)
- [Kontak Developer](#-kontak-developer)

## ✨ Fitur Unggulan

-   **Manajemen Multi-Dompet**: Proses ratusan atau ribuan dompet sumber dari satu file `pharse.txt` yang sederhana.
-   **Sweep Otomatis**: Secara otomatis mentransfer saldo yang tersedia ke dompet utama Anda.
-   **Kalkulasi Cerdas**: Bot secara otomatis menghitung *fee* transaksi (0.01 Pi) dan mempertahankan saldo minimum yang dibutuhkan (1 Pi) di setiap dompet sumber.
-   **Rotasi Node Pi**: Menggunakan daftar *hardcoded* dari node Pi Network dan merotasinya untuk setiap transaksi. Ini meningkatkan keandalan dan mendistribusikan beban permintaan API.
-   **Operasi Berkelanjutan (24/7)**: Didesain untuk berjalan tanpa henti dalam sebuah *infinite loop*, memastikan dompet baru atau saldo yang masuk akan diproses secara berkala.
-   **Logging Real-time**: Dapatkan *feedback* yang jelas dan informatif di terminal Anda untuk setiap tindakan, mulai dari pengecekan saldo, kalkulasi transfer, hingga hasil transaksi (sukses atau gagal).
-   **Penanganan Error**: Mampu menangani error umum seperti file tidak ditemukan, saldo tidak cukup, atau masalah koneksi ke node.

## ⚙️ Bagaimana Cara Kerjanya?

Bot ini bekerja melalui beberapa langkah logis dalam sebuah siklus:

1.  **Baca Konfigurasi**: Bot pertama kali membaca alamat dompet penerima dari file `.env`.
2.  **Baca Daftar Dompet**: Selanjutnya, ia membaca semua *mnemonic phrase* yang tersimpan di `pharse.txt`.
3.  **Iterasi & Proses**: Untuk setiap *mnemonic phrase*:
    -   Ia memilih satu Node Pi dari daftar secara berurutan (rotasi).
    -   Menerbitkan pasangan kunci (Public & Secret Key) dari *mnemonic phrase*.
    -   Menghubungi Node Pi untuk mendapatkan saldo terkini dari dompet tersebut.
    -   Menghitung jumlah yang bisa ditransfer: `Total Saldo - 1 Pi (Cadangan) - 0.01 Pi (Biaya)`.
    -   Jika saldo mencukupi, ia akan membangun, menandatangani, dan mengirimkan transaksi ke jaringan Pi.
4.  **Ulangi Siklus**: Setelah semua dompet dalam file diproses, bot akan langsung memulai kembali dari dompet pertama, memastikan pemrosesan yang berkelanjutan.

## ⚠️ Peringatan Kritis

-   **RISIKO ANDA TANGGUNG SENDIRI.** Alat ini berinteraksi langsung dengan aset kripto Anda melalui kunci privat (*mnemonic phrase*). Developer tidak bertanggung jawab atas kehilangan dana yang mungkin terjadi akibat penggunaan skrip ini, kesalahan konfigurasi, atau kerentanan lainnya.
-   **AMANKAN FILE `pharse.txt` ANDA.** File ini setara dengan kunci brankas Anda. Jangan pernah membagikannya, mengunggahnya ke repositori publik, atau menyimpannya di lokasi yang tidak aman.
-   Skrip ini bersifat *read-only* pada file `pharse.txt`, artinya ia tidak akan pernah mengubah atau menghapus *phrase* Anda.

## 🛠️ Prasyarat

Pastikan perangkat Anda telah terinstal perangkat lunak berikut:
-   [Node.js](https://nodejs.org/en/) (direkomendasikan versi 16.x atau lebih baru)
-   [Git](https://git-scm.com/)

## 🚀 Instalasi Cepat

Buka terminal atau Command Prompt Anda dan ikuti langkah-langkah di bawah ini.

```bash
# 1. Clone repositori ini ke mesin lokal Anda
git clone https://github.com/zendshost/PiBot-Node-JS.git

# 2. Masuk ke direktori proyek yang baru dibuat
cd PiBot-Node-JS

# 3. Instal semua dependensi yang dibutuhkan
npm install
```

## 📝 Konfigurasi Detail

Sebelum menjalankan bot, Anda **wajib** melakukan dua konfigurasi berikut:

#### 1. Atur Alamat Penerima

Buat file baru di direktori utama proyek dengan nama `.env`. File ini digunakan untuk menyimpan variabel lingkungan yang sensitif.

```bash
# Untuk pengguna Linux/macOS
touch .env

# Untuk pengguna Windows
echo. > .env
```

Buka file `.env` tersebut dan isi dengan format berikut:

**File: `.env`**
```ini
# Ganti dengan alamat dompet Pi PUBLIK (G...) milik Anda
RECEIVER_ADDRESS="GBU5GV6G3O54FOZYYMJS433GTTRUGIFXMLHRQGNHCHBZHYP22XNMM4X6"
```

#### 2. Siapkan Daftar Dompet Sumber

Buat file baru di direktori utama proyek dengan nama `pharse.txt`.

```bash
# Untuk pengguna Linux/macOS
touch pharse.txt

# Untuk pengguna Windows
echo. > pharse.txt
```

Buka file `pharse.txt` dan isi dengan semua *mnemonic phrase* dari dompet yang ingin Anda kelola. **PENTING: Setiap *phrase* harus berada di baris baru.**

**File: `pharse.txt` (Contoh)**
```
word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
another phrase example which can be twenty four words long for your wallet
third wallet phrase goes here on a completely new separate line like this
...dan seterusnya
```

## ▶️ Menjalankan Bot

Setelah semua instalasi dan konfigurasi selesai, Anda siap menjalankan bot.

```bash
node bot.js
```

Bot akan segera aktif dan Anda akan melihat output log di terminal Anda yang menunjukkan setiap langkah yang diambilnya.

 <!-- Ganti dengan screenshot nyata jika ada -->

Untuk menghentikan bot, cukup tekan `CTRL + C` di terminal.

## 📂 Struktur Proyek

```
PiBot-Node-JS/
├── .env                # File konfigurasi untuk alamat penerima (WAJIB DIBUAT)
├── pharse.txt          # File berisi daftar mnemonic phrase Anda (WAJIB DIBUAT)
├── bot.js              # Logika utama dari aplikasi bot
├── package.json        # Mendefinisikan skrip dan dependensi proyek
├── package-lock.json   # Versi terkunci dari dependensi
└── README.md           # Dokumentasi yang sedang Anda baca
```

## 👨‍💻 Kontak Developer

Punya pertanyaan, ide fitur, atau menemukan bug? Jangan ragu untuk menghubungi saya atau membuat *Issue* di repositori ini.

-   **GitHub:** [zendshost](https://github.com/zendshost)
-   **Telegram:** [@zendshost](https://t.me/zendshost)

---

Dibuat dengan ❤️ dan secangkir kopi. Jika Anda merasa proyek ini bermanfaat, pertimbangkan untuk memberikan bintang ⭐ pada repositori ini!
````
