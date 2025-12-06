const express = require('express');
// Import middleware satpam
const authenticateToken = require('../middleware/authMiddleware'); 
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// --- ROUTE DIPROTEKSI SATPAM ---
// User harus punya token untuk akses ini
router.get('/me', authenticateToken, getMe); 

module.exports = router;