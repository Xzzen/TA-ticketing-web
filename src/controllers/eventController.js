// File: src/controllers/eventController.js
const prisma = require('../utils/prisma');
const Joi = require('joi'); 

// --- 1. CREATE EVENT (Plus Tiket Custom) ---
const createEvent = async (req, res) => {
  try {
    // Ambil data dari body (FormData)
    const { name, description, date, location, price, quota } = req.body;
    const organizerId = req.user.id;
    const imageFilename = req.file ? req.file.filename : null;

    // Validasi sederhana
    if (!name || !description || !date || !location || !price || !quota) {
        return res.status(400).json({ message: "Semua kolom wajib diisi!" });
    }
    
    // Simpan Event + Tiket Sekaligus
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        location,
        image: imageFilename,
        organizerId,
        // 🔥 FITUR BARU: Buat tiket sesuai input Admin
        tickets: {
            create: {
                name: 'Regular Ticket',
                price: parseInt(price), // Ambil dari input
                quota: parseInt(quota)  // Ambil dari input
            }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Event & Tiket berhasil dibuat!', data: event });

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ success: false, message: 'Gagal membuat event' });
  }
};

// --- 2. GET EVENTS ---
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { deletedAt: null },
      include: {
        organizer: { select: { name: true, email: true } },
        tickets: true // Wajib include tiket biar Admin bisa lihat stok saat ini
      },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal ambil data' });
  }
};

// --- 3. UPDATE EVENT (Plus Update Harga/Stok) ---
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // Ambil input baru
    const { name, description, date, location, price, quota } = req.body;
    const imageFilename = req.file ? req.file.filename : undefined; // Kalau ada upload baru

    // Cek Event Lama
    const event = await prisma.event.findUnique({ 
        where: { id: parseInt(id) },
        include: { tickets: true } // Ambil tiket lamanya juga
    });
    
    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    // Update Data Event
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        name, description, location,
        date: date ? new Date(date) : undefined,
        image: imageFilename // Update gambar kalau ada file baru
      }
    });

    // 🔥 FITUR BARU: Update Data Tiket juga
    // Kita update tiket pertama yang nempel di event ini
    if (event.tickets && event.tickets.length > 0) {
        await prisma.ticket.update({
            where: { id: event.tickets[0].id },
            data: {
                price: price ? parseInt(price) : undefined,
                quota: quota ? parseInt(quota) : undefined
            }
        });
    }

    res.json({ success: true, message: 'Event & Tiket berhasil diupdate' });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: 'Gagal update event' });
  }
};

// --- 4. DELETE EVENT ---
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });
    res.json({ success: true, message: 'Event berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal hapus event' });
  }
};

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent };