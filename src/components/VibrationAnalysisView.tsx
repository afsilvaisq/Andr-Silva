import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Clock, Activity, Zap, BarChart3 } from 'lucide-react';

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
          // Velocidade (mm/s RMS)
          vx: result[key].vib_X || 0,
          vy: result[key].vib_Y || 0,
          vz: result[key].vib_Z || 0,
          // Aceleração (g) - Calculada no Node-RED
          ax: result[key].acc_X || 0,
          ay: result[key].acc_Y || 0,
          az: result[key].acc_Z || 0,
          tag: result[key].tag || assetName || 'EQUIPAMENTO_01',
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { vx: 0, vy: 0, vz: 0, ax: 0, ay: 0, az: 0, tag: '---' };

  if (loading) return <div className="p-8 font-sans text-slate-400 text-sm animate-pulse uppercase tracking-widest">A ler barramento de sensores...</div>;

  return (
    <div className="w-full bg-transparent font-sans text-slate-600 p-4">
      
      {/* Header Minimalista - TAG a Preto */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-black tracking-tight">{latest.tag}</h1>
          <p className="text-slate-400 text-sm font-medium">Monitorização Multivariável: Velocidade e Aceleração</p>
        </div>
        <div className="flex items-center gap-4 bg-white/80 p-3 rounded-2xl border border-slate-100 shadow-sm">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{latest.time}</span>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Sistema Online
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <MainMetricCard label="Velocidade Atual (RMS)" value={Math.max(latest.vx, latest.vy, latest.vz)} unit="mm/s" color="text-blue-600" />
        <MainMetricCard label="Pico de Aceleração" value={Math.max(latest.ax, latest.ay, latest.az)} unit="g" color="text-indigo-600" />
      </div>

      <div className="space-y-12">
        {/* Gráfico 1: Velocidade (Trend mm/s) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-blue-500" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tendência de Velocidade (ISO 10816)</span>
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> X</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Y</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Z</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                <ReferenceLine y={7.1} stroke="#ef4444" strokeDasharray="6 6" strokeOpacity={0.4} />
                <ReferenceLine y={4.5} stroke="#f59e0b" strokeDasharray="6 6" strokeOpacity={0.4} />
                <Area type="monotone" dataKey="vx" stroke="#3b82f6" strokeWidth={2} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="vy" stroke="#ef4444" strokeWidth={2} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="vz" stroke="#10b981" strokeWidth={2} fill="transparent" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Aceleração (Trend g) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-indigo-500" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tendência de Aceleração (Bearing Health)</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                <Area type="monotone" dataKey="ax" stroke="#6366f1" strokeWidth={2} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="ay" stroke="#8b5cf6" strokeWidth={2} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="az" stroke="#d946ef" strokeWidth={2} fill="transparent" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainMetricCard = ({ label, value, unit, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className={`text-4xl font-bold tracking-tighter ${color}`}>{value.toFixed(2)}</span>
      <span className="text-xs font-bold text-slate-300 uppercase">{unit}</span>
    </div>
  </div>
);

export default VibrationAnalysisView;
