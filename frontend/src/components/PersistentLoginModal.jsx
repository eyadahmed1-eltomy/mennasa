import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PersistentLoginModal() {
  const { showPersistentLoginPrompt, confirmPersistentLogin, declinePersistentLogin } = useAuth();

  if (!showPersistentLoginPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-3xl border border-white/10 shadow-2xl max-w-[450px] w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/50 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Stay Signed In?
          </h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed">
            Would you like to stay signed in on this device? You'll remain authenticated even after closing the app, making your return seamless.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-2">
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">⚠️ Security Advisory</p>
          <p className="text-yellow-300/80 text-xs leading-relaxed">
            Only enable this on personal, non-shared devices. Your session will be kept active in local storage.
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={declinePersistentLogin}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-2xl text-sm uppercase tracking-widest transition-all"
          >
            Not Now
          </button>
          <button
            onClick={confirmPersistentLogin}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-2xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-purple-600/30 active:scale-95"
          >
            Yes, Stay Signed
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest font-black">
          You can disable this anytime in settings
        </p>
      </div>
    </div>
  );
}
