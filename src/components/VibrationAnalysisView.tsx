import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock } from 'lucide-react';

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
          tagName: result[key].tag || assetName || 'SENSOR_01',
        }));
        setData(formattedData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [assetName]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };

  if (loading) return <div className="p-4 text-[10px] font-mono text-slate-500 animate-pulse">INIT_STREAM...</div>;

  return (
    <div className="w-full bg-transparent text-slate-400 font-mono selection:bg-indigo-500/30">
      
      {/* Header Técnico Compacto */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-l-2 border-indigo-500 pl-4">
        <div>
          <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">{latest.tagName} // TELEMETRIA TRIAXIAL</h2>
          <p className="text-[9px] text-slate-500 mt-1 uppercase">Monitorização de condição em tempo real via RTDB</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-6">
          <TechnicalStat label="X_RADIAL" value={latest.x} color="text-blue-500" />
          <TechnicalStat label="Y_TANGENTIAL" value={latest.y} color="text-red-500" />
          <TechnicalStat label="Z_AXIAL" value={latest.z} color="text-green-500" />
        </div>
      </div>

      {/* Contentor do Gráfico Transparente */}
      <div className="relative h-[450px] w-full border border-slate-800/40 bg-slate-900/5 rounded-sm p-2">
        {/* Label do Eixo Y */}
        <div className="absolute left-2 top-4 flex items-center gap-2 transform -rotate-90 origin-left translate-y-20">
          <span className="text-[8px] font-bold tracking-widest text-slate-600 uppercase">Magnitude (mm/s RMS)</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="lineX" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lineY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lineZ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="0" vertical={true} stroke="#1e293b" strokeOpacity={0.3} />
            
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              label={{ value: 'Eixo Temporal (hh:mm:ss)', position: 'bottom', offset: 0, fontSize: 8, fill: '#64748b' }}
            />
            
            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 'auto']}
            />

            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: '9px', borderRadius: '2px' }}
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />

            {/* Linhas de Alerta Estilo Imagem */}
            <ReferenceLine y={4.5} label={{ position: 'right', value: 'CRÍTICO', fill: '#ef4444', fontSize: 7, fontWeight: 'bold' }} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={2.8} label={{ position: 'right', value: 'ALERTA', fill: '#f59e0b', fontSize: 7, fontWeight: 'bold' }} stroke="#f59e0b" strokeDasharray="3 3" />

            {/* Linhas de Tendência Triaxial */}
            <Area type="monotone" dataKey="x" stroke="#3b82f6" strokeWidth={1.2} fill="url(#lineX)" isAnimationActive={false} />
            <Area type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={1.2} fill="url(#lineY)" isAnimationActive={false} />
            <Area type="monotone" dataKey="z" stroke="#22c55e" strokeWidth={1.2} fill="url(#lineZ)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legenda Manual Estilo Dark */}
        <div className="absolute bottom-4 right-8 flex gap-4">
          <LegendItem color="bg-blue-500" label="Radial_X" />
          <LegendItem color="bg-red-500" label="Tangential_Y" />
          <LegendItem color="bg-green-500" label="Axial_Z" />
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-[8px] text-slate-600 tracking-widest uppercase font-bold">
        <div className="flex items-center gap-2">
          <Activity size={10} className="text-emerald-500" />
          Sistema Ativo // Frequência Amostragem: Variável
        </div>
        <div>UUID: {latest.tagName}_TX_01</div>
      </div>
    </div>
  );
};

const TechnicalStat = ({ label, value, color }: any) => (
  <div className="flex flex-col items-end">
    <span className="text-[8px] text-slate-600 font-bold tracking-tighter mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-lg font-mono font-bold tracking-tighter ${color}`}>{value.toFixed(3)}</span>
      <span className="text-[8px] text-slate-700">mm/s</span>
    </div>
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-[2px] ${color}`} />
    <span className="text-[8px] font-bold text-slate-500 uppercase">{label}</span>
  </div>
);

export default VibrationAnalysisView;
