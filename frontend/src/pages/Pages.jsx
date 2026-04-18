import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Pages() {
  const { user } = useAuth();
  const [pagesList, setPagesList] = useState([]);
  const [likedPages, setLikedPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pagesRes, likedRes] = await Promise.all([
        fetch('/api/pages', { headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } }),
        fetch('/api/pages/liked', { headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } })
      ]);
      const pagesData = await pagesRes.json();
      const likedData = await likedRes.json();
      setPagesList(pagesData);
      setLikedPages(likedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleLike = async (pageId) => {
    try {
      const res = await fetch(`/api/pages/${pageId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) {
        setLikedPages(prev => 
          prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
        );
        // Refresh page list to update follower counts
        const refreshRes = await fetch('/api/pages', { headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } });
        const refreshedData = await refreshRes.json();
        setPagesList(refreshedData);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 text-left">
      {/* Header Section */}
      <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl mb-12 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic flex items-center justify-center gap-3">
          <span>📄</span> Official Pages
        </h1>
        <p className="text-xl text-gray-400 max-w-[750px] mx-auto leading-relaxed font-medium">
          Connect with elite creators, global brands, and industry leaders. Stay updated with the voices that shape the Velora universe.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-10 rounded-2xl text-[0.9rem] uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95">
            + Establish Page
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-10 rounded-2xl text-[0.9rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            👍 Liked Portals
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-10 rounded-2xl text-[0.9rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            📩 Invites
          </button>
        </div>
      </div>

      <div className="text-[0.7rem] font-black text-gray-500 uppercase mb-6 pl-2 tracking-[0.3em]">Authorized Creators & Brands Matrix</div>
      
      {/* Grid Cards Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Entities...</div>
        </div>
      ) : pagesList.length === 0 ? (
        <div className="glass-card p-20 text-center text-gray-500 rounded-3xl border border-white/5">
          <div className="text-4xl mb-4">🌑</div>
          <div className="text-lg font-bold">No official portals identified.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagesList.map((p) => {
            const isLiked = likedPages.includes(p.id);
            return (
              <div key={p.id} className="glass-card rounded-3xl border border-white/5 overflow-hidden group hover:border-purple-500/40 transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-black/20 flex flex-col">
                <div className="relative h-48 overflow-hidden">
                   <img src={p.cover} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight group-hover:text-purple-400 transition-colors leading-tight flex items-center gap-2">
                    {p.name} <span className="text-blue-400 text-sm drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" title="Verified Protocol">✓</span>
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <span>🔥 {p.followers_count} followers</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>Verified Entity</span>
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                    <button 
                      onClick={() => toggleLike(p.id)}
                      className={`flex-1 font-black py-3.5 rounded-2xl text-[0.8rem] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isLiked ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/10'}`}
                    >
                      {isLiked ? '✓ Liked' : '👍 Like Portal'}
                    </button>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-black py-3.5 rounded-2xl text-[0.8rem] uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 active:scale-95">
                      Follow
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
