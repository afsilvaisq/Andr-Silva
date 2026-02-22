import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, AlertTriangle } from 'lucide-react';

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
          tagName: result[key].tag || assetName || 'NODE_01',
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };
  
  // Lógica de Alerta Crítico
  const isCritical = latest.x > 4.5 || latest.y > 4.5 || latest.z > 4.5;

  if (loading) return <div className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando Barramento...</div>;

  return (
    <div className="w-full bg-transparent font-mono text-slate-400 p-2">
      
      {/* Indicadores de Telemetria Superior */}
      <div className="flex justify-between items-start mb-6 border-l-2 border-slate-800 pl-4 py-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
              {latest.tagName} // REALTIME_TREND
            </h2>
            {isCritical && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded">
                <AlertTriangle size={10} /> CRITICAL_ALERT
              </div>
            )}
          </div>
          <div className="flex gap-6">
             <MetricPoint label="X_RADIAL" value={latest.x} color={latest.x > 4.5 ? "text-red-500 animate-pulse" : "text-blue-500"} />
             <MetricPoint label="Y_TANGENTIAL" value={latest.y} color={latest.y > 4.5 ? "text-red-500 animate-pulse" : "text-red-500"} />
             <MetricPoint label="Z_AXIAL" value={latest.z} color={latest.z > 4.5 ? "text-red-500 animate-pulse" : "text-green-500"} />
          </div>
        </div>
        <div className="text-[9px] text-slate-600 font-bold uppercase text-right space-y-1">
          <p className="flex items-center justify-end gap-2">
            <Clock size={10} /> {latest.time || '--:--:--'}
          </p>
          <p className={isCritical ? "text-red-500 animate-pulse" : "text-emerald-900"}>● LIVE_STREAM</p>
        </div>
      </div>

      {/* Contentor do Gráfico de Tendência */}
      <div className="h-[400px] w-full relative border border-slate-800/20 rounded-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="gX" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gZ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="0" vertical={true} stroke="#1e293b" strokeOpacity={0.1} />
            
            <XAxis dataKey="time" axisLine={{ stroke: '#1e293b' }} tickLine={false} tick={{ fontSize: 8, fill: '#475569' }}>
              <Label value="TEMPO (HH:MM:SS)" offset={-12} position="insideBottom" fill="#334155" fontSize={7} fontWeight="bold" />
            </XAxis>
            
            <YAxis axisLine={{ stroke: '#1e293b' }} tickLine={false} tick={{ fontSize: 8, fill: '#475569' }} domain={[0, 'auto']}>
              <Label value="MAGNITUDE (MM/S)" angle={-90} position="insideLeft" offset={15} fill="#334155" fontSize={7} fontWeight="bold" />
            </YAxis>

            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #1e293b', fontSize: '8px', borderRadius: '0px' }}
              cursor={{ stroke: '#1e293b', strokeWidth: 1 }}
            />

            <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5}>
              <Label value="LIMITE_CRÍTICO" position="right" fill="#ef4444" fontSize={7} />
            </ReferenceLine>

            <Area type="monotone" dataKey="x" stroke="#3b82f6" strokeWidth={1} fill="url(#gX)" isAnimationActive={false} />
            <Area type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={1} fill="url(#gY)" isAnimationActive={false} />
            <Area type="monotone" dataKey="z" stroke="#22c55e" strokeWidth={1} fill="url(#gZ)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Estilo Engenharia Inferior */}
      <div className="flex justify-between items-center mt-6 text-[8px] font-bold text-slate-700 tracking-widest uppercase">
        <div className="flex gap-4">
          <LegendMark color="bg-blue-500" label="X_RADIAL" />
          <LegendMark color="bg-red-500" label="Y_TANGENTIAL" />
          <LegendMark color="bg-green-500" label="Z_AXIAL" />
        </div>
        <div className="flex items-center gap-2">
          <Activity size={10} className={isCritical ? "text-red-500 animate-ping" : "text-emerald-900"} />
          SISTEMA_VIB_OK // ISO_10816
        </div>
      </div>
    </div>
  );
};

const MetricPoint = ({ label, value, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[7px] text-slate-600 font-black mb-1 tracking-tighter uppercase">{label}</span>
    <span className={`text-sm font-bold tabular-nums tracking-tighter ${color}`}>
      {value?.toFixed(3)} <span className="text-[8px] opacity-30 font-normal">mm/s</span>
    </span>
  </div>
);

const LegendMark = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-[2px] ${color}`} />
    <span>{label}</span>
  </div>
);

export default VibrationAnalysisView;
