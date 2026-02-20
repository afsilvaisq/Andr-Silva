
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { ArrowRightLeft, Target, Info, Calculator, CheckCircle2, AlertTriangle, Settings2, ChevronDown, Coins, Leaf, Clock, TrendingUp, RefreshCw, CloudLightning } from 'lucide-react';

interface AlignmentViewProps {
  assets: Asset[];
}

const ALIGNMENT_TOLERANCES = [
  { rpmMin: 0, rpmMax: 1000, offsetExcellent: 0.08, offsetAcceptable: 0.13, angularExcellent: 0.06, angularAcceptable: 0.10 },
  { rpmMin: 1000, rpmMax: 2000, offsetExcellent: 0.05, offsetAcceptable: 0.08, angularExcellent: 0.04, angularAcceptable: 0.07 },
  { rpmMin: 2000, rpmMax: 3000, offsetExcellent: 0.04, offsetAcceptable: 0.06, angularExcellent: 0.03, angularAcceptable: 0.05 },
  { rpmMin: 3000, rpmMax: 10000, offsetExcellent: 0.03, offsetAcceptable: 0.04, angularExcellent: 0.02, angularAcceptable: 0.03 },
];

const AlignmentView: React.FC<AlignmentViewProps> = ({ assets }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [rpm, setRpm] = useState<string>('1500');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Variáveis de Consumo Energético
  const [powerKw, setPowerKw] = useState<string>('75');
  const [energyPrice, setEnergyPrice] = useState<string>('0.18');
  const [opHours, setOpHours] = useState<string>('8000');
  const [loadFactor, setLoadFactor] = useState<string>('85');

  // Valores Medidos
  const [vOffset, setVOffset] = useState<string>('0.15');
  const [vAngular, setVAngular] = useState<string>('0.12');
  const [hOffset, setHOffset] = useState<string>('0.06');
  const [hAngular, setHAngular] = useState<string>('0.08');

  const tolerance = useMemo(() => {
    const n = parseFloat(rpm);
    if (isNaN(n)) return ALIGNMENT_TOLERANCES[1];
    return ALIGNMENT_TOLERANCES.find(t => n >= t.rpmMin && n < t.rpmMax) || ALIGNMENT_TOLERANCES[3];
  }, [rpm]);

  const handleAcoemSync = () => {
    setIsSyncing(true);
    // Simulação de chamada API para Acoem Cloud
    setTimeout(() => {
      setVOffset((Math.random() * 0.05).toFixed(3));
      setVAngular((Math.random() * 0.04).toFixed(3));
      setHOffset((Math.random() * 0.03).toFixed(3));
      setHAngular((Math.random() * 0.03).toFixed(3));
      setIsSyncing(false);
    }, 1500);
  };

  const checkStatus = (value: string, type: 'offset' | 'angular') => {
    const val = Math.abs(parseFloat(value));
    if (isNaN(val)) return 'invalid';
    const limitExc = type === 'offset' ? tolerance.offsetExcellent : tolerance.angularExcellent;
    const limitAcc = type === 'offset' ? tolerance.offsetAcceptable : tolerance.angularAcceptable;
    if (val <= limitExc) return 'excellent';
    if (val <= limitAcc) return 'acceptable';
    return 'critical';
  };

  const energyImpact = useMemo(() => {
    const p = parseFloat(powerKw) || 0;
    const cost = parseFloat(energyPrice) || 0;
    const hours = parseFloat(opHours) || 0;
    const load = (parseFloat(loadFactor) || 0) / 100;

    const values = [
      { val: Math.abs(parseFloat(vOffset)), limit: tolerance.offsetExcellent },
      { val: Math.abs(parseFloat(vAngular)), limit: tolerance.angularExcellent },
      { val: Math.abs(parseFloat(hOffset)), limit: tolerance.offsetExcellent },
      { val: Math.abs(parseFloat(hAngular)), limit: tolerance.angularExcellent }
    ];

    const ratios = values.map(v => v.val / v.limit);
    const maxRatio = Math.max(...ratios);
    
    let lossPercent = Math.max(0, (maxRatio - 1) * 0.015);
    if (lossPercent > 0.10) lossPercent = 0.10;

    const annualConsumptionKwh = p * hours * load;
    const potentialSavingEuro = annualConsumptionKwh * lossPercent * cost;
    const potentialSavingKwh = annualConsumptionKwh * lossPercent;
    const co2Saved = (potentialSavingKwh * 0.4) / 1000;

    return { 
      euro: potentialSavingEuro, 
      kwh: potentialSavingKwh, 
      co2: co2Saved, 
      lossPercent: lossPercent * 100,
      severityRatio: maxRatio
    };
  }, [powerKw, energyPrice, opHours, loadFactor, vOffset, vAngular, hOffset, hAngular, tolerance]);

  const currentStatus = useMemo(() => {
    if (energyImpact.severityRatio <= 1) return 'excellent';
    if (energyImpact.lossPercent < 3) return 'acceptable';
    return 'critical';
  }, [energyImpact]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-light pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Gestão de Alinhamento Proporcional</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp size={12} className="text-indigo-600" />
            Cálculo Dinâmico de Perdas por Atrito Parasita
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleAcoemSync}
            disabled={isSyncing}
            className="flex items-center gap-3 bg-white border border-rose-100 hover:border-rose-500 text-rose-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudLightning size={14} />}
            {isSyncing ? 'Sincronizando Acoem...' : 'Puxar da Acoem Cloud'}
          </button>
          
          <div className="relative w-full md:w-64">
            <select 
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px] font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer shadow-sm"
            >
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <Settings2 size={16} className="text-indigo-600" />
              </div>
              <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em]">Configuração Técnica</h3>
            </div>
            <div className="space-y-4">
              <InputGroup label="Rotação (RPM)" value={rpm} onChange={setRpm} unit="N" />
              <InputGroup label="Potência (kW)" value={powerKw} onChange={setPowerKw} unit="P" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <Coins size={16} className="text-amber-600" />
              </div>
              <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em]">Custos de Operação</h3>
            </div>
            <div className="space-y-4">
              <InputGroup label="Preço Energia" value={energyPrice} onChange={setEnergyPrice} unit="€/kWh" />
              <InputGroup label="Horas / Ano" value={opHours} onChange={setOpHours} unit="h" />
              <InputGroup label="Fator de Carga" value={loadFactor} onChange={setLoadFactor} unit="%" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-10 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Target size={16} className="text-indigo-600" /> Medições Atuais
                   </h3>
                   <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                     currentStatus === 'excellent' ? 'bg-emerald-50 text-emerald-600' :
                     currentStatus === 'acceptable' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                   }`}>
                     {currentStatus === 'excellent' ? 'Excelente' : currentStatus === 'acceptable' ? 'Aceitável' : 'Fora de Tolerância'}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                   <div className="space-y-6">
                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Plano Vertical</p>
                      <MeasurementInput label="Offset" value={vOffset} onChange={setVOffset} unit="mm" status={checkStatus(vOffset, 'offset')} />
                      <MeasurementInput label="Angular" value={vAngular} onChange={setVAngular} unit="mm/100" status={checkStatus(vAngular, 'angular')} />
                   </div>
                   <div className="space-y-6">
                      <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Plano Horizontal</p>
                      <MeasurementInput label="Offset" value={hOffset} onChange={setHOffset} unit="mm" status={checkStatus(hOffset, 'offset')} />
                      <MeasurementInput label="Angular" value={hAngular} onChange={setHAngular} unit="mm/100" status={checkStatus(hAngular, 'angular')} />
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                   <Leaf size={180} />
                </div>
                
                <div className="relative z-10">
                   <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Impacto Proporcional</p>
                   <h3 className="text-sm font-extralight text-slate-300 uppercase tracking-widest mb-10">ROI de Correção Anual</h3>
                   
                   <div className="space-y-8">
                      <div>
                        <p className="text-5xl font-extralight tracking-tighter text-white">
                          € {energyImpact.euro.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                           <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${energyImpact.lossPercent > 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (energyImpact.lossPercent / 10) * 100)}%` }}
                              ></div>
                           </div>
                           <span className="text-[10px] text-slate-400 font-bold">{energyImpact.lossPercent.toFixed(1)}% de Perda</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                         <div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Recuperação Térmica</p>
                            <p className="text-xl font-bold">{energyImpact.kwh.toLocaleString()} <span className="text-[10px] font-light">kWh/ano</span></p>
                         </div>
                         <div>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Desvio da Tolerância</p>
                            <p className="text-xl font-bold">{energyImpact.severityRatio.toFixed(1)}<span className="text-[10px] font-light">x Limite</span></p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="relative z-10 mt-10 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-medium leading-relaxed text-slate-400">
                     Cada incremento de <strong className="text-emerald-400">1.0x</strong> acima do limite excelente gera aproximadamente <strong className="text-emerald-400">1.5%</strong> de desperdício em calor e vibração.
                   </p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-8 bg-white border border-slate-200 rounded-[32px] flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                   <Clock size={20} />
                </div>
                <div>
                   <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Payback do Serviço</p>
                   <p className="text-sm font-black text-slate-900">{(energyImpact.euro > 0 ? (350 / energyImpact.euro * 12) : 0).toFixed(1)} Meses</p>
                </div>
             </div>
             <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] md:col-span-2">
                <div className="flex items-center gap-4">
                   <Info size={20} className="text-indigo-600" />
                   <p className="text-[11px] text-indigo-900/70 font-medium leading-relaxed">
                     Este cálculo utiliza um **Modelo de Perda Contínuo**. Diferente de tabelas fixas, ele detecta pequenas melhorias no alinhamento que já resultam em ganhos financeiros imediatos.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, unit }: { label: string, value: string, onChange: (v: string) => void, unit: string }) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-slate-900 text-[11px] font-bold focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 uppercase font-black">{unit}</span>
    </div>
  </div>
);

const MeasurementInput = ({ label, value, onChange, unit, status }: { label: string, value: string, onChange: (v: string) => void, unit: string, status: string }) => {
  const statusColor = (s: string) => {
    switch (s) {
      case 'excellent': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'acceptable': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'critical': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor(status)}`}>
          {status === 'excellent' ? 'OK' : status === 'acceptable' ? 'Alerta' : 'Crítico'}
        </span>
      </div>
      <div className="relative">
        <input 
          type="number" 
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50 border rounded-2xl py-3 px-4 text-slate-900 text-sm font-bold focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all ${
            status === 'critical' ? 'border-rose-100' : 'border-slate-100'
          }`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 uppercase font-black">{unit}</span>
      </div>
    </div>
  );
};

export default AlignmentView;
