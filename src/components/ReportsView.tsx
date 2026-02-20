
import React, { useState, useMemo } from 'react';
import { Asset, MaintenanceReport, UserRole } from '../types';
import { 
  FileText, Download, Printer, ChevronDown, 
  Calendar, MapPin, Activity, ShieldCheck, ClipboardList, Info, AlertTriangle,
  Plus, User, Clock, CheckCircle2, Save, X, Eye, FileSearch, History, Cpu
} from 'lucide-react';

interface ReportsViewProps {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
  userRole: UserRole;
}

const ReportsView: React.FC<ReportsViewProps> = ({ assets, onUpdateAsset, userRole }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Form State
  const [newReport, setNewReport] = useState<Partial<MaintenanceReport>>({
    anomalyDescription: '',
    diagnosis: '',
    recommendations: ''
  });

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  const reports = useMemo(() => selectedAsset?.reports || [], [selectedAsset]);
  const activeReport = useMemo(() => reports.find(r => r.id === selectedReportId), [reports, selectedReportId]);

  const handleSaveReport = () => {
    if (!selectedAsset || !newReport.anomalyDescription || !newReport.diagnosis) {
      alert("Por favor preencha a descrição e o diagnóstico.");
      return;
    }

    const report: MaintenanceReport = {
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: userRole === 'admin' ? 'Eng. Manutenção' : 'Operador Técnico',
      location: selectedAsset.location,
      severity: selectedAsset.severity,
      anomalyDescription: newReport.anomalyDescription!,
      diagnosis: newReport.diagnosis!,
      recommendations: newReport.recommendations || 'Nenhuma recomendação adicional.'
    };

    const updatedAsset: Asset = {
      ...selectedAsset,
      reports: [report, ...(selectedAsset.reports || [])]
    };

    onUpdateAsset(updatedAsset);
    setIsCreating(false);
    setNewReport({ anomalyDescription: '', diagnosis: '', recommendations: '' });
    setSelectedReportId(report.id);
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'A': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'B': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'C': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'D': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-light pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Centro de Relatórios Técnicos</h2>
          <p className="text-slate-500 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
            <ClipboardList size={12} className="text-indigo-600" />
            Consolidação Documental e Diagnóstico
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto relative z-10">
          <div className="relative w-full md:w-56 group">
            <select 
              value={selectedAssetId}
              onChange={(e) => { 
                setSelectedAssetId(e.target.value); 
                setIsCreating(false);
                setSelectedReportId(null);
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[11px] font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer"
            >
              {assets.map(a => <option key={a.id} value={a.id}>{a.name} - {a.location}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
          <button 
            onClick={() => { setIsCreating(true); setSelectedReportId(null); }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-light uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Plus size={14} /> Novo Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-light text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History size={14} className="text-indigo-600" /> Histórico ({reports.length})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                 {reports.map(report => (
                   <div 
                    key={report.id} 
                    onClick={() => { setSelectedReportId(report.id); setIsCreating(false); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                      selectedReportId === report.id 
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[8px] font-light text-slate-400 uppercase tracking-widest">
                           {new Date(report.timestamp).toLocaleDateString()}
                         </span>
                         <span className={`px-2 py-0.5 rounded-full text-[7px] font-light uppercase tracking-widest border ${getSeverityBadge(report.severity)}`}>
                           {report.severity}
                         </span>
                      </div>
                      <p className="text-[11px] font-light text-slate-900 truncate uppercase tracking-tight">TAG: {selectedAsset?.name}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="text-[8px] text-slate-400 font-light uppercase flex items-center gap-1"><User size={10} /> {report.author}</span>
                         <span className="text-[8px] text-slate-400 font-light uppercase flex items-center gap-1"><Clock size={10} /> {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                   </div>
                 ))}
                 {reports.length === 0 && !isCreating && (
                   <div className="py-20 text-center opacity-30">
                     <FileSearch size={32} className="mx-auto mb-4" />
                     <p className="text-[10px] font-light uppercase tracking-widest">Sem registos</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-2">
           {isCreating ? (
             <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                   <div>
                      <h3 className="text-sm font-light text-slate-900 uppercase tracking-widest">Abertura de Relatório Técnico</h3>
                      <p className="text-[9px] text-slate-400 font-light uppercase mt-1">TAG: {selectedAsset?.name} • {selectedAsset?.location}</p>
                   </div>
                   <button onClick={() => setIsCreating(false)} className="text-slate-300 hover:text-rose-500"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-light text-slate-400 uppercase tracking-widest ml-2">Descrição da Anomalia</label>
                      <textarea 
                        value={newReport.anomalyDescription} 
                        onChange={(e) => setNewReport({...newReport, anomalyDescription: e.target.value})}
                        placeholder="Descreva o desvio detetado (ex: ruído anormal no rolamento LA)..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-xs font-light outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[100px]"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-light text-slate-400 uppercase tracking-widest ml-2">Diagnóstico Técnico</label>
                      <textarea 
                        value={newReport.diagnosis} 
                        onChange={(e) => setNewReport({...newReport, diagnosis: e.target.value})}
                        placeholder="Análise da causa provável baseada nos dados e inspeção..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-xs font-light outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[120px]"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-light text-slate-400 uppercase tracking-widest ml-2">Zona de Recomendações</label>
                      <textarea 
                        value={newReport.recommendations} 
                        onChange={(e) => setNewReport({...newReport, recommendations: e.target.value})}
                        placeholder="Ações corretivas ou preventivas sugeridas..."
                        className="w-full bg-indigo-50/30 border border-indigo-100 rounded-[24px] p-6 text-xs font-light outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[100px]"
                      />
                   </div>
                </div>
                <div className="pt-8 border-t border-slate-50 flex gap-4">
                   <button onClick={() => setIsCreating(false)} className="px-8 py-4 text-[10px] font-light text-slate-400 uppercase tracking-widest">Cancelar</button>
                   <button 
                    onClick={handleSaveReport}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-light uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all"
                   >
                     <Save size={18} /> Validar e Arquivar Relatório
                   </button>
                </div>
             </div>
           ) : activeReport ? (
             <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-xl space-y-12 animate-in fade-in zoom-in-95 relative overflow-hidden print:shadow-none print:border-none">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none flex flex-col items-center">
                   <Cpu size={250} className="text-black" />
                   <h1 className="text-4xl font-extralight text-black tracking-tighter uppercase mt-4">ReliabilityTech</h1>
                </div>
                <div className="flex justify-between items-start relative z-10">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-light uppercase tracking-widest rounded-lg">ID: {activeReport.id}</div>
                         <div className={`px-3 py-1 rounded-lg text-[10px] font-light uppercase tracking-widest border ${getSeverityBadge(activeReport.severity)}`}>
                            Severidade: {activeReport.severity}
                         </div>
                      </div>
                      <h3 className="text-3xl font-extralight text-slate-900 tracking-tighter uppercase">Relatório de Inspeção</h3>
                      <p className="text-xs font-light text-slate-400 uppercase tracking-widest mt-1">{selectedAsset?.name} • {activeReport.location}</p>
                   </div>
                   <div className="flex gap-2 print:hidden">
                      <button onClick={() => window.print()} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-all"><Printer size={18} /></button>
                      <button onClick={() => setSelectedReportId(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl border border-slate-100 transition-all"><X size={18} /></button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 py-8 border-y border-slate-50">
                   <div>
                      <p className="text-[8px] font-light text-slate-400 uppercase tracking-widest mb-1">Data de Realização</p>
                      <p className="text-sm font-light text-slate-900">{new Date(activeReport.timestamp).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-light text-slate-400 uppercase tracking-widest mb-1">Hora do Registo</p>
                      <p className="text-sm font-light text-slate-900">{new Date(activeReport.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-light text-slate-400 uppercase tracking-widest mb-1">Utilizador Autor</p>
                      <p className="text-sm font-light text-slate-900">{activeReport.author}</p>
                   </div>
                </div>
                <div className="space-y-10 relative z-10">
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-light text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-500" /> Descrição da Anomalia
                      </h4>
                      <div className="bg-slate-50/50 p-6 rounded-[24px] text-xs font-light text-slate-700 leading-relaxed border border-slate-100">
                         {activeReport.anomalyDescription}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-light text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} className="text-indigo-600" /> Diagnóstico da Engenharia
                      </h4>
                      <div className="p-6 rounded-[24px] text-xs font-light text-slate-800 leading-relaxed border border-slate-50 bg-white">
                         {activeReport.diagnosis}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-light text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={14} /> Recomendações de Manutenção
                      </h4>
                      <div className="bg-emerald-50/30 p-6 rounded-[24px] text-xs font-light text-emerald-900 leading-relaxed border border-emerald-100 italic">
                         {activeReport.recommendations}
                      </div>
                   </div>
                </div>
                <div className="pt-10 border-t border-slate-50 flex justify-between items-center opacity-40">
                   <p className="text-[8px] font-light text-slate-400 uppercase tracking-widest italic">Documento gerado eletronicamente pela plataforma ReliabilityTech</p>
                   <ShieldCheck size={24} className="text-slate-300" />
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[48px] border border-slate-100 shadow-sm opacity-50">
                <div className="p-8 bg-slate-50 rounded-full mb-6 text-slate-200">
                   <FileSearch size={64} strokeWidth={1} />
                </div>
                <h3 className="text-sm font-light text-slate-400 mb-1">Selecione um relatório para visualizar</h3>
                <p className="text-[9px] text-slate-300 uppercase tracking-widest">Ou utilize o botão "Novo Relatório" para iniciar uma inspeção técnica</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
