import { useNavigate } from 'react-router-dom';

export default function Stories() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black z-100 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-linear-to-b from-black/50 to-transparent">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-all">✕</button>
        <div className="text-white font-bold">Stories</div>
        <div className="w-10" />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full aspect-[9/16] bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group">
          <div className="text-gray-500 font-medium">Story Content Viewer Placeholder</div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
