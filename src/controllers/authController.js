// File: src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// --- 1. FUNGSI REGISTER ---
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || "USER" },
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: 'Gagal register user' });
  }
};

// --- 2. FUNGSI LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: token 
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Gagal login' });
  }
};

// --- 3. EXPORT (INI YANG PALING PENTING!) ---
// Pastikan register DAN login ada di dalam kurung kurawal
module.exports = { 
  register, 
  login 
};

// --- FUNGSI CEK PROFIL (BARU) ---
const getMe = async (req, res) => {
  try {
    // req.user.id ini didapat otomatis dari middleware tadi
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      // Pilih data yang mau ditampilkan saja (jangan tampilkan password)
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil data profil',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal ambil profil' });
  }
};

// JANGAN LUPA UPDATE EXPORT DI PALING BAWAH:
module.exports = { register, login, getMe };