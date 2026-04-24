import { users } from '../../data/mockData';

export default function RightSidebar() {
  const onlineUsers = users.filter((u) => u.online);
  const offlineUsers = users.filter((u) => !u.online);

  return (
    <aside className="w-80 h-[calc(100vh-56px)] sticky top-14 overflow-y-auto p-4 bg-(--bg-primary) block border-l border-(--border)">
      <div className="bg-linear-to-br from-purple-500/10 to-pink-500/5 rounded-xl p-4 mb-6 border border-purple-500/10">
        <div className="text-[0.82rem] font-bold text-white mb-1.5 flex items-center gap-2">🎂 Birthdays</div>
        <div className="text-[0.82rem] text-gray-400 leading-normal">
          <span className="font-bold text-white">Sophia Laurent</span> and <span className="font-bold text-white">2 others</span> have birthdays today.
        </div>
      </div>

      <div className="flex justify-between items-center px-2 mb-3">
        <span className="text-[0.95rem] font-bold text-gray-400">Contacts</span>
        <button className="text-gray-400 hover:bg-white/10 w-8 h-8 flex items-center justify-center rounded-full transition-all">⋯</button>
      </div>

      <div className="flex flex-col gap-0.5">
        {onlineUsers.map((u) => (
          <button key={u.id} className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all group">
            <div className="relative">
              <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover mr-3 border border-white/10" />
              <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-(--bg-primary)" />
            </div>
            <span className="text-[0.95rem] font-medium text-gray-300 group-hover:text-white transition-colors">{u.name}</span>
          </button>
        ))}
      </div>

      <div className="px-2 mt-6 mb-3 text-[0.95rem] font-bold text-gray-400">More Contacts</div>
      <div className="flex flex-col gap-0.5 opacity-60">
        {offlineUsers.map((u) => (
          <button key={u.id} className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all group">
            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover mr-3 grayscale-50" />
            <span className="text-[0.95rem] font-medium text-gray-400 group-hover:text-white transition-colors">{u.name}</span>
          </button>
        ))}
      </div>

      <div className="px-2 mt-6 mb-3 text-[0.95rem] font-bold text-gray-400">Group Conversations</div>
      <div className="flex flex-col gap-0.5">
        <button className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all text-gray-300 group">
          <span className="w-9 h-9 flex items-center justify-center text-xl bg-white/5 rounded-full mr-3 group-hover:bg-white/10 transition-all text-orange-400">🎨</span>
          <span className="text-[0.95rem] font-medium group-hover:text-white transition-colors">Design Team</span>
        </button>
        <button className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all text-gray-300 group">
          <span className="w-9 h-9 flex items-center justify-center text-xl bg-white/5 rounded-full mr-3 group-hover:bg-white/10 transition-all text-blue-400">🚀</span>
          <span className="text-[0.95rem] font-medium group-hover:text-white transition-colors">Project Alpha</span>
        </button>
        <button className="flex items-center w-full p-2.5 rounded-lg hover:bg-white/5 transition-all text-gray-300 group">
          <span className="w-9 h-9 flex items-center justify-center text-xl bg-white/5 rounded-full mr-3 group-hover:bg-white/10 transition-all text-purple-400">🎮</span>
          <span className="text-[0.95rem] font-medium group-hover:text-white transition-colors">Gaming Squad</span>
        </button>
      </div>
    </aside>
  );
}
