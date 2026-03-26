import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stories } from '../data/mockData'; // Stories aren't fully integrated yet, hold mock

function Stories() {
  return (
    <div className="stories-container glass-card" style={{ padding: '12px' }}>
      <div className="story-card create-story">
        <div className="create-story-icon">+</div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Create Story</span>
      </div>
      {stories.map((story) => (
        <div key={story.id} className="story-card">
          <img src={story.image} alt="" />
          <img src={story.user.avatar} alt="" className="story-avatar" />
          <div className="story-overlay">
            <span className="story-name">{story.user.name.split(' ')[0]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreatePost({ refreshPosts }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePost = async () => {
    if (!postText.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append('content', postText);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('velora_token')}`
        },
        body: formData
      });

      if (res.ok) {
        setPostText('');
        setSelectedImage(null);
        setShowModal(false);
        refreshPosts(); // Reload feed from backend
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="create-post glass-card">
        <div className="create-post-top">
          <img src={user?.avatar} alt="" className="avatar avatar-md" />
          <button className="create-post-input" onClick={() => setShowModal(true)}>
            What's on your mind, {user?.name?.split(' ')[0]}?
          </button>
        </div>
        <div className="create-post-actions">
          <button className="create-post-action">🎥 Live Video</button>
          <button className="create-post-action" onClick={() => setShowModal(true)}>🖼️ Photo/Video</button>
          <button className="create-post-action">😊 Feeling/Activity</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Post</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src={user?.avatar} alt="" className="avatar avatar-md" />
              <div>
                <div style={{ fontWeight: 700 }}>{user?.name}</div>
                <button className="btn btn-ghost" style={{ padding: '2px 10px', fontSize: '0.75rem', borderRadius: '6px', background: 'var(--bg-tertiary)' }}>
                  🌐 Public ▾
                </button>
              </div>
            </div>

            <textarea
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              style={{ width: '100%', minHeight: '100px', resize: 'none', background: 'transparent', border: 'none', fontSize: '1.1rem', color: 'var(--text-primary)' }}
              autoFocus
            />

            {selectedImage && (
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-sm)', maxHeight: '300px', objectFit: 'cover' }} />
                <button 
                  className="btn-icon" 
                  style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)' }}
                  onClick={() => setSelectedImage(null)}
                >✕</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Add to your post</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '1.3rem' }}>
                <label style={{ cursor: 'pointer' }} title="Photo/Video">
                  🖼️
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
                </label>
                <span style={{ cursor: 'pointer' }} title="Tag People">👤</span>
                <span style={{ cursor: 'pointer' }} title="Feeling">😊</span>
                <span style={{ cursor: 'pointer' }} title="Check in">📍</span>
                <span style={{ cursor: 'pointer' }} title="GIF">🎞️</span>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePost} 
                    disabled={!postText.trim() && !selectedImage}>
              Post
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Post({ post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  const toggleLike = async () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);

    // Call API async (optimistic UI update happened above)
    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
    } catch {
      // Revert on error
      setLiked(liked);
      setLikes(likes);
    }
  };

  return (
    <div className="post glass-card">
      <div className="post-header">
        <img src={post.user.avatar} alt="" className="avatar avatar-md" />
        <div className="post-user-info">
          <div className="post-username">{post.user.name}</div>
          <div className="post-meta">
            <span>{new Date(post.time).toLocaleTimeString()}</span> · <span>🌐</span>
          </div>
        </div>
        <button className="btn-icon" style={{ width: 32, height: 32 }}>⋯</button>
      </div>

      {post.content && <div className="post-content">{post.content}</div>}
      {post.image && <img src={post.image} alt="" className="post-image" />}

      <div className="post-stats">
        <span>💜 {likes.toLocaleString()}</span>
        <span>{post.commentsList?.length || 0} comments · 0 shares</span>
      </div>

      <div className="post-actions">
        <button className={`post-action-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
          {liked ? '💜' : '🤍'} Like
        </button>
        <button className="post-action-btn" onClick={() => setShowComments(!showComments)}>💬 Comment</button>
        <button className="post-action-btn">↗️ Share</button>
      </div>

      {showComments && (
        <div className="comments-section">
          {post.commentsList?.map((c) => (
            <div key={c.id} className="comment">
              <img src={c.user.avatar} alt="" className="avatar avatar-sm" />
              <div>
                <div className="comment-content">
                  <div className="comment-author">{c.user.name}</div>
                  <div className="comment-text">{c.text}</div>
                </div>
                <div className="comment-actions">
                  <span>Like</span>
                  <span>Reply</span>
                  <span>{new Date(c.time).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="comment-input-row">
            <img src={user?.avatar} alt="" className="avatar avatar-sm" />
            <input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <Stories />
      <CreatePost refreshPosts={fetchPosts} />
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
