import { Coffee, ShoppingBag, Car, Home as HomeIcon, Zap, Gift, Smartphone, Briefcase, TrendingUp, Activity } from 'lucide-react';

export const APP_VERSION = "v2.0.0";

export const TABS = { 
  HOME: 'home', HISTORY: 'history', ADD: 'add', 
  AUDIT: 'audit', STATS: 'stats', WEALTH: 'wealth', PROFILE: 'profile' 
};

export const UNITS = [
  { label: '₹', value: 1 },
  { label: 'K', value: 1000 },
  { label: 'L', value: 100000 },
  { label: 'Cr', value: 10000000 }
];

export const TAX_LIMITS = {
  SECTION_80C: 150000,
  SECTION_80D: 25000,
  STANDARD_DEDUCTION: 50000
};

export const CATEGORIES = [
  { id: 'food', name: 'Food', icon: Coffee, color: 'bg-orange-500/20 text-orange-300', keywords: ['cafe', 'coffee', 'zomato', 'swiggy'] },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-sky-500/20 text-sky-300', keywords: ['amazon', 'flipkart', 'myntra'] },
  { id: 'transport', name: 'Transport', icon: Car, color: 'bg-blue-500/20 text-blue-300', keywords: ['uber', 'ola', 'fuel'] },
  { id: 'housing', name: 'Housing', icon: HomeIcon, color: 'bg-indigo-500/20 text-indigo-300', keywords: ['rent', 'maintenance'] },
  { id: 'utilities', name: 'Utilities', icon: Zap, color: 'bg-yellow-500/20 text-yellow-300', keywords: ['bill', 'mobile'] },
  { id: 'entertainment', name: 'Fun', icon: Gift, color: 'bg-pink-500/20 text-pink-300', keywords: ['netflix', 'movie'] },
  { id: 'tech', name: 'Tech', icon: Smartphone, color: 'bg-cyan-500/20 text-cyan-300', keywords: ['apple', 'electronics'] },
  { id: 'salary', name: 'Salary', icon: Briefcase, color: 'bg-emerald-500/20 text-emerald-300', keywords: ['salary'] },
  { id: 'investment', name: 'Invest', icon: TrendingUp, color: 'bg-teal-500/20 text-teal-300', keywords: ['stock', 'sip', 'mutual'] },
  { id: 'other', name: 'Other', icon: Activity, color: 'bg-slate-500/20 text-slate-300', keywords: [] },
];