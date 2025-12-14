// File: src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();

// 1. IMPORT CONTROLLER
const { createEvent, getAllEvents, updateEvent, deleteEvent } = require('../controllers/eventController');

// 2. IMPORT MIDDLEWARE (SATPAM)
// Perhatikan: Kita pakai kurung kurawal { } karena mengambil 2 fungsi sekaligus
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- PENGATURAN ROUTE ---

// A. PUBLIC (Bisa diakses siapa saja tanpa login)
// User mau lihat daftar event? Boleh dong.
router.get('/', getAllEvents);

// B. PROTECTED & ADMIN ONLY (Harus Login & Harus Admin)
// Urutan Satpam: Cek Token -> Cek Admin -> Cek File Upload -> Jalankan Controller

// 1. Buat Event (Cuma Admin)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), createEvent);

// 2. Edit Event (Cuma Admin)
// Catatan: Saya tambahkan upload.single('image') jaga-jaga kalau mau ganti gambar event
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateEvent);

// 3. Hapus Event (Cuma Admin)
router.delete('/:id', verifyToken, verifyAdmin, deleteEvent);

module.exports = router;