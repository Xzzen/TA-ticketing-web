// File: src/controllers/authController.js
const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');

const register = async (req, res) => {
  try {
    // 1. Ambil data dari body request
    const { name, email, password, role } = req.body;

    // 2. Validasi sederhana (Cek email duplikat)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, // Format response standar
        message: 'Email sudah terdaftar!' 
      });
    }

    // 3. Enkripsi Password (Wajib)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke Database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER" // Default jadi USER
      },
    });

    // 5. Kirim Response Sukses
    res.status(201).json({
      success: true, // Format response standar
      message: 'Registrasi berhasil!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

module.exports = { register };