import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock } from 'lucide-react';

const VibrationAnalysisView: React.FC<{ assetName?: string }> = ({ assetName }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consulta os últimos 50 registos da pasta 'historico'
    const dbRef = query(ref(database, 'historico'), limitToLast(50));

    const unsubscribe = onValue(dbRef, (snapshot) => {
      const result = snapshot.val();
      if (result) {
        const formattedData = Object.keys(result).map(key => ({
          time: new Date(result[key].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          x: result[key].vib_X,
          y: result[key].vib_Y,
          z: result[key].vib_Z,
          tagName: result[key].tag || 'Sem TAG',
          fullDate: new Date(result[key].timestamp).toLocaleString()
        }));
        setData(formattedData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const latest = data[data.length - 1] || {};

  return (
    <div className="space-y-6">
      {/* Cabeçalho Limpo - Sem "Live do Firebase" */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">
            {latest?.tagName || assetName || 'Equipamento'} - Live
          </h2>
          <p className="text-slate-400 text-[10px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={12} className="text-indigo-600 animate-pulse" />
            Monitorização em Tempo Real
          </p>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Eixo X (Radial)" value={latest.x} unit="mm/s" color="#3b82f6" />
        <MetricCard label="Eixo Y (Tangencial)" value={latest.y} unit="mm/s" color="#ef4444" />
        <MetricCard label="Eixo Z (Axial)" value={latest.z} unit="mm/s" color="#22c55e" />
      </div>

      {/* Gráfico Triaxial com as Cores Corretas */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} stroke="#cbd5e1" fontSize={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              
              <Line 
                type="monotone" 
                dataKey="x" 
                name="Eixo X" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                name="Eixo Y" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                dataKey="z" 
                name="Eixo Z" 
                stroke="#22c55e" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between px-4">
        <p className="text-[9px] text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Clock size={10} />
          Última atualização: {latest?.fullDate || 'A aguardar sensor...'}
        </p>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, color }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
    <p className="text-[8px] font-light text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-extralight text-slate-900" style={{ color: color }}>
        {value !== undefined ? value.toFixed(2) : '---'}
      </span>
      <span className="text-[10px] text-slate-300 uppercase font-light">{unit}</span>
    </div>
  </div>
);

export default VibrationAnalysisView;
