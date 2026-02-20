
import React from 'react';
import { Asset, SeverityLevel } from '../types';
import { Activity } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
  isActive: boolean;
}

const getSeverityColor = (level: SeverityLevel) => {
  switch (level) {
    case 'A': 
    case 'B': return 'bg-emerald-500';
    case 'C': return 'bg-amber-400';
    case 'D': return 'bg-rose-500';
    default: return 'bg-slate-400';
  }
};

const getSeverityText = (level: SeverityLevel) => {
  switch (level) {
    case 'A':
    case 'B': return 'text-emerald-600';
    case 'C': return 'text-amber-600';
    case 'D': return 'text-rose-600';
    default: return 'text-slate-600';
  }
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, isActive }) => {
  const vibration = asset.sensors.find(s => s.type === 'vibration')?.currentValue || 0;

  return (
    <div 
      onClick={() => onClick(asset)}
      className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
        isActive 
          ? 'border-indigo-500 bg-white shadow-xl shadow-indigo-100' 
          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className={`absolute top-0 right-0 w-1 h-full ${getSeverityColor(asset.severity)} opacity-40 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">{asset.name}</h3>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-bold">{asset.location}</p>
        </div>
        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black text-white ${getSeverityColor(asset.severity)} shadow-sm`}>
          {asset.severity}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mb-1">RMS Vibr.</p>
          <p className={`text-sm font-black ${getSeverityText(asset.severity)}`}>
            {vibration.toFixed(2)} <span className="text-[10px] text-slate-400 font-bold ml-1">mm/s</span>
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mb-1">Saúde</p>
          <p className="text-sm font-black text-slate-900">{asset.healthScore}%</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase font-bold tracking-wide">
         <span className="flex items-center gap-1.5"><Activity size={12} className="text-slate-300" /> {asset.sensors.length} Pontos</span>
         <span className={`h-1.5 w-1.5 rounded-full ${getSeverityColor(asset.severity)}`}></span>
         <span>{asset.severity === 'D' ? 'Perigo' : asset.severity === 'C' ? 'Alerta' : 'Normal'}</span>
      </div>
    </div>
  );
};

export default AssetCard;
