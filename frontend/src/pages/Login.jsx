import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, requestPersistentLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // First login without persistence
      await login(email, password, false);
      // Then ask about persistent login
      requestPersistentLogin(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-700" />

      <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Branding Side */}
        <div className="text-center md:text-left space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
           <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic select-none">
             Velora<span className="text-purple-600">.</span>
           </h1>
           <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-[450px]">
             Step into the future of social networking. Experience a premium, high-fidelity world where connections feel real and luxury is standard.
           </p>
           <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-gray-300 font-bold uppercase tracking-widest">✨ Premium App</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-gray-300 font-bold uppercase tracking-widest">🔒 Secure</div>
           </div>
        </div>

        {/* Form Side */}
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
          <form className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Identity Login</h2>
              <p className="text-gray-500 font-medium italic text-sm">Welcome back to the Velora ecosystem.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center animate-in shake duration-300">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Universal Email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="Access Key"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-lg uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95"
            >
              {isLoading ? 'Initializing Session...' : 'Initialize Session'}
            </button>

            <div className="text-center">
              <button type="button" className="text-gray-500 hover:text-purple-400 text-sm font-bold transition-colors">Forgotten Access Credentials?</button>
            </div>

            <div className="relative flex items-center justify-center py-2">
               <div className="absolute left-0 right-0 h-px bg-white/5" />
               <span className="relative bg-[#0b0c10] px-4 text-gray-600 text-[0.65rem] font-black uppercase tracking-[0.2em]">Matrix Interface</span>
            </div>

            <Link 
              to="/register" 
              className="block w-full text-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-[0.9rem]"
            >
              Establish New Identity
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
