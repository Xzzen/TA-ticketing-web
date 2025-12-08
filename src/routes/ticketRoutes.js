// File: src/routes/ticketRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { createTicket, getTicketsByEvent } = require('../controllers/ticketController');

const router = express.Router();

// POST /api/tickets (Wajib Login - Buat Tiket)
router.post('/', authenticateToken, createTicket);

// GET /api/tickets/event/:eventId (Public - Lihat Tiket di Event tertentu)
router.get('/event/:eventId', getTicketsByEvent);

module.exports = router;