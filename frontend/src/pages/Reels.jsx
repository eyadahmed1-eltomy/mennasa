import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ReelComments({ reelId, onClose, onCommentCountUpdate }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, name }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/reels/${reelId}/comments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setComments(data);
      onCommentCountUpdate(data.length + data.reduce((acc, current) => acc + (current.replies?.length || 0), 0));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchComments(); }, [reelId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/reels/${reelId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('velora_token')}`
        },
        body: JSON.stringify({
          content: replyTo ? `@${replyTo.name} ${text}` : text,
          parent_id: replyTo?.id || null
        })
      });
      if (res.ok) {
        setText('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (e) { console.error(e); }
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/reels/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) fetchComments();
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (id) => {
    try {
      const res = await fetch(`/api/reels/comments/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) fetchComments();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="absolute top-0 right-0 w-full sm:w-[400px] h-full glass-card border-l border-white/10 flex flex-col z-50 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Comments</h3>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all" onClick={onClose}>✕</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {comments.map((c) => (
          <div key={c.id} className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-3">
              <img src={c.user.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg" alt="" />
              <div className="flex-1">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:border-white/10 transition-all">
                  <div className="font-bold text-white text-[0.9rem] mb-1 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{c.user.name}</div>
                  <div className="text-[0.92rem] text-gray-200 leading-relaxed font-medium">{c.content}</div>
                </div>
                <div className="flex items-center gap-4 mt-2 px-2 text-[0.7rem] font-black uppercase tracking-widest text-gray-500">
                  <span 
                    className={`cursor-pointer transition-colors ${c.liked ? 'text-purple-400' : 'hover:text-gray-300'}`}
                    onClick={() => toggleLike(c.id)}
                  >
                    {c.likes_count || 0} Like
                  </span>
                  <span className="cursor-pointer hover:text-gray-300" onClick={() => setReplyTo({ id: c.id, name: c.user.name })}>Reply</span>
                  {c.user_id === user?.id && (
                    <span className="cursor-pointer text-red-500/60 hover:text-red-500" onClick={() => deleteComment(c.id)}>Delete</span>
                  )}
                </div>
                
                {c.replies?.map(r => (
                  <div key={r.id} className="mt-4 flex gap-3">
                    <img src={r.user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10 mt-1" alt="" />
                    <div className="flex-1">
                      <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                        <div className="font-bold text-white text-[0.85rem] mb-1 uppercase tracking-tight">{r.user.name}</div>
                        <div className="text-[0.88rem] text-gray-200 leading-relaxed font-medium">{r.content}</div>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 px-2 text-[0.65rem] font-black uppercase tracking-widest text-gray-500">
                        <span 
                          className={`cursor-pointer transition-colors ${r.liked ? 'text-purple-400' : 'hover:text-gray-300'}`}
                          onClick={() => toggleLike(r.id)}
                        >
                          {r.likes_count || 0} Like
                        </span>
                        {r.user_id === user?.id && <span className="cursor-pointer text-red-500/60 hover:text-red-500" onClick={() => deleteComment(r.id)}>Delete</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/10 bg-black/40">
        {replyTo && (
          <div className="flex items-center justify-between text-[0.7rem] font-black text-purple-400 mb-3 px-2 uppercase tracking-widest italic">
            <span>Replying to {replyTo.name}</span>
            <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-300 transition-colors">✕</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <img src={user?.avatar} className="w-9 h-9 rounded-full object-cover border border-white/10" alt="" />
          <div className="flex-1 relative">
            <input 
              placeholder="Inject comment..." 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-[0.9rem] text-white focus:bg-white/10 focus:border-purple-500/30 outline-none transition-all placeholder-gray-600"
            />
          </div>
          <button 
            onClick={handleSend} 
            disabled={!text.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:bg-white/10 transition-all font-black text-white shadow-lg shadow-purple-600/20"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelCard({ reel, onHide }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(reel.liked);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [commentsCount, setCommentsCount] = useState(reel.comments_count);
  const [sharesCount, setSharesCount] = useState(reel.shares_count || 0);
  const [following, setFollowing] = useState(reel.following);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReelMenu, setShowReelMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoDuration;
    }
  };

  const toggleLike = async () => {
    const newStatus = !liked;
    setLiked(newStatus);
    setLikesCount(newStatus ? likesCount + 1 : likesCount - 1);
    try {
      const res = await fetch(`/api/reels/${reel.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      }
    } catch (e) {
      setLiked(liked);
      setLikesCount(likesCount);
    }
  };

  const toggleFollow = async () => {
    setFollowing(!following);
    try {
      const res = await fetch(`/api/follows/${reel.user.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      }
    } catch (e) {
      setFollowing(following);
    }
  };

  const handleHide = async () => {
    try {
      await fetch(`/api/reels/${reel.id}/hide`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      onHide(reel.id);
    } catch (e) { console.error(e); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/reels?id=${reel.id}`);
    alert('Link copied to clipboard!');
    setShowShare(false);
  };

  return (
    <div className="w-full h-full relative group shadow-2xl">
      <div className="w-full h-full bg-black relative overflow-hidden rounded-[2.5rem] border border-white/5">
        {reel.video_url ? (
          <>
            <video 
              ref={videoRef}
              src={reel.video_url || reel.video} 
              loop 
              autoPlay 
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', 
                height: '100%',
                display: 'block',
                objectFit: 'contain',
                backgroundColor: '#000',
                objectPosition: 'center',
                visibility: 'visible',
                opacity: 1
              }}
              onClick={togglePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadStart={() => console.log('Video loading started:', reel.video_url)}
              onCanPlay={() => console.log('Video can play')}
              onError={(e) => {
                console.error('Video loading error:', e);
                console.error('Attempted to load:', reel.video_url);
              }}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 z-10">
              <button
                onClick={togglePlayPause}
                className="w-20 h-20 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all transform hover:scale-110 border border-white/30"
              >
                <span className="text-5xl text-white drop-shadow-lg">
                  {isPlaying ? '⏸' : '▶'}
                </span>
              </button>
            </div>

            {/* Custom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              {/* Progress Bar */}
              <div 
                className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all group/progress backdrop-blur-sm"
                onClick={handleProgressChange}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50"
                  style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                >
                  <div className="float-right w-3 h-3 bg-white rounded-full transform translate-y-0.5 shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-full text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    <span className="text-lg">{isPlaying ? '⏸' : '▶'}</span>
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    <span className="text-lg">{isMuted ? '🔇' : '🔊'}</span>
                  </button>

                  <span className="text-xs font-bold text-gray-300 backdrop-blur-sm px-2 py-1 rounded bg-black/30">
                    {Math.floor(currentTime)}s / {Math.floor(videoDuration)}s
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      } else if (videoRef.current.webkitRequestFullscreen) {
                        videoRef.current.webkitRequestFullscreen();
                      }
                    }
                  }}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                  title="Fullscreen"
                >
                  <span className="text-lg">⛶</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
            <div className="text-6xl">🎬</div>
            <div className="text-sm font-bold uppercase tracking-wider">Video Not Available</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full p-8 pb-10 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={reel.user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-xl" alt="" />
              {following && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full border-2 border-black flex items-center justify-center text-[0.6rem] font-black">✓</div>}
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-white text-lg tracking-tight uppercase italic drop-shadow-md">{reel.user.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {reel.user.id !== user?.id && (
                  <button 
                    className={`text-[0.65rem] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full transition-all border ${following ? 'bg-white/10 border-white/10 text-white' : 'bg-purple-600 border-purple-500 text-white shadow-lg'}`} 
                    onClick={toggleFollow}
                  >
                    {following ? 'Connected' : 'Connect'}
                  </button>
                )}
                <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">• Original Audio</span>
              </div>
            </div>
          </div>
          <p className="text-white text-[0.9rem] font-medium leading-relaxed max-w-[85%] drop-shadow-lg italic">
            {reel.caption}
          </p>
        </div>

        <div className="absolute right-6 bottom-10 flex flex-col gap-6 z-10 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          <div className="flex flex-col items-center gap-1 transition-all active:scale-90" onClick={toggleLike}>
            <div className={`w-14 h-14 flex items-center justify-center rounded-full glass-card border border-white/10 text-2xl transition-all shadow-xl ${liked ? 'bg-purple-600/30 text-purple-400 border-purple-500/40' : 'text-white hover:bg-white/10'}`}>
              {liked ? '💜' : '🤍'}
            </div>
            <span className="text-[0.7rem] font-black text-white uppercase tracking-widest drop-shadow-lg">{likesCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1 transition-all active:scale-90" onClick={() => setShowComments(true)}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full glass-card border border-white/10 text-2xl text-white hover:bg-white/10 shadow-xl">
              💬
            </div>
            <span className="text-[0.7rem] font-black text-white uppercase tracking-widest drop-shadow-lg">{commentsCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1 transition-all active:scale-90" onClick={() => setShowShare(true)}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full glass-card border border-white/10 text-2xl text-white hover:bg-white/10 shadow-xl">
              ↗️
            </div>
            <span className="text-[0.7rem] font-black text-white uppercase tracking-widest drop-shadow-lg">{sharesCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1 relative transition-all active:scale-90" onClick={() => setShowReelMenu(!showReelMenu)}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full glass-card border border-white/10 text-2xl text-white hover:bg-white/10 shadow-xl">
              ⋯
            </div>
            {showReelMenu && (
              <div className="absolute right-[calc(100%+16px)] top-0 w-[200px] glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200">
                <button 
                  className="w-full p-4 flex items-center gap-3 text-[0.75rem] font-black tracking-widest text-white hover:bg-white/10 transition-colors text-left border-b border-white/5 uppercase"
                  onClick={handleHide}
                >
                  🚫 Not Interested
                </button>
                <button 
                  className="w-full p-4 flex items-center gap-3 text-[0.75rem] font-black tracking-widest text-red-500 hover:bg-red-500/10 transition-colors text-left uppercase"
                  onClick={() => alert('Reported!')}
                >
                  🚩 Report Signal
                </button>
              </div>
            )}
          </div>
        </div>

        {showShare && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowShare(false)}>
            <div className="w-full max-w-sm glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8 space-y-6" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Broadcast Info</h4>
                <p className="text-gray-500 text-[0.7rem] font-black uppercase tracking-widest">Share this stream to your mainframe.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all border border-white/10 uppercase tracking-widest text-[0.8rem]" 
                  onClick={copyLink}
                >
                  🔗 Clone URL
                </button>
                <button 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[0.8rem] shadow-xl shadow-purple-600/30" 
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/reels/${reel.id}/share`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('velora_token')}` 
                        }
                      });
                      if (res.ok) {
                        setSharesCount(prev => prev + 1);
                        alert('Propagated to feed!');
                        setShowShare(false);
                      }
                    } catch (e) { console.error('Share Error:', e); }
                  }}
                >
                  📢 Push to Feed
                </button>
                <button 
                  className="w-full text-gray-500 hover:text-white font-black py-2 transition-colors uppercase tracking-widest text-[0.65rem]"
                  onClick={() => setShowShare(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showComments && (
        <ReelComments 
          reelId={reel.id} 
          onClose={() => setShowComments(false)} 
          onCommentCountUpdate={setCommentsCount}
        />
      )}
    </div>
  );
}

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newReel, setNewReel] = useState({ caption: '', video: null });
  const containerRef = useRef(null);

  const fetchReels = async () => {
    try {
      const res = await fetch('/api/reels', {
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setReels(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleCreateReel = async () => {
    if (!newReel.video) return;
    const formData = new FormData();
    formData.append('caption', newReel.caption);
    formData.append('video', newReel.video);

    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` },
        body: formData
      });
      if (res.ok) {
        setShowCreate(false);
        setNewReel({ caption: '', video: null });
        fetchReels();
      }
    } catch (e) { console.error(e); }
  };

  const scroll = (direction) => {
    if (containerRef.current) {
      const { scrollTop, clientHeight } = containerRef.current;
      const target = direction === 'down' ? scrollTop + clientHeight : scrollTop - clientHeight;
      containerRef.current.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-white gap-6">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(147,51,234,0.3)]" />
      <div className="font-black text-xl uppercase tracking-[0.4em] animate-pulse italic">Initializing Reels...</div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-[#0b0c10] relative overflow-hidden">
      <div className="absolute top-8 left-8 z-20">
         <button 
           className="bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-purple-600/40 transition-all active:scale-95 uppercase tracking-widest text-[0.85rem] italic"
           onClick={() => setShowCreate(true)}
         >
           + Inject Reel
         </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth" ref={containerRef}>
        {reels.map((reel) => (
          <div key={reel.id} className="h-full w-full snap-start snap-always py-6 flex items-center justify-center">
             <div className="h-full max-h-[820px] aspect-9/16 w-full max-w-[460px]">
                <ReelCard reel={reel} onHide={(id) => setReels(reels.filter(r => r.id !== id))} />
             </div>
          </div>
        ))}
        {reels.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-8 p-6">
            <div className="text-8xl opacity-10 animate-pulse">📼</div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Silent Mainframe</h3>
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">No active broadcasts found in your sector.</p>
            </div>
            <button 
              className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-12 rounded-2xl border border-white/10 uppercase tracking-widest transition-all italic"
              onClick={() => setShowCreate(true)}
            >
              Start Broadcast
            </button>
          </div>
        )}
      </div>

      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-6 z-10 hidden lg:flex">
        <button 
          className="w-14 h-14 flex items-center justify-center rounded-full glass-card border border-white/10 text-white hover:bg-white/10 transition-all shadow-xl font-black" 
          onClick={() => scroll('up')}
        >
          ▲
        </button>
        <button 
          className="w-14 h-14 flex items-center justify-center rounded-full glass-card border border-white/10 text-white hover:bg-white/10 transition-all shadow-xl font-black" 
          onClick={() => scroll('down')}
        >
          ▼
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/3">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Signal Uplink</h2>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all text-xl" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="p-10 space-y-8">
              <div className="relative group">
                <input 
                  type="file" 
                  id="reel-video"
                  accept="video/*" 
                  onChange={e => setNewReel({...newReel, video: e.target.files[0]})} 
                  className="hidden"
                />
                <label 
                  htmlFor="reel-video"
                  className="block w-full border-2 border-dashed border-white/10 rounded-3xl p-14 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-600/5 transition-all group"
                >
                   <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 duration-500">🎬</div>
                   <div className="text-white font-extrabold uppercase tracking-widest text-[0.85rem]">{newReel.video ? newReel.video.name : 'Select High-Fidelity Source'}</div>
                   <div className="text-gray-500 text-[0.65rem] font-black uppercase tracking-[0.2em] mt-2">MP4 / WEBM / MOV</div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest pl-3">Data Caption</label>
                <textarea 
                  placeholder="Describe your transmission..." 
                  value={newReel.caption}
                  onChange={e => setNewReel({...newReel, caption: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:bg-white/10 focus:border-purple-500/30 transition-all placeholder-gray-600 min-h-[140px] font-medium leading-relaxed italic"
                />
              </div>
            </div>
            <div className="p-8 pt-0">
              <button 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl text-lg uppercase tracking-[0.3em] transition-all shadow-2xl shadow-purple-600/40 disabled:opacity-30 disabled:grayscale active:scale-95" 
                onClick={handleCreateReel} 
                disabled={!newReel.video}
              >
                Establish Uplink
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
