
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Asset, SensorType, UserRole, DataSource, SeverityLevel } from '../types';
import { Zap, Activity, History, Info, Thermometer, Waves, Droplets } from 'lucide-react';

interface ReliabilityDashboardProps {
  asset: Asset;
  userRole: UserRole;
  onUpdateAsset?: (asset: Asset) => void;
}

const ReliabilityDashboard: React.FC<ReliabilityDashboardProps> = ({ asset, userRole, onUpdateAsset }) => {
  const [activeModality, setActiveModality] = useState<SensorType>(SensorType.VIBRATION);
  const [activeSensorId, setActiveSensorId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<DataSource>('continuous');
  const [isChanging, setIsChanging] = useState(false);

  // Filtragem: por Fonte e por Modalidade
  const filteredSensors = useMemo(() => {
    return asset.sensors.filter(s => s.dataSource === activeSource && s.type === activeModality);
  }, [asset.sensors, activeSource, activeModality]);

  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 300);
    
    if (activeModality !== SensorType.ULTRASOUND) {
      if (filteredSensors.length > 0) {
        const currentExists = filteredSensors.find(s => s.id === activeSensorId);
        if (!currentExists) setActiveSensorId(filteredSensors[0].id);
      } else {
        setActiveSensorId(null);
      }
    }

    return () => clearTimeout(timer);
  }, [asset.id, activeSource, activeModality, filteredSensors]);

  const currentSensor = useMemo(() => {
    return asset.sensors.find(s => s.id === activeSensorId && s.dataSource === activeSource && s.type === activeModality);
  }, [asset.sensors, activeSensorId, activeSource, activeModality]);

  const chartColor = useMemo(() => {
    if (activeModality === SensorType.VIBRATION) return '#6366f1';
    if (activeModality === SensorType.TEMPERATURE) return '#f43f5e';
    return '#10b981'; // Ultrasound/Lube
  }, [activeModality]);

  const chartTitle = useMemo(() => {
    if (activeModality === SensorType.TEMPERATURE) return 'Temperatura de Operação';
    if (activeModality === SensorType.ULTRASOUND) return 'Fricção Ultrassónica (dB)';
    if (currentSensor?.unit === 'G') return 'Aceleração (G-s)';
    return 'Vibração RMS';
  }, [activeModality, currentSensor]);

  const warningThreshold = useMemo(() => {
    if (activeModality === SensorType.TEMPERATURE) return (currentSensor?.thresholdMax || 85) * 0.8;
    if (activeModality === SensorType.ULTRASOUND) return 25; // Alerta de fricção dB
    return currentSensor?.unit === 'G' ? 1.5 : 2.8;
  }, [activeModality, currentSensor]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard */}
      <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-slate-200/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
             <div className={`px-2 py-0.5 rounded-md text-white text-[9px] font-black uppercase tracking-widest ${
               asset.severity === 'D' ? 'bg-rose-500' : asset.severity === 'C' ? 'bg-amber-400' : 'bg-emerald-500'
             }`}>
               Zona {asset.severity}
             </div>
             <p className="text-slate-400 text-[9px] font-bold tracking-widest uppercase flex items-center gap-1">
               <Zap size={10} className="text-indigo-600" /> {asset.location}
             </p>
           </div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{asset.name}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Seletor de Modalidade - Integrado com Lubrificação */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setActiveModality(SensorType.VIBRATION)} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeModality === SensorType.VIBRATION ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Waves size={10} /> Vibração
            </button>
            <button 
              onClick={() => setActiveModality(SensorType.TEMPERATURE)} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeModality === SensorType.TEMPERATURE ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Thermometer size={10} /> Temperatura
            </button>
            <button 
              onClick={() => setActiveModality(SensorType.ULTRASOUND)} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeModality === SensorType.ULTRASOUND ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Droplets size={10} /> Lubrificação
            </button>
          </div>

          {/* Seletor de Fonte (Apenas visível se houver sensores padrão) */}
          {activeModality !== SensorType.ULTRASOUND && (
            <div className="flex bg-slate-200/40 p-1 rounded-xl border border-slate-200/40 backdrop-blur-md">
              <button 
                onClick={() => setActiveSource('continuous')} 
                className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeSource === 'continuous' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Online
              </button>
              <button 
                onClick={() => setActiveSource('periodic')} 
                className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeSource === 'periodic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Inspeção
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Seletor de Pontos Filtrados */}
      {activeModality !== SensorType.ULTRASOUND && (
        <div className="relative">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scroll-smooth px-1 no-scrollbar">
            {filteredSensors.length > 0 ? filteredSensors.map(sensor => (
              <button 
                key={`${sensor.id}-${sensor.dataSource}`} 
                onClick={() => setActiveSensorId(sensor.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-[24px] border transition-all duration-500 flex items-center gap-4 group/btn ${
                  activeSensorId === sensor.id 
                    ? 'border-slate-900 bg-white shadow-xl scale-[1.02] ring-1 ring-slate-900/5' 
                    : 'border-white/10 bg-white/30 backdrop-blur-sm hover:border-slate-200/50 hover:bg-white/60'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {activeSensorId === sensor.id && (
                    <div className={`absolute w-4 h-4 rounded-full animate-ping opacity-20 ${
                      activeModality === SensorType.VIBRATION ? 'bg-indigo-500' : 'bg-rose-500'
                    }`} />
                  )}
                  <div className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-500 relative z-10 ${sensor.id === activeSensorId ? 'scale-125' : 'scale-100'} ${
                    sensor.currentValue >= (sensor.thresholdMax) ? 'bg-rose-500' : 
                    sensor.currentValue >= (sensor.unit === 'G' ? 1.5 : 2.8) ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}></div>
                </div>
                <div className="text-left">
                  <p className={`text-[7px] font-black uppercase mb-0.5 transition-colors duration-300 ${activeSensorId === sensor.id ? 'text-slate-900' : 'text-slate-400'}`}>{sensor.label}</p>
                  <p className="text-xs font-black text-slate-900 tracking-tight">{sensor.currentValue.toFixed(2)} <span className="text-[8px] text-slate-400 uppercase font-normal">{sensor.unit}</span></p>
                </div>
              </button>
            )) : (
              <div className="py-4 px-6 text-[10px] text-slate-300 italic uppercase">Nenhum ponto de {activeModality === SensorType.VIBRATION ? 'vibração' : 'temperatura'} disponível.</div>
            )}
          </div>
        </div>
      )}

      {/* Gráfico de Tendência Unificado */}
      <div className={`bg-white p-8 md:p-10 rounded-[48px] border border-slate-200 shadow-xl min-h-[500px] flex flex-col transition-opacity duration-700 ${isChanging ? 'opacity-40' : 'opacity-100'}`}>
        {(activeModality === SensorType.ULTRASOUND && asset.lubeHistory && asset.lubeHistory.length > 0) || (currentSensor && currentSensor.history.length > 0) ? (
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-700 fill-mode-forwards">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                {activeModality === SensorType.VIBRATION ? <Waves size={16} className="text-indigo-600" /> : 
                 activeModality === SensorType.TEMPERATURE ? <Thermometer size={16} className="text-rose-500" /> : 
                 <Droplets size={16} className="text-emerald-600" />}
                Tendência de {chartTitle}
              </h3>
              
              <div className="flex items-center gap-4">
                {activeModality === SensorType.ULTRASOUND ? (
                  <>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-0.5 bg-rose-500 rounded-full"></div> Antes Lube
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-0.5 bg-emerald-500 rounded-full"></div> Depois Lube
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-0.5 bg-emerald-500 rounded-full"></div> Normal
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-0.5 bg-amber-400 rounded-full"></div> Alerta
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-0.5 bg-rose-500 rounded-full"></div> Crítico
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-full h-[400px] min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {activeModality === SensorType.ULTRASOUND ? (
                    <AreaChart data={asset.lubeHistory}>
                      <defs>
                        <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} tickFormatter={(t) => new Date(t).toLocaleDateString()} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', padding: '12px' }} />
                      <ReferenceLine y={25} stroke="#fbbf24" strokeDasharray="5 5" label={{ value: 'ALERTA', fill: '#fbbf24', fontSize: 8, fontWeight: 'black' }} />
                      <Area type="monotone" dataKey="frictionBefore" stroke="#f43f5e" strokeWidth={2} fill="url(#colorBefore)" name="Antes (dB)" />
                      <Area type="monotone" dataKey="frictionAfter" stroke="#10b981" strokeWidth={2} fill="url(#colorAfter)" name="Depois (dB)" />
                    </AreaChart>
                  ) : (
                    <AreaChart data={currentSensor?.history || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad-standard" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} tickFormatter={(t) => new Date(t).toLocaleDateString()} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, (max: number) => Math.max(max * 1.2, currentSensor?.thresholdMax || 0)]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', padding: '12px' }} />
                      <ReferenceLine y={warningThreshold} stroke="#fbbf24" strokeDasharray="5 5" strokeWidth={1.5} label={{ position: 'right', value: 'ALERTA', fill: '#fbbf24', fontSize: 8, fontWeight: 'black' }} />
                      <ReferenceLine y={currentSensor?.thresholdMax} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={1.5} label={{ position: 'right', value: 'CRÍTICO', fill: '#f43f5e', fontSize: 8, fontWeight: 'black' }} />
                      <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={3} fill="url(#grad-standard)" isAnimationActive={true} animationDuration={800} dot={false} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-700">
             <div className="bg-slate-50 p-8 rounded-full mb-6">
               <History size={40} className="text-slate-200" />
             </div>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Monitoramento Aguardando Leituras para esta modalidade</p>
          </div>
        )}
      </div>

      {/* Indicador de Conformidade Técnica */}
      <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[40px] border border-slate-200/50 shadow-sm transition-all duration-500">
         <h3 className="text-[9px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
           <Info size={14} className="text-indigo-600" /> 
           {activeModality === SensorType.VIBRATION ? 'ENQUADRAMENTO ISO 20816-3' : 
            activeModality === SensorType.TEMPERATURE ? 'CONFORMIDADE TÉRMICA' : 'QUALIDADE DE LUBRIFICAÇÃO (dB)'}
         </h3>
         
         <div className="relative h-4 w-full bg-slate-200/30 rounded-full flex overflow-hidden shadow-inner border border-slate-100/50">
            {activeModality === SensorType.ULTRASOUND ? (
              <>
                <div className="h-full bg-emerald-500/15 w-[40%]" />
                <div className="h-full bg-amber-400/15 w-[30%]" />
                <div className="h-full bg-rose-500/15 flex-1" />
                <div 
                  className="absolute top-0 w-2.5 h-full bg-slate-900 shadow-2xl rounded-full transition-all duration-1000 z-10 border border-white/50" 
                  style={{ left: `${Math.min(98.5, ((asset.lubeHistory?.[asset.lubeHistory.length-1]?.frictionAfter || 0) / 60) * 100)}%` }}
                />
              </>
            ) : (
              <>
                <div className="h-full bg-emerald-500/15 w-[46%]" />
                <div className="h-full bg-amber-400/15 w-[29%]" />
                <div className="h-full bg-rose-500/15 flex-1" />
                <div 
                  className="absolute top-0 w-2.5 h-full bg-slate-900 shadow-2xl rounded-full transition-all duration-1000 z-10 border border-white/50" 
                  style={{ left: `${Math.min(98.5, ((currentSensor?.currentValue || 0) / (activeModality === SensorType.TEMPERATURE ? 120 : 6)) * 100)}%` }}
                />
              </>
            )}
         </div>
         <div className="flex justify-between mt-3 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
            {activeModality === SensorType.VIBRATION ? (
              <><span>0.0 mm/s</span><span>2.8 mm/s (Alerta)</span><span>4.5 mm/s (Crítico)</span></>
            ) : activeModality === SensorType.TEMPERATURE ? (
              <><span>20°C (Amb)</span><span>85°C (Limite)</span><span>110°C (Crítico)</span></>
            ) : (
              <><span>0 dB (Fricção Zero)</span><span>25 dB (Filme Pobre)</span><span>50+ dB (Fricção Crítica)</span></>
            )}
         </div>
      </div>
    </div>
  );
};

export default ReliabilityDashboard;
