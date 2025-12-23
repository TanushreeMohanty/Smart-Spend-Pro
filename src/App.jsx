import React, { useState, useEffect, useMemo, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, setDoc, getDoc, getDocs, onSnapshot, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { 
  Home, ListFilter, Plus, ClipboardCheck, PieChart, Landmark, User, LogOut, 
  Pin, PinOff, ArrowDown, ArrowUp, UploadCloud, Loader2, Target, IndianRupee, 
  Bot, Sparkles, Receipt, Copy, Edit3, X, AlertTriangle, Search, ArrowUpDown 
} from 'lucide-react';

// --- Internal Imports ---
import { auth, db, appId, geminiKey } from './config/firebase';
import { CATEGORIES, TABS, TAX_LIMITS, UNITS, APP_VERSION } from './constants';
import { formatIndianCompact } from './utils/formatters';
import { calculateTaxData } from './utils/taxCalc';
import { processPdf } from './utils/pdfParser';

import LoginScreen from './components/LoginScreen';
import Loading from './components/Loading';
import TransactionItem from './components/TransactionItem';
import WealthItem from './components/WealthItem';
import UnitSelector from './components/UnitSelector';
import AIResponse from './components/AIResponse';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [transactions, setTransactions] = useState([]);
  const [wealthItems, setWealthItems] = useState([]);
  
  // Header & Forms
  const [addMode, setAddMode] = useState('manual');
  const [isHeaderPinned, setIsHeaderPinned] = useState(true);
  const [amount, setAmount] = useState('');
  const [transUnit, setTransUnit] = useState(1);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [type, setType] = useState('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // History Filters (Logic Added)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Wealth Form
  const [wealthName, setWealthName] = useState('');
  const [wealthAmount, setWealthAmount] = useState('');
  const [wealthType, setWealthType] = useState('asset');
  const [wealthUnit, setWealthUnit] = useState(1);

  // Advanced Features
  const [taxProfile, setTaxProfile] = useState({ annualRent: '', annualEPF: '', healthInsurance: '' });
  const [showTaxWizard, setShowTaxWizard] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState({ monthlyIncome: '', monthlyBudget: '', dailyBudget: '' });
  const [profileUnits, setProfileUnits] = useState({ monthlyIncome: 1, monthlyBudget: 1, dailyBudget: 1 });
  const [savingSettings, setSavingSettings] = useState(false);

  const fileInputRef = useRef(null);

  // --- Auth & Init ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  // --- Data Sync ---
  useEffect(() => {
    if (!user) return;
    
    // Transactions Sync
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const unsubT = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a,b) => (b.date?.seconds||0) - (a.date?.seconds||0));
      setTransactions(data);
    }, (err) => console.error("Firestore Error (Transactions):", err));

    // Wealth Sync
    const unsubW = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'wealth'), (snap) => {
      setWealthItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Firestore Error (Wealth):", err));

    // Settings Sync
    getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'preferences')).then(snap => {
      if(snap.exists()) {
        const data = snap.data();
        if(data.taxProfile) setTaxProfile(data.taxProfile);
        setSettings({
            monthlyIncome: data.monthlyIncome || '',
            monthlyBudget: data.monthlyBudget || '',
            dailyBudget: data.dailyBudget || ''
        });
      }
    });

    return () => { unsubT(); unsubW(); };
  }, [user]);

  // --- Handlers ---
  const handleLogin = async () => { try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch(e) { setAuthError(e.message); } };
  const handleGuest = async () => { try { await signInAnonymously(auth); } catch(e) { setAuthError(e.message); } };
  const handleSignOut = () => { if(confirm("Sign out?")) signOut(auth); };

  const handleResetData = async () => {
    if (!window.confirm("⚠️ DANGER ZONE ⚠️\n\nAre you sure you want to delete ALL your transactions, assets, and settings?\n\nThis action CANNOT be undone.")) return;
    if (!window.confirm("Final Confirmation: This will wipe your account clean. Click OK to proceed.")) return;

    setIsSubmitting(true);
    try {
      const transRef = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
      const wealthRef = collection(db, 'artifacts', appId, 'users', user.uid, 'wealth');
      const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'preferences');

      const [tSnap, wSnap] = await Promise.all([getDocs(transRef), getDocs(wealthRef)]);
      const deletePromises = [
        ...tSnap.docs.map(d => deleteDoc(d.ref)),
        ...wSnap.docs.map(d => deleteDoc(d.ref)),
        deleteDoc(settingsRef)
      ];
      await Promise.all(deletePromises);

      setTransactions([]);
      setWealthItems([]);
      setParsedTransactions([]);
      setSettings({ monthlyIncome: '', monthlyBudget: '', dailyBudget: '' });
      setProfileUnits({ monthlyIncome: 1, monthlyBudget: 1, dailyBudget: 1 });
      setTaxProfile({ annualRent: '', annualEPF: '', healthInsurance: '' });

      alert("Account reset complete.");
    } catch (e) {
      console.error(e);
      alert("Error resetting data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
            amount: parseFloat(amount) * transUnit, description, category, type, date: serverTimestamp()
        });
        setAmount(''); setDescription(''); setIsSubmitting(false); setActiveTab(TABS.HOME);
    } catch(e) { alert("Save Failed: Check Internet"); setIsSubmitting(false); }
  };

  const addWealth = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'wealth'), {
      name: wealthName, amount: parseFloat(wealthAmount) * wealthUnit, type: wealthType, date: serverTimestamp()
    });
    setWealthName(''); setWealthAmount('');
  };

  const handleFileUpload = async (file) => {
    try {
      const data = await processPdf(file, pdfPassword);
      setParsedTransactions(data);
    } catch(e) { 
      if(e.name === 'PasswordException') setShowPasswordPrompt(true);
      else alert("Error: " + e.message);
    }
  };

  const removeParsedItem = (id) => {
    setParsedTransactions(prev => prev.filter(t => t.id !== id));
  };

  const saveBulk = async () => {
    const batch = writeBatch(db);
    parsedTransactions.forEach(t => {
      const docRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
      const { id, ...cleanData } = t; 
      batch.set(docRef, { ...cleanData, date: t.date });
    });
    await batch.commit();
    setParsedTransactions([]); 
    setActiveTab(TABS.HOME);
  };

  const handleSaveSettings = async (e) => {
      e.preventDefault();
      setSavingSettings(true);
      const finalSettings = {
          monthlyIncome: parseFloat(settings.monthlyIncome) * profileUnits.monthlyIncome,
          monthlyBudget: parseFloat(settings.monthlyBudget) * profileUnits.monthlyBudget,
          dailyBudget: parseFloat(settings.dailyBudget) * profileUnits.dailyBudget
      };
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'preferences'), finalSettings, { merge: true });
      setSavingSettings(false);
  };

const generateAI = async () => {
    setAiLoading(true);
    setAiInsight(null);
    try {
      // ✅ FIX: Switched to the universally supported 'gemini-pro' model
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contents: [{ 
                parts: [{ 
                    text: `Act as a financial advisor. Data: Income ₹${totals.income}, Expenses ₹${totals.expenses}. Give 3 short bullet points: Observation, Advice, Tip. Use Markdown formatting.` 
                }] 
            }] 
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
          console.error("Gemini API Error:", data.error);
          setAiInsight(`Error: ${data.error.message}`);
      } else {
          setAiInsight(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response");
      }
    } catch(e) { 
        console.error("Network Error:", e);
        setAiInsight("Connection Error: Check console for details."); 
    } finally { 
        setAiLoading(false); 
    }
  };

  // --- Derived State ---
  const totals = useMemo(() => transactions.reduce((acc, t) => ({ ...acc, [t.type === 'income' ? 'income' : 'expenses']: acc[t.type === 'income' ? 'income' : 'expenses'] + parseFloat(t.amount) }), { income: 0, expenses: 0 }), [transactions]);
  const netWorth = useMemo(() => wealthItems.reduce((acc, t) => acc + (t.type === 'asset' ? 1 : -1) * parseFloat(t.amount), 0), [wealthItems]);
  const taxData = useMemo(() => calculateTaxData(transactions, taxProfile), [transactions, taxProfile]);

  // --- Filter Logic ---
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(t => t.description.toLowerCase().includes(term) || t.amount.toString().includes(term));
    }
    if (filterType !== 'all') data = data.filter(t => t.type === filterType);
    if (filterCategory !== 'all') data = data.filter(t => t.category === filterCategory);
    
    // Sorting
    data.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        const amtA = parseFloat(a.amount);
        const amtB = parseFloat(b.amount);
        if (sortBy === 'date-desc') return dateB - dateA;
        if (sortBy === 'date-asc') return dateA - dateB;
        if (sortBy === 'amount-desc') return amtB - amtA;
        if (sortBy === 'amount-asc') return amtA - amtB;
        return 0;
    });
    return data;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy]);

  if (loading) return <Loading />;
  if (!user) return <LoginScreen onLoginGoogle={handleLogin} onGuest={handleGuest} error={authError} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={handleSignOut}>
      
      {/* Header */}
      {activeTab !== TABS.PROFILE && (
        <header className="mb-8 lg:mb-10 animate-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {activeTab === TABS.WEALTH ? 'Wealth Portfolio' : `Hi, ${user.displayName?.split(' ')[0] || 'Guest'}`}
              </h1>
              <p className="text-slate-400 text-sm">
                {activeTab === TABS.WEALTH ? 'Track your assets and liabilities' : 'Welcome back to your dashboard'}
              </p>
            </div>
            
            <button onClick={() => setIsHeaderPinned(!isHeaderPinned)} className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full">
               {isHeaderPinned ? <Pin className="w-3 h-3 text-cyan-400" /> : <PinOff className="w-3 h-3" />}
               {isHeaderPinned ? 'Pinned' : 'Unpinned'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-white/10 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
              <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-widest">
                    {activeTab === TABS.WEALTH ? 'Total Net Worth' : 'Total Balance'}
                </p>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    {activeTab === TABS.WEALTH 
                      ? formatIndianCompact(netWorth)
                      : `₹${(totals.income - totals.expenses).toLocaleString('en-IN')}`
                    }
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-300 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
                      <div className="flex items-center gap-1"><ArrowDown className="w-4 h-4"/> <span className="text-[10px] font-bold uppercase">{activeTab === TABS.WEALTH ? 'Assets' : 'Income'}</span></div>
                      <span className="font-bold text-lg ml-auto">{activeTab !== TABS.WEALTH && `${formatIndianCompact(totals.income)}`}</span>
                  </div>
                  <div className="flex-1 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-rose-300 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
                      <div className="flex items-center gap-1"><ArrowUp className="w-4 h-4"/> <span className="text-[10px] font-bold uppercase">{activeTab === TABS.WEALTH ? 'Liabilities' : 'Expenses'}</span></div>
                      <span className="font-bold text-lg ml-auto">{activeTab !== TABS.WEALTH && `${formatIndianCompact(totals.expenses)}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Content Injection */}
      <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
        {activeTab === TABS.HOME && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">Recent Transactions</h3>
                <button onClick={() => setActiveTab(TABS.HISTORY)} className="text-xs text-cyan-400 hover:underline">See All</button>
              </div>
              {transactions.length === 0 ? (
                <div className="border-2 border-dashed border-white/5 rounded-3xl p-10 text-center">
                  <p className="text-slate-500 text-sm">No recent activity.</p>
                  <button onClick={() => setActiveTab(TABS.ADD)} className="mt-4 text-cyan-400 text-sm font-bold">Add First Entry</button>
                </div>
              ) : (
                transactions.slice(0, 5).map(t => <TransactionItem key={t.id} item={t} onDelete={(id) => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id))} />)
              )}
            </div>
            
            {/* Desktop Side Panel */}
            <div className="hidden lg:block bg-white/5 rounded-3xl p-6 border border-white/10 h-fit">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setActiveTab(TABS.ADD)} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                  <Plus className="w-4 h-4"/> Add Transaction
                </button>
                <button onClick={() => setActiveTab(TABS.WEALTH)} className="bg-white/5 hover:bg-white/10 text-slate-300 p-3 rounded-xl font-medium text-sm transition-all border border-white/5">
                  Update Assets
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === TABS.ADD && (
           <div className="max-w-2xl mx-auto">
             <div className="bg-white/5 p-1 rounded-2xl flex mb-8 border border-white/10">
               <button onClick={() => setAddMode('manual')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${addMode==='manual'?'bg-blue-600 text-white shadow-lg':'text-slate-400 hover:text-white'}`}>Manual Entry</button>
               <button onClick={() => setAddMode('upload')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${addMode==='upload'?'bg-blue-600 text-white shadow-lg':'text-slate-400 hover:text-white'}`}>Upload Statement</button>
             </div>
             {addMode === 'manual' ? (
               <form onSubmit={addTransaction} className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/10">
                 <div className="text-center">
                   <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 block">Amount</label>
                   {/* FIXED: Added min="0" and strict validation on change */}
                   <input 
                      type="number" 
                      min="0"
                      value={amount} 
                      onChange={e => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        setAmount(val);
                      }} 
                      className="bg-transparent text-6xl font-black text-white text-center w-full outline-none placeholder-white/10" 
                      placeholder="0" 
                      autoFocus 
                   />
                   <UnitSelector currentUnit={transUnit} onSelect={setTransUnit} className="mt-4 max-w-[240px] mx-auto" />
                 </div>
                 
                 <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                   {CATEGORIES.map(c => <button key={c.id} type="button" onClick={()=>setCategory(c.id)} className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${category===c.id?'bg-white/10 border-cyan-500/50 text-white scale-105 shadow-xl':'border-white/5 text-slate-500 hover:bg-white/5'}`}><c.icon className="w-6 h-6"/><span className="text-[10px] font-bold uppercase">{c.name}</span></button>)}
                 </div>
                 
                 <div className="space-y-4">
                   <input type="text" value={description} onChange={e=>setDescription(e.target.value)} placeholder="What was this for?" className="w-full bg-black/20 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-cyan-500/50 transition-colors" />
                   <div className="flex gap-3">
                     <button type="button" onClick={()=>setType('expense')} className={`flex-1 p-5 rounded-2xl font-bold border transition-all ${type==='expense'?'bg-rose-500/20 border-rose-500/50 text-rose-200':'bg-black/20 border-transparent text-slate-500'}`}>Expense</button>
                     <button type="button" onClick={()=>setType('income')} className={`flex-1 p-5 rounded-2xl font-bold border transition-all ${type==='income'?'bg-emerald-500/20 border-emerald-500/50 text-emerald-200':'bg-black/20 border-transparent text-slate-500'}`}>Income</button>
                   </div>
                 </div>
                 
                 <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 p-5 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-cyan-500/20 transition-all active:scale-[0.98]">{isSubmitting ? 'Saving...' : 'Save Transaction'}</button>
               </form>
             ) : (
               <div className="space-y-6">
                 <div className="text-center border-4 border-dashed border-white/10 rounded-[3rem] p-16 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => fileInputRef.current.click()}>
                   <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                     <UploadCloud className="w-10 h-10 text-blue-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2">Upload Bank Statement</h3>
                   <p className="text-slate-400 max-w-xs mx-auto">Supports PDF and CSV. We'll automatically categorize your spending.</p>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
                 </div>

                 {parsedTransactions.length > 0 && (
                   <div className="animate-in slide-in-from-bottom-4">
                     <div className="flex justify-between items-center mb-4 px-2">
                         <h3 className="font-bold text-white">Review ({parsedTransactions.length})</h3>
                         <button onClick={() => setParsedTransactions([])} className="text-xs text-rose-400 hover:underline">Clear All</button>
                     </div>
                     <div className="max-h-[400px] overflow-y-auto space-y-2 mb-4 pr-1">
                         {parsedTransactions.map((t, idx) => (
                             <TransactionItem 
                                 key={t.id || idx} 
                                 item={t} 
                                 onDelete={() => removeParsedItem(t.id)} 
                             />
                         ))}
                     </div>
                     <button onClick={saveBulk} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all">
                         Confirm Import ({parsedTransactions.length} Items)
                     </button>
                   </div>
                 )}
               </div>
             )}
           </div>
        )}

        {/* FIXED: History Filters Implemented */}
        {activeTab === TABS.HISTORY && (
          <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">History</h2>
                <div className="flex gap-2">
                    <button onClick={() => setSortBy(s => s === 'date-desc' ? 'date-asc' : 'date-desc')} className="p-2 bg-white/5 rounded-full border border-white/10 text-slate-400">
                        <ArrowUpDown className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            {/* Filter UI */}
            <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-30 py-4 -mx-2 px-2 space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-3 rounded-xl text-white outline-none focus:border-cyan-500/50"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['all', 'expense', 'income'].map(ft => (
                        <button 
                            key={ft}
                            onClick={() => setFilterType(ft)}
                            className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap border ${filterType === ft ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-slate-400 border-white/5'}`}
                        >
                            {ft}
                        </button>
                    ))}
                     <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 text-slate-400 text-xs rounded-full px-4 py-2 outline-none"
                    >
                        <option value="all">All Cats</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            
            {/* List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No transactions found.</div>
            ) : (
                filteredTransactions.map(t => <TransactionItem key={t.id} item={t} onDelete={(id) => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id))} />)
            )}
          </div>
        )}

        {activeTab === TABS.STATS && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white">AI Advisor</h2>
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6 rounded-[2rem] border border-white/10 shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <Bot className="w-6 h-6 text-cyan-300" />
                </div>
                <div className="flex-1">
                  <AIResponse data={aiInsight} />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={generateAI} 
                  disabled={aiLoading}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-yellow-400" />}
                  {aiLoading ? "Thinking..." : "Generate New Insight"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.AUDIT && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Tax Scout</h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                    FY {taxData.fiscalYear}
                  </span>
                  <span className="text-sm">Automated Deduction Tracking</span>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowTaxWizard(true)} 
                  className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] p-8 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Receipt className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Estimated Taxable Income</span>
                  <div className="text-4xl lg:text-5xl font-black text-white mt-4 mb-2 tracking-tight">
                    {formatIndianCompact(taxData.taxableIncome)}
                  </div>
                  <div className="text-sm text-slate-500">
                    Gross: <span className="text-slate-300">{formatIndianCompact(taxData.totalIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-xl flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Sec 80C Investments</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${taxData.investments80C >= 150000 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {((taxData.investments80C / TAX_LIMITS.SECTION_80C) * 100).toFixed(0)}% Utilized
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-white">{formatIndianCompact(taxData.investments80C)}</span>
                  <span className="text-slate-500 font-medium">/ 1.5L Limit</span>
                </div>

                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(100, (taxData.investments80C / TAX_LIMITS.SECTION_80C) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Includes EPF, ELSS, LIC, and Tuition Fees automatically detected from your transactions.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                  const report = `Tax Report FY ${taxData.fiscalYear}\nIncome: ₹${taxData.totalIncome}\nTaxable: ₹${taxData.taxableIncome}\n80C: ₹${taxData.investments80C}`;
                  navigator.clipboard.writeText(report);
                  alert("Report copied!");
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl text-slate-200 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Copy className="w-5 h-5" /> Copy Summary for CA
            </button>
          </div>
        )}

        {showTaxWizard && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f0c29] w-full max-w-md rounded-[2.5rem] p-8 border border-white/20 shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-bold text-white text-2xl">Tax Profile</h3>
                  <p className="text-slate-400 text-sm mt-1">Update invisible deductions</p>
                </div>
                <button onClick={() => setShowTaxWizard(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5">
                  <X className="text-white w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase mb-2 block tracking-widest">Annual Rent Paid (HRA)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={taxProfile.annualRent} 
                      onChange={(e) => setTaxProfile({ ...taxProfile, annualRent: e.target.value })} 
                      className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-2xl text-white text-lg outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase mb-2 block tracking-widest">Employee EPF (Annual)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={taxProfile.annualEPF} 
                      onChange={(e) => setTaxProfile({ ...taxProfile, annualEPF: e.target.value })} 
                      className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-2xl text-white text-lg outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <button 
                  onClick={() => { 
                    setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'preferences'), { taxProfile }, { merge: true }); 
                    setShowTaxWizard(false); 
                  }} 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 mt-2 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.WEALTH && (
          <div className="space-y-6 pb-24">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <h2 className="text-slate-400 text-xs font-bold uppercase">Net Worth</h2>
              <h1 className="text-4xl font-bold text-white">{formatIndianCompact(netWorth)}</h1>
            </div>
            <form onSubmit={addWealth} className="space-y-4">
              <input type="text" placeholder="Asset Name" value={wealthName} onChange={e=>setWealthName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white" />
              <div className="flex gap-2">
                <input type="number" placeholder="Val" value={wealthAmount} onChange={e=>setWealthAmount(e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl text-white" />
                <UnitSelector currentUnit={wealthUnit} onSelect={setWealthUnit} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={()=>setWealthType('asset')} className={`flex-1 p-3 rounded-xl text-xs font-bold ${wealthType==='asset'?'bg-emerald-500/20 text-emerald-300':'bg-white/5 text-slate-500'}`}>Asset</button>
                <button type="button" onClick={()=>setWealthType('liability')} className={`flex-1 p-3 rounded-xl text-xs font-bold ${wealthType==='liability'?'bg-rose-500/20 text-rose-300':'bg-white/5 text-slate-500'}`}>Liability</button>
              </div>
              <button type="submit" className="w-full bg-white/10 text-white font-bold p-3 rounded-xl">Add Item</button>
            </form>
            {wealthItems.map(w => <WealthItem key={w.id} item={w} onDelete={(id) => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'wealth', id))} />)}
          </div>
        )}

        {activeTab === TABS.PROFILE && (
            <div className="space-y-6 pb-24 animate-in fade-in">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex items-center space-x-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 border-4 border-white/5"><User className="w-8 h-8" /></div>
                <div>
                    <h3 className="font-bold text-white text-xl">{user.displayName || 'Guest User'}</h3>
                    <p className="text-sm text-slate-400 mb-2">{user.email || 'guest@smartspend.app'}</p>
                    <div className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full w-fit border border-blue-500/20">PRO USER</div>
                </div>
            </div>
            <form onSubmit={handleSaveSettings} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2"><Target className="w-5 h-5 text-yellow-400" /> Financial Goals</h3>
                    {['monthlyIncome', 'monthlyBudget', 'dailyBudget'].map((k) => (
                        <div key={k} className="space-y-2">
                        <label className="text-xs text-slate-500 font-bold uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="number" value={settings[k]} onChange={(e) => setSettings({...settings, [k]: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl text-white outline-none" placeholder="0" />
                        </div>
                        <UnitSelector 
                            currentUnit={profileUnits[k]} 
                            onSelect={(u) => setProfileUnits(prev => ({...prev, [k]: u}))} 
                        />
                        </div>
                    ))}
                    <button type="submit" disabled={savingSettings} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black shadow-xl">{savingSettings ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : 'Save Changes'}</button>
            </form>
            <div className="pt-8 border-t border-white/10 space-y-4">
            <h3 className="font-bold text-rose-400 text-sm uppercase tracking-widest mb-2">Danger Zone</h3>
            
            <button 
                onClick={handleResetData} 
                disabled={isSubmitting}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-4 rounded-2xl font-bold border border-rose-500/20 flex items-center justify-center gap-2 transition-all"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <AlertTriangle className="w-5 h-5" />}
                {isSubmitting ? "Wiping Data..." : "Reset All Data"}
            </button>

            <button onClick={handleSignOut} className="w-full bg-white/5 hover:bg-white/10 text-slate-400 py-4 rounded-2xl font-bold border border-white/5">
                Sign Out
            </button>
        </div>
            </div>
        )}

      </div>
    </Layout>
  );
}