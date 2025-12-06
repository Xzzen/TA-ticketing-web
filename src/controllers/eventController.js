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

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date), // Ubah text jadi format Tanggal
        location,
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
      // Sertakan data pembuat event (Organizer)
      include: {
        organizer: {
          select: { name: true, email: true } // Jangan tampilkan password!
        }
      },
      orderBy: {
        date: 'asc' // Urutkan dari tanggal terdekat
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

// Jangan lupa Export!
module.exports = { createEvent, getAllEvents };