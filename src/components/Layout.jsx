import React from 'react';
import { Home, ListFilter, Plus, ClipboardCheck, PieChart, Landmark, User, LogOut } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab, handleSignOut }) {
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: ListFilter, label: 'History' },
    { id: 'add', icon: Plus, label: 'Add', special: true }, // Special middle button
    { id: 'audit', icon: ClipboardCheck, label: 'Audit' },
    { id: 'stats', icon: PieChart, label: 'Stats' },
    { id: 'wealth', icon: Landmark, label: 'Wealth' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-slate-950 text-blue-50 font-sans selection:bg-cyan-500/30">
      
      {/* --- DESKTOP SIDEBAR (Visible only on lg screens 1024px+) --- */}
      <nav className="hidden lg:flex flex-col fixed left-6 top-6 bottom-6 w-24 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] items-center py-8 z-50 shadow-2xl">
        
        {/* Logo Area */}
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg mb-auto">
          <span className="font-black text-white text-lg">S</span>
        </div>

        {/* Icons */}
        <div className="flex flex-col gap-4 w-full px-3">
          {navItems.map((t) => (
            t.id !== 'add' && ( // Skip 'Add' button in sidebar list, usually handled separately or just included
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`group relative p-3 rounded-2xl transition-all duration-300 hover:bg-white/10 ${activeTab === t.id ? 'bg-white/10 text-cyan-400' : 'text-slate-400'}`}
            >
              <t.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeTab === t.id ? 'stroke-[2.5px]' : ''}`} />
              
              {/* Tooltip on Hover */}
              <span className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                {t.label}
              </span>
            </button>
            )
          ))}
          
          {/* Add Button - Distinct Style */}
          <button onClick={() => setActiveTab('add')} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <button onClick={handleSignOut} className="mt-auto p-4 text-slate-500 hover:text-rose-400 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* --- MOBILE & TABLET BOTTOM BAR (Visible below 1024px) --- */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-[#0f0c29]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 px-4 shadow-2xl flex justify-between items-center max-w-md mx-auto">
          {navItems.slice(0, 5).map(t => ( // Showing fewer items on mobile to prevent crowding
            t.special ? 
            <div key={t.id} className="relative -top-8">
              <button 
                onClick={() => setActiveTab(t.id)} 
                className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border-4 border-[#0f0c29] transform transition-transform active:scale-95"
              >
                <t.icon className="w-7 h-7" />
              </button>
            </div> : 
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === t.id ? 'text-cyan-400' : 'text-slate-500'}`}
            >
              <t.icon className={`w-6 h-6 ${activeTab === t.id ? 'fill-cyan-400/10' : ''}`} />
            </button>
          ))}
          {/* Mobile Menu Overflow usually goes here, but for now we fit 5 items */}
        </div>
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      {/* - Mobile/Tablet: pb-32 (Padding bottom for nav), px-4 (Horizontal padding)
          - Laptop/Desktop (lg): pl-40 (Padding left for sidebar), pt-8, pr-8
      */}
      <main className="w-full min-h-screen relative pb-32 lg:pb-8 lg:pl-40 pt-8 px-4 lg:pr-8 max-w-[1600px] mx-auto transition-all duration-300">
        {children}
      </main>

    </div>
  );
}