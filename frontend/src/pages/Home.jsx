import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';

function StoryCarousel({ stories, loading }) {
  return (
    <div className="relative overflow-hidden mb-6 px-1">
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 snap-x">
        <div className="min-w-[110px] h-[190px] rounded-xl glass-card flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all snap-start border border-white/5">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg shadow-purple-500/20 text-center leading-none">+</div>
          <span className="text-[0.78rem] font-bold text-gray-400">Create Story</span>
        </div>
        {!loading && stories.map((userStory) => (
          <div key={userStory.user_id} className="min-w-[110px] h-[190px] rounded-xl overflow-hidden relative cursor-pointer group snap-start border border-white/5 hover:border-white/20 transition-all">
            <img src={userStory.stories[0].media_url.startsWith('http') ? userStory.stories[0].media_url : `http://localhost:5000/uploads/${userStory.stories[0].media_url.split('/').pop()}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-2.5 left-2.5 z-10">
               <div className="w-9 h-9 rounded-full border-2 border-purple-500 p-0.5 bg-[#0a0e27]">
                 <img src={userStory.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
               </div>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-2.5 w-[calc(100%-20px)]">
              <span className="text-white text-[0.78rem] font-bold truncate block drop-shadow-md">{userStory.user_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileImage({ user, hasStory, isOwner, size = "md" }) {
  const [showMenu, setShowMenu] = useState(false);
  const sizeClasses = size === "sm" ? "w-9 h-9" : size === "md" ? "w-11 h-11" : "w-14 h-14";
  const ringClasses = hasStory ? "p-0.5 border-2 border-purple-500 rounded-full cursor-pointer" : "cursor-pointer";

  const handleClick = () => {
    if (!hasStory && !isOwner) { alert('Opening profile photo...'); return; }
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative inline-block">
      <div className={ringClasses} onClick={handleClick}>
        <img src={user?.avatar} alt="" className={`${sizeClasses} rounded-full object-cover border border-white/10`} />
      </div>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-[110%] left-0 w-[180px] glass-card p-1.5 shadow-2xl rounded-xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <button className="flex items-center w-full p-2 hover:bg-white/5 rounded-lg text-[0.85rem] text-gray-200 transition-colors text-left" onClick={() => alert('Opening photo...')}>🖼️ View Photo</button>
            {hasStory && <button className="flex items-center w-full p-2 hover:bg-white/5 rounded-lg text-[0.85rem] text-gray-200 transition-colors text-left" onClick={() => alert('Opening story...')}>🎬 View Story</button>}
            {isOwner && <button className="flex items-center w-full p-2 hover:bg-white/5 rounded-lg text-[0.85rem] text-gray-200 transition-colors text-left" onClick={() => alert('Change photo...')}>⚙️ Change Photo</button>}
          </div>
        </>
      )}
    </div>
  );
}

function CreatePost({ refreshPosts, stories }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');

  const hasSelfStory = stories.some(s => s.user_id === user?.id);

  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) return;
    const formData = new FormData();
    formData.append('content', postText);
    formData.append('feeling', feeling);
    formData.append('location', location);
    if (selectedImage) formData.append('image', selectedImage);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` },
      body: formData
    });
    if (res.ok) {
      setPostText(''); setSelectedImage(null); setFeeling(''); setLocation('');
      setShowModal(false); refreshPosts();
    }
  };

  const handleStoryUpload = async (file) => {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', file.type.startsWith('video') ? 'video' : 'image');
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` },
      body: formData
    });
    if (res.ok) { setShowStoryModal(false); window.location.reload(); }
  };

  return (
    <>
      <div className="glass-card flex justify-around p-2.5 mb-4 rounded-xl border border-white/5">
         <button className="flex-1 py-2 rounded-lg hover:bg-white/5 transition-all text-[0.9rem] font-medium text-gray-300" onClick={() => setShowModal(true)}>✍️ Post</button>
         <button className="flex-1 py-2 rounded-lg hover:bg-white/5 transition-all text-[0.9rem] font-medium text-gray-300" onClick={() => setShowStoryModal(true)}>🎬 Story</button>
         <button className="flex-1 py-2 rounded-lg hover:bg-white/5 transition-all text-[0.9rem] font-medium text-gray-300" onClick={() => window.location.href='/reels'}>🎥 Reel</button>
      </div>

      <div className="glass-card p-4 rounded-xl border border-white/5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <ProfileImage user={user} isOwner={true} hasStory={hasSelfStory} />
          <button className="flex-1 bg-white/5 hover:bg-white/10 text-left px-4 py-2.5 rounded-full text-gray-400 text-[0.95rem] transition-colors" onClick={() => setShowModal(true)}>
            What's on your mind, {user?.name?.split(' ')[0]}?
          </button>
        </div>
        <div className="flex items-center gap-1 border-t border-white/10 pt-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-medium transition-all" onClick={() => setShowModal(true)}>🖼️ <span className="hidden sm:inline">Photo</span></button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-medium transition-all" onClick={() => setShowModal(true)}>😊 <span className="hidden sm:inline">Feeling</span></button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-medium transition-all" onClick={() => setShowModal(true)}>📍 <span className="hidden sm:inline">Check-in</span></button>
        </div>
      </div>

      {showStoryModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStoryModal(false)} />
           <div className="relative w-full max-w-md glass-card p-6 rounded-2xl border border-white/10 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-white mb-4 text-center">Create Story</h2>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center hover:border-purple-500/50 transition-colors cursor-pointer relative group">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleStoryUpload(e.target.files[0])} />
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📤</div>
                <div className="text-gray-400 font-medium text-center">Click or drag media to upload</div>
              </div>
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg glass-card rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-left">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="w-8" />
              <h2 className="text-lg font-bold text-white">Create Post</h2>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all text-center" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <ProfileImage user={user} isOwner={true} hasStory={hasSelfStory} />
                <div>
                  <div className="font-bold text-white leading-tight">
                    {user?.name} {feeling && <span className="font-normal text-gray-400">is feeling {feeling}</span>}
                  </div>
                  <div className="text-[0.75rem] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span className="flex items-center bg-white/5 px-2 py-0.5 rounded gap-1.5 border border-white/5">🌐 Public</span>
                    {location && <span className="flex items-center bg-white/5 px-2 py-0.5 rounded gap-1.5 border border-white/5">📍 {location}</span>}
                  </div>
                </div>
              </div>

              <textarea 
                placeholder={`What's on your mind?`} 
                value={postText} 
                onChange={(e) => setPostText(e.target.value)} 
                className="w-full min-h-[120px] bg-transparent border-none outline-none text-xl text-white placeholder-gray-500 resize-none" 
                autoFocus 
              />

              <div className="flex gap-2 mb-4">
                 <input placeholder="😊 Feeling" value={feeling} onChange={e => setFeeling(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder-gray-600" />
                 <input placeholder="📍 location" value={location} onChange={e => setLocation(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder-gray-600" />
              </div>

              {selectedImage && (
                <div className="relative mb-4 group ring-1 ring-white/10 rounded-xl overflow-hidden">
                  <img src={URL.createObjectURL(selectedImage)} alt="" className="w-full max-h-[300px] object-cover" />
                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedImage(null)}>✕</button>
                </div>
              )}

              <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl mb-4 bg-white/5">
                <span className="text-[0.9rem] font-bold text-gray-300">Add to your post</span>
                <div className="flex gap-4 items-center">
                  <label className="cursor-pointer hover:scale-110 transition-transform">
                    <span className="text-xl">🖼️</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                  </label>
                  <button className="text-xl hover:scale-110 transition-transform">👤</button>
                  <button className="text-xl hover:scale-110 transition-transform">😊</button>
                  <button className="text-xl hover:scale-110 transition-transform">📍</button>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[0.95rem] transition-all shadow-lg shadow-purple-600/20" onClick={handlePost} disabled={!postText.trim() && !selectedImage}>Post</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReelsCarousel() {
  const [reels, setReels] = useState([]);
  useEffect(() => {
    fetch('/api/reels', { headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` } })
      .then(res => res.json()).then(data => setReels(data)).catch(e => console.error(e));
  }, []);
  if (reels.length === 0) return null;
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 mb-2 snap-x pt-2">
      {reels.map(reel => (
        <div key={reel.id} className="min-w-[140px] h-[240px] rounded-2xl bg-black overflow-hidden relative group snap-start border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer">
          <video src={reel.video_url.startsWith('http') ? reel.video_url : `http://localhost:5000/uploads/${reel.video_url.split('/').pop()}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
             <div className="text-white text-[0.7rem] font-bold flex items-center gap-1.5 drop-shadow-md">🎬 {reel.shares_count || 0} shares</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Post({ post, refreshPosts, storiesData }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const hasStory = (storiesData || []).some(s => s.user_id === post.user.id);

  const toggleLike = async () => {
    const isLiking = !liked;
    setLiked(isLiking);
    setLikes(prev => isLiking ? prev + 1 : Math.max(0, prev - 1));
    fetch(`/api/posts/${post.id}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` } });
  };

  const handleAddComment = async (e) => {
    if (e.key === 'Enter' && commentText.trim()) {
      const res = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` },
        body: JSON.stringify({ post_id: post.id, content: commentText })
      });
      if (res.ok) { setCommentText(''); refreshPosts(); }
    }
  };

  return (
    <div className="glass-card mb-4 rounded-xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ProfileImage user={post.user} isOwner={post.user.id === user?.id} hasStory={hasStory} />
            <div className="text-left">
              <div className="font-bold text-white hover:underline cursor-pointer leading-tight">
                {post.user.name} {post.feeling && <span className="font-normal text-gray-400">is feeling {post.feeling}</span>}
              </div>
              <div className="text-[0.75rem] text-gray-400 flex items-center gap-1 mt-0.5">
                <span>{new Date(post.time).toLocaleDateString()}</span>
                <span>·</span>
                {post.location && <span className="flex items-center gap-1">📍 {post.location} · </span>}
                <span>🌐</span>
              </div>
            </div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400 transition-all">⋯</button>
        </div>

        {post.content && <div className="text-[0.95rem] text-gray-100 mb-3 whitespace-pre-wrap leading-relaxed">{post.content}</div>}
        
        {post.reel_id && (
          <div className="relative w-full aspect-4/5 rounded-xl overflow-hidden bg-black mb-3 ring-1 ring-white/10 group">
            <video src={post.reel_video_url} className="w-full h-full object-cover" controls loop />
          </div>
        )}
        
        {post.image && (
          <div 
            className="relative w-full rounded-xl overflow-hidden mb-3 ring-1 ring-white/10 cursor-zoom-in"
            onClick={() => navigate(`/photo/${post.id}`)}
          >
            <img src={post.image} alt="" className="w-full object-cover max-h-[600px] hover:scale-[1.02] transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
          </div>
        )}

        <div className="flex items-center justify-between py-1 px-1 text-gray-400 text-[0.85rem] border-b border-white/5 mb-2">
          <div className="flex items-center gap-1.5"><span className="flex items-center justify-center w-5 h-5 bg-purple-500 rounded-full text-[10px] text-white">💜</span> {likes}</div>
          <div className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>{post.commentsList?.length || 0} comments</div>
        </div>

        <div className="flex gap-1">
          <button className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-[0.9rem] font-bold transition-all ${liked ? 'text-purple-400' : 'text-gray-400'}`} onClick={toggleLike}>
            {liked ? '💜' : '🤍'} Like
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-bold transition-all" onClick={() => setShowComments(!showComments)}>
            💬 Comment
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-bold transition-all">
            ↗️ Share
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-white/5 p-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-3 mb-4">
            {post.commentsList?.map(c => (
              <div key={c.id} className="flex gap-2">
                <ProfileImage user={c.user} size="sm" isOwner={c.user.id === user?.id} hasStory={(storiesData || []).some(s => s.user_id === c.user.id)} />
                <div className="flex-1 text-left">
                  <div className="bg-white/5 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <div className="font-bold text-[0.85rem] text-white leading-tight">{c.user.name}</div>
                    <div className="text-[0.9rem] text-gray-200 mt-0.5 whitespace-pre-wrap">{c.text}</div>
                  </div>
                  <div className="flex gap-3 mt-1 ml-2 text-[0.7rem] font-bold text-gray-400">
                    <button className="hover:underline">Like</button>
                    <button className="hover:underline">Reply</button>
                    <span>1h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ProfileImage user={user} size="sm" isOwner={true} hasStory={(storiesData || []).some(s => s.user_id === user?.id)} />
            <div className="relative flex-1">
              <input 
                placeholder="Write a comment..." 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
                onKeyDown={handleAddComment} 
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[0.9rem] text-white outline-none focus:border-purple-500/50 transition-all placeholder-gray-600" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 cursor-pointer">
                <span>😊</span><span>📷</span><span>👾</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const loader = useRef(null);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories', { headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` } });
      const data = await res.json();
      setStories(data);
    } catch (e) { console.error(e); } finally { setLoadingStories(false); }
  };

  const fetchPosts = async (isInitial = false) => {
    const currentOffset = isInitial ? 0 : offset;
    try {
      const res = await fetch(`/api/posts?limit=5&offset=${currentOffset}`, { headers: { Authorization: `Bearer ${localStorage.getItem('velora_token')}` } });
      const data = await res.json();
      if (data.length < 5) setHasMore(false);
      setPosts(prev => isInitial ? data : [...prev, ...data]);
      setOffset(prev => isInitial ? 5 : prev + 5);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStories(); fetchPosts(true); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && hasMore) fetchPosts(); }, { threshold: 1.0 });
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [hasMore, offset]);

  const firstPosts = posts.slice(0, 3);
  const otherPosts = posts.slice(3);

  return (
    <div className="max-w-[680px] mx-auto px-2 py-4">
      {/* <Sidebar /> */}
      <div className="px-2 mb-4 text-[1.1rem] font-bold text-gray-400 flex items-center gap-2">✨ <span className="text-white">What's new?</span></div>
      <CreatePost refreshPosts={() => fetchPosts(true)} stories={stories} />
      
      <div className="px-2 mt-8 mb-4 text-[1.1rem] font-bold text-gray-400 flex items-center gap-2">🎬 <span className="text-white">Stories</span></div>
      <StoryCarousel stories={stories} loading={loadingStories} />
      
      <div className="px-2 mt-8 mb-4 text-[1.1rem] font-bold text-gray-400 flex items-center gap-2">🏠 <span className="text-white">Feed</span></div>
      {firstPosts.map(post => <Post key={post.id} post={post} refreshPosts={() => fetchPosts(true)} storiesData={stories} />)}
      
      {posts.length > 3 && (
        <>
          <div className="px-2 mt-8 mb-4 text-[1.1rem] font-bold text-gray-400 flex items-center gap-2">📺 <span className="text-white">Recommended Reels</span></div>
          <ReelsCarousel />
        </>
      )}

      {otherPosts.map(post => <Post key={post.id} post={post} refreshPosts={() => fetchPosts(true)} storiesData={stories} />)}
      
      {hasMore && (
        <div ref={loader} className="p-8 flex flex-col items-center justify-center gap-4 text-gray-500">
           <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
           <div className="text-sm font-medium">Loading more stories and posts...</div>
        </div>
      )}
      {!hasMore && posts.length > 0 && <div className="p-12 text-center text-gray-500 font-medium">✨ You're all caught up!</div>}
    </div>
  );
}