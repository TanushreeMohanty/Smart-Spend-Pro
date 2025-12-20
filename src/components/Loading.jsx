import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-6 h-6 text-blue-200 animate-pulse" /></div>
      </div>
      <p className="text-blue-100 font-bold tracking-wider">LOADING</p>
    </div>
  );
}