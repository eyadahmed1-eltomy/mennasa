import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [convos, setConvos] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isFriend, setIsFriend] = useState(false);
  const [showMessageLimit, setShowMessageLimit] = useState(false);
  const pollingRef = useRef(null);
  const initializedIntent = useRef(false);

  // Fetch conversations (auto-add friends)
  const fetchConvos = async () => {
    try {
      // First, fetch friends list
      const friendRes = await fetch('/api/friends/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const friendsData = await friendRes.json();
      setFriends(friendsData);

      // Fetch conversations
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      
      // Auto-merge friends into conversations
      const convoMap = new Map(data.map(c => [c.other_id, c]));
      const mergedConvos = friendsData.map(f => convoMap.get(f.id) || {
        id: `friend-${f.id}`,
        other_id: f.id,
        other_name: f.name,
        other_avatar: f.avatar,
        last_message: 'No messages yet',
        last_message_at: new Date().toISOString()
      });

      // Add non-friend convos at the end
      const finalConvos = [...mergedConvos];
      data.forEach(c => {
        if (!friendsData.find(f => f.id === c.other_id)) {
          finalConvos.push(c);
        }
      });

      setConvos(finalConvos);
      
      // Handle incoming intent from user profile or Find Friends page
      const urlParams = new URLSearchParams(location.search);
      const targetUserId = urlParams.get('userId');
      
      if (!initializedIntent.current && targetUserId) {
        const existing = finalConvos.find(c => c.other_id === parseInt(targetUserId));
        if (existing) {
          setActiveConvo(existing);
        }
        initializedIntent.current = true;
      } else if (finalConvos.length > 0 && !activeConvo) {
        setActiveConvo(finalConvos[0]);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  // Fetch messages and check if friend
  const fetchMessages = async (convoId, otherId) => {
    if (!convoId) return;
    try {
      const res = await fetch(`/api/messages/${convoId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setMessages(data);

      // Check if users are friends
      if (otherId) {
        const friendRes = await fetch(`/api/friends/check/${otherId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
        });
        const result = await friendRes.json();
        setIsFriend(result.isFriend);

        // Count messages if not friends
        if (!result.isFriend) {
          const userMsgs = data.filter(m => m.sender_id === user.id).length;
          setMessageCount(userMsgs);
          
          if (userMsgs >= 10) {
            setShowMessageLimit(true);
          }
        } else {
          setShowMessageLimit(false);
          setMessageCount(0);
        }
      }
    } catch (e) { 
      console.error(e); 
    }
  };

  useEffect(() => {
    fetchConvos();
    pollingRef.current = setInterval(() => {
      fetchConvos();
      if (activeConvo) fetchMessages(activeConvo.id, activeConvo.other_id);
    }, 4000);
    return () => clearInterval(pollingRef.current);
  }, []);

  useEffect(() => {
    if (activeConvo) {
      fetchMessages(activeConvo.id, activeConvo.other_id);
    }
  }, [activeConvo]);

  const selectConvo = (c) => {
    setActiveConvo(c);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvo) return;

    // Check message limit for non-friends
    if (!isFriend && messageCount >= 10) {
      alert('⚠️ You\'ve reached the 10-message limit with non-friends. Send a friend request to message freely!');
      return;
    }

    // Optimistic update
    const tempMsg = { id: Date.now(), text: newMsg, sender_id: user.id, created_at: new Date().toISOString() };
    setMessages([...messages, tempMsg]);
    setNewMsg('');
    setMessageCount(messageCount + 1);

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
      
      if (typeof activeConvo.id === 'string' && activeConvo.id.startsWith('friend-')) {
        fetchMessages(data.conversationId, activeConvo.other_id);
      } else {
        fetchMessages(activeConvo.id, activeConvo.other_id);
      }
      fetchConvos();
    } catch (e) { console.error(e); }
  };

  const sendFriendRequest = async () => {
    try {
      const res = await fetch(`/api/friends/request/send/${activeConvo.other_id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) {
        alert('✓ Friend request sent!');
        setShowMessageLimit(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5 bg-(--bg-primary) overflow-hidden text-left">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-90 flex flex-col border-r border-white/5 bg-black/20">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Chats</h2>
          <div className="flex gap-2">
             <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400">⋯</button>
             <button 
              onClick={() => navigate('/friends')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400"
             >
              ➕
             </button>
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
            <div className="flex flex-col items-center p-8 text-gray-500 gap-2">
              <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <span>Loading chats...</span>
            </div>
          ) : convos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">
              No chats. Start by adding friends!
            </div>
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
                <img src={activeConvo.other_avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/5 shadow-lg shadow-black/20 cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${activeConvo.other_id}`)} />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-(--bg-primary)" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white leading-tight uppercase tracking-tight text-[0.9rem] hover:underline cursor-pointer" onClick={() => navigate(`/profile/${activeConvo.other_id}`)}>{activeConvo.other_name}</div>
                <div className={`text-[0.7rem] font-bold mt-0.5 tracking-widest uppercase ${isFriend ? 'text-green-500' : 'text-yellow-500'}`}>
                  {isFriend ? '✓ Friend' : '⚠️ Non-friend'}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-purple-400 transition-all border border-white/5">📞</button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-purple-400 transition-all border border-white/5">📹</button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-purple-400 transition-all border border-white/5">ℹ️</button>
              </div>
            </div>

            {/* Message Limit Warning */}
            {showMessageLimit && (
              <div className="bg-yellow-600/20 border-b border-yellow-500/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="text-sm text-yellow-400 font-bold">
                    You've sent {messageCount}/10 messages. Send a friend request to message freely!
                  </div>
                </div>
                <button
                  onClick={sendFriendRequest}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-sm uppercase tracking-widest transition-all"
                >
                  Send Friend Request
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50 uppercase tracking-widest font-black text-xs gap-2">
                  <span>Start of conversation</span>
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
                placeholder={(!isFriend && messageCount >= 10) ? "Message limit reached" : "Type a message..."} 
                value={newMsg} 
                onChange={(e) => setNewMsg(e.target.value)} 
                disabled={(!isFriend && messageCount >= 10)}
                className="flex-1 bg-white/5 border border-white/5 rounded-full px-5 py-2.5 text-[0.95rem] text-white focus:bg-white/10 focus:border-purple-500/30 outline-none transition-all placeholder-gray-600 disabled:opacity-50" 
              />
              <button 
                type="submit" 
                disabled={!newMsg.trim() || !activeConvo || (showMessageLimit && !isFriend)}
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
