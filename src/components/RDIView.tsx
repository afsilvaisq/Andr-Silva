
import React, { useState, useRef, useMemo } from 'react';
import { Asset } from '../types';
import { 
  Video, Upload, Play, Trash2, Maximize2, 
  ChevronDown, Activity, Info, Zap, Layers, MonitorPlay 
} from 'lucide-react';

interface RDIViewProps {
  assets: Asset[];
}

interface RDIVideoRecord {
  assetId: string;
  url: string;
  name: string;
  timestamp: string;
  analysisType: string;
}

const RDIView: React.FC<RDIViewProps> = ({ assets }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [videoRecords, setVideoRecords] = useState<RDIVideoRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  
  const currentAssetVideos = useMemo(() => {
    return videoRecords.filter(v => v.assetId === selectedAssetId);
  }, [videoRecords, selectedAssetId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedAssetId) {
      setIsUploading(true);
      // Simulação de processamento de amplificação
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        const newRecord: RDIVideoRecord = {
          assetId: selectedAssetId,
          url,
          name: file.name,
          timestamp: new Date().toISOString(),
          analysisType: 'Full Spectrum Amplification'
        };
        setVideoRecords(prev => [newRecord, ...prev]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2000);
    }
  };

  const removeVideo = (url: string) => {
    setVideoRecords(prev => prev.filter(v => v.url !== url));
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-light pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Motion Amplification (RDI)</h2>
          <p className="text-slate-400 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <MonitorPlay size={12} className="text-indigo-600" />
            Visualização de Vibração por Vídeo Spectral
          </p>
        </div>
        
        <div className="relative w-full md:w-64 group">
          <select 
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px] font-light focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer shadow-sm"
          >
            {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Painel de Upload e Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Upload size={14} className="text-indigo-600" /> Carregar Gravação
            </h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-square rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                isUploading ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="video/*" 
              />
              {isUploading ? (
                <div className="space-y-4 animate-pulse">
                  <Activity className="text-indigo-600 w-10 h-10 mx-auto" />
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Amplificando Movimento...</p>
                </div>
              ) : (
                <>
                  <Video className="text-slate-200 w-12 h-12 mb-4" />
                  <p className="text-xs font-bold text-slate-400">Clique para selecionar vídeo</p>
                  <p className="text-[8px] text-slate-300 uppercase tracking-widest mt-2">MP4, MOV ou AVI</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Layers size={100} />
             </div>
             <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
               <Info size={14} /> Notas de Análise
             </h4>
             <p className="text-[11px] leading-relaxed text-indigo-100/70 font-light italic">
               A tecnologia RDI transforma cada pixel da câmara num sensor de vibração. Utilize filtros de banda para isolar frequências específicas de rolamentos ou desequilíbrio.
             </p>
             <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  <span>Modo Ativo</span>
                  <span className="text-emerald-400">Alta Resolução</span>
                </div>
             </div>
          </div>
        </div>

        {/* Galeria de Vídeos Amplificados */}
        <div className="xl:col-span-3">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm min-h-[600px]">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                 <MonitorPlay size={18} className="text-indigo-600" /> Galeria de Ativo: {selectedAsset?.name}
               </h3>
               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 {currentAssetVideos.length} Registos Encontrados
               </div>
            </div>

            {currentAssetVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
                {currentAssetVideos.map((video, idx) => (
                  <div key={idx} className="group relative bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl transition-all hover:scale-[1.01]">
                    <div className="aspect-video relative overflow-hidden">
                      <video 
                        src={video.url} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        controls
                      />
                      {/* Simulador de Overlay RDI */}
                      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
                         <div className="absolute inset-0 border border-emerald-500/20 grid grid-cols-4 grid-rows-4">
                            {Array.from({length: 16}).map((_, i) => <div key={i} className="border border-emerald-500/5"></div>)}
                         </div>
                      </div>
                      {/* Tags de Overlay */}
                      <div className="absolute top-4 left-4 flex gap-2">
                         <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[7px] font-black text-emerald-400 uppercase border border-emerald-500/20 tracking-widest">
                            Motion x10
                         </div>
                         <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[7px] font-black text-indigo-400 uppercase border border-indigo-500/20 tracking-widest">
                            {video.analysisType}
                         </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex justify-between items-center bg-slate-900">
                       <div className="text-left">
                          <p className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[150px]">{video.name}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                             {new Date(video.timestamp).toLocaleDateString()} • {new Date(video.timestamp).toLocaleTimeString()}
                          </p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => removeVideo(video.url)} className="p-3 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-xl transition-all border border-slate-700">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-32 opacity-30">
                 <Video size={64} className="text-slate-200 mb-6" strokeWidth={1} />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nenhuma Análise RDI para este Ativo</p>
                 <p className="text-[9px] text-slate-300 uppercase mt-2">Carregue um vídeo capturado para iniciar a amplificação.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RDIView;
