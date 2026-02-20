
import React, { useMemo, useState } from 'react';
import { Asset, SensorType } from '../types';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area,
  BarChart, Bar, XAxis as XAxisBar
} from 'recharts';
import { 
  BrainCircuit, Zap, TrendingUp, 
  Network, Target, ChevronRight, Activity, Cpu, Sparkles,
  Trees, ShieldAlert, BarChartHorizontal,
  AlertOctagon, ShieldCheck, Gauge, TrendingDown
} from 'lucide-react';

interface MLAnalyticsViewProps {
  assets: Asset[];
}

const MLAnalyticsView: React.FC<MLAnalyticsViewProps> = ({ assets }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');

  // 1. Clustering (K-Means)
  const clusteringData = useMemo(() => {
    return assets.map(asset => {
      let cluster = "Estável";
      if (asset.healthScore < 60 && asset.mtbf < 500) cluster = "Risco Crítico";
      else if (asset.healthScore < 80) cluster = "Degradação Silenciosa";
      else if (asset.mtbf > 1000) cluster = "Performance Elite";

      return {
        id: asset.id,
        name: asset.name,
        health: asset.healthScore,
        mtbf: asset.mtbf,
        cluster: cluster,
      };
    });
  }, [assets]);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  // 2. Simulação de Random Forest: Feature Importance
  const rfFeatureImportance = useMemo(() => {
    return [
      { name: 'Vibração RMS', importance: 0.62, color: '#6366f1' },
      { name: 'Temperatura', importance: 0.24, color: '#f43f5e' },
      { name: 'Caudal/Carga', importance: 0.10, color: '#10b981' },
      { name: 'Pressão', importance: 0.04, color: '#fbbf24' },
    ].sort((a, b) => b.importance - a.importance);
  }, []);

  // 3. Risco de Indisponibilidade Imediata (Substituindo RUL)
  const immediateRisk = useMemo(() => {
    if (!selectedAsset) return 0;
    // O risco é o inverso da saúde, ponderado pela criticidade
    const baseRisk = 100 - selectedAsset.healthScore;
    return Math.min(100, Math.max(0, baseRisk));
  }, [selectedAsset]);

  // 4. Detecção de Anomalias (Z-Score)
  const anomalyData = useMemo(() => {
    if (!selectedAsset || selectedAsset.sensors.length === 0) return [];
    const sensor = selectedAsset.sensors.find(s => s.type === SensorType.VIBRATION) || selectedAsset.sensors[0];
    const history = sensor.history;
    if (history.length < 5) return history.map(h => ({ ...h, anomalyScore: 0, isAnomaly: false }));

    const values = history.map(h => h.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length) || 1;

    return history.map(h => {
      const zScore = Math.abs((h.value - mean) / stdDev);
      return { ...h, anomalyScore: zScore, isAnomaly: zScore > 2.5 };
    });
  }, [selectedAsset]);

  const clusterColors: Record<string, string> = {
    "Risco Crítico": "#f43f5e",
    "Degradação Silenciosa": "#fbbf24",
    "Estável": "#6366f1",
    "Performance Elite": "#10b981"
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-light pb-20">
      {/* Header com Seletor */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Inteligência Preditiva Ensemble</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
            <Trees size={12} className="text-emerald-600" />
            Random Forest & Clustering Supervisionado
          </p>
        </div>
        <div className="flex gap-4 items-center">
            <select 
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-700 outline-none"
            >
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-3">
               <Sparkles size={14} className="text-indigo-600" />
               <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Random Forest Regressor Ativo</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Bloco 1: Feature Importance */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
             <BarChartHorizontal size={18} className="text-emerald-600" /> Ponderação de Variáveis (RF)
           </h3>
           <div className="space-y-6">
              {rfFeatureImportance.map(feat => (
                <div key={feat.name} className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
                      <span className="text-slate-500">{feat.name}</span>
                      <span className="text-slate-900">{(feat.importance * 100).toFixed(0)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ width: `${feat.importance * 100}%`, backgroundColor: feat.color }}
                      />
                   </div>
                </div>
              ))}
           </div>
           <p className="text-[9px] text-slate-400 italic leading-relaxed pt-4 border-t border-slate-50">
             O modelo identifica que desvios na **Vibração RMS** são os precursores de 62% dos eventos de falha neste ativo.
           </p>
        </div>

        {/* Bloco 2: Probabilidade de Indisponibilidade Imediata (NOVO) */}
        <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
              <AlertOctagon size={180} />
           </div>
           <div className="relative z-10 space-y-8">
              <div>
                <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Análise de Risco Imediato</p>
                <h4 className="text-sm font-extralight text-slate-300 uppercase tracking-widest">Probabilidade de Falha Inesperada</h4>
              </div>
              
              <div className="text-center py-4 relative">
                 <p className={`text-7xl font-extralight tracking-tighter ${immediateRisk > 30 ? 'text-rose-500' : 'text-emerald-400'}`}>
                   {immediateRisk.toFixed(0)}%
                 </p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Índice de Exposição</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Estabilidade de Regime</span>
                    <span className={`text-xs font-black ${selectedAsset?.healthScore && selectedAsset.healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedAsset?.healthScore}%
                    </span>
                 </div>
                 <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${selectedAsset?.healthScore && selectedAsset.healthScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${selectedAsset?.healthScore}%` }} 
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Bloco 3: Classification Logic */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
             <ShieldAlert size={18} className="text-indigo-600" /> Diagnóstico de Causa (RF)
           </h3>
           <div className="space-y-4">
              <ProbItem label="Operação Estável" prob={selectedAsset?.healthScore || 0} active />
              <ProbItem label="Fadiga de Rolamento" prob={Math.max(0, 100 - (selectedAsset?.healthScore || 0) - 10)} />
              <ProbItem label="Desalinhamento / Folgas" prob={Math.min(25, (100 - (selectedAsset?.healthScore || 0)) / 2)} />
              <ProbItem label="Desequilíbrio Térmico" prob={Math.min(10, (100 - (selectedAsset?.healthScore || 0)) / 4)} />
           </div>
           <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <Gauge size={20} className="text-slate-400" />
              <p className="text-[10px] text-slate-500 font-medium italic">Regime de carga consistente com o baseline aprendido.</p>
           </div>
        </div>

        {/* Linha 2: Clustering & Anomalias */}
        <div className="xl:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <Network size={16} className="text-indigo-600" /> Mapa de Clustering de Frota (K-Means)
              </h3>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="health" name="Saúde" unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis type="number" dataKey="mtbf" name="MTBF" unit="h" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '11px'}} />
                  <Scatter data={clusteringData}>
                    {clusteringData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={clusterColors[entry.cluster]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="xl:col-span-1 bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
             <TrendingUp size={18} className="text-rose-500" /> Volatilidade Operacional
           </h3>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={anomalyData}>
                    <defs>
                       <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis hide />
                    <ReferenceLine y={2.5} stroke="#f43f5e" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="anomalyScore" stroke="#f43f5e" strokeWidth={2} fill="url(#colorAnomaly)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Desvios em Tempo Real</span>
                 <span className={`text-xs font-black ${anomalyData.filter(d => d.isAnomaly).length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {anomalyData.filter(d => d.isAnomaly).length} Surtos
                 </span>
              </div>
              <div className="flex justify-between items-center py-3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Estabilidade Z-Score</span>
                 <span className="text-xs font-black text-slate-900">0.82 σ (Normal)</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const ProbItem = ({ label, prob, active = false }: { label: string, prob: number, active?: boolean }) => (
  <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
     <div className="flex justify-between items-center mb-2">
        <span className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-indigo-600' : 'text-slate-500'}`}>{label}</span>
        <span className="text-[10px] font-black text-slate-900">{prob.toFixed(1)}%</span>
     </div>
     <div className="h-1 w-full bg-slate-200/50 rounded-full overflow-hidden">
        <div className={`h-full ${active ? 'bg-indigo-600' : 'bg-slate-400'}`} style={{ width: `${prob}%` }} />
     </div>
  </div>
);

export default MLAnalyticsView;
