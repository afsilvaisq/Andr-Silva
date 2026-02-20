
import React, { useState } from 'react';
import { Asset, CriticalityAssessment, UserRole } from '../types';
import { ShieldAlert, AlertTriangle, TrendingDown, Grid3X3, Sparkles, Leaf, Coins, Users, Edit3, Save, Lock, Loader2 } from 'lucide-react';

interface CriticalityViewProps {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
  userRole: UserRole;
}

const CriticalityView: React.FC<CriticalityViewProps> = ({ assets, onUpdateAsset, userRole }) => {
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<CriticalityAssessment | null>(null);

  const getCriticalityData = (asset: Asset) => {
    const c = asset.criticality || { probability: 1, impactEnvironment: 1, impactEconomic: 1, impactHuman: 1 };
    const avgImpact = (c.impactEnvironment + c.impactEconomic + c.impactHuman) / 3;
    const score = c.probability * avgImpact;
    return {
      score,
      prob: c.probability,
      impact: avgImpact,
      level: score > 15 ? 'Crítico' : score > 10 ? 'Alto' : score > 5 ? 'Médio' : 'Baixo'
    };
  };

  const handleStartEdit = (asset: Asset) => {
    if (userRole !== 'admin') return;
    setEditingAssetId(asset.id);
    setEditValues(asset.criticality || { probability: 1, impactEnvironment: 1, impactEconomic: 1, impactHuman: 1 });
  };

  const handleSaveEdit = (asset: Asset) => {
    if (editValues && userRole === 'admin') {
      onUpdateAsset({ ...asset, criticality: editValues });
      setEditingAssetId(null);
      setEditValues(null);
    }
  };

  const sortedAssets = [...assets].sort((a, b) => getCriticalityData(b).score - getCriticalityData(a).score);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight uppercase">Matriz de Criticidade</h2>
          <p className="text-slate-400 text-sm font-medium">Priorização estratégica de manutenção industrial</p>
        </div>
        {userRole === 'client' && (
          <div className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2 text-slate-400 border border-slate-200">
            <Lock size={12} />
            <span className="text-[10px] font-medium uppercase tracking-widest">Apenas Leitura</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-8">
            <Grid3X3 className="text-indigo-600" size={18} />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Mapa de Risco</h3>
          </div>
          
          <div className="relative aspect-square w-full max-w-[280px] mx-auto">
            <div className="grid grid-cols-5 h-full border-l border-b border-slate-200">
              {Array.from({ length: 25 }).map((_, i) => {
                const row = 5 - Math.floor(i / 5);
                const col = (i % 5) + 1;
                const risk = row * col;
                let bgColor = 'bg-slate-50/40';
                if (risk > 15) bgColor = 'bg-rose-500/5';
                else if (risk > 10) bgColor = 'bg-amber-400/5';
                else if (risk > 5) bgColor = 'bg-indigo-600/5';
                
                return (
                  <div key={i} className={`${bgColor} border border-white/50 relative`}>
                    <div className="absolute inset-0 flex flex-wrap gap-0.5 p-0.5 items-center justify-center">
                      {assets.map(asset => {
                        const data = getCriticalityData(asset);
                        if (Math.round(data.prob) === col && Math.round(data.impact) === row) {
                          return (
                            <div 
                              key={asset.id} 
                              className={`w-2.5 h-2.5 rounded-full shadow-sm transition-transform hover:scale-150 ${
                                data.score > 15 ? 'bg-rose-500' : 
                                data.score > 10 ? 'bg-amber-500' : 
                                data.score > 5 ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                              title={asset.name}
                            ></div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute -left-10 top-1/2 -rotate-90 text-[9px] text-slate-300 tracking-widest uppercase font-medium">Impacto</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-slate-300 tracking-widest uppercase font-medium">Probabilidade</div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest mb-8">Ativos de Alta Prioridade</h3>
            
            <div className="space-y-3">
              {sortedAssets.map((asset, idx) => {
                const data = getCriticalityData(asset);
                const isEditing = editingAssetId === asset.id;

                return (
                  <div key={asset.id} className={`p-4 rounded-2xl border transition-all ${isEditing ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-200 font-medium">#{idx + 1}</span>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 tracking-tight">{asset.name}</h4>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{asset.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{data.score.toFixed(1)}</p>
                          <span className={`text-[9px] font-medium uppercase px-2 py-0.5 rounded-full ${
                            data.score > 15 ? 'bg-rose-50 text-rose-500' : 
                            data.score > 10 ? 'bg-amber-50 text-amber-500' : 
                            'bg-indigo-50 text-indigo-600'
                          }`}>
                            {data.level}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <button onClick={() => handleSaveEdit(asset)} className="p-2 bg-indigo-600 text-white rounded-lg"><Save size={16} /></button>
                          ) : (
                            <>
                              {userRole === 'admin' && (
                                <button onClick={() => handleStartEdit(asset)} className="p-2 text-slate-200 hover:text-slate-400"><Edit3 size={16} /></button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isEditing && editValues && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-4 border-t border-slate-100">
                        <SliderInput label="Falha" value={editValues.probability} onChange={v => setEditValues({...editValues, probability: v})} />
                        <SliderInput label="Ambiente" value={editValues.impactEnvironment} onChange={v => setEditValues({...editValues, impactEnvironment: v})} />
                        <SliderInput label="Economia" value={editValues.impactEconomic} onChange={v => setEditValues({...editValues, impactEconomic: v})} />
                        <SliderInput label="Segurança" value={editValues.impactHuman} onChange={v => setEditValues({...editValues, impactHuman: v})} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="space-y-1.5">
    <span className="text-[9px] text-slate-400 uppercase font-semibold tracking-tighter">{label}</span>
    <div className="flex items-center gap-2">
      <input 
        type="range" min="1" max="5" step="1" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
      />
      <span className="text-[10px] text-slate-900 font-semibold">{value}</span>
    </div>
  </div>
);

export default CriticalityView;
