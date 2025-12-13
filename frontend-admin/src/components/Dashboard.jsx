// File: src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  
  // State Form (Dibuat terpisah agar lebih mudah dikelola)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
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
    
    // Pakai FormData karena ada FILE
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('location', location);
    
    // Masukkan file jika user memilih gambar
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
      
      alert('✅ Event Berhasil Dibuat!');
      fetchEvents(); // Refresh list otomatis
      
      // Reset Form
      setName(''); setDescription(''); setDate(''); setLocation(''); setImageFile(null);
      
      // Trik untuk mereset input file HTML
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
      fetchEvents(); // Refresh list
    } catch (err) {
      alert('Gagal hapus (Mungkin bukan event kamu?)');
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h3>🔥 Dashboard Admin</h3>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>

      {/* FORM INPUT KEREN */}
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
              style={{display: 'none'}} // Sembunyikan input asli biar rapi
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

      {/* LIST EVENT (GRID LAYOUT) */}
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