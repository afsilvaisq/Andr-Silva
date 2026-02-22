import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Clock, Activity, Zap, ShieldCheck } from 'lucide-react';

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
          tag: result[key].tag || assetName || 'EQUIPAMENTO_01',
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0, tag: '---' };

  const getStatus = (val: number) => {
    if (val > 7.1) return { label: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (val > 4.5) return { label: 'WARNING', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'OPTIMAL', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const statusX = getStatus(latest.x);
  const statusY = getStatus(latest.y);
  const statusZ = getStatus(latest.z);

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-transparent">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.3em] animate-pulse">Sincronizando...</span>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-transparent font-sans text-slate-500 p-2 antialiased relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] animate-pulse" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{latest.tag}</h1>
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.4em] font-black ml-5">Telemetry_Stream_Active</p>
        </div>
        
        <div className="flex items-center gap-6 px-4 py-2 bg-slate-100/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-600">{latest.time}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-2">
        <FuturisticMetric 
          label="Radial_X" 
          value={latest.x} 
          status={statusX}
          icon={<Zap size={14} />}
          color="#6366f1"
        />
        <FuturisticMetric 
          label="Tangential_Y" 
          value={latest.y} 
          status={statusY}
          icon={<Activity size={14} />}
          color="#f43f5e"
        />
        <FuturisticMetric 
          label="Axial_Z" 
          value={latest.z} 
          status={statusZ}
          icon={<ShieldCheck size={14} />}
          color="#10b981"
        />
      </div>

      {/* Main Chart Container */}
      <div className="relative h-[400px] w-full bg-white/40 rounded-[40px] border border-slate-200/50 p-8 backdrop-blur-xl shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="glowX" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="glowY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="glowZ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#f1f5f9" 
            />
            
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
              domain={[0, 'auto']}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#f1f5f9', strokeWidth: 1 }}
            />

            <ReferenceLine y={7.1} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5 5" label={{ position: 'right', value: 'CRÍTICO', fill: '#f43f5e', fontSize: 8, fontWeight: 'black' }} />
            <ReferenceLine y={4.5} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5 5" label={{ position: 'right', value: 'ALERTA', fill: '#fbbf24', fontSize: 8, fontWeight: 'black' }} />

            <Area 
              type="monotone" 
              dataKey="x" 
              stroke="#6366f1" 
              strokeWidth={3} 
              fill="url(#glowX)" 
              isAnimationActive={true} 
              animationDuration={1000}
              dot={false}
            />
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke="#f43f5e" 
              strokeWidth={3} 
              fill="url(#glowY)" 
              isAnimationActive={true} 
              animationDuration={1000}
              dot={false}
            />
            <Area 
              type="monotone" 
              dataKey="z" 
              stroke="#10b981" 
              strokeWidth={3} 
              fill="url(#glowZ)" 
              isAnimationActive={true} 
              animationDuration={1000}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="mt-12 flex flex-wrap gap-8 px-4">
        <LegendItem color="#6366f1" label="Eixo Radial X" />
        <LegendItem color="#f43f5e" label="Eixo Tangencial Y" />
        <LegendItem color="#10b981" label="Eixo Axial Z" />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ISO_10816_Standard</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
        </div>
      </div>
    </div>
  );
};

const FuturisticMetric = ({ label, value, status, icon, color }: any) => (
  <div className="group relative p-6 bg-white/40 border border-slate-200/50 rounded-[32px] hover:bg-white/60 transition-all duration-500 shadow-sm backdrop-blur-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-400 group-hover:text-slate-900 transition-colors">
        {icon}
      </div>
      <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
        {status.label}
      </div>
    </div>
    
    <div className="space-y-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
          {value.toFixed(3)}
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">mm/s</span>
      </div>
    </div>

    {/* Progress bar indicator */}
    <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-1000 ease-out"
        style={{ 
          width: `${Math.min((value / 10) * 100, 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-4 backdrop-blur-md rounded-2xl shadow-2xl">
        <p className="text-[9px] font-black text-slate-500 mb-3 border-b border-white/5 pb-2 uppercase tracking-widest">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight">{entry.name}</span>
              </div>
              <span className="text-[11px] font-black text-white tabular-nums">
                {entry.value.toFixed(3)} <span className="text-[8px] text-slate-500 font-normal">mm/s</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-3 h-1 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[9px] text-slate-400 tracking-widest uppercase font-black">{label}</span>
  </div>
);

export default VibrationAnalysisView;
