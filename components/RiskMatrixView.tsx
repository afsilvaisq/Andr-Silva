
import React, { useState } from 'react';
import { Asset } from '../types';
import { Search, Grid3X3, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskMatrixViewProps {
  assets: Asset[];
}

const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getRiskPos = (asset: Asset) => {
    const c = asset.criticality || { probability: 1, impactEnvironment: 1, impactEconomic: 1, impactHuman: 1 };
    const avgImpact = (c.impactEnvironment + c.impactEconomic + c.impactHuman) / 3;
    return {
      prob: Math.round(c.probability),
      impact: Math.round(avgImpact),
      score: c.probability * avgImpact
    };
  };

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-light">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Matriz de Risco Crítico</h2>
          <p className="text-slate-400 text-[9px] font-light uppercase tracking-[0.2em]">Visão Estratégica: Probabilidade vs. Severidade</p>
        </div>
        <div className="relative w-full max-w-sm">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
           <input 
            type="text" 
            placeholder="Filtrar equipamentos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-900 text-[11px] font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl relative">
          <div className="relative aspect-square w-full max-w-md mx-auto">
             {/* Heatmap Grid - Vivid Colors */}
             <div className="grid grid-cols-5 grid-rows-5 h-full border-l-2 border-b-2 border-slate-200 overflow-hidden rounded-bl-sm">
                {Array.from({ length: 25 }).map((_, i) => {
                  const row = 5 - Math.floor(i / 5);
                  const col = (i % 5) + 1;
                  const riskValue = row * col;
                  
                  let cellBg = "bg-slate-50";
                  // Vivid Palette Implementation
                  if (riskValue > 15) cellBg = "bg-rose-500 shadow-inner";
                  else if (riskValue > 10) cellBg = "bg-amber-400 shadow-inner";
                  else if (riskValue > 5) cellBg = "bg-emerald-500 shadow-inner";
                  else if (riskValue > 0) cellBg = "bg-emerald-50 shadow-inner";

                  return (
                    <div key={i} className={`${cellBg} border border-slate-100 relative flex items-center justify-center transition-all duration-300`}>
                       <div className="flex flex-wrap gap-1.5 items-center justify-center p-1.5 z-10">
                          {filteredAssets.map(asset => {
                            const pos = getRiskPos(asset);
                            if (pos.prob === col && pos.impact === row) {
                              return (
                                <div 
                                  key={asset.id} 
                                  className="w-4 h-4 rounded-full bg-white shadow-lg cursor-help group relative border-2 border-slate-900 transition-all hover:scale-150"
                                >
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white text-[9px] font-light uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                                    {asset.name}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                       </div>
                       <span className="absolute bottom-1 right-1 text-[7px] font-black text-slate-300 uppercase">{col}x{row}</span>
                    </div>
                  );
                })}
             </div>
             {/* Axis Labels */}
             <div className="absolute -left-16 top-1/2 -rotate-90 text-[9px] font-light text-slate-400 uppercase tracking-[0.4em]">Severidade</div>
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-light text-slate-400 uppercase tracking-[0.4em]">Probabilidade</div>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
           <h3 className="text-[9px] font-light text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
             Lista de Priorização ({filteredAssets.length})
           </h3>
           {filteredAssets.length > 0 ? filteredAssets.map(asset => {
             const pos = getRiskPos(asset);
             return (
               <div key={asset.id} className="p-5 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-slate-50 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-2xl border transition-colors ${
                        pos.score > 15 ? 'bg-rose-500 text-white border-rose-400' : 
                        pos.score > 10 ? 'bg-amber-400 text-white border-amber-300' : 
                        'bg-emerald-500 text-white border-emerald-400'
                     }`}>
                        <AlertTriangle size={16} strokeWidth={1.5} />
                     </div>
                     <div>
                        <p className="text-xs font-normal text-slate-900 uppercase tracking-tight">{asset.name}</p>
                        <p className="text-[9px] text-slate-400 font-light uppercase tracking-widest">{asset.location}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-xl font-extralight tracking-tighter ${
                        pos.score > 15 ? 'text-rose-600' : pos.score > 10 ? 'text-amber-600' : 'text-emerald-600'
                     }`}>
                        {pos.score.toFixed(1)}
                     </p>
                     <p className="text-[8px] text-slate-400 font-light uppercase tracking-widest">Índice RPN</p>
                  </div>
               </div>
             );
           }) : (
             <div className="py-20 text-center text-slate-300 font-light uppercase tracking-[0.2em] text-[10px]">Sem resultados para "{searchTerm}"</div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-100">
        <div className="p-6 bg-rose-500 rounded-3xl shadow-lg shadow-rose-200">
          <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Crítico</p>
          <p className="text-rose-50 text-[9px] font-light leading-relaxed">Intervenção de engenharia mandatória em menos de 24h.</p>
        </div>
        <div className="p-6 bg-amber-400 rounded-3xl shadow-lg shadow-amber-200">
          <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Atenção</p>
          <p className="text-amber-50 text-[9px] font-light leading-relaxed">Programar inspeção visual e análise de óleo.</p>
        </div>
        <div className="p-6 bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-200">
          <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Estável</p>
          <p className="text-emerald-50 text-[9px] font-light leading-relaxed">Ativo em conformidade com as normas ISO vigentes.</p>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrixView;
