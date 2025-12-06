// File: src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // 1. Ambil token dari Header (Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil kata kedua

  // 2. Kalau tidak ada token, tolak!
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak! Token tidak ditemukan.'
    });
  }

  // 3. Verifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token tidak valid atau kadaluwarsa.'
      });
    }

    // 4. Token valid! Simpan data user agar bisa dipakai di controller
    req.user = user;
    next(); // Lanjut ke proses berikutnya
  });
};

module.exports = authenticateToken;