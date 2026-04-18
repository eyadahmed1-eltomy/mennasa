import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifTray, setShowNotifTray] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const searchTimeout = useRef(null);

  const navTabs = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/reels', icon: '🎬', label: 'Reels' },
    { path: '/groups', icon: '👥', label: 'Groups' },
    { path: '/marketplace', icon: '🏪', label: 'Marketplace' },
    { path: '/pages', icon: '📄', label: 'Pages' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    if (searchQuery.length > 1) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/users/search?q=${searchQuery}`, { headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }});
          const data = await res.json();
          setSearchResults(data);
        } catch (e) { console.error(e); }
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications', { headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }})
        .then(res => res.json()).then(data => setNotifications(data)).catch(e => console.error(e));
    }
  }, [user, showNotifTray]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="navbar flex items-center px-4 bg-(--bg-primary) border-b sticky top-0 z-50 h-14">
      <Link to="/" className="navbar-brand text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mr-4">Velora</Link>

      <div className="relative flex-1 max-w-md">
        <div className="flex items-center bg-(--bg-secondary) rounded-full px-3 py-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search Velora..."
            className="bg-transparent border-none outline-none ml-2 text-sm w-full text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 w-full glass-card p-2 shadow-2xl rounded-xl border border-(--border)">
             {searchResults.map(u => (
               <button key={u.id} className="flex items-center w-full p-2 hover:bg-white/5 rounded-lg transition-all" onClick={() => { navigate(`/profile?id=${u.id}`); setSearchResults([]); setSearchQuery(''); }}>
                 <img src={u.avatar} className="w-9 h-9 rounded-full object-cover mr-3" alt="" />
                 <div className="text-left"><div className="font-bold text-sm text-white">{u.name}</div><div className="text-xs text-gray-400">User</div></div>
               </button>
             ))}
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-2 mx-auto justify-center flex-1 pr-32">
        {navTabs.map((tab) => (
          <button
            key={tab.path}
            className={`flex items-center justify-center w-24 h-12 rounded-lg text-2xl hover:bg-white/5 transition-all ${isActive(tab.path) ? 'text-purple-500 border-b-4 border-purple-500 rounded-none' : 'text-gray-400'}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-(--bg-secondary) hover:bg-white/10 text-xl" onClick={() => navigate('/messages')}>💬</button>
        <div className="relative">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-(--bg-secondary) hover:bg-white/10 text-xl" onClick={() => setShowNotifTray(!showNotifTray)}>
            🔔
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center rounded-full border-2 border-(--bg-primary) font-bold">{unreadCount}</span>}
          </button>
          {showNotifTray && (
            <div className="absolute top-12 right-0 w-80 glass-card p-2 shadow-2xl rounded-xl border border-(--border) max-h-[500px] overflow-y-auto">
               <div className="p-2 font-bold text-lg border-b border-white/10 mb-2">Notifications</div>
               {notifications.length === 0 ? <div className="p-4 text-center text-gray-400">No notifications</div> : notifications.map(n => (
                 <div key={n.id} className={`flex items-center p-3 rounded-lg hover:bg-white/5 mb-1 cursor-pointer ${!n.is_read ? 'bg-white/5' : ''}`}>
                   <img src={n.actor_avatar} className="w-11 h-11 rounded-full object-cover mr-3" alt="" />
                   <div className="text-sm">
                      <span className="font-bold text-white">{n.actor_name}</span> {n.type === 'like' ? 'liked your post.' : n.type === 'comment' ? 'commented on your post.' : 'started following you.'}
                      <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="relative ml-2">
          <button className="w-10 h-10 rounded-full overflow-hidden border border-(--border) hover:opacity-80 transition-opacity" onClick={() => setShowMenu(!showMenu)}>
            <img src={user?.avatar} alt="" className="w-full h-full object-cover" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute top-12 right-0 w-72 glass-card p-2 shadow-2xl rounded-xl border border-(--border) z-50">
                <button className="flex items-center w-full p-2 hover:bg-white/5 rounded-lg mb-2" onClick={() => { navigate('/profile'); setShowMenu(false); }}>
                  <img src={user?.avatar} alt="" className="w-11 h-11 rounded-full object-cover mr-3" />
                  <div className="text-left"><div className="font-bold text-white leading-tight">{user?.name}</div><div className="text-xs text-gray-400">See your profile</div></div>
                </button>
                <div className="h-px bg-white/10 my-2" />
                <button className="flex items-center w-full p-2.5 hover:bg-white/5 rounded-lg text-sm gap-3" onClick={() => { navigate('/settings'); setShowMenu(false); }}>⚙️ <span>Settings & Privacy</span></button>
                <button className="flex items-center w-full p-2.5 hover:bg-white/5 rounded-lg text-sm gap-3" onClick={() => { navigate('/privacy'); setShowMenu(false); }}>🛡️ <span>Privacy Center</span></button>
                <button className="flex items-center w-full p-2.5 hover:bg-white/5 rounded-lg text-sm gap-3" onClick={() => { navigate('/settings'); setShowMenu(false); }}>🌙 <span>Display & Accessibility</span></button>
                <div className="h-px bg-white/10 my-2" />
                <button className="flex items-center w-full p-2.5 hover:bg-white/5 rounded-lg text-sm gap-3 text-red-400" onClick={() => { logout(); navigate('/login'); setShowMenu(false); }}>🚪 <span className="font-bold">Log Out</span></button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
