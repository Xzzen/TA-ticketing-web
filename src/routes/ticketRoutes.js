const express = require('express');
const router = express.Router();
// Pastikan path ini mengarah ke file yang BENAR
const ticketController = require('../controllers/transactionController'); 
const { verifyToken } = require('../middleware/authMiddleware');

// POST Beli Tiket
router.post('/', verifyToken, ticketController.createTransaction);

// GET Riwayat Tiket (KITA MATIKAN DULU SEMENTARA)
// router.get('/my-tickets', verifyToken, ticketController.getUserTransactions);

module.exports = router;