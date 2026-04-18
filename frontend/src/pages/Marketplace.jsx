import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/marketplace', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const initializeContact = (sellerId, itemTitle) => {
    // Navigate to messages and potentially initiate a thread
    // For now, we redirect to messages hub. 
    // Evolution point: pass state to Messages.jsx to auto-start a convo
    navigate('/messages', { state: { targetUserId: sellerId, initialMsg: `Hi, I'm interested in your listing: "${itemTitle}". Protocol for acquisition?` } });
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 text-left">
      {/* Header Section */}
      <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl mb-12 text-center relative overflow-hidden group">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic flex items-center justify-center gap-3">
          <span>🏪</span> Marketplace
        </h1>
        <p className="text-xl text-gray-400 max-w-[750px] mx-auto leading-relaxed font-medium">
          The ultimate protocol for elite commerce. Acquire exclusive assets and list your premium inventory in the Velora ecosystem.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-8 rounded-2xl text-[0.85rem] uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95">
            + New Listing
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-2xl text-[0.85rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            🔍 Browse
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-2xl text-[0.85rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            📦 Yours
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-2xl text-[0.85rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            🔖 Saved
          </button>
        </div>
      </div>

      <div className="text-[0.7rem] font-black text-gray-500 uppercase mb-6 pl-2 tracking-[0.3em]">Authorized Commercial Listings Matrix</div>
      
      {/* Marketplace Grid Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Commercial Uplink...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-20 text-center text-gray-500 rounded-3xl border border-white/5">
          <div className="text-4xl mb-4">🌑</div>
          <div className="text-lg font-bold uppercase tracking-tighter">No assets available in the current sector.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden group hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1 shadow-lg shadow-black/20 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                 <img src={item.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                    <div className="text-xl font-black text-white drop-shadow-md tracking-tight">{item.price}</div>
                 </div>
                 <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md text-white text-[0.6rem] font-black uppercase px-2 py-1 rounded-md border border-white/10">{item.condition}</div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-[0.95rem] font-bold text-white mb-2 leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-[0.7rem] font-bold uppercase tracking-widest mb-4">
                  <span>📍 {item.location || 'Encrypted'}</span>
                </div>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => initializeContact(item.user_id, item.title)}
                    className="w-full bg-white/5 hover:bg-purple-600 hover:text-white text-gray-400 font-black py-3 rounded-xl text-[0.75rem] uppercase tracking-widest transition-all border border-white/5 hover:border-purple-500 group-hover:shadow-md"
                  >
                     Initialize Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
