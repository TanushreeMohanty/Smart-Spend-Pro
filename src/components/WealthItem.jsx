import React from 'react';
import { Building2, FileText, Trash2 } from 'lucide-react';
import { formatIndianCompact } from '../utils/formatters';

export default function WealthItem({ item, onDelete }) {
  const isAsset = item.type === 'asset';
  return (
    <div className="group flex items-center p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl mb-3">
      <div className={`p-3.5 rounded-2xl mr-4 ${isAsset ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
        {isAsset ? <Building2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-blue-50">{item.name}</h4>
        <p className="text-xs text-blue-300/70 capitalize">{item.type}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${isAsset ? 'text-emerald-300' : 'text-rose-300'}`}>
          {formatIndianCompact(item.amount)}
        </p>
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-500 hover:text-rose-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}