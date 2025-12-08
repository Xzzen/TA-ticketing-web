// File: src/routes/transactionRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { createTransaction, getMyTransactions } = require('../controllers/transactionController');

const router = express.Router();

// Semua fitur transaksi WAJIB LOGIN
router.post('/', authenticateToken, createTransaction); // Beli Tiket
router.get('/my-history', authenticateToken, getMyTransactions); // Lihat Riwayat

module.exports = router;