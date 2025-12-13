// File: src/routes/eventRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware'); // Import Satpam
const { createEvent, getAllEvents, updateEvent, deleteEvent } = require('../controllers/eventController');
const upload = require('../middleware/uploadMiddleware'); // <--- TAMBAHKAN BARIS PENTING INI

const router = express.Router();

// Route: POST /api/events (DIPROTEKSI - Wajib Login)
router.post('/', authenticateToken, upload.single('image'), createEvent);

// Route: GET /api/events (PUBLIK - Boleh Siapa Saja)
router.get('/', getAllEvents);

// --- ROUTE BARU ---
// PUT = Edit, DELETE = Hapus
// Keduanya butuh parameter :id (Event mana yang mau diedit/hapus?)
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

module.exports = router;