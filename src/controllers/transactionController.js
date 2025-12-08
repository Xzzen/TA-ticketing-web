// File: src/controllers/transactionController.js
const prisma = require('../utils/prisma');

// --- FUNGSI BELI TIKET (ORDER) ---
const createTransaction = async (req, res) => {
  try {
    const { ticketId, quantity } = req.body;
    const userId = req.user.id; // Pembeli adalah user yang login

    // 1. Cek Tiket & Stok
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
    }

    if (ticket.quota < quantity) {
      return res.status(400).json({ success: false, message: 'Stok tiket habis atau tidak cukup!' });
    }

    // 2. Hitung Total Harga
    const totalAmount = ticket.price * quantity;

    // 3. MULAI TRANSAKSI DATABASE (Prisma Transaction)
    // Kita pakai $transaction supaya "Catat Order" dan "Kurangi Stok" terjadi bersamaan.
    const result = await prisma.$transaction(async (prisma) => {
      
      // A. Buat Header Transaksi
      const newTransaction = await prisma.transaction.create({
        data: {
          userId,
          totalAmount,
          status: 'SUCCESS', // Anggap langsung lunas dulu
          details: {
            create: [
              {
                ticketId,
                quantity,
                subtotal: totalAmount
              }
            ]
          }
        },
        include: {
          details: true // Tampilkan detailnya di response
        }
      });

      // B. Kurangi Stok Tiket (PENTING!)
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          quota: {
            decrement: quantity // Kurangi stok otomatis
          }
        }
      });

      return newTransaction;
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil! Tiket sudah dibeli.',
      data: result
    });

  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ success: false, message: 'Gagal memproses transaksi' });
  }
};

// --- FUNGSI LIHAT RIWAYAT BELANJA (History) ---
const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        details: {
          include: {
            ticket: { select: { name: true, event: { select: { name: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal ambil riwayat' });
  }
};

module.exports = { createTransaction, getMyTransactions };