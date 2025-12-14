// File: src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import Controller
const transactionController = require('../controllers/transactionController');

// 2. IMPORT MIDDLEWARE (INI YANG BIKIN ERROR TADI)
// Kita harus pakai kurung kurawal { } karena mengambil verifyToken dari dalam objek
const { verifyToken } = require('../middleware/authMiddleware');

// --- ROUTES ---

// POST /api/transactions (Beli Tiket)
// Pastikan transactionController.createTransaction ada di controller!
router.post('/', verifyToken, transactionController.createTransaction);

// GET /api/transactions/my-tickets (Lihat Tiket Saya)
// Pastikan transactionController.getUserTransactions ada di controller!
router.get('/my-tickets', verifyToken, transactionController.getUserTransactions);

module.exports = router;