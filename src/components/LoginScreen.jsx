import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';
import { APP_VERSION } from '../constants';

export default function LoginScreen({ onLoginGoogle, onGuest, error }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-[2rem] mb-10 flex items-center justify-center shadow-2xl">
        <Wallet className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-5xl font-black mb-3">SmartSpend</h1>
      <p className="text-blue-200/70 mb-10">Financial clarity for the modern era.</p>
      
      {error && (
        <div className="bg-rose-500/20 border border-rose-500/30 p-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="text-xs text-rose-200">{error}</span>
        </div>
      )}

      <div className="space-y-4 w-full max-w-sm">
        <button onClick={onLoginGoogle} className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-xl">
          Continue with Google
        </button>
        <button onClick={onGuest} className="w-full bg-white/5 border border-white/10 font-bold py-4 rounded-2xl">
          Continue as Guest
        </button>
      </div>
      <div className="mt-8 text-xs text-slate-500 font-mono">{APP_VERSION}</div>
    </div>
  );
}