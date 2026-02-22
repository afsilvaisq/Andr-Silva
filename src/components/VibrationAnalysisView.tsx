import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, AlertCircle, History } from 'lucide-react';

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

  // Filtra os últimos 5 eventos que ultrapassaram o limite de alerta (4.5)
  const alertHistory = useMemo(() => {
    return data
      .filter(d => d.x > 4.5 || d.y > 4.5 || d.z > 4.5)
      .slice(-5)
      .reverse();
  }, [data]);

  const latest = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };
  const getStatusColor = (val: number) => {
    if (val > 7.1) return "text-red-500 animate-pulse";
    if (val > 4.5) return "text-yellow-500";
    return "text-emerald-500";
  };

  if (loading) return <div className=\"p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest\">Data Sync...</div>;

  return (
    <div className=\"w-full bg-transparent font-mono text-slate-400 p-2\">
      
      {/* Header Técnico */}
      <div className=\"flex justify-between items-start mb-8 border-l-2 border-slate-800 pl-4\">
        <div className=\"space-y-3\">
          <h2 className=\"text-[10px] font-black text-white tracking-[0.4em] uppercase\">
            {latest.tagName} // TELEMETRIA_SENSÓRICA
          </h2>
          <div className=\"flex gap-8\">
             <MetricDisplay label=\"X_RADIAL\" value={latest.x} color={getStatusColor(latest.x)} />
             <MetricDisplay label=\"Y_TANGENTIAL\" value={latest.y} color={getStatusColor(latest.y)} />
             <MetricDisplay label=\"Z_AXIAL\" value={latest.z} color={getStatusColor(latest.z)} />
          </div>
        </div>
        <div className=\"text-[9px] font-bold text-right\">
          <p className=\"text-slate-500 mb-1 tracking-widest\">SISTEMA ATIVO</p>
          <p className=\"text-white flex items-center justify-end gap-2\"><Clock size={10}/> {latest.time}</p>
        </div>
      </div>

      <div className=\"flex flex-col lg:flex-row gap-6\">
        {/* Gráfico de Tendência (Trend) */}
        <div className=\"flex-1 h-[450px] relative border border-slate-800/30 rounded-sm bg-slate-900/5\">
          <ResponsiveContainer width=\"100%\" height=\"100%\">
            <AreaChart data={data} margin={{ top: 10, right: 40, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray=\"0\" vertical={true} stroke=\"#1e293b\" strokeOpacity={0.1} />
              <XAxis dataKey=\"time\" axisLine={{stroke:'#1e293b'}} tick={{fontSize: 8, fill:'#475569'}} tickLine={false}>
                <Label value=\"EIXO TEMPORAL\" offset={-12} position=\"insideBottom\" fill=\"#334155\" fontSize={7} fontWeight=\"bold\" />
              </XAxis>
              <YAxis axisLine={{stroke:'#1e293b'}} tick={{fontSize: 8, fill:'#475569'}} tickLine={false}>
                <Label value=\"MAGNITUDE (MM/S)\" angle={-90} position=\"insideLeft\" offset={15} fill=\"#334155\" fontSize={7} fontWeight=\"bold\" />
              </YAxis>
              
              {/* Níveis de Alarme ISO 10816 */}
              <ReferenceLine y={7.1} stroke=\"#ef4444\" strokeDasharray=\"3 3\" strokeWidth={1} />
              <ReferenceLine y={4.5} stroke=\"#eab308\" strokeDasharray=\"3 3\" strokeWidth={1} />

              <Area type=\"monotone\" dataKey=\"x\" stroke=\"#3b82f6\" strokeWidth={1.2} fill=\"transparent\" isAnimationActive={false} />
              <Area type=\"monotone\" dataKey=\"y\" stroke=\"#ef4444\" strokeWidth={1.2} fill=\"transparent\" isAnimationActive={false} />
              <Area type=\"monotone\" dataKey=\"z\" stroke=\"#22c55e\" strokeWidth={1.2} fill=\"transparent\" isAnimationActive={false} />
              
              <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #1e293b', fontSize:'8px'}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela Lateral de Alarmes (Recent Events) */}
        <div className=\"w-full lg:w-72 bg-slate-900/10 border border-slate-800/30 p-4 rounded-sm\">
          <h3 className=\"text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2\">
            <History size={12}/> Histórico de Alertas
          </h3>
          <div className=\"space-y-2\">
            {alertHistory.length > 0 ? alertHistory.map((event, i) => (
              <div key={i} className=\"border-b border-slate-800/50 pb-2 flex justify-between items-center\">
                <div>
                  <p className=\"text-[8px] text-slate-500 font-bold\">{event.time}</p>
                  <p className=\"text-[10px] text-white font-bold tracking-tighter italic uppercase\">Excessive_Vib</p>
                </div>
                <div className=\"text-right\">
                  <span className={`text-[10px] font-bold ${event.x > 7.1 || event.y > 7.1 || event.z > 7.1 ? 'text-red-500' : 'text-yellow-500'}`}>
                    {Math.max(event.x, event.y, event.z).toFixed(2)}
                  </span>
                  <p className=\"text-[7px] text-slate-600\">mm/s</p>
                </div>
              </div>
            )) : (
              <p className=\"text-[8px] text-slate-700 italic\">Nenhum alerta registado...</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Industrial */}
      <div className=\"mt-8 flex justify-between items-center text-[8px] font-black text-slate-700 tracking-[0.2em] uppercase\">
        <div className=\"flex gap-6\">
          <span className=\"flex items-center gap-2\"><div className=\"w-2 h-2 rounded-full bg-blue-500\"/> X_RADIAL</span>
          <span className=\"flex items-center gap-2\"><div className=\"w-2 h-2 rounded-full bg-red-500\"/> Y_TANGENTIAL</span>
          <span className=\"flex items-center gap-2\"><div className=\"w-2 h-2 rounded-full bg-green-500\"/> Z_AXIAL</span>
        </div>
        <div className=\"flex items-center gap-2\">
          <Activity size={10} className=\"text-emerald-900\" />
          SISTEMA_VIB_OK // ISO_10816_STANDARDS
        </div>
      </div>
    </div>
  );
};

const MetricDisplay = ({ label, value, color }: any) => (
  <div className=\"flex flex-col\">
    <span className=\"text-[7px] text-slate-600 font-black tracking-tighter mb-1 uppercase\">{label}</span>
    <div className=\"flex items-baseline gap-1\">
      <span className={`text-sm font-bold tracking-tighter ${color}`}>{value?.toFixed(3)}</span>
      <span className=\"text-[8px] text-slate-800 font-bold\">mm/s</span>
    </div>
  </div>
);

export default VibrationAnalysisView;
