import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const settingSections = [
  { id: 'general', icon: '⚙️', label: 'General', items: [
    { label: 'Name', desc: 'Change your display name', value: 'Alex Velorum' },
    { label: 'Username', desc: 'Your unique Velora handle', value: '@alexvelorum' },
    { label: 'Email', desc: 'Manage your email address', value: 'alex@velora.com' },
    { label: 'Phone', desc: 'Add or change phone number', value: '+1 (555) 123-4567' },
    { label: 'Language', desc: 'Choose your preferred language', value: 'English (US)' },
  ]},
  { id: 'privacy', icon: '🔒', label: 'Privacy', items: [
    { label: 'Who can see your posts', toggle: true, value: 'Friends' },
    { label: 'Who can send you friend requests', toggle: true, value: 'Everyone' },
    { label: 'Who can look you up by email', toggle: true, value: 'Friends of friends' },
    { label: 'Who can look you up by phone', toggle: true, value: 'Friends' },
    { label: 'Search engine indexing', desc: 'Allow search engines to link to your profile', isToggle: true, on: false },
  ]},
  { id: 'security', icon: '🛡️', label: 'Security & Login', items: [
    { label: 'Change Password', desc: 'Update your password regularly', action: true },
    { label: 'Two-Factor Authentication', desc: 'Add extra security to your account', isToggle: true, on: true },
    { label: 'Login Alerts', desc: 'Get notified about unrecognized logins', isToggle: true, on: true },
    { label: 'Authorized Logins', desc: 'Review devices where you\'re logged in', action: true },
    { label: 'App Passwords', desc: 'Manage passwords for third-party apps', action: true },
  ]},
  { id: 'notifications', icon: '🔔', label: 'Notifications', items: [
    { label: 'Push Notifications', desc: 'Receive notifications on your device', isToggle: true, on: true },
    { label: 'Email Notifications', desc: 'Receive updates via email', isToggle: true, on: false },
    { label: 'SMS Notifications', desc: 'Receive updates via text message', isToggle: true, on: false },
    { label: 'Friend Requests', desc: 'Notify when someone sends a request', isToggle: true, on: true },
    { label: 'Tags', desc: 'Notify when someone tags you', isToggle: true, on: true },
  ]},
  { id: 'blocking', icon: '🚫', label: 'Blocking', items: [
    { label: 'Blocked Users', desc: 'Manage your blocked users list', action: true },
    { label: 'Block Messages', desc: 'Block messages from non-friends', isToggle: true, on: false },
    { label: 'Block App Invites', desc: 'Block app invitations', action: true },
    { label: 'Block Page Invites', desc: 'Block page invitations', action: true },
  ]},
  { id: 'account', icon: '👤', label: 'Account Management', items: [
    { label: 'Download Your Data', desc: 'Get a copy of your Velora data', action: true },
    { label: 'Deactivate Account', desc: 'Temporarily disable your account', action: true, danger: true },
    { label: 'Delete Account', desc: 'Permanently delete your account and data', action: true, danger: true },
  ]},
];

export default function Settings() {
  const [active, setActive] = useState('general');
  const [toggles, setToggles] = useState({});
  const { user } = useAuth();

  const section = settingSections.find(s => s.id === active);

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col md:flex-row max-w-[1000px] mx-auto gap-6 p-4 md:p-8 min-h-[calc(100vh-100px)] items-start">
      {/* Sidebar */}
      <div className="w-full md:w-[280px] flex flex-col gap-1 sticky top-20">
        <h2 className="text-2xl font-extrabold text-white px-4 py-4">Settings</h2>
        <nav className="flex flex-col gap-1">
          {settingSections.map(s => (
            <button 
              key={s.id} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[0.95rem] transition-all border border-transparent ${active === s.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-400 hover:bg-white/5 hover:border-white/5'}`} 
              onClick={() => setActive(s.id)}
            >
              <span className="text-xl w-6 text-center">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 w-full animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/2">
            <span className="text-3xl">{section.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">{section.label}</h3>
              <p className="text-gray-500 text-sm font-medium">Manage your {section.label.toLowerCase()} preferences</p>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {section.items.map((item, i) => {
              const toggleKey = `${active}-${i}`;
              const isOn = toggles[toggleKey] !== undefined ? toggles[toggleKey] : item.on;
              return (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-white/0.01 transition-colors group">
                  <div className="flex-1">
                    <div className="font-bold text-white mb-0.5 group-hover:text-purple-400 transition-colors">{item.label}</div>
                    {item.desc && <div className="text-[0.88rem] text-gray-500 leading-snug max-w-[450px]">{item.desc}</div>}
                    {item.value && <div className="text-[0.82rem] text-purple-400/80 font-bold mt-1 tracking-wide">{item.value}</div>}
                  </div>
                  
                  <div className="flex items-center pl-4">
                    {item.isToggle && (
                      <div 
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${isOn ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-white/10'}`} 
                        onClick={() => handleToggle(toggleKey)}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 transform ${isOn ? 'translate-x-6 shadow-md' : 'translate-x-0'}`} />
                      </div>
                    )}
                    {item.action && (
                      <button className={`px-5 py-2 rounded-lg font-bold text-[0.82rem] transition-all border ${item.danger ? 'text-red-500 border-red-500/20 hover:bg-red-500/10' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                        {item.danger ? 'Manage' : 'Edit'}
                      </button>
                    )}
                    {item.toggle && (
                      <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-[0.82rem] hover:bg-white/10 transition-all">{item.value}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 p-6 glass-card rounded-2xl border border-white/10 flex items-center justify-between text-[0.85rem] text-gray-500 font-medium italic">
           <span>Changes are saved automatically to your Velora profile. ✨</span>
           <button className="text-purple-400 hover:underline not-italic font-bold">Clear All Settings</button>
        </div>
      </div>
    </div>
  );
}
