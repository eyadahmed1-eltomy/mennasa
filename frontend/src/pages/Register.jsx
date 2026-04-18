import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', birthday: '', gender: '' });
  const { register, requestPersistentLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // First register without persistence
      await register({ name: `${form.firstName} ${form.lastName}`, email: form.email, password: form.password }, false);
      // Then ask about persistent login
      requestPersistentLogin(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-700" />

      <div className="max-w-[1100px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Branding Side */}
        <div className="hidden md:flex flex-col space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
           <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic select-none">
             Velora<span className="text-purple-600">.</span>
           </h1>
           <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-[450px]">
             Define your presence in the digital elite. Join a community where every interaction is crafted for excellence.
           </p>
           <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-gray-300 font-bold uppercase tracking-widest">✨ Elite Status</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-gray-300 font-bold uppercase tracking-widest">🌐 Global Reach</div>
           </div>
        </div>

        {/* Form Side */}
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <form className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">New Identity</h2>
              <p className="text-gray-500 font-medium italic text-sm">Initialize your unique Velora profile.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-bold text-center animate-in shake duration-300">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="First Name" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
                value={form.firstName} 
                onChange={(e) => update('firstName', e.target.value)} 
                required 
              />
              <input 
                placeholder="Last Name" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
                value={form.lastName} 
                onChange={(e) => update('lastName', e.target.value)} 
                required 
              />
            </div>

            <input 
              type="email" 
              placeholder="Email Protocol" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
              value={form.email} 
              onChange={(e) => update('email', e.target.value)} 
              required 
            />

            <input 
              type="password" 
              placeholder="Secure Access Key" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
              value={form.password} 
              onChange={(e) => update('password', e.target.value)} 
              required 
            />

            <div className="space-y-2">
              <label className="text-[0.7rem] font-black text-gray-500 uppercase tracking-widest pl-1">Biological Marker (Birthday)</label>
              <input 
                type="date" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
                value={form.birthday} 
                onChange={(e) => update('birthday', e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.7rem] font-black text-gray-500 uppercase tracking-widest pl-1">Entity Gender</label>
              <div className="flex gap-3">
                {['Female', 'Male', 'Other'].map((g) => (
                  <button 
                    key={g} 
                    type="button"
                    onClick={() => update('gender', g)}
                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all ${form.gender === g ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/20'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[0.65rem] text-gray-600 text-center uppercase tracking-widest font-black py-2">
              Encrypted Agreement Protocol Initiated
            </p>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-lg uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95"
            >
              {isLoading ? 'Confirming Identity...' : 'Confirm Identity'}
            </button>

            <div className="text-center pt-2">
              <span className="text-gray-500 text-sm font-medium italic pr-2">Known identity?</span>
              <Link to="/login" className="text-purple-400 hover:underline font-black uppercase tracking-widest text-xs">Sign In Interface</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
