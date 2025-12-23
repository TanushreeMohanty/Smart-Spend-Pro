import React from 'react';
import { Home, ListFilter, Plus, ClipboardCheck, PieChart, Landmark, User, LogOut } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab, handleSignOut }) {
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: ListFilter, label: 'History' },
    { id: 'add', icon: Plus, label: 'Add', special: true }, 
    { id: 'audit', icon: ClipboardCheck, label: 'Audit' },
    { id: 'stats', icon: PieChart, label: 'Stats' },
    { id: 'wealth', icon: Landmark, label: 'Wealth' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-slate-950 text-blue-50 font-sans selection:bg-cyan-500/30">
      
      {/* --- DESKTOP / LAPTOP SIDEBAR --- */}
      <nav className="hidden lg:flex flex-col fixed left-4 top-4 bottom-4 w-20 xl:w-24 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] items-center py-4 z-50 shadow-2xl transition-all duration-300">
        
        {/* Unified Scrollable Container */}
        {/* All items including Logo and Logout are now inside this div to handle small screen heights gracefully */}
        <div className="flex flex-col gap-3 xl:gap-4 w-full h-full px-2 items-center overflow-y-auto no-scrollbar">
          
          {/* App Logo */}
          <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0 mb-2 mt-2">
            <span className="font-black text-white text-base xl:text-lg">S</span>
          </div>

          {/* Spacer to center nav items visually when space permits */}
          <div className="flex-1 flex flex-col gap-3 xl:gap-4 w-full items-center justify-center min-h-min">
            {navItems.map((t) => (
              t.id !== 'add' && (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)} 
                className={`group p-2.5 xl:p-3 rounded-2xl transition-all duration-300 hover:bg-white/10 ${activeTab === t.id ? 'bg-white/10 text-cyan-400' : 'text-slate-400'}`}
                title={t.label}
              >
                <t.icon className={`w-5 h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110 ${activeTab === t.id ? 'stroke-[2.5px]' : ''}`} />
                <span className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50 shadow-xl">
                  {t.label}
                </span>
              </button>
              )
            ))}
            
            {/* Add Button (Desktop) */}
            <button onClick={() => setActiveTab('add')} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white p-2.5 xl:p-3 rounded-2xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 shrink-0">
              <Plus className="w-5 h-5 xl:w-6 xl:h-6" />
            </button>
          </div>

          {/* Sign Out Button - Pushed to bottom via flex layout but scrolls if needed */}
          <button onClick={handleSignOut} className="mb-2 p-3 xl:p-4 text-slate-500 hover:text-rose-400 transition-colors shrink-0">
            <LogOut className="w-5 h-5" />
          </button>

        </div>
      </nav>

      {/* --- MOBILE & TABLET BOTTOM BAR --- */}
      <div className="lg:hidden fixed bottom-6 left-2 right-2 z-50">
        <div className="bg-[#0f0c29]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex justify-between items-center">
          
          <button 
            onClick={() => setActiveTab('home')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-cyan-400/10' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <ListFilter className={`w-5 h-5 ${activeTab === 'history' ? 'fill-cyan-400/10' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('audit')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'audit' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <ClipboardCheck className={`w-5 h-5 ${activeTab === 'audit' ? 'fill-cyan-400/10' : ''}`} />
          </button>

          {/* Middle Add Button */}
          <div className="relative -top-6 shrink-0 mx-1">
            <button 
              onClick={() => setActiveTab('add')} 
              className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] border-4 border-[#0f0c29] transform transition-transform active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'stats' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <PieChart className={`w-5 h-5 ${activeTab === 'stats' ? 'fill-cyan-400/10' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('wealth')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'wealth' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <Landmark className={`w-5 h-5 ${activeTab === 'wealth' ? 'fill-cyan-400/10' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'fill-cyan-400/10' : ''}`} />
          </button>

        </div>
      </div>

      <main className="w-full min-h-screen relative pb-32 lg:pb-8 lg:pl-32 xl:pl-40 pt-8 px-4 lg:pr-8 max-w-[1600px] mx-auto transition-all duration-300">
        {children}
      </main>

    </div>
  );
}