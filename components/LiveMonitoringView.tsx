
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { Asset, SensorType } from '../types';
import { Waves, Activity, Zap, Cpu, Thermometer, Droplets, Gauge, AlertCircle, ChevronDown } from 'lucide-react';

interface LiveMonitoringViewProps {
  assets: Asset[];
}

const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({ assets }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [liveData, setLiveData] = useState<any[]>([]);
  const [spectrumData, setSpectrumData] = useState<any[]>([]);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  const generateSpectrum = () => {
    return Array.from({ length: 100 }).map((_, i) => ({
      hz: i * 10,
      amplitude: Math.max(0, 
        (i === 5 ? 2.5 : 0) + 
        (i === 10 ? 1.8 : 0) + 
        (i === 15 ? 0.9 : 0) + 
        Math.random() * 0.2
      )
    }));
  };

  useEffect(() => {
    setLiveData(Array.from({ length: 40 }).map((_, i) => ({
      time: i,
      vibration: (selectedAsset?.sensors.find(s => s.type === SensorType.VIBRATION)?.currentValue || 1.2) + (Math.random() * 0.2 - 0.1),
      temperature: (selectedAsset?.sensors.find(s => s.type === SensorType.TEMPERATURE)?.currentValue || 45) + (Math.random() * 2 - 1),
      pressure: (selectedAsset?.sensors.find(s => s.type === SensorType.PRESSURE)?.currentValue || 6.5) + (Math.random() * 0.4 - 0.2),
      flow: (selectedAsset?.sensors.find(s => s.type === SensorType.FLOW)?.currentValue || 120) + (Math.random() * 5 - 2.5)
    })));
    setSpectrumData(generateSpectrum());

    const interval = setInterval(() => {
      setLiveData(prev => {
        const last = prev[prev.length - 1];
        const nextTime = last.time + 1;
        
        return [...prev.slice(1), { 
          time: nextTime, 
          vibration: Math.max(0, last.vibration + (Math.random() * 0.2 - 0.1)),
          temperature: Math.max(20, last.temperature + (Math.random() * 0.5 - 0.25)),
          pressure: Math.max(0, last.pressure + (Math.random() * 0.1 - 0.05)),
          flow: Math.max(0, last.flow + (Math.random() * 2 - 1))
        }];
      });
      setSpectrumData(prev => prev.map(d => ({ ...d, amplitude: Math.max(0, d.amplitude + (Math.random() * 0.05 - 0.025)) })));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAssetId]);

  const latest = liveData[liveData.length - 1] || {};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Monitorização Live Multi-Variável</h2>
          <p className="text-slate-400 text-[10px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={12} className="text-indigo-600 animate-pulse" />
            Sincronização de Telemetria (1Hz)
          </p>
        </div>
        
        <div className="relative w-full md:w-64 group">
          <select 
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px] font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer shadow-sm"
          >
            {assets.map(a => <option key={a.id} value={a.id} className="bg-white">{a.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-indigo-600 transition-colors" size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <Waves size={16} className="text-indigo-600" />
                Vibração Global (RMS)
              </h3>
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[8px] font-bold uppercase tracking-widest">Estável</div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '10px' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="vibration" stroke="#6366f1" strokeWidth={1.5} fill="url(#colorVib)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ParameterTrendChart 
              title="Temperatura" 
              data={liveData} 
              dataKey="temperature" 
              icon={<Thermometer size={16} className="text-orange-500" />} 
              color="#f97316" 
              unit="°C"
            />
            <ParameterTrendChart 
              title="Pressão" 
              data={liveData} 
              dataKey="pressure" 
              icon={<Gauge size={16} className="text-blue-500" />} 
              color="#3b82f6" 
              unit="bar"
            />
            <ParameterTrendChart 
              title="Caudal" 
              data={liveData} 
              dataKey="flow" 
              icon={<Droplets size={16} className="text-cyan-500" />} 
              color="#06b6d4" 
              unit="m³/h"
            />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <Zap size={16} className="text-amber-500" />
                Espectro de Frequência (Análise FFT)
              </h3>
              <span className="text-[9px] font-light text-slate-300 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">Janela: Hanning</span>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spectrumData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="hz" tick={{fill: '#94a3b8', fontSize: 8}} axisLine={false} tickLine={false} interval={9} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
                  <Bar dataKey="amplitude" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                    {spectrumData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.amplitude > 1.5 ? '#f43f5e' : entry.amplitude > 0.5 ? '#6366f1' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-light text-slate-400 uppercase tracking-widest mb-6">VALORES EM TEMPO REAL</h4>
            <div className="space-y-6">
              <LiveMetric label="Vibração RMS" value={`${(latest.vibration || 0).toFixed(2)}`} unit="mm/s" />
              <LiveMetric label="Temperatura" value={`${(latest.temperature || 0).toFixed(1)}`} unit="°C" />
              <LiveMetric label="Pressão" value={`${(latest.pressure || 0).toFixed(2)}`} unit="bar" />
              <LiveMetric label="Caudal" value={`${(latest.flow || 0).toFixed(1)}`} unit="m³/h" />
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <AlertCircle size={14} className="text-indigo-600" />
               <h4 className="text-[10px] font-light text-indigo-600 uppercase tracking-widest">AUDITORIA DE DADOS</h4>
             </div>
             <p className="text-[11px] leading-relaxed text-indigo-800/80 font-light italic">
               Correlação positiva detectada entre vibração e temperatura. O aumento térmico de {((latest.temperature || 0) - 40).toFixed(1)}°C acima do baseline é proporcional à carga de caudal atual.
             </p>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-light text-slate-400 uppercase tracking-widest">Health Node</span>
            </div>
            <span className="text-[9px] font-light text-slate-300 uppercase">Uptime: 142h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParameterTrendChart = ({ title, data, dataKey, icon, color, unit }: { title: string, data: any[], dataKey: string, icon: React.ReactNode, color: string, unit: string }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[9px] font-light text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <span className="text-[10px] font-extralight text-slate-900">{unit}</span>
    </div>
    <div className="h-[80px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#color-${dataKey})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const LiveMetric = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="flex justify-between items-end border-b border-slate-100 pb-2">
    <div>
      <p className="text-[8px] font-light text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-xl font-extralight text-slate-900 tracking-tighter">{value}</p>
    </div>
    <span className="text-[9px] font-light text-slate-300 mb-1">{unit}</span>
  </div>
);

export default LiveMonitoringView;
