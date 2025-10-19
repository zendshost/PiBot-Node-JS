---

# 🤖 PiBot Node JS

> Bot canggih untuk melakukan *sweep* (transfer otomatis) saldo Pi Network dari banyak dompet ke satu dompet utama. Dirancang untuk efisiensi dan keandalan dengan rotasi node otomatis.

[![made-with-nodejs](https://img.shields.io/badge/Made%20with-Node.js-1f425f.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Fitur Unggulan

-   **Multi-Wallet Support**: Kelola dan sweep saldo dari ratusan atau ribuan dompet Pi secara bersamaan.
-   **Konfigurasi Mudah**: Cukup siapkan file `.env` untuk alamat penerima dan `pharse.txt` untuk daftar dompet Anda.
-   **Kalkulasi Cerdas**: Bot secara otomatis menghitung biaya transaksi (fee) dan menyisakan saldo minimum (1 Pi) di setiap dompet.
-   **Rotasi Node Otomatis**: Menggunakan daftar node Pi yang beragam untuk memastikan koneksi yang stabil dan mengurangi risiko kegagalan transaksi.
-   **Operasi Berkelanjutan**: Didesain untuk berjalan 24/7, terus memonitor dan memproses dompet dalam sebuah loop tanpa henti.
-   **Logging Informatif**: Dapatkan feedback real-time di konsol untuk setiap langkah, mulai dari pengecekan saldo hingga status keberhasilan transaksi.

## ⚠️ Peringatan Penting

-   **GUNAKAN DENGAN RISIKO ANDA SENDIRI.** Alat ini berinteraksi langsung dengan aset kripto Anda. Developer tidak bertanggung jawab atas kehilangan dana apa pun.
-   **JAGA KERAHASIAAN MNEMONIC.** File `pharse.txt` berisi kunci pribadi ke dompet Anda. Jangan pernah membagikan file ini atau isinya kepada siapa pun.
-   Pastikan Anda memahami cara kerja skrip ini sebelum menggunakannya.

## ⚙️ Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

-   [Node.js](https://nodejs.org/en/) (versi 16 atau lebih tinggi direkomendasikan)
-   [Git](https://git-scm.com/)

## 🚀 Instalasi & Konfigurasi

Ikuti langkah-langkah mudah ini untuk menjalankan bot.

**1. Clone Repositori**

Buka terminal atau command prompt Anda dan jalankan perintah berikut:

```bash
git clone https://github.com/zendshost/PiBot-Node-JS.git
```

**2. Masuk ke Direktori Proyek**

```bash
cd PiBot-Node-JS
```

**3. Instal Dependensi**

Jalankan perintah ini untuk menginstal semua paket yang dibutuhkan oleh proyek:

```bash
npm install
```

**4. Konfigurasi Alamat Penerima**

Buat file baru bernama `.env` di dalam direktori proyek. Salin dan tempel konten di bawah ini ke dalam file tersebut.

📝 **File: `.env`**

```ini
RECEIVER_ADDRESS="ALAMAT_PI_PENERIMA_ANDA"
```

> **Penting:** Ganti `ALAMAT_PI_PENERIMA_ANDA` dengan alamat dompet Pi **publik** (G...) milik Anda yang akan menjadi tujuan transfer.

**5. Siapkan Daftar Dompet Anda**

Buat file baru bernama `pharse.txt`. Isi file ini dengan *mnemonic phrase* (12 atau 24 kata) dari setiap dompet yang ingin Anda kelola.

**Setiap *phrase* harus berada di baris baru.**

📝 **File: `pharse.txt` (Contoh)**

```
word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
another phrase example which can be twenty four words long for your wallet
third wallet phrase goes here on a completely new separate line like this
...
```

## ▶️ Cara Menjalankan Bot

Setelah semua konfigurasi selesai, jalankan bot dengan perintah berikut di terminal Anda:

```bash
node bot.js
```

Bot akan segera berjalan, membaca file `pharse.txt`, dan mulai memproses setiap dompet satu per satu. Anda akan melihat log aktivitasnya langsung di terminal.

 <!-- Anda bisa mengganti ini dengan screenshot nyata jika ada -->

Bot akan terus berjalan dalam loop tak terbatas. Untuk menghentikannya, tekan `CTRL + C` di terminal.

## 👨‍💻 Kontak Developer

Punya pertanyaan, saran, atau butuh bantuan? Jangan ragu untuk menghubungi.

-   **GitHub:** [zendshost](https://github.com/zendshost)
-   **Telegram:** [@zendshost](https://t.me/zendshost)

---

Dibuat dengan ❤️ dan kopi. Jangan lupa beri bintang ⭐ jika proyek ini bermanfaat
