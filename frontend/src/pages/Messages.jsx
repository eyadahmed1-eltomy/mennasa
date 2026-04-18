import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [convos, setConvos] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);
  const initializedIntent = useRef(false);

  const fetchConvos = async () => {
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setConvos(data);
      
      // Handle incoming intent from Marketplace
      if (!initializedIntent.current && location.state?.targetUserId) {
        const existing = data.find(c => c.other_id === location.state.targetUserId);
        if (existing) {
          setActiveConvo(existing);
        } else {
          // It's a new contact, we'll need to fetch user details to show a shadow convo
          // or just wait for the first message to be sent via the post route.
          // For simplicity, we create a temporary "shadow" conversation object.
          const tempConvo = {
            id: 'temp-' + Date.now(),
            other_id: location.state.targetUserId,
            other_name: 'Target Asset', // Ideally fetch real name, for now use intent
            other_avatar: 'https://i.pravatar.cc/150?u=' + location.state.targetUserId,
            last_message: 'Initializing protocol...',
            last_message_at: new Date().toISOString()
          };
          setConvos([tempConvo, ...data]);
          setActiveConvo(tempConvo);
        }
        setNewMsg(location.state.initialMsg || '');
        initializedIntent.current = true;
      } else if (data.length > 0 && !activeConvo) {
        setActiveConvo(data[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (convoId) => {
    if (!convoId) return;
    try {
      const res = await fetch(`/api/messages/${convoId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchConvos();
    // Start polling for new conversations/messages
    pollingRef.current = setInterval(() => {
      fetchConvos();
      if (activeConvo) fetchMessages(activeConvo.id);
    }, 4000);
    return () => clearInterval(pollingRef.current);
  }, []);

  useEffect(() => {
    if (activeConvo) fetchMessages(activeConvo.id);
  }, [activeConvo]);

  const selectConvo = (c) => {
    setActiveConvo(c);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvo) return;
    
    // Optimistic update
    const tempMsg = { id: Date.now(), text: newMsg, sender_id: user.id, created_at: new Date().toISOString() };
    setMessages([...messages, tempMsg]);
    setNewMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('velora_token')}` 
        },
        body: JSON.stringify({ receiverId: activeConvo.other_id, text: newMsg })
      });
      const data = await res.json();
      
      if (typeof activeConvo.id === 'string' && activeConvo.id.startsWith('temp-')) {
        // If it was a temp convo, we now have a real ID
        fetchMessages(data.conversationId);
      } else {
        fetchMessages(activeConvo.id);
      }
      fetchConvos();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5 bg-(--bg-primary) overflow-hidden text-left">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-[360px] flex flex-col border-r border-white/5 bg-black/20">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Chats</h2>
          <div className="flex gap-2">
             <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400">⋯</button>
             <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400">✏️</button>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
             <input 
               placeholder="Search Messenger" 
               className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-[0.9rem] text-white focus:bg-white/10 outline-none transition-all placeholder-gray-600" 
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center p-8 text-gray-500 gap-2"><div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" /><span>Syncing protocol...</span></div>
          ) : convos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No active connections.</div>
          ) : convos.map((c) => (
            <div 
              key={c.id} 
              className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 group ${activeConvo?.id === c.id ? 'bg-purple-600/10 border border-purple-500/20' : 'hover:bg-white/5 border border-transparent'}`} 
              onClick={() => selectConvo(c)}
            >
              <div className="relative">
                <img src={c.other_avatar} alt="" className="w-14 h-14 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-(--bg-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                   <div className="font-bold text-white text-[0.95rem] truncate">{c.other_name}</div>
                   <div className="text-[0.7rem] text-gray-500 font-bold whitespace-nowrap pt-1 group-hover:text-purple-400 transition-colors uppercase tracking-widest">
                     {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
                <div className="text-[0.85rem] text-gray-400 truncate mt-0.5 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{c.last_message || 'No messages yet'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/10 relative">
        {activeConvo ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center gap-3 glass-card sticky top-0 z-10">
              <div className="relative">
                <img src={activeConvo.other_avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/5 shadow-lg shadow-black/20" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-(--bg-primary)" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight uppercase tracking-tight text-[0.9rem] hover:underline cursor-pointer">{activeConvo.other_name}</div>
                <div className={`text-[0.7rem] font-bold mt-0.5 tracking-widest uppercase text-green-500`}>Active now</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-purple-400 transition-all border border-white/5">📞</button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-purple-400 transition-all border border-white/5">📹</button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-purple-400 transition-all border border-white/5">ℹ️</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50 uppercase tracking-widest font-black text-xs gap-2">
                  <span>Start of Matrix Uplink</span>
                  <div className="w-px h-12 bg-gray-800" />
                </div>
              ) : messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[70%] p-3.5 rounded-2xl text-[0.92rem] font-medium leading-relaxed shadow-xl ${m.sender_id === user.id ? 'bg-purple-600 text-white rounded-br-none shadow-purple-600/10' : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5 shadow-black/10'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form className="p-4 pb-6 flex items-center gap-2 border-t border-white/5 bg-black/20" onSubmit={sendMessage}>
              <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-xl grayscale hover:grayscale-0 transition-all">➕</button>
                <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-xl grayscale hover:grayscale-0 transition-all">🖼️</button>
                <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-xl grayscale hover:grayscale-0 transition-all">🎁</button>
              </div>
              <input 
                placeholder="Type a message..." 
                value={newMsg} 
                onChange={(e) => setNewMsg(e.target.value)} 
                className="flex-1 bg-white/5 border border-white/5 rounded-full px-5 py-2.5 text-[0.95rem] text-white focus:bg-white/10 focus:border-purple-500/30 outline-none transition-all placeholder-gray-600" 
              />
              <button 
                type="submit" 
                disabled={!newMsg.trim() || !activeConvo}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:bg-white/10 transition-all shadow-lg shadow-purple-600/20"
              >
                <span className="text-white transform rotate-45 mb-1 mr-0.5">➤</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 opacity-40">
            <div className="text-6xl">💬</div>
            <div className="text-xl font-bold tracking-tighter uppercase">Select a chat to begin</div>
          </div>
        )}
      </div>
    </div>
  );
}
