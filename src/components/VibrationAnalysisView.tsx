import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, History, AlertTriangle } from 'lucide-react';

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

  // Histórico de Alertas: Filtra leituras acima de 4.5
  const alertHistory = useMemo(() => {
    return data
      .filter(d => d.x > 4.5 || d.y > 4.5 || d.z > 4.5)
      .slice(-6)
      .reverse();
  }, [data]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };

  const getSeverityColor = (val: number) => {
    if (val > 7.1) return "text-red-500 animate-pulse font-black"; // Crítico
    if (val > 4.5) return "text-yellow-500 font-bold"; // Alerta
    return "text-emerald-500"; // OK
  };

  if (loading) return <div className="p-4 text-[10px] font-mono text-slate-500 animate-pulse uppercase">Syncing Stream...</div>;

  return (
    <div className="w-full bg-transparent font-mono text-slate-400 p-2">
      
      {/* Indicadores de Topo */}
      <div className="flex justify-between items-start mb-8 border-l-2 border-slate-800 pl-4 py-1">
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
            {latest.tagName} // TELEMETRY_TREND
          </h2>
          <div className="flex gap-8">
             <MetricBox label="X_RADIAL" value={latest.x} color={getSeverityColor(latest.x)} />
             <MetricBox label="Y_TANGENTIAL" value={latest.y} color={getSeverityColor(latest.y)} />
             <MetricBox label="Z_AXIAL" value={latest.z} color={getSeverityColor(latest.z)} />
          </div>
        </div>
        <div className="text-[9px] font-bold text-right space-y-1">
          <p className="text-white flex items-center justify-end gap-2"><Clock size={10}/> {latest.time}</p>
          <p className="text-slate-600 tracking-tighter uppercase font-black">ISO_10816_Standard</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Gráfico de Espectro */}
        <div className="flex-1 h-[400px] border border-slate-800/20 bg-slate-900/5 rounded-sm relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="0" vertical={true} stroke="#1e293b" strokeOpacity={0.1} />
              <XAxis dataKey="time" axisLine={{stroke:'#1e293b'}} tick={{fontSize: 8, fill:'#475569'}} tickLine={false} />
              <YAxis axisLine={{stroke:'#1e293b'}} tick={{fontSize: 8, fill:'#475569'}} tickLine={false} domain={[0, 'auto']}>
                <Label value="MAGNITUDE (MM/S)" angle={-90} position="insideLeft" offset={15} fill="#334155" fontSize={7} fontWeight="black" />
              </YAxis>
              
              {/* Linhas de Limite Crítico e Alerta */}
              <ReferenceLine y={7.1} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine y={4.5} stroke="#eab308" strokeDasharray="3 3" />

              <Area type="monotone" dataKey="x" stroke="#3b82f6" strokeWidth={1} fill="transparent" isAnimationActive={false} />
              <Area type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={1} fill="transparent" isAnimationActive={false} />
              <Area type="monotone" dataKey="z" stroke="#22c55e" strokeWidth={1} fill="transparent" isAnimationActive={false} />
              <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #1e293b', fontSize:'8px'}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de Histórico Lateral */}
        <div className="w-full xl:w-80 bg-slate-900/10 border border-slate-800/30 p-4 rounded-sm">
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={12}/> Log de Eventos ({alertHistory.length})
          </h3>
          <div className="space-y-3">
            {alertHistory.length > 0 ? alertHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-800/30 pb-2">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-600 font-bold">{item.time}</span>
                  <span className="text-[10px] text-white font-black italic">VIB_ALERT_OVER</span>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-bold ${Math.max(item.x, item.y, item.z) > 7.1 ? 'text-red-500 pulse' : 'text-yellow-500'}`}>
                    {Math.max(item.x, item.y, item.z).toFixed(2)}
                  </span>
                  <span className="text-[7px] text-slate-700 ml-1">mm/s</span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-[8px] text-slate-700 uppercase tracking-widest italic font-bold">Sem anomalias detetadas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legenda Estilo Terminal */}
      <div className="mt-8 flex justify-between items-center text-[8px] font-black text-slate-700 tracking-widest uppercase">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-2 h-[1px] bg-blue-500"/> X_RAD</span>
          <span className="flex items-center gap-2"><div className="w-2 h-[1px] bg-red-500"/> Y_TAN</span>
          <span className="flex items-center gap-2"><div className="w-2 h-[1px] bg-green-500"/> Z_AXI</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={10} className={latest.x > 4.5 ? "text-yellow-500 animate-bounce" : "text-emerald-900"} />
          STREAMING_ACTIVE // SECURE_LINK
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[7px] text-slate-600 font-black tracking-tighter mb-1 uppercase italic">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-sm font-bold tabular-nums ${color}`}>{value?.toFixed(3)}</span>
      <span className="text-[8px] text-slate-800 font-black">MM/S</span>
    </div>
  </div>
);

export default VibrationAnalysisView;
