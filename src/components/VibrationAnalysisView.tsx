import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, Zap, Target } from 'lucide-react';

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
          tagName: result[key].tag || 'Ativo IoT',
          fullDate: new Date(result[key].timestamp).toLocaleString()
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2 animate-in fade-in duration-500">
      {/* Header Estilo Glassmorphism */}
      <div className="bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-5">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg shadow-indigo-200">
            <Target className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {latest?.tagName || assetName || 'Equipamento'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Telemetry System</span>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Última Leitura</p>
          <p className="text-sm font-medium text-slate-700">{latest?.fullDate || '--/--/---- --:--'}</p>
        </div>
      </div>

      {/* Grid de Métricas Visuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernMetricCard label="Eixo X - Radial" value={latest?.x} color="#3b82f6" />
        <ModernMetricCard label="Eixo Y - Tangencial" value={latest?.y} color="#ef4444" />
        <ModernMetricCard label="Eixo Z - Axial" value={latest?.z} color="#22c55e" />
      </div>

      {/* Gráfico de Área Moderno */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-100/50">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Espectro de Vibração</h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> <span className="text-[10px] font-bold text-slate-500">X</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /> <span className="text-[10px] font-bold text-slate-500">Y</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /> <span className="text-[10px] font-bold text-slate-500">Z</span></div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" hide />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey
