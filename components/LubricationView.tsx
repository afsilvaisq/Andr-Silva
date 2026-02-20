
import React, { useState, useMemo } from 'react';
import { Asset, LubricationPoint, LubeExpertReading } from '../types';
import { 
  Droplets, ClipboardList, TrendingUp, Calendar, 
  Settings, CheckCircle2, AlertTriangle, Info, Plus, 
  Clock, Thermometer, Upload, History, Zap, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from 'recharts';

interface LubricationViewProps {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
}

const LubricationView: React.FC<LubricationViewProps> = ({ assets, onUpdateAsset }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'plan' | 'lubeexpert'>('plan');
  const [isUploading, setIsUploading] = useState(false);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  
  const lubricationPoints = selectedAsset?.lubricationPoints || [];
  const lubeHistory = selectedAsset?.lubeHistory || [];

  const handleSimulateLubeExpert = () => {
    if (!selectedAsset) return;
    setIsUploading(true);
    setTimeout(() => {
      const newReading: LubeExpertReading = {
        timestamp: new Date().toISOString(),
        frictionBefore: 40 + Math.random() * 20,
        frictionAfter: 10 + Math.random() * 5,
        status: 'good'
      };
      
      onUpdateAsset({
        ...selectedAsset,
        lubeHistory: [...(selectedAsset.lubeHistory || []), newReading]
      });
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-light pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Engenharia de Lubrificação</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
            <Droplets size={12} className="text-indigo-600" />
            Tribologia e Gestão de Atrito
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto relative z-10">
          <select 
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full md:w-56 pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[11px] font-bold uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
          >
            {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setActiveTab('plan')}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'plan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Plano Técnico
            </button>
            <button 
              onClick={() => setActiveTab('lubeexpert')}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'lubeexpert' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              LubeExpert
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'plan' && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <ClipboardList size={18} className="text-indigo-600" /> Plano de Intervenção Preventiva
                </h3>
                <button className="flex items-center gap-2 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                   <Plus size={14} /> Novo Ponto
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                   <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                         <th className="px-6 py-5 font-bold">Identificação do Ponto</th>
                         <th className="px-6 py-5 font-bold">Lubrificante</th>
                         <th className="px-6 py-5 font-bold text-center">Volume (g)</th>
                         <th className="px-6 py-5 font-bold text-center">Frequência</th>
                         <th className="px-6 py-5 font-bold text-right">Última Aplicação</th>
                         <th className="px-6 py-5 font-bold text-right">Estado</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {lubricationPoints.length > 0 ? lubricationPoints.map((point) => (
                        <tr key={point.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-6 py-5">
                              <p className="font-bold text-slate-900 uppercase tracking-tight">{point.label}</p>
                           </td>
                           <td className="px-6 py-5">
                              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100 font-bold uppercase text-[9px]">{point.lubricant}</span>
                           </td>
                           <td className="px-6 py-5 text-center font-bold text-slate-700">{point.quantity}</td>
                           <td className="px-6 py-5 text-center font-bold text-slate-700">{point.frequency}</td>
                           <td className="px-6 py-5 text-right font-bold text-slate-400">
                              {new Date(point.lastDate).toLocaleDateString('pt-PT')}
                           </td>
                           <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 text-emerald-600 font-black uppercase text-[8px] tracking-widest">
                                 <CheckCircle2 size={12} /> Conforme
                              </div>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[9px]">Nenhum ponto de lubrificação mapeado</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-50">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Consumo Estimado (Mês)</p>
                   <p className="text-2xl font-black text-slate-900">1.250 <span className="text-xs text-slate-400 ml-1">Gramas</span></p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mão de Obra (h/mês)</p>
                   <p className="text-2xl font-black text-slate-900">4.5 <span className="text-xs text-slate-400 ml-1">Horas</span></p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
                   <Info size={24} className="text-indigo-600" />
                   <p className="text-[10px] text-indigo-900/70 font-bold italic leading-relaxed uppercase">Utilize massas sintéticas para reduzir a frequência de intervenção em 30%.</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'lubeexpert' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Diagnóstico Ultrasound */}
                <div className="xl:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-10">
                   <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                          <Activity size={18} className="text-indigo-600" /> Tendência de Fricção (dB)
                        </h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Validação Ultrassónica de Lubrificação</p>
                      </div>
                      <button 
                        onClick={handleSimulateLubeExpert}
                        disabled={isUploading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
                      >
                         {isUploading ? <History size={14} className="animate-spin" /> : <Upload size={14} />}
                         Sincronizar LubeExpert
                      </button>
                   </div>

                   <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={lubeHistory}>
                            <defs>
                               <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                               dataKey="timestamp" 
                               tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} 
                               tickFormatter={(t) => new Date(t).toLocaleDateString()}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} domain={[0, 'dataMax + 10']} />
                            <Tooltip 
                               contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '11px' }}
                            />
                            <ReferenceLine y={25} stroke="#fbbf24" strokeDasharray="5 5" label={{ value: 'ALERTA', fill: '#fbbf24', fontSize: 8, fontWeight: 'black' }} />
                            <Area 
                               type="monotone" 
                               dataKey="frictionBefore" 
                               stroke="#f43f5e" 
                               strokeWidth={2} 
                               fill="url(#colorBefore)" 
                               name="Antes da Lubrificação (dB)"
                            />
                            <Area 
                               type="monotone" 
                               dataKey="frictionAfter" 
                               stroke="#10b981" 
                               strokeWidth={2} 
                               fill="url(#colorAfter)" 
                               name="Após a Lubrificação (dB)"
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="flex gap-8 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nível de Atrito Residual</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Condição Hidrodinâmica</span>
                      </div>
                   </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                   <div className="bg-slate-900 p-8 rounded-[48px] text-white space-y-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                         <Zap size={150} />
                      </div>
                      <div className="relative z-10">
                         <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Eficácia de Lubrificação</p>
                         <h4 className="text-sm font-extralight text-slate-300 uppercase tracking-widest">Redução Média de Fricção</h4>
                         <div className="mt-8 flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter text-white">72</span>
                            <span className="text-xl font-bold text-emerald-400">%</span>
                         </div>
                         <div className="mt-6 flex items-center gap-3">
                            <TrendingUp className="text-emerald-400" size={16} />
                            <p className="text-[10px] text-slate-400 font-bold italic">Otimização de consumo detetada nos últimos 3 meses.</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Settings size={14} className="text-indigo-600" /> Parâmetros LubeExpert
                      </h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Sensor Ativo</span>
                            <span className="text-[10px] font-black text-slate-900">SDT 270 (Ultra)</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Frequência</span>
                            <span className="text-[10px] font-black text-slate-900">38.4 kHz</span>
                         </div>
                         <div className="flex justify-between items-center py-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Status</span>
                            <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase"><History size={12} /> Sync OK</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LubricationView;
