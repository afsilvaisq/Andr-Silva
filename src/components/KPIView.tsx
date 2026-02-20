
import React, { useState } from 'react';
import { Asset } from '../types';
import { 
  TrendingUp, Clock, ShieldCheck, Zap, BarChart3, 
  ArrowUpRight, ArrowDownRight, Activity, Percent, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

interface KPIViewProps {
  assets: Asset[];
}

const KPIView: React.FC<KPIViewProps> = ({ assets }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  const avgMTBF = assets.reduce((acc, a) => acc + a.mtbf, 0) / assets.length;
  const avgMTTR = assets.reduce((acc, a) => acc + a.mttr, 0) / assets.length;
  const avgHealth = assets.reduce((acc, a) => acc + a.healthScore, 0) / assets.length;

  const severityData = [
    { name: 'Excelente (A)', code: 'A', value: assets.filter(a => a.severity === 'A').length, color: '#10b981' },
    { name: 'Atenção (B)', code: 'B', value: assets.filter(a => a.severity === 'B').length, color: '#fbbf24' },
    { name: 'Alerta (C)', code: 'C', value: assets.filter(a => a.severity === 'C').length, color: '#f97316' },
    { name: 'Crítico (D)', code: 'D', value: assets.filter(a => a.severity === 'D').length, color: '#f43f5e' },
  ];

  const maintenanceHistory = [
    { month: 'Jan', failures: 4, cost: 2100 },
    { month: 'Fev', failures: 2, cost: 1200 },
    { month: 'Mar', failures: 5, cost: 3500 },
    { month: 'Abr', failures: 3, cost: 1800 },
    { month: 'Mai', failures: 1, cost: 800 },
    { month: 'Jun', failures: 2, cost: 1400 },
  ];

  const filteredAssets = selectedSeverity 
    ? assets.filter(a => a.severity === selectedSeverity)
    : [];

  const handlePieClick = (data: any) => {
    setSelectedSeverity(prev => prev === data.code ? null : data.code);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-light pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Dashboard KPI Industrial</h2>
          <p className="text-slate-500 text-[10px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <BarChart3 size={12} className="text-indigo-600" />
            Performance & Fiabilidade dos Ativos
          </p>
        </div>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard 
          icon={<Clock className="text-indigo-600" size={20} />} 
          label="MTBF Médio" 
          value={`${avgMTBF.toFixed(0)}h`} 
          trend="+5.2%" 
          positive={true} 
          desc="Mean Time Between Failures"
        />
        <KPICard 
          icon={<Zap className="text-amber-500" size={20} />} 
          label="MTTR Médio" 
          value={`${avgMTTR.toFixed(1)}h`} 
          trend="-12.1%" 
          positive={true} 
          desc="Mean Time To Repair"
        />
        <KPICard 
          icon={<Activity className="text-emerald-500" size={20} />} 
          label="Disponibilidade" 
          value="98.2%" 
          trend="+1.2%" 
          positive={true} 
          desc="Tempo de Ativo vs Parada"
        />
        <KPICard 
          icon={<ShieldCheck className="text-indigo-600" size={20} />} 
          label="Saúde Média" 
          value={`${avgHealth.toFixed(1)}%`} 
          trend="+2.4%" 
          positive={true} 
          desc="Score de Condição dos Ativos"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Gráfico de Evolução de Custo/Falhas */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" /> Histórico de Ocorrências e Custos
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                   <span className="text-[9px] text-slate-400 font-bold uppercase">Custos (€)</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                   <span className="text-[9px] text-slate-400 font-bold uppercase">Falhas</span>
                </div>
              </div>
           </div>

           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceHistory}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '11px'}}
                  />
                  <Bar yAxisId="right" dataKey="failures" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar yAxisId="left" dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Distribuição de Severidade (Pie Chart) */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 flex flex-col items-center">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-start flex items-center gap-2">
              <Percent size={16} className="text-indigo-600" /> Status dos Ativos
           </h3>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    onClick={handlePieClick}
                  >
                    {severityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className={`cursor-pointer transition-opacity ${selectedSeverity && selectedSeverity !== entry.code ? 'opacity-30' : 'opacity-100'}`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-50">
              {severityData.map(s => (
                <button 
                  key={s.name} 
                  onClick={() => handlePieClick(s)}
                  className={`flex items-center gap-2 p-1 rounded-lg transition-all ${selectedSeverity === s.code ? 'bg-slate-50 ring-1 ring-slate-100' : ''}`}
                >
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div>
                   <span className={`text-[9px] font-bold uppercase ${selectedSeverity === s.code ? 'text-indigo-600' : 'text-slate-500'}`}>{s.name}</span>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Listagem de ativos filtrados */}
      {selectedSeverity && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-indigo-600" /> Ativos na Condição {selectedSeverity} ({filteredAssets.length})
               </h3>
               <button 
                onClick={() => setSelectedSeverity(null)}
                className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
               >
                 Limpar Filtro
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {filteredAssets.map(asset => (
                 <div key={asset.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{asset.name}</p>
                       <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{asset.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-900">{asset.healthScore}%</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Saúde</p>
                       </div>
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black ${
                          asset.severity === 'A' ? 'bg-emerald-500' : 
                          asset.severity === 'B' ? 'bg-amber-400' : 
                          asset.severity === 'C' ? 'bg-orange-500' : 'bg-rose-500'
                       }`}>
                          {asset.severity}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KPICard = ({ icon, label, value, trend, positive, desc }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
        positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-extralight text-slate-900 tracking-tighter mb-2">{value}</h3>
      <p className="text-[9px] text-slate-400 italic">{desc}</p>
    </div>
  </div>
);

export default KPIView;
