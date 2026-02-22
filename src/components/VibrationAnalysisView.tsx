import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Clock, Activity } from 'lucide-react';

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
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Vibration Analysis Portfolio</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-wider">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-300" />
            <span>{latest.time}</span>
          </div>
          <span className="text-emerald-500">● LIVE</span>
        </div>
      </div>

      {/* Grid de Valores Discretos */}
      <div className="grid grid-cols-3 gap-8 mb-16 px-2">
        <SimpleMetric label="Radial X" value={latest.x} />
        <SimpleMetric label="Tangencial Y" value={latest.y} />
        <SimpleMetric label="Axial Z" value={latest.z} />
      </div>

      {/* Gráfico de Linhas Finas */}
      <div className="h-[350px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" strokeWidth={0.5} />
            
            <XAxis dataKey="time" hide />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#cbd5e1'}}
              domain={[0, 'auto']}
            />
            
            <Tooltip 
              cursor={{ stroke: '#f1f5f9', strokeWidth: 1 }}
              contentStyle={{ 
                borderRadius: '0px', 
                border: '1px solid #f1f5f9', 
                boxShadow: 'none',
                fontSize: '10px',
                padding: '8px'
              }} 
            />

            {/* Limites de Alerta Subtis */}
            <ReferenceLine y={7.1} stroke="#ef4444" strokeWidth={0.5} strokeDasharray="3 3" />
            <ReferenceLine y={4.5} stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="3 3" />

            {/* Linhas de Dados Ultra-Finas */}
            <Line 
              type="monotone" 
              dataKey="x" 
              stroke="#3b82f6" 
              strokeWidth={1} 
              dot={false} 
              isAnimationActive={false} 
            />
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="#ef4444" 
              strokeWidth={1} 
              dot={false} 
              isAnimationActive={false} 
            />
            <Line 
              type="monotone" 
              dataKey="z" 
              stroke="#10b981" 
              strokeWidth={1} 
              dot={false} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda de Eixos Inferior */}
      <div className="mt-8 flex gap-6 px-2">
        <LegendItem color="bg-blue-400" label="X_AXIS" />
        <LegendItem color="bg-red-400" label="Y_AXIS" />
        <LegendItem color="bg-emerald-400" label="Z_AXIS" />
      </div>
    </div>
  );
};

const SimpleMetric = ({ label, value }: any) => (
  <div className="flex flex-col gap-1 border-l border-slate-100 pl-4">
    <span className="text-[9px] text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-light text-slate-900 tracking-tighter">{value.toFixed(2)}</span>
      <span className="text-[8px] text-slate-300">mm/s</span>
    </div>
  </div>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
    <span className="text-[9px] text-slate-400 tracking-tighter uppercase">{label}</span>
  </div>
);

export default VibrationAnalysisView;
