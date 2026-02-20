
import React, { useState } from 'react';
import { Asset, FailureMode, UserRole } from '../types';
import { ClipboardList, Plus, Trash2, Info, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface FMECAViewProps {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
  userRole: UserRole;
}

const FMECAView: React.FC<FMECAViewProps> = ({ assets, onUpdateAsset, userRole }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const fmecaList = selectedAsset?.fmeca || [];

  const handleAddMode = () => {
    if (!selectedAsset) return;
    const newMode: FailureMode = {
      id: `fm-${Date.now()}`,
      component: 'Novo Componente',
      mode: 'Descrição da Falha',
      effect: 'Consequência',
      cause: 'Causa Provável',
      severity: 5,
      occurrence: 5,
      detection: 5,
      rpn: 125,
      action: 'Ação Recomendada',
      resSeverity: 5,
      resOccurrence: 5,
      resDetection: 5,
      resRPN: 125
    };
    onUpdateAsset({ ...selectedAsset, fmeca: [...fmecaList, newMode] });
  };

  const handleUpdateMode = (updatedMode: FailureMode) => {
    if (!selectedAsset) return;
    const newList = fmecaList.map(m => {
      if (m.id === updatedMode.id) {
        return { 
          ...updatedMode, 
          rpn: updatedMode.severity * updatedMode.occurrence * updatedMode.detection,
          resRPN: updatedMode.resSeverity * updatedMode.resOccurrence * updatedMode.resDetection
        };
      }
      return m;
    });
    onUpdateAsset({ ...selectedAsset, fmeca: newList });
  };

  const handleDeleteMode = (id: string) => {
    if (!selectedAsset) return;
    onUpdateAsset({ ...selectedAsset, fmeca: fmecaList.filter(m => m.id !== id) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Análise FMECA</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em]">Failure Mode, Effects and Criticality Analysis</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedAssetId}
            onChange={(e) => { setSelectedAssetId(e.target.value); }}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-light focus:ring-1 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
          >
            {assets.map(a => <option key={a.id} value={a.id} className="bg-white">{a.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-xl">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <ClipboardList size={16} className="text-indigo-600" />
            Matriz de Fiabilidade
          </h3>
          {userRole === 'admin' && (
            <button onClick={handleAddMode} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-widest">
              <Plus size={14} /> Adicionar Modo
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 font-bold">Componente</th>
                <th className="px-6 py-5 font-bold text-center bg-indigo-50/50">S</th>
                <th className="px-6 py-5 font-bold text-center bg-indigo-50/50">O</th>
                <th className="px-6 py-5 font-bold text-center bg-indigo-50/50">D</th>
                <th className="px-6 py-5 font-bold text-center bg-indigo-50/50">RPN</th>
                <th className="px-6 py-5 font-bold">Ação Corretiva</th>
                <th className="px-6 py-5 font-bold text-center bg-emerald-50/50">S'</th>
                <th className="px-6 py-5 font-bold text-center bg-emerald-50/50">O'</th>
                <th className="px-6 py-5 font-bold text-center bg-emerald-50/50">D'</th>
                <th className="px-6 py-5 font-bold text-center bg-emerald-50/50 border-r border-slate-100">RPN'</th>
                {userRole === 'admin' && <th className="px-6 py-5 text-center">---</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fmecaList.length > 0 ? fmecaList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 min-w-[180px]">
                    <input 
                      disabled={userRole !== 'admin'}
                      className="block w-full bg-transparent font-semibold text-slate-900 outline-none mb-1 focus:text-indigo-600 transition-colors" 
                      value={item.component} 
                      onChange={e => handleUpdateMode({...item, component: e.target.value})}
                    />
                    <input 
                      disabled={userRole !== 'admin'}
                      className="block w-full bg-transparent text-slate-400 outline-none text-[9px] font-bold" 
                      value={item.mode} 
                      onChange={e => handleUpdateMode({...item, mode: e.target.value})}
                    />
                  </td>
                  {/* Current Risk */}
                  <td className="px-3 py-5 bg-indigo-50/30">
                    <select disabled={userRole !== 'admin'} className="bg-transparent text-center w-full font-bold text-slate-900 outline-none cursor-pointer" value={item.severity} onChange={e => handleUpdateMode({...item, severity: parseInt(e.target.value)})}>
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-white">{i+1}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-5 bg-indigo-50/30">
                    <select disabled={userRole !== 'admin'} className="bg-transparent text-center w-full font-bold text-slate-900 outline-none cursor-pointer" value={item.occurrence} onChange={e => handleUpdateMode({...item, occurrence: parseInt(e.target.value)})}>
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-white">{i+1}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-5 bg-indigo-50/30">
                    <select disabled={userRole !== 'admin'} className="bg-transparent text-center w-full font-bold text-slate-900 outline-none cursor-pointer" value={item.detection} onChange={e => handleUpdateMode({...item, detection: parseInt(e.target.value)})}>
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-white">{i+1}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-5 text-center bg-indigo-50/30">
                    <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] shadow-sm ${
                      item.rpn > 200 ? 'bg-rose-500 text-white' : item.rpn > 100 ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'
                    }`}>
                      {item.rpn}
                    </span>
                  </td>
                  {/* Action */}
                  <td className="px-6 py-5 min-w-[200px]">
                    <textarea 
                      disabled={userRole !== 'admin'}
                      rows={2}
                      className="w-full bg-transparent text-slate-600 outline-none resize-none text-[10px] font-light focus:text-slate-900 transition-colors border-l border-slate-100 pl-4" 
                      value={item.action} 
                      onChange={e => handleUpdateMode({...item, action: e.target.value})}
                    />
                  </td>
                  {/* Residual Risk */}
                  <td className="px-3 py-5 bg-emerald-50/30">
                    <select disabled={userRole !== 'admin'} className="bg-transparent text-center w-full font-bold text-emerald-600 outline-none cursor-pointer" value={item.resSeverity} onChange={e => handleUpdateMode({...item, resSeverity: parseInt(e.target.value)})}>
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-white">{i+1}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-5 bg-emerald-50/30">
                    <select disabled={userRole !== 'admin'} className="bg-transparent text-center w-full font-bold text-emerald-600 outline-none cursor-pointer" value={item.resOccurrence} onChange={e => handleUpdateMode({...item, resOccurrence: parseInt(e.target.value)})}>
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-white">{i+1}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-5 bg-emerald-50/30">
                    <select disabled={userRole !== 'admin'} className="bg-transparent text-center w-full font-bold text-emerald-600 outline-none cursor-pointer" value={item.resDetection} onChange={e => handleUpdateMode({...item, resDetection: parseInt(e.target.value)})}>
                      {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-white">{i+1}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-5 text-center bg-emerald-50/30 border-r border-slate-100">
                    <div className="flex flex-col items-center">
                      <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] shadow-sm ${
                        item.resRPN > 200 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {item.resRPN}
                      </span>
                      {item.rpn > item.resRPN && (
                        <div className="flex items-center gap-1 mt-1 text-[8px] text-emerald-600 font-bold uppercase">
                          <ArrowRight size={8} /> -{Math.round(((item.rpn - item.resRPN) / item.rpn) * 100)}%
                        </div>
                      )}
                    </div>
                  </td>
                  {userRole === 'admin' && (
                    <td className="px-4 py-5 text-center">
                      <button onClick={() => handleDeleteMode(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="px-8 py-24 text-center text-slate-300 italic font-light uppercase tracking-widest text-[10px]">Análise Pendente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default FMECAView;
