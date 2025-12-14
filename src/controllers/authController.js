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
    
    // Default role adalah "USER" jika tidak diisi
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

    // ✅ DISINI KUNCINYA: Role dimasukkan ke dalam Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      // ✅ KITA KIRIM ROLE SECARA EKSPLISIT BIAR FRONTEND GAMPANG BACANYA
      role: user.role, 
      token: token, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // Kirim role juga di data object
        token: token 
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Gagal login' });
  }
};

// --- 3. FUNGSI CEK PROFIL ---
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

// --- 4. EXPORT SATU PINTU (LEBIH AMAN) ---
module.exports = { 
  register, 
  login, 
  getMe 
};