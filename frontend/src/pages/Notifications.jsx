import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      fetchNotifs();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-white">Notifications</h1>
        <div className="flex items-center gap-2">
           <button onClick={markAllRead} className="text-purple-400 text-sm font-bold hover:underline">Mark all as read</button>
           <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400">⋯</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >All</button>
        <button 
          onClick={() => setFilter('unread')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === 'unread' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >Unread</button>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 font-bold text-gray-400 border-b border-white/5">Earlier</div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium tracking-tight">No notifications to show.</div>
        ) : filtered.map((n) => (
          <div 
            key={n.id} 
            className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 group ${!n.is_read ? 'bg-white/5' : ''}`}
            onClick={() => {
              if (n.type === 'follow') navigate(`/profile?id=${n.actor_id}`);
              else navigate('/'); // Redirect to post or home
            }}
          >
            <div className="relative">
              <img src={n.actor_avatar} alt="" className="w-14 h-14 rounded-full object-cover border border-white/10 shadow-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-[10px] border-2 border-[#0a0e27]">
                {n.type === 'like' ? '💜' : n.type === 'comment' ? '💬' : '👤'}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[0.95rem] text-gray-200">
                <span className="font-bold text-white uppercase tracking-tight text-sm">{n.actor_name}</span> {n.type === 'like' ? 'liked your post.' : n.type === 'comment' ? 'commented on your post.' : 'started following you.'}
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            {!n.is_read && (
              <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
