import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Clock, BarChart3, Activity, AlertCircle } from 'lucide-react';

const VibrationAnalysisView: React.FC<{ assetName?: string }> = ({ assetName }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbRef = query(ref(database, 'historico'), limitToLast(50));
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const result = snapshot.val();
      if (result) {
        const formattedData = Object.keys(result).map(key => ({
          time: new Date(result[key].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          x: result[key].vib_X || 0,
          y: result[key].vib_Y || 0,
          z: result[key].vib_Z || 0,
          tag: result[key].tag || assetName || 'EQUIPAMENTO_01',
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0, tag: '---' };

  if (loading) return <div className="p-8 text-slate-400 text-sm font-sans animate-pulse">Sincronizando dados...</div>;

  return (
    <div className="w-full bg-transparent font-sans text-slate-600 p-2">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 px-2">
        <div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Monitorização ISO 10816</span>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">{latest.tag}</h1>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <Clock size={16} className="text-slate-300" />
          <span className="text-sm font-bold text-slate-700">{latest.time}</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)]">
        
        {/* Info & Legenda */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex gap-10">
            <MetricSummary label="Radial X" value={latest.x} color="bg-blue-500" />
            <MetricSummary label="Tangencial Y" value={latest.y} color="bg-red-500" />
            <MetricSummary label="Axial Z" value={latest.z} color="bg-emerald-500" />
          </div>
          
          <div className="flex bg-slate-50 p-1 rounded-xl">
            <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-bold text-slate-900 uppercase">Velocidade (mm/s)</button>
            <button className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase opacity-50 cursor-not-allowed">Aceleração (g)</button>
          </div>
        </div>

        {/* Gráfico de Tendência Melhorado */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
              
              <XAxis dataKey="time" hide />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#cbd5e1', fontWeight: 600}}
              />
              
              <Tooltip 
                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  padding: '16px',
                  fontWeight: 'bold'
                }} 
              />

              {/* Linhas de Alerta Estilizadas */}
              <ReferenceLine y={7.1} stroke="#ef4444" strokeDasharray="10 10" strokeOpacity={0.2} label={{ position: 'right', value: 'CRITICAL', fill: '#ef4444', fontSize: 9, fontWeight: 900 }} />
              <ReferenceLine y={4.5} stroke="#f59e0b" strokeDasharray="10 10" strokeOpacity={0.2} label={{ position: 'right', value: 'WARNING', fill: '#f59e0b', fontSize: 9, fontWeight: 900 }} />

              {/* Áreas de Tendência */}
              <Area 
                type="monotone" 
                dataKey="x" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fill="url(#gradientX)" 
                isAnimationActive={false} 
              />
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke="#ef4444" 
                strokeWidth={4} 
                fill="transparent" 
                isAnimationActive={false} 
              />
              <Area 
                type="monotone" 
                dataKey="z" 
                stroke="#10b981" 
                strokeWidth={4} 
                fill="transparent" 
                isAnimationActive={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Discreto */}
      <div className="mt-6 px-4 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Activity size={14} />
          Real-time Engine Active
        </div>
        <span>Sampling rate: 1Hz</span>
      </div>
    </div>
  );
};

const MetricSummary = ({ label, value, color }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
    </div>
    <div className="flex items-baseline gap-1 ml-4">
      <span className="text-2xl font-bold text-slate-900 tracking-tighter">{value.toFixed(2)}</span>
      <span className="text-[9px] font-bold text-slate-300">MM/S</span>
    </div>
  </div>
);

export default VibrationAnalysisView;
