// File: src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan di folder 'public/uploads' yang tadi kita buat
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    // Buat nama file unik: "event-" + tanggal-jam-detik + ekstensi asli
    // Contoh hasil: event-16788899922-gambar.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file (Opsional: agar cuma bisa upload gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Terima
  } else {
    cb(new Error('Hanya boleh upload file gambar!'), false); // Tolak
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file maksimal 5MB
  fileFilter: fileFilter
});

module.exports = upload;