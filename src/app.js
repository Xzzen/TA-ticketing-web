require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path'); // <--- IMPORT PATH (Bawaan Node.js)


// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes'); 
const eventRoutes = require('./routes/eventRoutes'); // <--- 1. TAMBAHKAN INI (Import Route Event)
const ticketRoutes = require('./routes/ticketRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE WAJIB ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public/uploads')));


// --- DAFTARKAN ROUTES DI SINI ---
app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes); // <--- 2. TAMBAHKAN INI (Daftarkan URL /api/events)
app.use('/api/tickets', ticketRoutes);
app.use('/api/transactions', transactionRoutes);

// --- ROUTE UTAMA ---
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