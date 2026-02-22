import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, Cpu, BarChart3 } from 'lucide-react';

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
          tagName: result[key].tag || assetName || 'ATV-01',
          fullDate: new Date(result[key].timestamp).toLocaleString()
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };

  if (loading) return <div className="p-10 text-[10px] text-slate-500 font-mono tracking-widest">LOADING_DATA_STREAM...</div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-300 p-4 font-sans selection:bg-indigo-500/30">
      
      {/* Top Bar - Ultra Compacta */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
            <Cpu size={16} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight uppercase">{latest.tagName}</h2>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">Triaxial Analysis // Real-time</p>
          </div>
        </div>
        <div className="flex gap-4">
          <StatusItem label="Status" value="Online" color="text-emerald-500" />
          <StatusItem label="Last Sync" value={latest.time} />
        </div>
      </div>

      {/* Mini Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <CompactMetric axis="X" value={latest.x} color="#3b82f6" label="Radial" />
        <CompactMetric axis="Y" value={latest.y} color="#ef4444" label="Tangential" />
        <CompactMetric axis="Z" value={latest.z} color="#22c55e" label="Axial" />
      </div>

      {/* Gráfico Estilo Engenharia */}
      <div className="bg-[#11151c] border border-slate-800 rounded-lg p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vibration Spectrum (mm/s RMS)</span>
          </div>
          <div className="flex gap-3 text-[9px] font-mono">
            <LegendTag color="#3b82f6" label="X-Radial" />
            <LegendTag color="#ef4444" label="Y-Tangential" />
            <LegendTag color="#22c55e" label="Z-Axial" />
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={true} stroke="#1e293b" strokeOpacity={0.5} />
              <XAxis dataKey="time" hide />
              <YAxis tick={{fontSize: 9, fill: '#475569'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#11151c', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px' }}
                itemStyle={{ padding: '0px' }}
              />
              <Area type="monotone" dataKey="x" stroke="#3b82f6" strokeWidth={1.5} fill="url(#blue)" animationDuration={500} isAnimationActive={false} />
              <Area type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={1.5} fill="url(#red)" animationDuration={500} isAnimationActive={false} />
              <Area type="monotone" dataKey="z" stroke="#22c55e" strokeWidth={1.5} fill="url(#green)" animationDuration={500} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CompactMetric = ({ axis, value, color, label }: any) => (
  <div className="bg-[#11151c] border border-slate-800 p-3 rounded flex justify-between items-center hover:border-slate-700 transition-colors">
    <div>
      <p className="text-[9px] font-mono text-slate-500 uppercase">{label}</p>
      <h3 className="text-xs font-bold text-white">Axis {axis}</h3>
    </div>
    <div className="text-right">
      <span className="text-xl font-mono font-bold tracking-tighter" style={{ color }}>
        {value?.toFixed(3)}
      </span>
      <span className="text-[8px] ml-1 text-slate-600 uppercase font-bold">mm/s</span>
    </div>
  </div>
);

const StatusItem = ({ label, value, color = "text-slate-400" }: any) => (
  <div className="text-right">
    <p className="text-[8px] uppercase text-slate-600 font-bold tracking-tighter">{label}</p>
    <p className={`text-[10px] font-mono font-bold ${color}`}>{value}</p>
  </div>
);

const LegendTag = ({ color, label }: any) => (
  <div className="flex items-center gap-1.5">
    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-slate-500 uppercase tracking-tighter">{label}</span>
  </div>
);

export default VibrationAnalysisView;
