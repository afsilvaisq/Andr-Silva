import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Clock, AlertCircle, Activity, ChevronRight } from 'lucide-react';

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

  // Filtro para a tabela de logs (apenas alertas)
  const alerts = useMemo(() => {
    return data.filter(d => d.x > 4.5 || d.y > 4.5 || d.z > 4.5).slice(-5).reverse();
  }, [data]);

  if (loading) return <div className="p-8 font-sans text-slate-400 text-sm animate-pulse">A carregar telemetria...</div>;

  return (
    <div className="w-full bg-transparent font-sans text-slate-600 p-4">
      
      {/* Header Minimalista */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">{latest.tag}</h1>
          <p className="text-slate-400 text-sm font-medium">Análise de Vibração Triaxial em Tempo Real</p>
        </div>
        <div className="flex items-center gap-4 bg-white/50 p-2 rounded-xl border border-slate-100 shadow-sm">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">{latest.time}</span>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> LIVE
          </div>
        </div>
      </div>

      {/* Grid de Métricas Limpas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard label="Radial (X)" value={latest.x} color="#3b82f6" />
        <MetricCard label="Tangencial (Y)" value={latest.y} color="#ef4444" />
        <MetricCard label="Axial (Z)" value={latest.z} color="#10b981" />
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Gráfico Moderno - 3 Eixos Juntos */}
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trend de Magnitude (mm/s)</span>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> X</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/> Y</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Z</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#cbd5e1'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                
                {/* Linhas de Alerta ISO */}
                <ReferenceLine y={7.1} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} />
                <ReferenceLine y={4.5} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1} />

                <Area type="monotone" dataKey="x" stroke="#3b82f6" strokeWidth={2.5} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={2.5} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="z" stroke="#10b981" strokeWidth={2.5} fill="transparent" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log Lateral de Anomalias */}
        <div className="w-full xl:w-72">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Eventos de Alerta</h3>
          <div className="space-y-3">
            {alerts.length > 0 ? alerts.map((a, i) => (
              <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400">{a.time}</p>
                  <p className="text-xs font-bold text-slate-800">Vibração Elevada</p>
                </div>
                <span className={`text-xs font-bold ${Math.max(a.x, a.y, a.z) > 7.1 ? 'text-red-500' : 'text-amber-500'}`}>
                  {Math.max(a.x, a.y, a.z).toFixed(2)}
                </span>
              </div>
            )) : (
              <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                <p className="text-[10px] text-slate-400 font-medium">Sem alertas registados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color }: any) => {
  const isWarning = value > 4.5;
  const isCritical = value > 7.1;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold tracking-tighter ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-800'}`}>
          {value.toFixed(2)}
        </span>
        <span className="text-[10px] font-bold text-slate-300 uppercase">mm/s</span>
      </div>
      <div className="mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500" 
          style={{ width: `${Math.min(value * 10, 100)}%`, backgroundColor: color }} 
        />
      </div>
    </div>
  );
};

export default VibrationAnalysisView;
