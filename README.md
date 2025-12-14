# Event Ticketing System

Aplikasi berbasis web untuk manajemen dan pemesanan tiket event. Aplikasi ini dibangun untuk memenuhi Tugas Akhir, memungkinkan Admin untuk mengelola event dan User untuk membeli tiket secara online.

## Fitur Utama

### Fitur Admin
* **Manajemen Event:** Membuat, Mengedit, dan Menghapus event (CRUD).
* **Upload Gambar:** Dukungan upload poster event menggunakan Multer.
* **Soft Delete:** Penghapusan event tidak menghilangkan data permanen (hanya ditandai sebagai terhapus) untuk menjaga integritas data transaksi.
* **Manajemen Stok:** Mengatur harga dan kuota tiket.

### Fitur User (Pembeli)
* **Browsing Event:** Melihat daftar event yang tersedia dengan tampilan Grid.
* **Pembelian Tiket:** Membeli tiket dengan input jumlah (Quantity) dan kalkulasi harga otomatis.
* **Tiket Saya:** Melihat riwayat pemesanan tiket beserta status pembayaran.
* **Validasi Stok:** Mencegah pembelian jika kuota tiket habis.

## Teknologi yang Digunakan

**Backend:**
* Node.js & Express.js
* Prisma ORM (Database Management)
* SQLite (Database - Bisa diganti MySQL/PostgreSQL)
* JSON Web Token (JWT) untuk Autentikasi
* Joi (Validasi Input)
* Multer (Upload File)

**Frontend:**
* React.js (Vite)
* Axios (API Request)
* CSS Modern (Custom Styling ala OTA/Traveloka)

---

## Cara Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal (Localhost).

### 1. Persiapan Backend
Buka terminal dan arahkan ke folder backend:

```bash
cd TA-ticketing-web
# 1. Install dependencies
npm install

# 2. Setup Environment Variables
# Buat file .env baru, lalu isi (lihat contoh di bawah)

# 3. Setup Database (Prisma)
npx prisma migrate dev --name init

# 4. Jalankan Server
npm run dev