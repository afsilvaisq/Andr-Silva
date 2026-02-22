import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Waves, Clock, Database } from 'lucide-react';

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
  tagName: result[key].tag || 'Sem TAG', // Lê a tag enviada pelo sensor
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cabeçalho da Secção */}
     <div>
  <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">
    {latest.tagName} - Live
  </h2>
</div>

      {/* Cards de Resumo em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Eixo X (RMS)" value={latest.x} unit="mm/s" color="#6366f1" />
        <MetricCard label="Eixo Y (RMS)" value={latest.y} unit="mm/s" color="#10b981" />
        <MetricCard label="Eixo Z (RMS)" value={latest.z} unit="mm/s" color="#f59e0b" />
      </div>

      {/* Gráfico de Tendência Principal */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <Waves size={16} className="text-indigo-600" />
            Linha de Tendência Triaxial
          </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                tick={{fill: '#94a3b8', fontSize: 10}} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10}}
                label={{ value: 'mm/s', angle: -90, position: 'insideLeft', style: {fontSize: '10px', fill: '#94a3b8'} }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', textTransform: 'uppercase' }} />
              
              <Line type="monotone" dataKey="x" name="Vibração X" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="y" name="Vibração Y" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="z" name="Vibração Z" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info de Rodapé */}
      <div className="flex items-center justify-between px-4">
        <p className="text-[9px] text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Clock size={10} />
          Última atualização: {latest.fullDate || 'A aguardar sensor...'}
        </p>
        <span className="text-[9px] text-slate-300 uppercase tracking-widest">Frequência: 2 min</span>
      </div>
    </div>
  );
};

/* Componente Auxiliar para os Cards Superiores */
const MetricCard = ({ label, value, unit, color }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
    <p className="text-[8px] font-light text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-extralight text-slate-900" style={{ color: value > 5 ? '#ef4444' : 'inherit' }}>
        {value !== undefined ? value.toFixed(2) : '---'}
      </span>
      <span className="text-[10px] text-slate-300 uppercase font-light">{unit}</span>
    </div>
    <div className="w-full h-1 bg-slate-50 mt-4 rounded-full overflow-hidden">
      <div className="h-full transition-all duration-1000" style={{ width: `${Math.min((value || 0) * 10, 100)}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

export default VibrationAnalysisView;
