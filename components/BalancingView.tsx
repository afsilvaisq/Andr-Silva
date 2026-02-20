
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { RotateCw, Info, Calculator, CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, Weight } from 'lucide-react';

interface BalancingViewProps {
  assets: Asset[];
}

const ISO_GRADES = [
  { g: 0.4, label: 'G0.4', desc: 'Fusos, discos e armaduras de alta precisão.' },
  { g: 1.0, label: 'G1', desc: 'Motores elétricos pequenos, gravadores de fita.' },
  { g: 2.5, label: 'G2.5', desc: 'Turbinas a gás/vapor, turbo-compressores.' },
  { g: 6.3, label: 'G6.3', desc: 'Peças de máquinas em geral, bombas, ventiladores.' },
  { g: 16.0, label: 'G16', desc: 'Maquinaria agrícola, polias de correia.' },
  { g: 40.0, label: 'G40', desc: 'Rodas de automóveis, jantes.' },
];

const BalancingView: React.FC<BalancingViewProps> = ({ assets }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [mass, setMass] = useState<string>('150'); // kg
  const [rpm, setRpm] = useState<string>('1500'); // RPM
  const [selectedG, setSelectedG] = useState<number>(6.3);
  
  // Real measurement inputs
  const [actualMass, setActualMass] = useState<string>('0.5'); // g
  const [actualRadius, setActualRadius] = useState<string>('200'); // mm

  const calculations = useMemo(() => {
    const M = parseFloat(mass) || 0;
    const N = parseFloat(rpm) || 0;
    if (M === 0 || N === 0) return { eper: 0, uper: 0, actualU: 0, status: 'invalid' };

    // eper (g·mm/kg) = (9549 * G) / N
    const eper = (9549 * selectedG) / N;
    // Uper (g·mm) = eper * M
    const uper = eper * M;

    const actM = parseFloat(actualMass) || 0;
    const actR = parseFloat(actualRadius) || 0;
    const actualU = actM * actR;

    const status = actualU <= uper ? 'compliant' : 'non-compliant';

    return { eper, uper, actualU, status };
  }, [mass, rpm, selectedG, actualMass, actualRadius]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-light">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Engenharia de Equilibragem</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <RotateCw size={12} className="text-indigo-600" />
            Cálculo de Desequilíbrio Residual Admissível (ISO 21940-11)
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Step 1: Standard Config */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                 <Calculator size={16} className="text-indigo-600" />
              </div>
              <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em]">Parâmetros do Rotor</h3>
           </div>

           <div className="space-y-6">
              <InputGroup label="Massa do Rotor (M)" value={mass} onChange={setMass} unit="kg" />
              <InputGroup label="Velocidade (N)" value={rpm} onChange={setRpm} unit="RPM" />
              
              <div className="space-y-3">
                 <label className="text-[9px] font-light text-slate-500 uppercase tracking-widest block">Grau de Qualidade (G)</label>
                 <div className="grid grid-cols-2 gap-2">
                    {ISO_GRADES.map((grade) => (
                       <button 
                        key={grade.g}
                        onClick={() => setSelectedG(grade.g)}
                        className={`p-3 rounded-2xl border text-[10px] font-normal transition-all text-left ${
                          selectedG === grade.g 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200' 
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                        }`}
                       >
                          <span className="block font-bold">{grade.label}</span>
                          <span className={`text-[8px] opacity-60 leading-tight block mt-1 ${selectedG === grade.g ? 'text-white' : 'text-slate-400'}`}>{grade.desc.substring(0, 30)}...</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Step 2: Calculator Result */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                   <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em]">Limites Admissíveis</h3>
              </div>

              <div className="grid gap-4">
                 <ResultCard label="Desequilíbrio Específico (eper)" value={calculations.eper.toFixed(2)} unit="g·mm/kg" color="indigo" />
                 <ResultCard label="Desequilíbrio Total (Uper)" value={calculations.uper.toFixed(1)} unit="g·mm" color="emerald" />
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <p className="text-[10px] text-slate-500 font-light leading-relaxed">
                   Para um rotor de {mass}kg operando a {rpm} RPM em grau {selectedG}, o limite técnico é de {calculations.uper.toFixed(1)} g·mm. Este valor deve ser distribuído entre os planos de correção.
                 </p>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-[8px] text-slate-300 uppercase tracking-[0.3em]">Cálculos baseados na Norma Internacional ISO 21940-11</p>
           </div>
        </div>

        {/* Step 3: Verificação Residual */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
           <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 ${
              calculations.status === 'compliant' ? 'bg-emerald-500' : 'bg-rose-500'
           }`}></div>

           <div className="space-y-8 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                   <Weight size={16} className="text-slate-600" />
                </div>
                <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em]">Análise de Desequilíbrio Residual</h3>
              </div>

              <div className="space-y-4">
                 <InputGroup label="Massa de Desequilíbrio" value={actualMass} onChange={setActualMass} unit="g" />
                 <InputGroup label="Raio de Correção" value={actualRadius} onChange={setActualRadius} unit="mm" />
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Desequilíbrio Residual Calculado</p>
                       <p className="text-3xl font-extralight text-slate-900 tracking-tighter">{calculations.actualU.toFixed(1)} <span className="text-xs text-slate-400 ml-1">g·mm</span></p>
                    </div>
                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                       calculations.status === 'compliant' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                       {calculations.status === 'compliant' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                    </div>
                 </div>

                 <div className={`p-4 rounded-2xl text-[10px] font-normal uppercase tracking-widest text-center border ${
                    calculations.status === 'compliant' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-rose-50 border-rose-100 text-rose-600'
                 }`}>
                    {calculations.status === 'compliant' ? 'DENTRO DA TOLERÂNCIA' : 'FORA DA TOLERÂNCIA'}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, unit }: { label: string, value: string, onChange: (v: string) => void, unit: string }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-light text-slate-500 uppercase tracking-widest block">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 text-sm font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 uppercase font-bold">{unit}</span>
    </div>
  </div>
);

const ResultCard = ({ label, value, unit, color }: { label: string, value: string, unit: string, color: 'indigo' | 'emerald' }) => (
  <div className={`p-6 rounded-3xl border transition-all ${
    color === 'indigo' ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'
  }`}>
    <p className={`text-[8px] uppercase tracking-[0.2em] mb-2 ${
      color === 'indigo' ? 'text-indigo-600' : 'text-emerald-600'
    }`}>{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-extralight text-slate-900 tracking-tighter">{value}</p>
      <p className="text-[9px] text-slate-400 font-light">{unit}</p>
    </div>
  </div>
);

export default BalancingView;
