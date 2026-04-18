export default function PrivacyCenter() {
  const cards = [
    { icon: '🔒', title: 'Privacy Checkup', desc: 'Review your privacy settings and make sure they work the way you want.' },
    { icon: '👤', title: 'Who Can See What You Share', desc: 'Control who sees your posts, profile information, and activity.' },
    { icon: '📱', title: 'Your Data Settings', desc: 'Manage the data Velora collects and how it\'s used.' },
    { icon: '🔐', title: 'Account Security', desc: 'Protect your account with strong passwords and two-factor authentication.' },
    { icon: '📊', title: 'Ad Preferences', desc: 'Control how your data is used for ad targeting and personalization.' },
    { icon: '🌐', title: 'Search & Discovery', desc: 'Manage how people find and connect with you on Velora.' },
    { icon: '📋', title: 'Your Activity Log', desc: 'Review and manage your activity history across Velora.' },
    { icon: '🤝', title: 'Apps & Websites', desc: 'Manage third-party apps connected to your Velora account.' },
    { icon: '📥', title: 'Download Your Information', desc: 'Get a copy of your data including posts, photos, and messages.' },
    { icon: '👁️', title: 'Face Recognition', desc: 'Control whether Velora can recognize you in photos and videos.' },
    { icon: '📍', title: 'Location Services', desc: 'Manage how your location data is collected and used.' },
    { icon: '🗑️', title: 'Deactivation & Deletion', desc: 'Options for deactivating or permanently deleting your account.' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="glass-card p-12 rounded-3xl border border-white/10 shadow-2xl mb-12 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[80px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">🛡️ Privacy Center</h1>
        <p className="text-xl text-gray-400 max-w-[700px] mx-auto leading-relaxed font-medium">
          Learn how Velora protects your digital footprint. Take control of your data with our transparent and powerful privacy tools.
        </p>
        <button className="mt-8 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-10 rounded-2xl text-lg uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95">
          Start Privacy Checkup
        </button>
      </div>

      <div className="text-[0.7rem] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 pl-2">Privacy Tools & Settings Matrix</div>
      
      {/* Privacy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group hover:-translate-y-1">
            <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 duration-300">{card.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight group-hover:text-purple-400 transition-colors">{card.title}</h3>
            <p className="text-gray-500 text-[0.9rem] leading-relaxed font-medium mb-4">{card.desc}</p>
            <button className="text-purple-400 hover:underline text-xs font-black uppercase tracking-widest">Manage Protocol →</button>
          </div>
        ))}
      </div>

      {/* Policy Section */}
      <div className="glass-card p-12 mt-12 rounded-3xl border border-white/10 text-center">
        <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Velora Data Policy</h2>
        <p className="text-gray-400 max-w-[650px] mx-auto mb-8 font-medium italic leading-loose text-lg">
          "At Velora, your privacy is not just a setting—it's the core of our ecosystem. We are committed to absolute transparency regarding your personal information."
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold transition-all border border-white/5 uppercase tracking-widest text-[0.85rem]">Full Policy</button>
          <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold transition-all border border-white/5 uppercase tracking-widest text-[0.85rem]">Cookies</button>
          <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold transition-all border border-white/5 uppercase tracking-widest text-[0.85rem]">Terms</button>
        </div>
      </div>
    </div>
  );
}
