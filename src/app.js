require('dotenv').config(); // Load konfigurasi dari .env
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes'); // Panggil file route yang baru dibuat

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE WAJIB ---
app.use(cors()); // Agar bisa diakses dari luar
app.use(morgan('dev')); // Logger: Mencatat request di terminal
app.use(express.json()); // Agar bisa baca input format JSON
app.use(express.urlencoded({ extended: true })); // Agar bisa baca input Form

// --- DAFTARKAN ROUTES DI SINI ---
// Artinya: Semua URL yang diawali /api/auth akan masuk ke authRoutes
app.use('/api/auth', authRoutes); 

// --- ROUTE UTAMA (Check Server) ---
app.get('/', (req, res) => {
  res.json({
    message: "Server Event Ticketing siap meluncur tawwana! 🚀",
    serverTime: new Date()
  });
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`\n✅ Server berjalan di: http://localhost:${PORT}`);
});

module.exports = app;