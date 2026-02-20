
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Asset, RCARecord, FiveWhys, IshikawaData, RCAAction, FaultTreeNode, RCAAttachment } from '../types';
import { 
  SearchCode, GitPullRequest, HelpCircle, LayoutGrid, 
  CheckCircle2, Trash2, Plus, ChevronDown, Info, 
  AlertCircle, ArrowRight, User, Calendar, Save, ClipboardList, X, Loader2, History, Eye, 
  Network, Camera, Image as ImageIcon, Zap, Link as LinkIcon, PlusCircle, MinusCircle,
  Clock, CheckCircle, AlertTriangle, Lock, Unlock
} from 'lucide-react';

interface RCAViewProps {
  assets: Asset[];
}

type Methodology = 'history' | '5whys' | 'ishikawa' | 'faulttree' | 'evidence' | 'actionplan';

const RCAView: React.FC<RCAViewProps> = ({ assets }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [activeMethod, setActiveMethod] = useState<Methodology>('history');
  const [isSaving, setIsSaving] = useState(false);
  const [rcaHistory, setRcaHistory] = useState<RCARecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados dos Formulários
  const [caseStatus, setCaseStatus] = useState<'open' | 'closed'>('open');
  const [fiveWhys, setFiveWhys] = useState<FiveWhys>({ problem: '', whys: ['', '', '', '', ''], rootCause: '' });
  const [ishikawa, setIshikawa] = useState<IshikawaData>({ machine: [], method: [], manpower: [], material: [], measurement: [], environment: [] });
  const [faultTree, setFaultTree] = useState<FaultTreeNode>({ id: 'root', label: 'Evento Topo (Falha)', gate: 'OR', children: [] });
  const [attachments, setAttachments] = useState<RCAAttachment[]>([]);
  const [actions, setActions] = useState<RCAAction[]>([]);
  
  // Estados Auxiliares para inserção
  const [addingToCategory, setAddingToCategory] = useState<keyof IshikawaData | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [newAction, setNewAction] = useState<Partial<RCAAction>>({ what: '', who: '', when: '', status: 'pending' });

  useEffect(() => {
    const saved = localStorage.getItem('reliability-rca-history');
    if (saved) setRcaHistory(JSON.parse(saved));
  }, []);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  const filteredHistory = useMemo(() => rcaHistory.filter(h => h.assetId === selectedAssetId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [rcaHistory, selectedAssetId]);

  // --- Funções Ishikawa ---
  const handleAddItemToIshikawa = (category: keyof IshikawaData) => {
    if (!newItemText.trim()) return;
    setIshikawa(prev => ({
      ...prev,
      [category]: [...prev[category], newItemText.trim()]
    }));
    setNewItemText('');
    setAddingToCategory(null);
  };

  const handleRemoveItemFromIshikawa = (category: keyof IshikawaData, index: number) => {
    setIshikawa(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  // --- Funções FTA (Árvore de Falhas) ---
  const addNode = (parentId: string) => {
    const newNode: FaultTreeNode = { id: Math.random().toString(36).substr(2, 9), label: 'Nova Causa/Evento', gate: 'NONE', children: [] };
    const updateTree = (node: FaultTreeNode): FaultTreeNode => {
      if (node.id === parentId) return { ...node, children: [...node.children, newNode] };
      return { ...node, children: node.children.map(updateTree) };
    };
    setFaultTree(updateTree(faultTree));
  };

  const updateNode = (id: string, updates: Partial<FaultTreeNode>) => {
    const updateTree = (node: FaultTreeNode): FaultTreeNode => {
      if (node.id === id) return { ...node, ...updates };
      return { ...node, children: node.children.map(updateTree) };
    };
    setFaultTree(updateTree(faultTree));
  };

  const removeNode = (id: string) => {
    if (id === 'root') return;
    const updateTree = (node: FaultTreeNode): FaultTreeNode => ({
      ...node,
      children: node.children.filter(c => c.id !== id).map(updateTree)
    });
    setFaultTree(updateTree(faultTree));
  };

  // --- Funções de Anexos ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: RCAAttachment = { id: Date.now().toString() + Math.random(), name: file.name, data: reader.result as string, type: file.type };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id));

  // --- Funções de Ações ---
  const handleAddAction = () => {
    if (!newAction.what || !newAction.who) return;
    const action: RCAAction = {
      id: Date.now().toString(),
      what: newAction.what!,
      who: newAction.who!,
      when: newAction.when || new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setActions(prev => [...prev, action]);
    setNewAction({ what: '', who: '', when: '', status: 'pending' });
  };

  const removeAction = (id: string) => setActions(prev => prev.filter(a => a.id !== id));

  const updateActionStatus = (id: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  // --- Gravação e Histórico ---
  const handleSaveRCA = () => {
    if (!fiveWhys.problem) { alert("Defina o problema no separador 5 Porquês."); return; }
    setIsSaving(true);
    const newRecord: RCARecord = {
      id: `rca-${Date.now()}`,
      assetId: selectedAssetId,
      timestamp: new Date().toISOString(),
      methodology: 'Análise Multidimensional',
      status: caseStatus,
      fiveWhys, ishikawa, faultTree, attachments, actions
    };
    
    const updatedHistory = [...rcaHistory.filter(r => r.id !== newRecord.id), newRecord];
    
    setTimeout(() => {
      setRcaHistory(updatedHistory);
      localStorage.setItem('reliability-rca-history', JSON.stringify(updatedHistory));
      setIsSaving(false);
      setActiveMethod('history');
    }, 1200);
  };

  const loadAnalysis = (record: RCARecord) => {
    setCaseStatus(record.status || 'open');
    setFiveWhys(record.fiveWhys);
    setIshikawa(record.ishikawa);
    setFaultTree(record.faultTree || { id: 'root', label: 'Evento Topo', gate: 'OR', children: [] });
    setAttachments(record.attachments || []);
    setActions(record.actions);
    setActiveMethod('5whys');
  };

  const clearForm = () => {
    setCaseStatus('open');
    setFiveWhys({ problem: '', whys: ['', '', '', '', ''], rootCause: '' });
    setIshikawa({ machine: [], method: [], manpower: [], material: [], measurement: [], environment: [] });
    setFaultTree({ id: 'root', label: 'Evento Topo', gate: 'OR', children: [] });
    setAttachments([]);
    setActions([]);
    setActiveMethod('5whys');
  };

  if (!selectedAssetId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8 animate-in fade-in duration-700">
         <div className="bg-indigo-600/10 p-10 rounded-full border border-indigo-100"><SearchCode size={64} className="text-indigo-600" /></div>
         <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-extralight text-slate-900 tracking-tight uppercase">Módulo de Engenharia RCA</h2>
            <p className="text-slate-500 text-xs font-light">Selecione o Ativo para iniciar a investigação de causa raiz.</p>
         </div>
         <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="w-full max-w-sm pl-6 pr-12 py-4 bg-white border-2 border-slate-100 rounded-[32px] text-slate-900 text-sm font-semibold outline-none shadow-xl hover:shadow-indigo-100 transition-all appearance-none cursor-pointer">
            <option value="" disabled>Selecionar TAG...</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name} - {a.location}</option>)}
         </select>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">TAG: {selectedAsset?.name}</div>
             <button onClick={() => setSelectedAssetId('')} className="text-[9px] font-bold text-slate-400 hover:text-rose-600 uppercase transition-colors"><Trash2 size={10} /></button>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mt-2">Investigação de Falhas</h2>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[24px] border border-slate-200 shadow-inner overflow-x-auto no-scrollbar max-w-full">
           <MethodTab active={activeMethod === 'history'} onClick={() => setActiveMethod('history')} icon={<History size={14} />} label="Histórico" />
           <MethodTab active={activeMethod === '5whys'} onClick={() => setActiveMethod('5whys')} icon={<HelpCircle size={14} />} label="5 Porquês" />
           <MethodTab active={activeMethod === 'ishikawa'} onClick={() => setActiveMethod('ishikawa')} icon={<LayoutGrid size={14} />} label="Ishikawa" />
           <MethodTab active={activeMethod === 'faulttree'} onClick={() => setActiveMethod('faulttree')} icon={<Network size={14} />} label="FTA" />
           <MethodTab active={activeMethod === 'evidence'} onClick={() => setActiveMethod('evidence')} icon={<Camera size={14} />} label="Evidências" />
           <MethodTab active={activeMethod === 'actionplan'} onClick={() => setActiveMethod('actionplan')} icon={<CheckCircle2 size={14} />} label="Ações" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* --- HISTÓRICO --- */}
        {activeMethod === 'history' && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><History size={18} className="text-indigo-600" /> Histórico do Ativo</h3>
                <button onClick={clearForm} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl flex items-center gap-2"><Plus size={14} /> Nova RCA</button>
             </div>
             {filteredHistory.length > 0 ? (
                <div className="grid gap-4">
                   {filteredHistory.map(record => (
                      <div key={record.id} onClick={() => loadAnalysis(record)} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[32px] hover:border-indigo-300 hover:bg-white cursor-pointer shadow-sm transition-all">
                         <div className="flex items-start gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600"><ClipboardList size={20} /></div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(record.timestamp).toLocaleString()}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                                    record.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                  }`}>
                                    {record.status === 'open' ? 'Aberto' : 'Fechado'}
                                  </span>
                               </div>
                               <h4 className="text-sm font-bold text-slate-900">{record.fiveWhys.problem}</h4>
                               <div className="flex gap-4 mt-2">
                                  <span className="text-[9px] text-slate-400 flex items-center gap-1"><ImageIcon size={10} /> {record.attachments?.length || 0} Fotos</span>
                                  <span className="text-[9px] text-slate-400 flex items-center gap-1"><Network size={10} /> {record.actions.length} Ações</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 shadow-sm">Editar</button>
                         </div>
                      </div>
                   ))}
                </div>
             ) : <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Sem registos para este ativo</div>}
          </div>
        )}

        {/* --- 5 PORQUÊS --- */}
        {activeMethod === '5whys' && (
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle size={14} className="text-rose-500" /> Definição do Evento de Falha
                 </h3>
              </div>
              <textarea 
                value={fiveWhys.problem} 
                onChange={(e) => setFiveWhys({...fiveWhys, problem: e.target.value})} 
                placeholder="Qual foi o problema detetado?" 
                className="w-full bg-slate-50 border border-slate-100 rounded-[28px] p-6 text-sm font-semibold outline-none min-h-[120px] focus:ring-2 focus:ring-indigo-500/10 transition-all" 
              />
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aprofundamento (Cadeia de Causalidade)</h3>
                 {fiveWhys.whys.map((why, idx) => (
                    <div key={idx} className="flex gap-6 items-center group">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-all">
                         {idx+1}º
                       </div>
                       <input 
                        value={why} 
                        onChange={(e) => { const n = [...fiveWhys.whys]; n[idx] = e.target.value; setFiveWhys({...fiveWhys, whys: n}); }} 
                        className="flex-1 bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-xs font-semibold shadow-sm outline-none focus:border-indigo-300 transition-all" 
                        placeholder="Porquê isto aconteceu?" 
                       />
                    </div>
                 ))}
              </div>
              <div className="pt-6 space-y-4">
                 <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Causa Raiz Identificada</h3>
                 <textarea 
                  value={fiveWhys.rootCause} 
                  onChange={(e) => setFiveWhys({...fiveWhys, rootCause: e.target.value})} 
                  placeholder="Conclusão final da investigação 5 Porquês..." 
                  className="w-full bg-emerald-50 border border-emerald-100 rounded-[28px] p-6 text-sm font-semibold outline-none min-h-[80px]" 
                 />
              </div>
           </div>
        )}

        {/* --- ISHIKAWA --- */}
        {activeMethod === 'ishikawa' && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><LayoutGrid size={18} className="text-indigo-600" /> Diagrama de Ishikawa (6M)</h3>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Mapeamento de causas por categoria</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(['machine', 'method', 'manpower', 'material', 'measurement', 'environment'] as Array<keyof IshikawaData>).map(cat => (
                  <div key={cat} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                     <div className="flex justify-between items-center">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {cat === 'machine' ? 'Máquina' : cat === 'method' ? 'Método' : cat === 'manpower' ? 'Mão-de-Obra' : cat === 'material' ? 'Material' : cat === 'measurement' ? 'Medição' : 'Meio Ambiente'}
                        </h4>
                        <button onClick={() => setAddingToCategory(cat)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition-colors"><Plus size={16} /></button>
                     </div>
                     <div className="space-y-2">
                        {ishikawa[cat].map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm group">
                              <span className="text-[10px] font-bold text-slate-700">{item}</span>
                              <button onClick={() => handleRemoveItemFromIshikawa(cat, idx)} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={12} /></button>
                           </div>
                        ))}
                        {ishikawa[cat].length === 0 && !addingToCategory && <p className="text-[8px] text-slate-300 uppercase tracking-widest text-center py-2">Sem causas</p>}
                     </div>
                     {addingToCategory === cat && (
                       <div className="flex gap-2 animate-in slide-in-from-top-2">
                          <input autoFocus value={newItemText} onChange={(e) => setNewItemText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItemToIshikawa(cat)} className="flex-1 text-[10px] px-3 py-2 bg-white border border-indigo-200 rounded-xl outline-none" placeholder="Descrever causa..." />
                          <button onClick={() => handleAddItemToIshikawa(cat)} className="bg-indigo-600 text-white p-2 rounded-xl"><Plus size={14} /></button>
                          <button onClick={() => setAddingToCategory(null)} className="text-slate-400"><X size={14} /></button>
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* --- FTA --- */}
        {activeMethod === 'faulttree' && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
             <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex items-center gap-4">
                <Info size={20} className="text-indigo-600" />
                <p className="text-[11px] text-indigo-900/70 font-medium leading-relaxed">A Árvore de Falhas utiliza lógica booleana para mapear combinações de eventos.</p>
             </div>
             <div className="p-12 bg-slate-50 rounded-[40px] border border-slate-100 overflow-x-auto min-h-[500px] flex justify-center">
                <TreeNode node={faultTree} onAdd={addNode} onUpdate={updateNode} onRemove={removeNode} />
             </div>
          </div>
        )}

        {/* --- EVIDÊNCIAS --- */}
        {activeMethod === 'evidence' && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><Camera size={18} className="text-indigo-600" /> Galeria de Evidências</h3>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl"><ImageIcon size={16} /> Adicionar Fotos</button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} multiple accept="image/*" className="hidden" />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {attachments.map(att => (
                  <div key={att.id} className="group relative aspect-square bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 shadow-sm transition-all hover:scale-[1.02]">
                     <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => removeAttachment(att.id)} className="p-3 bg-white text-rose-500 rounded-2xl shadow-xl hover:bg-rose-50 transition-colors"><Trash2 size={18} /></button>
                     </div>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-300 transition-all">
                   <Plus size={32} strokeWidth={1} />
                   <span className="text-[9px] font-black uppercase mt-2">Upload</span>
                </button>
             </div>
          </div>
        )}

        {/* --- PLANO DE AÇÕES --- */}
        {activeMethod === 'actionplan' && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
             <div className="flex justify-between items-end gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-4 flex-1">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                     <CheckCircle2 size={18} className="text-indigo-600" /> Definição de Contramedidas
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Ação Corretiva</label>
                         <input value={newAction.what} onChange={(e) => setNewAction({...newAction, what: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" placeholder="O que fazer?" />
                      </div>
                      <div>
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Responsável</label>
                         <input value={newAction.who} onChange={(e) => setNewAction({...newAction, who: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" placeholder="Nome" />
                      </div>
                      <div className="flex gap-2 items-end">
                         <div className="flex-1">
                           <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Prazo</label>
                           <input type="date" value={newAction.when} onChange={(e) => setNewAction({...newAction, when: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" />
                         </div>
                         <button onClick={handleAddAction} className="bg-indigo-600 text-white p-3.5 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"><Plus size={18} /></button>
                      </div>
                   </div>
                </div>
                
                {/* Switch de Estado do Caso */}
                <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-[32px] border border-slate-100 min-w-[140px]">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Estado do Caso</p>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setCaseStatus('open')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${caseStatus === 'open' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}>Aberto</button>
                      <button onClick={() => setCaseStatus('closed')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${caseStatus === 'closed' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}>Fechado</button>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ações Listadas ({actions.length})</h4>
                {actions.map(action => (
                   <div key={action.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:border-indigo-100 transition-all group">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                           action.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                           action.status === 'in-progress' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300'
                         }`}>
                           {action.status === 'completed' ? <CheckCircle size={22} /> : action.status === 'in-progress' ? <Clock size={22} /> : <AlertTriangle size={22} />}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">{action.what}</p>
                            <div className="flex gap-4 mt-1">
                               <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1"><User size={10} /> {action.who}</span>
                               <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1"><Calendar size={10} /> {action.when}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                         <div className="relative group/sel">
                            <select 
                              value={action.status} 
                              onChange={(e) => updateActionStatus(action.id, e.target.value as any)}
                              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all cursor-pointer ${
                                action.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                action.status === 'in-progress' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                              }`}
                            >
                               <option value="pending">Pendente</option>
                               <option value="in-progress">Em Curso</option>
                               <option value="completed">Concluído</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
                         </div>
                         <button onClick={() => removeAction(action.id)} className="text-slate-200 hover:text-rose-500 p-2 transition-all"><Trash2 size={16} /></button>
                      </div>
                   </div>
                ))}
                {actions.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma ação definida</p></div>
                )}
             </div>

             <div className="pt-10 border-t border-slate-50">
                <button 
                  onClick={handleSaveRCA} 
                  disabled={isSaving}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-indigo-700 shadow-2xl transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                  {isSaving ? 'A Processar...' : `Gravar Investigação (Caso ${caseStatus === 'open' ? 'Aberto' : 'Fechado'})`}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Recursivo para Árvore de Falhas
const TreeNode = ({ node, onAdd, onUpdate, onRemove }: { node: FaultTreeNode, onAdd: (id: string) => void, onUpdate: (id: string, updates: any) => void, onRemove: (id: string) => void }) => (
  <div className="flex flex-col items-center space-y-8">
     <div className="relative group p-6 bg-white border border-slate-200 rounded-[32px] shadow-sm min-w-[240px] max-w-[300px] transition-all hover:border-indigo-500 hover:shadow-xl">
        <div className="flex justify-between items-center mb-4">
           <select 
            value={node.gate} 
            onChange={(e) => onUpdate(node.id, { gate: e.target.value })}
            className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border outline-none cursor-pointer ${
              node.gate === 'AND' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
              node.gate === 'OR' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}
           >
              <option value="NONE">Evento Final</option>
              <option value="OR">Porta OU (OR)</option>
              <option value="AND">Porta E (AND)</option>
           </select>
           {node.id !== 'root' && <button onClick={() => onRemove(node.id)} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><MinusCircle size={14} /></button>}
        </div>
        <textarea 
          value={node.label} 
          onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none resize-none no-scrollbar h-auto min-h-[44px] text-center"
          placeholder="Descrever causa..."
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => onAdd(node.id)} className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"><PlusCircle size={16} /></button>
        </div>
        {node.gate !== 'NONE' && (
          <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 flex flex-col items-center">
             <div className="w-0.5 h-4 bg-slate-200" />
             <div className={`p-1 rounded-md border text-[7px] font-black uppercase ${
               node.gate === 'OR' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200'
             }`}>{node.gate}</div>
          </div>
        )}
     </div>
     {node.children.length > 0 && (
       <div className="flex gap-12 pt-12 border-t-2 border-slate-100 relative">
          <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-100"></div>
          {node.children.map(child => (
             <TreeNode key={child.id} node={child} onAdd={onAdd} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
       </div>
     )}
  </div>
);

const MethodTab = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-[18px] text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-indigo-600 shadow-lg scale-[1.05]' : 'text-slate-400 hover:text-slate-600'}`}>{icon} {label}</button>
);

export default RCAView;
