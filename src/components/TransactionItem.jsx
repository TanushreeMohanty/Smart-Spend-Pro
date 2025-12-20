import React from 'react';
import { Trash2 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { formatDate } from '../utils/formatters';

export default function TransactionItem({ item, onDelete }) {
  const category = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = category.icon;
  const isExpense = item.type === 'expense';

  return (
    <div className="group flex items-center p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl mb-3 transition-all hover:bg-white/10">
      <div className={`p-3.5 rounded-2xl mr-4 ${category.color} shadow-inner`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="font-semibold text-blue-50 truncate">{item.description}</h4>
        <div className="flex items-center text-xs text-blue-300/70 mt-1">
          <span className="capitalize">{category.name}</span>
          <span className="mx-1.5 opacity-50">•</span>
          <span>{formatDate(item.date)}</span>
        </div>
      </div>
      <div className="text-right pl-2">
        <p className={`font-bold text-lg ${isExpense ? 'text-rose-300' : 'text-emerald-300'}`}>
          {isExpense ? '-' : '+'}₹{parseFloat(item.amount).toLocaleString('en-IN')}
        </p>
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 text-slate-500 hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}