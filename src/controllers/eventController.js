// File: src/controllers/eventController.js
const prisma = require('../utils/prisma');
const Joi = require('joi'); // Library Validasi (Wajib ada)

// --- 1. FUNGSI BUAT EVENT (CREATE) ---
const createEvent = async (req, res) => {
  try {
    // A. VALIDASI INPUT (Filter Data Nakal)
    // Kita atur syarat data yang boleh masuk
    const schema = Joi.object({
      name: Joi.string().min(5).max(100).required()
        .messages({'string.min': 'Nama event terlalu pendek (min 5 huruf)!'}),
      description: Joi.string().min(10).required()
        .messages({'string.min': 'Deskripsi terlalu pendek (min 10 huruf)!'}),
      date: Joi.date().iso().greater('now').required()
        .messages({'date.greater': 'Tanggal event harus di masa depan!'}),
      location: Joi.string().required()
    });

    // Cek apakah data user sesuai syarat?
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message // Kasih tau user salahnya dimana
      });
    }

    // B. PROSES SIMPAN KE DATABASE
    const { name, description, date, location } = req.body;
    const organizerId = req.user.id; // Didapat otomatis dari Token (Middleware)
    const imageFilename = req.file ? req.file.filename : null;
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date), // Ubah text jadi format Tanggal
        location,
        image: imageFilename, // <--- SIMPAN NAMA FILE KE DATABASE
        organizerId // Event ini milik user yang login
      }
    });

    // C. KIRIM RESPONSE SUKSES
    res.status(201).json({
      success: true,
      message: 'Event berhasil dibuat!',
      data: event
    });

  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: 'Gagal membuat event' });
  }
};

// --- 2. FUNGSI LIHAT SEMUA EVENT (READ) ---
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        deletedAt: null // <--- FILTER PENTING: Hanya ambil yang BELUM dihapus
      },
      include: {
        organizer: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil data event',
      data: events
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ success: false, message: 'Gagal ambil data event' });
  }
};
// --- 3. FUNGSI EDIT EVENT (UPDATE) ---
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID event dari URL
    const { name, description, date, location } = req.body;
    const userId = req.user.id; 

    // A. Cek dulu eventnya ada atau tidak
    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    // B. LOGIC ANTI-NAKAL: Cek Kepemilikan
    // Kalau bukan pemilik DAN bukan Admin, tolak!
    if (event.organizerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Anda tidak berhak mengedit event ini!' });
    }

    // C. Update Database
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined, // Update kalau ada input tanggal baru
        location
      }
    });

    res.json({ success: true, message: 'Event berhasil diupdate', data: updatedEvent });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update event' });
  }
};

// --- 4. FUNGSI HAPUS EVENT (DELETE) ---
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // A. Cek event
    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    // B. LOGIC ANTI-NAKAL
    if (event.organizerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus event ini!' });
    }

   // C. SOFT DELETE (Bukan Delete beneran)
    // Kita update kolom deletedAt menjadi waktu sekarang
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date() // Tandai sebagai terhapus sekarang
      }
    });

    res.json({ 
      success: true, 
      message: 'Event berhasil dihapus (Soft Delete)! Data transaksi tetap aman.' 
    });

  } catch (error) {
    // TAMBAHKAN INI AGAR ERROR MUNCUL DI TERMINAL
    console.error("❌ ERROR SAAT HAPUS EVENT:", error); 

    res.status(500).json({ 
      success: false, 
      message: 'Gagal hapus event',
      errorDetail: error.message // Tampilkan error ke Postman juga biar gampang
    });
  }
};

// Jangan lupa Export!
module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent };