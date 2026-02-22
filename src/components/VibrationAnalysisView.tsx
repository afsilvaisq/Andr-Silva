import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, Zap, Cpu } from 'lucide-react';

const VibrationAnalysisView: React.FC<{ assetName?: string }> = ({ assetName }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbRef = query(ref(database, 'historico'), limitToLast(50));
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const result = snapshot.val();
      if (result) {
        const formattedData = Object.keys(result).map(key => ({
          time: new Date(result[key].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          x: result[key].vib_X || 0,
          y: result[key].vib_Y || 0,
          z: result[key].vib_Z || 0,
          tagName: result[key].tag || assetName || 'Sensor Ativo',
          fullDate: new Date(result[key].timestamp).toLocaleString()
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <Activity className="animate-pulse text-indigo-500" size={32} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Sincronizando Datastream...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header Minimalista e Moderno */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
            <Cpu className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
              {latest?.tagName}
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Monitorização Triaxial Live
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
          <Clock size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 tabular-nums">
            {latest?.fullDate}
          </span>
        </div>
      </div>

      {/* Grid de Métricas Modernas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernMetricCard label="Radial (X)" value={latest?.x} color="#3b82f6" gradient="from-blue-500/20" />
        <ModernMetricCard label="Tangencial (Y)" value={latest?.y} color="#ef4444" gradient="from-red-500/20" />
        <ModernMetricCard label="Axial (Z)" value={latest?.z} color="#22c55e" gradient="from-green-500/20" />
      </div>

      {/* Contentor do Gráfico com Efeito Glassmorphism */}
      <div className="bg-white p-8 rounded-[48px] border border-slate-200/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-red-500 to-green-500 opacity-20" />
        
        <div className="h-[420px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradZ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" hide />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
              <Tooltip 
                cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '15px' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }} />
              
              <Area type="monotone" dataKey="x" name="EIXO X" stroke="#3b82f6" strokeWidth={3} fill="url(#gradX)" animationDuration={1000} />
              <Area type="monotone" dataKey="y" name="EIXO Y" stroke="#ef4444" strokeWidth={3} fill="url(#gradY)" animationDuration={1000} />
              <Area type="monotone" dataKey="z" name="EIXO Z" stroke="#22c55e" strokeWidth={3} fill="url(#gradZ)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ModernMetricCard = ({ label, value, color, gradient }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${gradient} to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
    
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">{label}</p>
    
    <div className="flex items-baseline gap-2 relative z-10">
      <span className="text-4xl font-bold tracking-tighter text-slate-800">
        {value !== undefined ? value.toFixed(2) : '0.00'}
      </span>
      <span className="text-[10px] font-bold text-slate-300 uppercase">mm/s</span>
    </div>

    <div className="mt-6 flex items-center gap-3 relative z-10">
      <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out rounded-full" 
          style={{ width: `${Math.min((value || 0) * 10, 100)}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
        />
      </div>
      <Zap size={12} style={{ color: color }} className="animate-pulse" />
    </div>
  </div>
);

export default VibrationAnalysisView;
