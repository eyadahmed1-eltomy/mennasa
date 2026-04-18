import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const mainItems = [
    { icon: '🏠', label: 'News Feed', path: '/' },
    { icon: '💬', label: 'Messenger', path: '/messages' },
    { icon: '🎬', label: 'Reels', path: '/reels' },
    { icon: '👥', label: 'Groups', path: '/groups' },
    { icon: '🏪', label: 'Marketplace', path: '/marketplace' },
    { icon: '📄', label: 'Pages', path: '/pages' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
  ];

  const shortcuts = [
    { icon: '📸', label: 'Photography Club' },
    { icon: '💻', label: 'Tech Innovators' },
    { icon: '🎮', label: 'Gaming Community' },
  ];

  const exploreItems = [
    { icon: '🎬', label: 'Watch' },
    { icon: '📅', label: 'Events' },
    { icon: '🌟', label: 'Memories' },
    { icon: '💾', label: 'Saved' },
    { icon: '🏷️', label: 'Favorites' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className="w-80 h-[calc(100vh-56px)] sticky top-14 overflow-y-auto p-2 bg-(--bg-primary) hidden xl:block border-r border-(--border)">
      <div className="flex flex-col gap-0.5">
        <button
          className={`flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all mb-1 ${location.pathname === '/profile' ? 'bg-white/10' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <img src={user?.avatar} alt="" className="w-9 h-9 rounded-full object-cover mr-3 border border-white/10" />
          <span className="font-semibold text-[0.95rem] text-white">{user?.name}</span>
        </button>

        {mainItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all text-gray-300 font-medium ${isActive(item.path) ? 'bg-white/10 text-white' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="w-9 text-2xl text-center mr-3">{item.icon}</span>
            <span className="text-[0.95rem]">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-white/10 my-4 mx-2" />
      
      <div className="px-4 py-2 text-[0.95rem] font-bold text-gray-400">Your Shortcuts</div>
      <div className="flex flex-col gap-0.5">
        {shortcuts.map((item) => (
          <button key={item.label} className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all text-gray-300">
            <span className="w-9 text-2xl text-center mr-3">{item.icon}</span>
            <span className="text-[0.95rem] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-white/10 my-4 mx-2" />

      <div className="px-4 py-2 text-[0.95rem] font-bold text-gray-400">Explore</div>
      <div className="flex flex-col gap-0.5">
        {exploreItems.map((item) => (
          <button key={item.label} className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all text-gray-300">
            <span className="w-9 text-2xl text-center mr-3">{item.icon}</span>
            <span className="text-[0.95rem] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 px-4 pb-6 text-[0.72rem] text-gray-500 leading-relaxed">
        Privacy · Terms · Advertising · Ad Choices · Cookies · © 2026 Velora
      </div>
    </aside>
  );
}
