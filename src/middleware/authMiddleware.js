// File: src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// --- SATPAM 1: CEK TOKEN (VERIFIKASI LOGIN) ---
const verifyToken = (req, res, next) => {
  // 1. Ambil token dari Header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

    // 4. Token valid! Simpan data user (id & role) ke request
    req.user = user;
    next(); // Lanjut ke proses berikutnya (bisa ke verifyAdmin atau langsung controller)
  });
};

// --- SATPAM 2: CEK ADMIN (OTORISASI) ---
// Middleware ini HANYA boleh dipasang SETELAH verifyToken
const verifyAdmin = (req, res, next) => {
  // Cek apakah data user ada (dari verifyToken) DAN role-nya ADMIN
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Silakan lewat, Bos!
  } else {
    // Kalau bukan Admin (misal: USER), tolak!
    return res.status(403).json({
      success: false,
      message: 'AKSES DITOLAK: Fitur ini khusus Admin!'
    });
  }
};

// --- EXPORT KEDUANYA ---
module.exports = { verifyToken, verifyAdmin };