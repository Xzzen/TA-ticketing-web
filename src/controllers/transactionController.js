// File: src/controllers/transactionController.js
const prisma = require('../utils/prisma');

// --- 1. BELI TIKET ---
const createTransaction = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id; 
    const jumlahBeli = parseInt(quantity);

    // A. Cek Event
    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    // B. Cek Tiket & Stok
    let ticket = await prisma.ticket.findFirst({
      where: { eventId: parseInt(eventId) }
    });

    // Jika tiket belum ada (case khusus), buatkan dummy
    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: { name: 'Regular Ticket', price: 50000, quota: 100, eventId: parseInt(eventId) }
      });
    }

    // 🔥 PENTING: Cek apakah stok cukup?
    if (ticket.quota < jumlahBeli) {
      return res.status(400).json({ message: `Stok tidak cukup! Sisa: ${ticket.quota}` });
    }

    // C. Hitung Subtotal
    const hitungSubtotal = ticket.price * jumlahBeli;

    // D. DATABASE TRANSACTION (Supaya Aman)
    // Kita pakai $transaction biar kalau gagal simpan transaksi, stok gak kepotong (Rollback)
    const result = await prisma.$transaction(async (prisma) => {
      
      // 1. Kurangi Stok Tiket
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          quota: {
            decrement: jumlahBeli // Fungsi ajaib Prisma: Kurangi sebesar jumlahBeli
          }
        }
      });

      // 2. Buat Data Transaksi
      const newTransaction = await prisma.transaction.create({
        data: {
          userId: userId,
          totalAmount: hitungSubtotal,
          status: 'SUCCESS',
          details: {
            create: [
              {
                ticketId: ticket.id,
                quantity: jumlahBeli,
                subtotal: hitungSubtotal
              }
            ]
          }
        },
        include: { details: { include: { ticket: true } } }
      });

      return newTransaction;
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil!',
      data: result
    });

  } catch (error) {
    console.error("Error Transaksi:", error);
    res.status(500).json({ message: 'Gagal memproses transaksi: ' + error.message });
  }
};

// --- 2. LIHAT RIWAYAT TIKET ---
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: { 
        details: { include: { ticket: { include: { event: true } } } } 
      } 
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil data transaksi' });
  }
};

module.exports = { createTransaction, getUserTransactions };