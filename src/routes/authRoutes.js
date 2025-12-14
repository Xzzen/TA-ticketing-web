// File: src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Import controller
const { verifyToken } = require('../middleware/authMiddleware'); // Import Satpam Token

// 1. REGISTER (POST /api/auth/register)
router.post('/register', authController.register);

// 2. LOGIN (POST /api/auth/login)
router.post('/login', authController.login);

// 3. CEK PROFILE (GET /api/auth/me) - INI YANG TADI ERROR
// Kita tambahkan 'verifyToken' karena user harus login dulu baru bisa cek profil
// Pastikan authController.getMe sudah dibuat di file controller!
router.get('/me', verifyToken, authController.getMe);

module.exports = router;