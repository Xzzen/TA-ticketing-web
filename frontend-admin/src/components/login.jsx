// File: src/components/Login.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Tembak ke Backend
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });

      console.log("✅ RESPON DARI BACKEND:", res.data);

      // 2. AMBIL TOKEN
      const tokenAsli = res.data.token || (res.data.data && res.data.data.token);
      
      // 3. AMBIL ROLE (INI YANG SEBELUMNYA HILANG) 👇
      // Kita cari role di berbagai kemungkinan tempat agar aman
      const roleUser = res.data.role || res.data.data?.role || res.data.user?.role || 'USER';

      if (tokenAsli) {
        console.log("🎫 Token:", tokenAsli);
        console.log("👤 Role:", roleUser); // Cek di console apakah ADMIN/USER muncul
        
        // PENTING: Kirim DUA data (Token DAN Role) ke App.jsx
        onLogin(tokenAsli, roleUser); 
      } else {
        setError('Login berhasil, tapi Token hilang.');
      }

    } catch (err) {
      console.error("Error saat login:", err);
      const pesanError = err.response?.data?.message || 'Login Gagal! Cek email/password.';
      setError(pesanError);
    }
  };

  return (
    <div className="login-container">
      <h2>Silakan Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          placeholder="email@contoh.com"
        />

        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          placeholder="Masukkan password"
        />

        <button type="submit">MASUK</button>
      </form>
    </div>
  );
}