import { useNavigate, useParams } from 'react-router-dom';

export default function PhotoViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-all z-[110]"
      >
        ✕
      </button>
      
      <div className="w-full h-full flex items-center justify-center p-4">
        <img 
          src={`/api/posts/photo/${id}`} 
          alt="Full size view" 
          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border border-white/5"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200'; // Fallback
          }}
        />
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
         <button className="flex items-center gap-2 text-white font-bold text-sm hover:scale-110 transition-transform">💜 Like</button>
         <button className="flex items-center gap-2 text-white font-bold text-sm hover:scale-110 transition-transform">💬 Comment</button>
         <button className="flex items-center gap-2 text-white font-bold text-sm hover:scale-110 transition-transform">↗️ Share</button>
      </div>
    </div>
  );
}
