// File: src/controllers/ticketController.js
const prisma = require('../utils/prisma');
const Joi = require('joi');

// --- 1. BUAT TIKET (Hanya Pemilik Event yang boleh) ---
const createTicket = async (req, res) => {
  try {
    // A. Validasi Input
    const schema = Joi.object({
      eventId: Joi.number().required(),
      name: Joi.string().required(), // Misal: VIP, Regular
      price: Joi.number().min(0).required(), // Harga tidak boleh minus
      quota: Joi.number().min(1).required() // Stok minimal 1
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { eventId, name, price, quota } = req.body;
    const userId = req.user.id; // User yang sedang login

    // B. CEK KEPEMILIKAN EVENT (Anti-Nakal Logic) 🛡️
    // Cari event-nya dulu
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    // 1. Cek apakah event ada?
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan!' });
    }

    // 2. Cek apakah yang login adalah pemilik event?
    if (event.organizerId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Dilarang! Anda bukan pemilik event ini.' 
      });
    }

    // C. Kalau aman, baru buat tiket
    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        name,
        price,
        quota
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tiket berhasil dibuat!',
      data: ticket
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat tiket' });
  }
};

// --- 2. LIHAT TIKET PER EVENT ---
const getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params; // Ambil dari URL (misal: /api/tickets/event/1)

    const tickets = await prisma.ticket.findMany({
      where: { eventId: parseInt(eventId) }
    });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal ambil tiket' });
  }
};

module.exports = { createTicket, getTicketsByEvent };