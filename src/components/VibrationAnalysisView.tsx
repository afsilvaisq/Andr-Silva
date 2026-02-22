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
    if (val > 7.1) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (val > 4.5) return { label: 'WARNING', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'OPTIMAL', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const statusX = getStatus(latest.x);
  const statusY = getStatus(latest.y);
  const statusZ = getStatus(latest.z);

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-[#050505] rounded-xl border border-white/5">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-indigo-500/50 uppercase tracking-[0.3em] animate-pulse">Initializing Stream</span>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#050505] font-sans text-slate-400 p-6 rounded-2xl border border-white/5 shadow-2xl antialiased overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -z-10" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
            <h1 className="text-xl font-medium text-white tracking-tight uppercase">{latest.tag}</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-mono ml-5">Vibration_Telemetry_Node_v2.4</p>
        </div>
        
        <div className="flex items-center gap-6 px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-indigo-400" />
            <span className="text-[11px] font-mono text-slate-300">{latest.time}</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <FuturisticMetric 
          label="Radial_X" 
          value={latest.x} 
          status={statusX}
          icon={<Zap size={14} />}
          color="#3b82f6"
        />
        <FuturisticMetric 
          label="Tangential_Y" 
          value={latest.y} 
          status={statusY}
          icon={<Activity size={14} />}
          color="#ef4444"
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
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
        <div className="relative h-[400px] w-full bg-black/40 rounded-xl border border-white/5 p-4 backdrop-blur-md">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="glowX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="glowY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="glowZ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="rgba(255,255,255,0.03)" 
              />
              
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
                domain={[0, 'auto']}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              />

              <ReferenceLine y={7.1} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" opacity={0.5}>
                <Label value="CRITICAL" position="right" fill="#ef4444" fontSize={8} fontWeight="bold" />
              </ReferenceLine>
              <ReferenceLine y={4.5} stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" opacity={0.3}>
                <Label value="WARNING" position="right" fill="#f59e0b" fontSize={8} fontWeight="bold" />
              </ReferenceLine>

              <Area 
                type="monotone" 
                dataKey="x" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                fill="url(#glowX)" 
                isAnimationActive={false} 
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="y" 
                stroke="#ef4444" 
                strokeWidth={2} 
                fill="url(#glowY)" 
                isAnimationActive={false} 
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="z" 
                stroke="#10b981" 
                strokeWidth={2} 
                fill="url(#glowZ)" 
                isAnimationActive={false} 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-8 flex flex-wrap gap-8 px-2 border-t border-white/5 pt-8">
        <LegendItem color="#3b82f6" label="Radial_X" />
        <LegendItem color="#ef4444" label="Tangential_Y" />
        <LegendItem color="#10b981" label="Axial_Z" />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">ISO_10816_Compliance</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
        </div>
      </div>
    </div>
  );
};

const FuturisticMetric = ({ label, value, status, icon, color }: any) => (
  <div className="group relative p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-tighter ${status.bg} ${status.color}`}>
        {status.label}
      </div>
    </div>
    
    <div className="space-y-1">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-mono font-medium text-white tracking-tighter tabular-nums">
          {value.toFixed(3)}
        </span>
        <span className="text-[10px] font-mono text-slate-600 uppercase">mm/s</span>
      </div>
    </div>

    {/* Progress bar indicator */}
    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-500 ease-out"
        style={{ 
          width: `${Math.min((value / 10) * 100, 100)}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80`
        }}
      />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-3 backdrop-blur-md rounded-lg shadow-2xl">
        <p className="text-[10px] font-mono text-slate-500 mb-2 border-b border-white/5 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-mono text-slate-300 uppercase">{entry.name}</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-white">
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
    <div className="w-3 h-[2px] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: color }} />
    <span className="text-[10px] text-slate-500 tracking-widest uppercase font-mono">{label}</span>
  </div>
);

export default VibrationAnalysisView;
