// File: src/components/UserHome.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserHome({ token, onLogout }) {
  const [view, setView] = useState('browse'); 
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);

  // STATE BARU: UNTUK MODAL PEMBELIAN
  const [selectedEvent, setSelectedEvent] = useState(null); // Event yang sedang diklik
  const [qty, setQty] = useState(1); // Jumlah yang mau dibeli

  // 1. AMBIL DATA EVENT
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios.get('http://localhost:3000/api/events')
      .then(res => setEvents(res.data.data))
      .catch(err => console.error(err));
  };

  // 2. AMBIL TIKET SAYA
  const fetchMyTickets = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/transactions/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(res.data.data);
      setView('tickets');
    } catch (err) {
      alert('Gagal mengambil riwayat tiket.');
    }
  };

  // 3. FUNGSI BUKA MODAL
  const openBuyModal = (event) => {
    setSelectedEvent(event);
    setQty(1); // Reset jadi 1 setiap buka modal
  };

  // 4. FUNGSI EKSEKUSI BELI (DARI MODAL)
  const handleConfirmBuy = async () => {
    if (!selectedEvent) return;

    try {
      await axios.post('http://localhost:3000/api/transactions', 
        { 
          eventId: selectedEvent.id, 
          quantity: parseInt(qty) // Kirim jumlah sesuai input user
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`✅ Berhasil membeli ${qty} tiket!`);
      setSelectedEvent(null); // Tutup modal
      fetchMyTickets(); // Pindah ke halaman tiket saya
    } catch (err) {
      alert('Gagal beli: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper: Ambil info tiket dari array tickets (karena 1 event bisa punya banyak tipe tiket, kita ambil yg pertama aja)
  const getTicketInfo = (event) => {
    if (event.tickets && event.tickets.length > 0) {
      return event.tickets[0];
    }
    return null; // Belum ada tiket disetting admin
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h3>Halo, User!</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView('browse')} className={view === 'browse' ? 'active-btn' : ''}>🏠 Cari Event</button>
          <button onClick={fetchMyTickets} className={view === 'tickets' ? 'active-btn' : ''}>🎫 Tiket Saya</button>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      {/* VIEW: DAFTAR EVENT */}
      {view === 'browse' && (
        <div className="event-grid">
          {events.map(event => {
            const ticketInfo = getTicketInfo(event);
            return (
              <div key={event.id} className="event-card">
                {event.image ? (
                  <img src={`http://localhost:3000/${event.image}`} alt={event.name} className="event-image"/>
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <div className="event-details">
                  <h4>{event.name}</h4>
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  
                  {/* Tampilkan Info Stok & Harga */}
                  <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', margin: '10px 0', fontSize: '13px' }}>
                    {ticketInfo ? (
                      <>
                        <p>💰 Harga: <strong>Rp {ticketInfo.price.toLocaleString()}</strong></p>
                        <p>📦 Sisa Stok: <strong>{ticketInfo.quota}</strong></p>
                      </>
                    ) : (
                      <p style={{color: 'red'}}>Tiket belum tersedia</p>
                    )}
                  </div>

                  <button 
                    className="btn-buy"
                    onClick={() => openBuyModal(event)} // Buka Modal, jangan langsung beli
                    disabled={!ticketInfo || ticketInfo.quota <= 0} // Matikan tombol kalau habis
                  >
                    {ticketInfo && ticketInfo.quota <= 0 ? 'HABIS' : 'BELI TIKET'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TIKET SAYA */}
      {view === 'tickets' && (
        <div style={{ padding: '20px' }}>
          <h2>📂 Tiket Saya</h2>
          {myTickets.map(trx => (
            <div key={trx.id} style={ticketStyle}>
               <div style={{ borderRight: '2px dashed #ccc', paddingRight: '15px' }}>
                  <span style={badgeStyle}>{trx.status}</span>
               </div>
               <div style={{ paddingLeft: '15px' }}>
                  {trx.details && trx.details[0]?.ticket?.event ? (
                    <>
                      <h3>{trx.details[0].ticket.event.name}</h3>
                      <p>Jumlah: <b>{trx.details[0].quantity} Tiket</b></p>
                      <p>Total Bayar: Rp {trx.totalAmount.toLocaleString()}</p>
                    </>
                  ) : <p>Data event tidak tersedia</p>}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL POPUP (Overlay) --- */}
      {selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>🎟️ Beli Tiket</h3>
            <p>Event: <strong>{selectedEvent.name}</strong></p>
            
            {/* Info Harga Satuan */}
            {getTicketInfo(selectedEvent) && (
              <p>Harga Satuan: Rp {getTicketInfo(selectedEvent).price.toLocaleString()}</p>
            )}

            {/* Input Quantity */}
            <div style={{ margin: '20px 0' }}>
              <label>Jumlah Tiket:</label>
              <input 
                type="number" 
                min="1" 
                max={getTicketInfo(selectedEvent)?.quota || 100}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px', width: '60px' }}
              />
            </div>

            {/* Total Estimasi */}
            {getTicketInfo(selectedEvent) && (
              <p style={{ fontWeight: 'bold', color: '#2ecc71' }}>
                Total Bayar: Rp {(getTicketInfo(selectedEvent).price * qty).toLocaleString()}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleConfirmBuy} style={confirmBtnStyle}>KONFIRMASI</button>
              <button onClick={() => setSelectedEvent(null)} style={cancelBtnStyle}>BATAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS Tambahan untuk Modal ---
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)', // Layar hitam transparan
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: 'white', padding: '30px', borderRadius: '10px',
  width: '350px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
};

const confirmBtnStyle = {
  flex: 1, padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
};

const cancelBtnStyle = {
  flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
};

const ticketStyle = {
  display: 'flex', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', padding: '15px', marginBottom: '10px', alignItems: 'center'
};

const badgeStyle = {
  background: '#2ecc71', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold'
};