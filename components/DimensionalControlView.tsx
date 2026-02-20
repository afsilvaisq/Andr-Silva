
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { Ruler, Info, Calculator, Target, Settings2 } from 'lucide-react';

interface DimensionalControlViewProps {
  assets: Asset[];
}

// ISO 286 / Industrial Standards Engine
// Values in microns (µm) for internal processing
const ISO_TABLES: Record<string, Record<string, number[]>> = {
  shafts: {
    // Range: [Min Diameter, Max Diameter, Upper Deviation, Lower Deviation]
    'h6': [18, 30, 0, -13, 30, 50, 0, -16, 50, 80, 0, -19, 80, 120, 0, -22],
    'j6': [18, 30, +9, -4, 30, 50, +11, -5, 50, 80, +12, -7, 80, 120, +13, -9],
    'k6': [18, 30, +15, +2, 30, 50, +18, +2, 50, 80, +21, +2, 80, 120, +25, +3],
    'm6': [18, 30, +21, +8, 30, 50, +25, +9, 50, 80, +30, +11, 80, 120, +35, +13],
    'n6': [18, 30, +28, +15, 30, 50, +33, +17, 50, 80, +39, +20, 80, 120, +45, +23],
  },
  housings: {
    'H7': [18, 30, +21, 0, 30, 50, +25, 0, 50, 80, +30, 0, 80, 120, +35, 0, 120, 180, +40, 0],
    'J7': [18, 30, +12, -9, 30, 50, +14, -11, 50, 80, +18, -12, 80, 120, +22, -13],
    'K7': [18, 30, +2, -19, 30, 50, +2, -23, 50, 80, +2, -28, 80, 120, +3, -32],
    'M7': [18, 30, -1, -22, 30, 50, -2, -27, 50, 80, -3, -33, 80, 120, -3, -38],
    'P7': [18, 30, -11, -32, 30, 50, -14, -39, 50, 80, -17, -47, 80, 120, -20, -55],
  }
};

const DimensionalControlView: React.FC<DimensionalControlViewProps> = ({ assets }) => {
  const [nominal, setNominal] = useState<string>('50');
  const [fitClass, setFitClass] = useState<string>('k6');
  const [type, setType] = useState<'shafts' | 'housings'>('shafts');

  const result = useMemo(() => {
    const D = parseFloat(nominal);
    if (isNaN(D) || D < 1) return null;

    const table = ISO_TABLES[type][fitClass];
    if (!table) return null;

    // Search range in flat table structure
    for (let i = 0; i < table.length; i += 4) {
      const min = table[i];
      const max = table[i + 1];
      if (D > min && D <= max) {
        const devUpper = table[i + 2];
        const devLower = table[i + 3];
        return {
          upper: D + devUpper / 1000,
          lower: D + devLower / 1000,
          tolerance: (devUpper - devLower) / 1000, // In mm
          devUpper: devUpper / 1000, // In mm
          devLower: devLower / 1000, // In mm
          devUpperMicrons: devUpper,
          devLowerMicrons: devLower
        };
      }
    }
    return null;
  }, [nominal, fitClass, type]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-light">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Controlo Dimensional</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <Ruler size={12} className="text-indigo-600" />
            Tolerâncias de Montagem ISO 286-2
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 h-fit">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Settings2 size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em]">Configuração de Ajuste</h3>
          </div>

          <div className="space-y-6">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <button 
                onClick={() => { setType('shafts'); setFitClass('k6'); }}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  type === 'shafts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Veio / Eixo
              </button>
              <button 
                onClick={() => { setType('housings'); setFitClass('H7'); }}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  type === 'housings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Caixa / Alojamento
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-light text-slate-500 uppercase tracking-widest block">Diâmetro Nominal (D)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 text-sm font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 uppercase font-bold">mm</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-light text-slate-500 uppercase tracking-widest block">Classe de Ajuste ISO</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(ISO_TABLES[type]).map((cls) => (
                  <button 
                    key={cls}
                    onClick={() => setFitClass(cls)}
                    className={`p-3 rounded-xl border text-[10px] font-bold transition-all text-center ${
                      fitClass === cls 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Result Display */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl min-h-[400px] flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
               <Target size={200} className="text-indigo-600" />
             </div>
             
             {result ? (
               <>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="flex-1 space-y-10">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Cálculo Técnico Final (Valores em mm)</p>
                          <h3 className="text-4xl font-extralight text-slate-900 tracking-tighter">
                            Ø {nominal} <span className="text-indigo-600 font-normal">{fitClass}</span>
                          </h3>
                       </div>

                       <div className="grid grid-cols-2 gap-10">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Limite Superior</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{result.upper.toFixed(3)} mm</p>
                            <span className="text-[9px] text-emerald-600 font-bold">+{result.devUpper.toFixed(3)} mm</span>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Limite Inferior</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{result.lower.toFixed(3)} mm</p>
                            <span className="text-[9px] text-rose-500 font-bold">{result.devLower >= 0 ? '+' : ''}{result.devLower.toFixed(3)} mm</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                          <div>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Tolerância Total (IT)</p>
                            <p className="text-sm font-black text-indigo-600">{result.tolerance.toFixed(3)} mm</p>
                          </div>
                          <div className="w-px h-8 bg-slate-100"></div>
                          <div className="flex-1">
                             <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Tipo de Ajuste</p>
                             <p className="text-xs font-bold text-slate-900">
                                {result.devLowerMicrons >= 0 && type === 'shafts' ? 'Interferência / Transição' : 'Folga / Transição'}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* BluePrint Visual Representation */}
                    <div className="w-full md:w-48 h-64 bg-slate-50 rounded-[32px] border border-slate-100 relative flex flex-col items-center justify-center p-6">
                       <div className="absolute w-full h-px bg-slate-300 left-0 top-1/2 -translate-y-1/2"></div>
                       <span className="absolute left-2 top-1/2 -translate-y-6 text-[8px] font-bold text-slate-400 uppercase">Linha Zero</span>
                       
                       {/* Tolerance Zone */}
                       <div 
                        className="w-12 bg-indigo-500/20 border-2 border-indigo-600 rounded-lg absolute transition-all duration-500"
                        style={{ 
                          height: `${Math.max(20, (result.tolerance * 1000) * 2)}px`,
                          top: `calc(50% - ${(result.devUpperMicrons) * 2}px)`
                        }}
                       >
                          <div className="h-full w-full flex items-center justify-center">
                             <span className="text-[8px] font-black text-indigo-600 -rotate-90 whitespace-nowrap">{fitClass}</span>
                          </div>
                       </div>

                       <div className="absolute bottom-4 text-[7px] text-slate-300 font-bold uppercase tracking-widest text-center">Esquema Metrológico</div>
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale py-20">
                  <Calculator size={60} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Diâmetro Nominal fora da gama de cálculo (18-120mm)</p>
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px]">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} /> Notas de Montagem Veio
                </h4>
                <p className="text-[11px] text-indigo-900/70 leading-relaxed font-medium">
                  Ajustes <strong>k6</strong> e <strong>m6</strong> são típicos para cargas rotativas no veio de máquinas rotativas, visando evitar o deslizamento do anel interno.
                </p>
             </div>
             <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px]">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} /> Notas de Alojamento
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Ajustes <strong>H7</strong> e <strong>J7</strong> permitem o deslocamento axial em rolamentos "livres" para acomodar a dilatação térmica.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionalControlView;
