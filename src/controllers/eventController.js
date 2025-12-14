// File: src/controllers/eventController.js
const prisma = require('../utils/prisma');
const Joi = require('joi'); 

// --- 1. FUNGSI BUAT EVENT (CREATE) ---
const createEvent = async (req, res) => {
  try {
    // A. VALIDASI INPUT
    const schema = Joi.object({
      name: Joi.string().min(5).max(100).required()
        .messages({'string.min': 'Nama event terlalu pendek (min 5 huruf)!'}),
      description: Joi.string().min(10).required()
        .messages({'string.min': 'Deskripsi terlalu pendek (min 10 huruf)!'}),
      date: Joi.date().iso().greater('now').required()
        .messages({'date.greater': 'Tanggal event harus di masa depan!'}),
      location: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // B. PROSES SIMPAN
    const { name, description, date, location } = req.body;
    const organizerId = req.user.id;
    const imageFilename = req.file ? req.file.filename : null;
    
    // Kita buat Event sekaligus Tiket default (misal 100 tiket) biar user langsung bisa beli
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        image: imageFilename,
        organizerId,
        // (Opsional) Buat tiket otomatis saat event dibuat
        tickets: {
            create: {
                name: 'Regular Ticket',
                price: 50000, // Harga Default (Bisa diedit nanti)
                quota: 100    // Stok Default
            }
        }
      }
    });

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
        deletedAt: null 
      },
      include: {
        organizer: {
          select: { name: true, email: true }
        },
        // 🔥 PERUBAHAN PENTING DISINI 🔥
        // Sertakan data tiket agar Frontend tahu Harga & Stok!
        tickets: true 
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
    const { id } = req.params;
    const { name, description, date, location } = req.body;
    const userId = req.user.id; 

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    if (event.organizerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Anda tidak berhak mengedit event ini!' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        date: date ? new Date(date) : undefined,
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

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    if (event.organizerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus event ini!' });
    }

    await prisma.event.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ 
      success: true, 
      message: 'Event berhasil dihapus (Soft Delete)!' 
    });

  } catch (error) {
    console.error("❌ ERROR SAAT HAPUS EVENT:", error); 
    res.status(500).json({ 
      success: false, 
      message: 'Gagal hapus event',
      errorDetail: error.message
    });
  }
};

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent };