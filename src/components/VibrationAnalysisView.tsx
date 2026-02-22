import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ref, onValue, limitToLast, query } from "firebase/database";
import { db as database } from '../services/firebase';
import { Activity, Clock, Zap } from 'lucide-react';

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
          x: result[key].vib_X,
          y: result[key].vib_Y,
          z: result[key].vib_Z,
          tagName: result[key].tag || 'Sensor Activo',
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Live Telemetry</span>
          </div>
          <h2 className="text-3xl font-extralight text-slate-900 tracking-tight">
            {latest?.tagName || assetName} <span className="text-slate-300 mx-2">|</span> <span className="text-slate-500 text-lg">Vibração Triaxial</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
            <Clock size={12} /> {latest?.fullDate || 'A sincronizar...'}
          </p>
        </div>
      </div>

      {/* Grid de Métricas Modernas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernMetricCard label="Eixo X" value={latest.x} color="#3b82f6" icon="radial" />
        <ModernMetricCard label="Eixo Y" value={latest.y} color="#ef4444" icon="tangencial" />
        <ModernMetricCard label="Eixo Z" value={latest.z} color="#22c55e" icon="axial" />
      </div>

      {/* Gráfico de Área Moderno */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorX" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
