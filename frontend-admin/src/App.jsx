// File: src/App.jsx
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserHome from './components/UserHome'; // ⚠️ Pastikan file ini sudah dibuat
import './App.css'; // Opsional jika ada CSS global

function App() {
  // 1. Ambil Token DAN Role dari penyimpanan
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  // 2. Fungsi Login: Terima Token & Role, lalu simpan
  const handleLogin = (newToken, newRole) => {
    // Paksa role jadi HURUF BESAR agar konsisten (misal: 'admin' jadi 'ADMIN')
    const safeRole = newRole ? newRole.toUpperCase() : 'USER';

    localStorage.setItem('token', newToken);
    localStorage.setItem('role', safeRole);
    
    setToken(newToken);
    setRole(safeRole);
    
    // Refresh halaman agar state benar-benar bersih
    window.location.reload(); 
  };

  // 3. Fungsi Logout: Hapus semuanya
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    window.location.reload();
  };

  // --- LOGIKA UTAMA (ROUTING) ---
  let HalamanTampil;

  if (!token) {
    // A. Belum Login
    HalamanTampil = <Login onLogin={handleLogin} />;
  } else {
    // B. Sudah Login -> Cek Role
    // Pastikan role dibaca sebagai huruf besar
    const currentRole = role ? role.toUpperCase() : 'USER';

    if (currentRole === 'ADMIN') {
      HalamanTampil = <Dashboard token={token} onLogout={handleLogout} />;
    } else {
      HalamanTampil = <UserHome token={token} onLogout={handleLogout} />;
    }
  }

  return (
    <div className="app-container">
       {/* Render Halaman yang sudah dipilih di atas */}
       {HalamanTampil}
    </div>
  );
}

export default App;