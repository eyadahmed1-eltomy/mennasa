import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AboutItem = ({ icon, label, value, hideIfEmpty }) => {
  if (hideIfEmpty && !value) return null;
  return (
    <div className="flex items-center gap-4 group/item">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl border border-white/5 group-hover/item:border-purple-500/30 transition-all shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</div>
        <div className="text-white font-bold text-[0.95rem]">{value || `No ${label.toLowerCase()} listed`}</div>
      </div>
    </div>
  );
};

const AboutSidebarItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-gray-300">
    <span className="text-xl">{icon}</span>
    <div className="text-[0.95rem]">{text}</div>
  </div>
);

const EditField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || `Add ${label.toLowerCase()}...`}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 transition-all outline-none text-[0.95rem]"
    />
  </div>
);

export default function Profile() {
  const { user: currentUser, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('Posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const targetId = searchParams.get('id') || currentUser?.id;

  const tabs = ['Posts', 'About', 'Friends', 'Photos', 'Videos', 'Check-ins'];
  const aboutTabs = ['Overview', 'Work and Education', 'Places Lived', 'Contact and Basic Info', 'Family and Relationships'];

  const [showEditModal, setShowEditModal] = useState(false);
  const [activeAboutTab, setActiveAboutTab] = useState('Overview');
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    if (!targetId) return;
    try {
      const res = await fetch(`/api/users/${targetId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      const data = await res.json();
      setProfileData(data);
      if (currentUser?.id === data.user.id) setEditForm(data.user);
      
      if (currentUser && targetId !== currentUser.id) {
        const followRes = await fetch(`/api/follows/status/${targetId}`, {
           headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
        });
        const followData = await followRes.json();
        setIsFollowing(followData.following);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('velora_token')}` 
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setShowEditModal(false);
        refreshUser();
        fetchProfile();
      }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId, currentUser]);

  const toggleFollow = async () => {
    try {
      const res = await fetch(`/api/follows/${targetId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('velora_token')}` }
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        fetchProfile(); // Refresh to get updated follower count
      }
    } catch (e) { console.error(e); }
  };

  if (!profileData) return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      <div className="font-bold">Loading Velora Profile...</div>
    </div>
  );

  const { user, posts } = profileData;
  const isOwnProfile = currentUser?.id === user.id;

  const SectionHeader = ({ title, onEdit, isOwnProfile }) => (
    <div className="flex items-center justify-between mb-8 group/header">
      <h4 className="text-gray-500 text-[0.7rem] font-black uppercase tracking-[0.3em]">{title} Matrix</h4>
      {isOwnProfile && (
        <button 
          onClick={onEdit}
          className="opacity-0 group-hover/header:opacity-100 transition-all text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 active:scale-95"
        >
          ✏️ Modify Data
        </button>
      )}
    </div>
  );

  const renderAboutContent = () => {
    const sectionTitle = activeAboutTab;
    
    switch (activeAboutTab) {
      case 'Work and Education':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title={sectionTitle} onEdit={() => setShowEditModal(true)} isOwnProfile={isOwnProfile} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AboutItem icon="💼" label="Workplace" value={user.workplace} />
              <AboutItem icon="🎓" label="College" value={user.college} />
              <AboutItem icon="🏫" label="High School" value={user.high_school} />
            </div>
          </div>
        );
      case 'Places Lived':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title={sectionTitle} onEdit={() => setShowEditModal(true)} isOwnProfile={isOwnProfile} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AboutItem icon="🏠" label="Current City" value={user.current_city} />
              <AboutItem icon="📍" label="Hometown" value={user.hometown} />
            </div>
          </div>
        );
      case 'Contact and Basic Info':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title={sectionTitle} onEdit={() => setShowEditModal(true)} isOwnProfile={isOwnProfile} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AboutItem icon="📞" label="Phone" value={user.phone} />
              <AboutItem icon="🌐" label="Website" value={user.website} />
              <AboutItem icon="👤" label="Gender" value={user.gender} />
              <AboutItem icon="🎂" label="Birth Date" value={user.birth_date} />
            </div>
          </div>
        );
      case 'Family and Relationships':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title={sectionTitle} onEdit={() => setShowEditModal(true)} isOwnProfile={isOwnProfile} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AboutItem icon="❤️" label="Relationship Status" value={user.relationship} />
            </div>
          </div>
        );
      default:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader title="Universal" onEdit={() => setShowEditModal(true)} isOwnProfile={isOwnProfile} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AboutItem icon="💼" label="Workplace" value={user.workplace} hideIfEmpty />
              <AboutItem icon="🏠" label="Current City" value={user.current_city} hideIfEmpty />
              <AboutItem icon="📍" label="Hometown" value={user.hometown} hideIfEmpty />
              <AboutItem icon="❤️" label="Relationship" value={user.relationship} hideIfEmpty />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-[1095px] mx-auto px-4 pb-12">
      {/* Cover Section */}
      <div className="relative h-[350px] rounded-b-2xl overflow-hidden glass-card border-x border-b border-white/10 group">
        <img src={user?.cover || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {isOwnProfile && (
           <button className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all backdrop-blur-md border border-white/10 z-10">
             📷 Edit Cover Photo
           </button>
        )}
      </div>

      {/* Header Profile Info */}
      <div className="relative px-8 pb-4 border-b border-white/5 mt-[-30px]">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-4 border-black/20 overflow-hidden shadow-2xl relative bg-white/5">
              <img src={user?.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full border border-white/10 flex items-center justify-center text-xl cursor-pointer shadow-lg">📷</button>
            )}
          </div>
          
          <div className="flex-1 pb-4 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-1.5">{user?.name}</h1>
            <p className="text-gray-400 font-medium mb-3">{user?.bio || 'Digital explorer ✨'}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 text-sm font-bold">
              <button className="hover:underline">0 friends</button>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <button className="hover:underline">0 followers</button>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-6">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold text-[0.9rem] flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
                >
                  ✏️ Edit Profile
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-lg font-bold text-[0.9rem] transition-all border border-white/5">👁️ View As</button>
              </>
            ) : (
              <button 
                onClick={toggleFollow}
                className={`px-8 py-2.5 rounded-lg font-bold text-[0.9rem] transition-all shadow-lg ${isFollowing ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'}`}
              >
                {isFollowing ? '✓ Following' : 'Follow'}
              </button>
            )}
            <button className="w-10 h-10 bg-white/5 hover:bg-white/10 flex items-center justify-center rounded-lg text-white border border-white/5 transition-all">⋯</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              className={`px-4 py-3 font-bold text-[0.95rem] transition-all relative ${activeTab === tab ? 'text-purple-500' : 'text-gray-400 hover:bg-white/5 rounded-lg'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-4 right-4 h-1 bg-purple-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-4 mt-4 items-start">
          {/* Main Content Area */}
          <div className="order-2 md:order-1 flex flex-col gap-4">
             {activeTab === 'About' ? (
               <div className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                 <div className="w-full md:w-80 border-r border-white/5 p-4 bg-white/2">
                   <h3 className="text-xl font-black text-white p-2 mb-4 uppercase tracking-tighter">About</h3>
                   <div className="flex flex-col gap-1">
                     {aboutTabs.map(at => (
                       <button 
                         key={at} 
                         onClick={() => setActiveAboutTab(at)}
                         className={`w-full text-left p-3 rounded-lg font-bold text-[0.9rem] transition-all ${activeAboutTab === at ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:bg-white/5'}`}
                       >
                         {at}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div className="flex-1 p-8">
                   <h4 className="text-gray-500 text-[0.7rem] font-black uppercase tracking-[0.3em] mb-8">{activeAboutTab} Matrix</h4>
                   {renderAboutContent()}
                 </div>
               </div>
             ) : (
               <>
                 {isOwnProfile && (
                   <div className="glass-card p-4 rounded-xl border border-white/5 mb-2">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10"><img src={currentUser?.avatar} className="w-full h-full object-cover" alt="" /></div>
                       <button className="flex-1 bg-white/5 hover:bg-white/10 text-left px-4 py-2.5 rounded-full text-gray-400 text-[0.95rem] transition-colors" onClick={() => navigate('/')}>What's on your mind?</button>
                     </div>
                   </div>
                 )}

                 {posts.length === 0 ? (
                   <div className="glass-card p-12 text-center text-gray-500 font-medium rounded-xl border border-white/5">
                     No posts to show yet.
                   </div>
                 ) : posts.map(post => (
                   <div key={post.id} className="glass-card rounded-xl border border-white/5 overflow-hidden p-4">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                           <img src={user?.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg" alt="" />
                           <div className="text-left">
                             <div className="font-bold text-white hover:underline cursor-pointer">{user?.name}</div>
                             <div className="text-xs text-gray-400">{new Date(post.time).toLocaleDateString()} · 🌐</div>
                           </div>
                         </div>
                         <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400">⋯</button>
                      </div>
                      {post.content && <div className="text-gray-100 text-[0.95rem] mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</div>}
                      {post.image && <div className="rounded-xl overflow-hidden border border-white/5 mb-3"><img src={post.image} className="w-full max-h-[500px] object-cover" alt="" /></div>}
                      <div className="flex items-center justify-between text-gray-400 text-[0.85rem] border-b border-white/5 pb-2 mb-2 px-1">
                         <div>💜 {post.likes}</div>
                         <div>0 comments</div>
                      </div>
                      <div className="flex gap-1">
                         <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-bold transition-all">🤍 Like</button>
                         <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-bold transition-all">💬 Comment</button>
                         <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-white/5 text-gray-400 text-[0.9rem] font-bold transition-all">↗️ Share</button>
                      </div>
                   </div>
                 ))}
               </>
             )}
          </div>

          {/* Info Sidebar */}
          <div className="order-1 md:order-2 flex flex-col gap-4 sticky top-20">
             <div className="glass-card p-5 rounded-xl border border-white/5">
               <h3 className="text-xl font-extrabold text-white mb-4">Intro</h3>
               <p className="text-center text-gray-300 text-[0.95rem] mb-4 leading-relaxed">{user?.bio || 'No bio yet.'}</p>
               
               <div className="flex flex-col gap-4 pt-2 border-t border-white/5">
                <AboutSidebarItem icon="💼" text={user.workplace ? `Works at ${user.workplace}` : 'No workplace listed'} />
                <AboutSidebarItem icon="🎓" text={user.college ? `Studied at ${user.college}` : 'No alma mater listed'} />
                <AboutSidebarItem icon="🏠" text={user.current_city ? `Lives in ${user.current_city}` : 'Lives on Earth'} />
                <AboutSidebarItem icon="📍" text={user.hometown ? `From ${user.hometown}` : 'From the Beyond'} />
                <AboutSidebarItem icon="❤️" text={user.relationship || 'Single'} />
                <AboutSidebarItem icon="⏰" text={`Joined Velora in ${new Date(user.created_at).getFullYear()}`} />
              </div>
              {isOwnProfile && <button onClick={() => setShowEditModal(true)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg text-[0.9rem] transition-all mt-4 border border-white/10">Edit Details</button>}
             </div>

            <div className="glass-card p-5 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-extrabold text-white">Photos</h3>
                <button className="text-purple-400 hover:underline text-sm font-bold">See all</button>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden border border-white/5">
                {posts.filter(p => p.image).slice(0, 9).map(p => (
                  <img key={p.id} src={p.image} className="w-full aspect-square object-cover hover:opacity-80 transition-opacity cursor-pointer" alt="" />
                ))}
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col text-left">
                  <h3 className="text-xl font-extrabold text-white">Friends</h3>
                  <span className="text-gray-400 text-[0.85rem]">0 friends</span>
                </div>
                <button className="text-purple-400 hover:underline text-sm font-bold">See all</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center text-gray-500 text-xs py-8 col-span-3">No friends to show yet.</div>
              </div>
            </div>
         </div>
      </div>
      
      {showEditModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 flex flex-col animate-in slide-in-from-bottom-8 duration-500 relative z-10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Edit Profile Protocol</h2>
              <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Bio Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-white">Bio</h3>
                  <span className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest">{editForm.bio?.length || 0}/160</span>
                </div>
                <textarea 
                  value={editForm.bio || ''} 
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Describe your digital legacy..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none resize-none h-24 font-medium"
                />
              </section>

              {/* Work & Education Section */}
              <section className="space-y-6">
                <h3 className="text-lg font-extrabold text-white border-l-4 border-purple-500 pl-4">Work & Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="Workplace" value={editForm.workplace} onChange={(v) => setEditForm({...editForm, workplace: v})} />
                  <EditField label="College" value={editForm.college} onChange={(v) => setEditForm({...editForm, college: v})} />
                  <EditField label="High School" value={editForm.high_school} onChange={(v) => setEditForm({...editForm, high_school: v})} />
                </div>
              </section>

              {/* Places Lived Section */}
              <section className="space-y-6">
                <h3 className="text-lg font-extrabold text-white border-l-4 border-blue-500 pl-4">Places Lived</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="Current City" value={editForm.current_city} onChange={(v) => setEditForm({...editForm, current_city: v})} />
                  <EditField label="Hometown" value={editForm.hometown} onChange={(v) => setEditForm({...editForm, hometown: v})} />
                </div>
              </section>

              {/* Contact & Basic Info */}
              <section className="space-y-6">
                <h3 className="text-lg font-extrabold text-white border-l-4 border-pink-500 pl-4">Contact & Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="Phone" value={editForm.phone} onChange={(v) => setEditForm({...editForm, phone: v})} />
                  <EditField label="Website" value={editForm.website} onChange={(v) => setEditField({...editForm, website: v})} />
                  <EditField label="Gender" value={editForm.gender} onChange={(v) => setEditForm({...editForm, gender: v})} />
                  <EditField label="Birth Date" value={editForm.birth_date} placeholder="YYYY-MM-DD" onChange={(v) => setEditForm({...editForm, birth_date: v})} />
                </div>
              </section>

              {/* Family and Relationships */}
              <section className="space-y-6 pb-10">
                <h3 className="text-lg font-extrabold text-white border-l-4 border-red-500 pl-4">Family and Relationships</h3>
                <EditField label="Relationship Status" value={editForm.relationship} placeholder="Single, In a relationship, etc." onChange={(v) => setEditForm({...editForm, relationship: v})} />
              </section>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/2 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-all text-[0.9rem]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-black text-[0.9rem] uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95 flex items-center gap-2"
              >
                {isSaving ? 'Syncing...' : 'Save Artifact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}