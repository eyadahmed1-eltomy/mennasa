import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Groups() {
  const { user } = useAuth();
  const [groupsList, setGroupsList] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [groupsRes, joinedRes] = await Promise.all([
        fetch('/api/groups', { headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } }),
        fetch('/api/groups/my', { headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } })
      ]);
      const groupsData = await groupsRes.json();
      const joinedData = await joinedRes.json();
      setGroupsList(groupsData);
      setJoinedGroups(joinedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleJoin = async (groupId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) {
        setJoinedGroups(prev => 
          prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
        // Refresh group list to update member counts
        const refreshRes = await fetch('/api/groups', { headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } });
        const refreshedData = await refreshRes.json();
        setGroupsList(refreshedData);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 text-left">
      {/* Header Section */}
      <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl mb-12 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic flex items-center justify-center gap-3">
          <span>👥</span> Groups
        </h1>
        <p className="text-xl text-gray-400 max-w-[750px] mx-auto leading-relaxed font-medium">
          Discover and forge alliances in exclusive digital realms. Connect with experts, hobbyists, and visionaries.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-10 rounded-2xl text-[0.9rem] uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95">
            + New Group
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-10 rounded-2xl text-[0.9rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            🔍 Discover
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-10 rounded-2xl text-[0.9rem] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
            👤 Your Groups
          </button>
        </div>
      </div>

      <div className="text-[0.7rem] font-black text-gray-500 uppercase mb-6 pl-2 tracking-[0.3em]">Curated Communities Matrix</div>
      
      {/* Grid Cards Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Realms...</div>
        </div>
      ) : groupsList.length === 0 ? (
        <div className="glass-card p-20 text-center text-gray-500 rounded-3xl border border-white/5">
          <div className="text-4xl mb-4">🌑</div>
          <div className="text-lg font-bold">No groups found in the matrix.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupsList.map((g) => {
            const isJoined = joinedGroups.includes(g.id);
            return (
              <div key={g.id} className="glass-card rounded-3xl border border-white/5 overflow-hidden group hover:border-purple-500/40 transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-black/20 flex flex-col">
                <div className="relative h-48 overflow-hidden">
                   <img src={g.cover} alt={g.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight group-hover:text-purple-400 transition-colors leading-tight">{g.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <span>⚡ {g.members_count} members</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>🌐 Open Realm</span>
                  </div>
                  <p className="text-gray-500 text-[0.88rem] leading-relaxed font-bold italic mb-6 line-clamp-2">" {g.bio || 'Joining this group grants you access to exclusive digital experiences and specialized protocol updates.'} "</p>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => toggleJoin(g.id)}
                      className={`w-full font-black py-3.5 rounded-2xl text-[0.8rem] uppercase tracking-widest transition-all border active:scale-95 ${isJoined ? 'bg-white/5 text-purple-400 border-purple-500/30' : 'bg-white/5 hover:bg-purple-600 hover:text-white text-gray-300 border-white/10 hover:border-purple-500'}`}
                    >
                      {isJoined ? '✓ Member Protocol' : 'Join Protocol'}
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
