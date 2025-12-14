// File: src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  
  // State Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  
  // --- INTEGRASI BARU: STATE HARGA & STOK ---
  const [price, setPrice] = useState('');
  const [quota, setQuota] = useState('');
  // ------------------------------------------

  const [imageFile, setImageFile] = useState(null);

  // 1. AMBIL DATA EVENT (READ)
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/events');
      setEvents(res.data.data);
    } catch (err) {
      alert('Gagal ambil data event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 2. BUAT EVENT BARU (CREATE + UPLOAD)
  const handleCreate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('location', location);
    
    // --- INTEGRASI BARU: MASUKKAN HARGA & STOK KE FORMDATA ---
    formData.append('price', price);
    formData.append('quota', quota);
    // ---------------------------------------------------------

    if (imageFile) {
      formData.append('image', imageFile); 
    }

    try {
      await axios.post('http://localhost:3000/api/events', formData, {
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('✅ Event & Tiket Berhasil Dibuat!');
      fetchEvents(); 
      
      // Reset Form (Termasuk Price & Quota)
      setName(''); setDescription(''); setDate(''); setLocation(''); 
      setPrice(''); setQuota(''); // Reset state baru
      setImageFile(null);
      
      const fileInput = document.getElementById('fileInput');
      if(fileInput) fileInput.value = ""; 

    } catch (err) {
      alert('Gagal buat event: ' + (err.response?.data?.message || err.message));
    }
  };

  // 3. HAPUS EVENT (DELETE)
  const handleDelete = async (id) => {
    if(!confirm("Yakin mau hapus event ini?")) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEvents(); 
    } catch (err) {
      alert('Gagal hapus (Mungkin bukan event kamu?)');
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h3>Dashboard Admin</h3>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>

      {/* FORM INPUT */}
      <div className="form-container">
        <h4>+ Tambah Event Baru</h4>
        <form onSubmit={handleCreate} className="event-form">
          <input 
            type="text" 
            placeholder="Nama Event" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Deskripsi Singkat" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            required 
          />
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Lokasi (Misal: Jakarta)" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            required 
          />

          {/* --- INTEGRASI BARU: INPUT HARGA & STOK --- */}
          {/* Saya taruh berdampingan sedikit styling inline agar rapi, tapi tetap ngikut style parent */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
                type="number" 
                placeholder="Harga Tiket (Rp)" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                required 
                style={{ flex: 1 }}
            />
            <input 
                type="number" 
                placeholder="Jumlah Stok" 
                value={quota} 
                onChange={e => setQuota(e.target.value)} 
                required 
                style={{ flex: 1 }}
            />
          </div>
          {/* ------------------------------------------ */}
          
          {/* AREA UPLOAD FILE CUSTOM */}
          <div className="file-input-container" onClick={() => document.getElementById('fileInput').click()}>
            <label style={{cursor: 'pointer', fontWeight: 'bold', color: '#7f8c8d'}}>
                📸 Klik Disini untuk Upload Poster
            </label>
            <input 
              id="fileInput"
              type="file" 
              onChange={e => setImageFile(e.target.files[0])} 
              accept="image/*"
              style={{display: 'none'}} 
            />
            {imageFile && (
              <p style={{color: '#27ae60', margin: '5px 0', fontSize: '0.9rem'}}>
                File terpilih: {imageFile.name}
              </p>
            )}
          </div>

          <button type="submit" className="btn-save">SIMPAN EVENT</button>
        </form>
      </div>

      {/* LIST EVENT */}
      <h3 className="event-list-title">Daftar Event Aktif ({events.length})</h3>
      
      <div className="event-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            
            {/* GAMBAR */}
            {event.image ? (
              <img 
                src={`http://localhost:3000/${event.image}`} 
                alt={event.name} 
                className="event-image"
              />
            ) : (
              <div className="no-image">No Image</div>
            )}
            
            {/* TEXT DETAIL */}
            <div className="event-details">
              <h4 className="event-title">{event.name}</h4>
              <div className="event-meta">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>📍 {event.location}</span>
              </div>
              
              {/* --- INTEGRASI BARU: MENAMPILKAN INFO TIKET DI CARD --- */}
              <div style={{ background: '#f1f1f1', padding: '8px', borderRadius: '4px', margin: '10px 0', fontSize: '0.85rem', color: '#333' }}>
                 <div>💰 <strong>Rp {event.tickets?.[0]?.price.toLocaleString() || 0}</strong></div>
                 <div>📦 Stok: <strong>{event.tickets?.[0]?.quota || 0}</strong></div>
              </div>
              {/* ------------------------------------------------------ */}

              <p className="event-description">{event.description}</p>
              
              <button 
                className="btn-delete" 
                onClick={() => handleDelete(event.id)}
              >
                Hapus Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}