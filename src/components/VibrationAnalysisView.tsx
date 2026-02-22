import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Clock } from 'lucide-react';

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

  if (loading) return <div className="p-4 text-[10px] font-sans text-slate-400 uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="w-full bg-transparent font-sans text-slate-500 p-2 antialiased">
      
      {/* Header Minimalista */}
      <div className="flex justify-between items-baseline mb-12 px-2">
        <div>
          <h1 className="text-2xl font-normal text-black tracking-tight">{latest.tag}</h1>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-light">Vibration Monitoring System</p>
        </div>
        <div className="flex items-center gap-4 text-[9px] tracking-wider font-light">
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-slate-300" />
            <span>{latest.time}</span>
          </div>
          <span className="text-emerald-500 opacity-70 italic">active stream</span>
        </div>
      </div>

      {/* Grid de Valores */}
      <div className="grid grid-cols-3 gap-8 mb-16 px-2">
        <SimpleMetric label="Radial X" value={latest.x} />
        <SimpleMetric label="Tangencial Y" value={latest.y} />
        <SimpleMetric label="Axial Z" value={latest.z} />
      </div>

      {/* Gráfico de Área Minimalista */}
      <div className="h-[380px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.08}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" strokeWidth={0.5} />
            
            <XAxis 
              dataKey="time" 
              axisLine={{ stroke: '#f1f5f9' }} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 300 }}
              dy={10}
            >
              <Label value="Tempo de Amostragem" offset={-10} position="insideBottom" fill="#cbd5e1" fontSize={9} fontWeight={300} />
            </XAxis>
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 300 }}
              domain={[0, 'auto']}
            >
              <Label value="Magnitude (mm/s)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#cbd5e1', fontSize: 9, fontWeight: 300 }} />
            </YAxis>
            
            <Tooltip 
              cursor={{ stroke: '#f1f5f9', strokeWidth: 1 }}
              contentStyle={{ 
                borderRadius: '0px', 
                border: '1px solid #f1f5f9', 
                boxShadow: 'none',
                fontSize: '9px',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.9)'
              }} 
            />

            <ReferenceLine y={7.1} stroke="#ef4444" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.3} />
            <ReferenceLine y={4.5} stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.3} />

            <Area 
              type="monotone" 
              dataKey="x" 
              stroke="#3b82f6" 
              strokeWidth={1} 
              fillOpacity={1} 
              fill="url(#colorX)" 
              isAnimationActive={false} 
            />
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke="#ef4444" 
              strokeWidth={1} 
              fillOpacity={1} 
              fill="url(#colorY)" 
              isAnimationActive={false} 
            />
            <Area 
              type="monotone" 
              dataKey="z" 
              stroke="#10b981" 
              strokeWidth={1} 
              fillOpacity={1} 
              fill="url(#colorZ)" 
              isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Minimalista */}
      <div className="mt-12 flex gap-8 px-2">
        <LegendItem color="bg-blue-400" label="Eixo X" />
        <LegendItem color="bg-red-400" label="Eixo Y" />
        <LegendItem color="bg-emerald-400" label="Eixo Z" />
      </div>
    </div>
  );
};

const SimpleMetric = ({ label, value }: any) => (
  <div className="flex flex-col gap-1 border-l border-slate-100 pl-4">
    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-light">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-light text-slate-900 tracking-tighter">{value.toFixed(2)}</span>
      <span className="text-[8px] text-slate-300 font-light">mm/s</span>
    </div>
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-1 h-1 rounded-full ${color}`} />
    <span className="text-[8px] text-slate-400 tracking-widest uppercase font-light">{label}</span>
  </div>
);

export default VibrationAnalysisView;
