import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, List, ChevronRight, AlertTriangle } from 'lucide-react';

const VibrationAnalysisView: React.FC<{ assetName?: string }> = ({ assetName }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbRef = query(ref(database, 'historico'), limitToLast(40));
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const result = snapshot.val();
      if (result) {
        const formattedData = Object.keys(result).map(key => ({
          time: new Date(result[key].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          x: result[key].vib_X || 0,
          y: result[key].vib_Y || 0,
          z: result[key].vib_Z || 0,
          tag: result[key].tag || 'SENS_01'
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };

  // Lógica de Severidade ISO 10816
  const getStatus = (val: number) => {
    if (val > 7.1) return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'CRITICAL' };
    if (val > 4.5) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'WARNING' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'STABLE' };
  };

  if (loading) return <div className="p-6 text-[10px] font-mono text-slate-500 tracking-widest animate-pulse">LOADING_INSIGHTS_ENGINE...</div>;

  return (
    <div className="w-full bg-transparent font-mono text-slate-400 p-2 space-y-6">
      
      {/* Header Compacto */}
      <div className="flex justify-between items-center border-b border-slate-800/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded">
            <Activity size={16} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest">{latest.tag} // VIB_INSIGHTS</h2>
            <p className="text-[9px] text-slate-600 uppercase tracking-tighter font-bold">ISO-10816 Monitoring</p>
          </div>
        </div>
        <div className="text-[10px] text-white font-bold bg-slate-900/80 px-3 py-1 rounded border border-slate-800">
          LIVE: {latest.time}
        </div>
      </div>

      {/* Grid de Micro-Charts (Estilo Insights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard label="X_AXIS_RADIAL" value={latest.x} data={data} dataKey="x" color="#3b82f6" />
        <InsightCard label="Y_AXIS_TANGENTIAL" value={latest.y} data={data} dataKey="y" color="#ef4444" />
        <InsightCard label="Z_AXIS_AXIAL" value={latest.z} data={data} dataKey="z" color="#22c55e" />
      </div>

      {/* Log de Eventos / Tabela */}
      <div className="bg-slate-900/10 border border-slate-800/30 rounded-sm overflow-hidden">
        <div className="bg-slate-800/20 px-4 py-2 border-b border-slate-800/40 flex justify-between items-center">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <List size={12}/> Event_Log_Stream
          </span>
          <span className="text-[8px] text-slate-700 font-black">ULTIMOS 8 REGISTOS</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="p-3 text-[8px] text-slate-600 uppercase font-black">Time</th>
              <th className="p-3 text-[8px] text-slate-600 uppercase text-center font-black">X</th>
              <th className="p-3 text-[8px] text-slate-600 uppercase text-center font-black">Y</th>
              <th className="p-3 text-[8px] text-slate-600 uppercase text-center font-black">Z</th>
              <th className="p-3 text-[8px] text-slate-600 uppercase text-right font-black">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-8).reverse().map((row, i) => {
              const maxVib = Math.max(row.x, row.y, row.z);
              const status = getStatus(maxVib);
              return (
                <tr key={i} className="border-b border-slate-800/10 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-[10px] font-bold text-slate-500">{row.time}</td>
                  <td className={`p-3 text-[10px] text-center font-bold ${row.x > 4.5 ? 'text-yellow-500' : ''}`}>{row.x.toFixed(2)}</td>
                  <td className={`p-3 text-[10px] text-center font-bold ${row.y > 4.5 ? 'text-yellow-500' : ''}`}>{row.y.toFixed(2)}</td>
                  <td className={`p-3 text-[10px] text-center font-bold ${row.z > 4.5 ? 'text-yellow-500' : ''}`}>{row.z.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InsightCard = ({ label, value, data, dataKey, color }: any) => {
  const status = value > 7.1 ? 'text-red-500 animate-pulse' : value > 4.5 ? 'text-yellow-500' : 'text-white';
  
  return (
    <div className="bg-slate-900/5 border border-slate-800/30 p-4 rounded-sm hover:border-indigo-500/30 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold tracking-tighter ${status}`}>{value.toFixed(3)}</span>
            <span className="text-[8px] text-slate-800 font-bold uppercase">mm/s</span>
          </div>
        </div>
        <ChevronRight size={12} className="text-slate-800" />
      </div>
      
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <ReferenceLine y={7.1} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.5} />
            <ReferenceLine y={4.5} stroke="#eab308" strokeDasharray="2 2" strokeOpacity={0.5} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={1.5} 
              fill={color} 
              fillOpacity={0.05} 
              isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VibrationAnalysisView;
