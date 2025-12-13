// File: src/components/Login.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error sebelum mencoba

    try {
      // 1. Tembak ke Backend
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });

      // --- LOGIKA DEBUGGING (TETAP DIPERTAHANKAN) ---
      console.log("✅ RESPON DARI BACKEND:", res.data);

      // 2. AMBIL TOKEN DENGAN AMAN
      const tokenAsli = res.data.token || (res.data.data && res.data.data.token);

      if (tokenAsli) {
        console.log("🎫 Token berhasil diambil:", tokenAsli);
        onLogin(tokenAsli); // Kirim token yang valid ke App.jsx
      } else {
        console.error("❌ Token tidak ditemukan di dalam respon!");
        setError('Login berhasil, tapi Token hilang. Cek Console (F12).');
      }

    } catch (err) {
      console.error("Error saat login:", err);
      // Tampilkan pesan error dari backend jika ada
      const pesanError = err.response?.data?.message || 'Login Gagal! Cek email/password.';
      setError(pesanError);
    }
  };

  return (
    // Gunakan className dari App.css
    <div className="login-container">
      <h2>Silakan Login</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Hapus inline style, biarkan CSS yang mengatur kerapiannya */}
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          placeholder="admin@example.com"
        />

        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          placeholder="Masukkan password"
        />

        <button type="submit">MASUK DASHBOARD</button>
      </form>
    </div>
  );
}