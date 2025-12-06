// File: src/routes/eventRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware'); // Import Satpam
const { createEvent, getAllEvents } = require('../controllers/eventController');

const router = express.Router();

// Route: POST /api/events (DIPROTEKSI - Wajib Login)
router.post('/', authenticateToken, createEvent);

// Route: GET /api/events (PUBLIK - Boleh Siapa Saja)
router.get('/', getAllEvents);

module.exports = router;