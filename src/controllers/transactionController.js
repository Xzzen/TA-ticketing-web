// File: src/controllers/transactionController.js
const prisma = require('../utils/prisma');

// --- 1. BELI TIKET ---
const createTransaction = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const userId = req.user.id; 

    // A. Cek apakah Event ada?
    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!event) return res.status(404).json({ message: 'Event tidak ditemukan' });

    // B. CARI TIKET UNTUK EVENT INI
    // Karena Schema Anda menghubungkan Transaction ke Ticket, bukan Event langsung.
    // Kita cari tiket pertama yang tersedia untuk event ini.
    let ticket = await prisma.ticket.findFirst({
      where: { eventId: parseInt(eventId) }
    });

    // C. JAGA-JAGA: Kalau Tiket belum dibuat admin, kita buatkan tiket otomatis (Default)
    // Supaya transaksi tidak error "Foreign Key Failed"
    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          name: 'Regular Ticket',
          price: 0, // Gratiskan dulu atau set harga default
          quota: 100,
          eventId: parseInt(eventId)
        }
      });
    }

    // D. Hitung Subtotal (Harga Tiket x Jumlah)
    const hitungSubtotal = ticket.price * parseInt(quantity);

    // E. Buat Transaksi (HEADER + DETAIL)
    const transaction = await prisma.transaction.create({
      data: {
        // --- Header (Tabel Transaction) ---
        userId: userId,
        totalAmount: hitungSubtotal, // Total seluruh belanjaan
        status: 'SUCCESS',

        // --- Detail (Tabel TransactionDetail) ---
        details: {
          create: [
            {
              // PENTING: Sesuai Schema, pakai ticketId dan subtotal
              ticketId: ticket.id,       // ✅ Ganti eventId jadi ticketId
              quantity: parseInt(quantity),
              subtotal: hitungSubtotal   // ✅ Ganti totalPrice jadi subtotal
            }
          ]
        }
      },
      include: {
        details: {
          include: { ticket: true } // Sertakan data tiket di response
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil!',
      data: transaction
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
      orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
      include: { 
        details: {
           include: { 
             ticket: {
               include: { event: true } // Ambil data Event lewat Tiket
             } 
           } 
        }
      } 
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil data transaksi' });
  }
};

module.exports = {
  createTransaction,
  getUserTransactions
};