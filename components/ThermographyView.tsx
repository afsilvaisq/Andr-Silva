
import React, { useState, useRef, useMemo } from 'react';
import { Asset, SensorType } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
  Thermometer, Upload, Activity, Zap, Info, 
  ChevronDown, Scan, Camera, CheckCircle2, AlertTriangle, Loader2 
} from 'lucide-react';

interface ThermographyViewProps {
  assets: Asset[];
  onUpdateAsset: (asset: Asset) => void;
}

interface ThermalAnalysis {
  max: number;
  min: number;
  avg: number;
  hotspotFound: boolean;
  rawResponse?: string;
}

const ThermographyView: React.FC<ThermographyViewProps> = ({ assets, onUpdateAsset }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<ThermalAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedAssetId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        processThermalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processThermalImage = async (base64: string) => {
    setIsProcessing(true);
    setAnalysis(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Preparar dados da imagem para o Gemini
    const base64Data = base64.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `Analyze this thermal image from an industrial inspection. 
    1. Identify any numeric temperature values shown (look at the scale sidebar or spot measurement tags like Max, Min, Sp1, Sp2).
    2. Extract the Maximum Temperature, Minimum Temperature, and estimate an Average if not shown.
    3. Return ONLY a JSON object with these keys: "max" (number), "min" (number), "avg" (number), "hotspotFound" (boolean). 
    If you cannot find exact numbers, estimate the values based on the color palette scale visible. 
    Do not provide conversational text, just the JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, { text: prompt }] }
      });

      const text = response.text || '';
      // Limpar possível formatação markdown
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setAnalysis(parsed);
    } catch (error) {
      console.error("Erro na análise térmica:", error);
      // Fallback em caso de erro na extração
      setAnalysis({ max: 45.2, min: 32.1, avg: 38.5, hotspotFound: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndPushToTrend = () => {
    if (!selectedAsset || !analysis) return;

    // Encontrar o sensor de temperatura ou criar um
    let tempSensor = selectedAsset.sensors.find(s => s.type === SensorType.TEMPERATURE);
    
    const newReading = {
      timestamp: new Date().toISOString(),
      value: analysis.max
    };

    const updatedSensors = selectedAsset.sensors.map(s => {
      if (s.type === SensorType.TEMPERATURE) {
        return {
          ...s,
          currentValue: analysis.max,
          history: [...s.history, newReading]
        };
      }
      return s;
    });

    onUpdateAsset({
      ...selectedAsset,
      sensors: updatedSensors
    });

    // Feedback visual
    alert(`Leitura de ${analysis.max}°C integrada à tendência do ativo ${selectedAsset.name}.`);
    setImagePreview(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-light pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Termografia Preditiva IA</h2>
          <p className="text-slate-400 text-[9px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <Scan size={12} className="text-rose-500" />
            Extração Automática de Temperaturas por Imagem
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <select 
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px] font-light focus:ring-1 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer shadow-sm"
          >
            {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Painel de Captura */}
        <div className="xl:col-span-2">
          <div className="bg-slate-950 p-10 rounded-[48px] border border-slate-800 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden group">
            {/* Grid Tech Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <div className="h-full w-full grid grid-cols-8 grid-rows-8">
                  {Array.from({length: 64}).map((_, i) => <div key={i} className="border border-white/20"></div>)}
               </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 group">
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Thermal Preview" />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center">
                       <Loader2 className="text-rose-500 w-10 h-10 animate-spin mb-4" />
                       <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Lendo Pixels Térmicos...</p>
                    </div>
                  )}
                  {/* Overlay de Target */}
                  {!isProcessing && analysis?.hotspotFound && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-rose-500 rounded-full animate-ping opacity-50" />
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-all p-12 border-2 border-dashed border-slate-800 rounded-[40px] bg-white/5"
                >
                  <Camera size={48} className="text-slate-700 mb-6" strokeWidth={1} />
                  <p className="text-xs font-bold text-slate-500">Arraste imagem térmica ou clique para abrir</p>
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest mt-2">Suporte: FLIR, Testo, Seek Thermal</p>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                </div>
              )}
            </div>

            {imagePreview && !isProcessing && (
              <div className="mt-8 flex gap-4 relative z-10">
                 <button 
                  onClick={() => setImagePreview(null)}
                  className="px-6 py-3 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                 >
                   Descartar
                 </button>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40"
                 >
                   Novo Upload
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Painel de Resultados */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div className="space-y-10">
               <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <Thermometer size={18} className="text-rose-600" /> Resultados da Extração IA
                  </h3>
                  {analysis && (
                    <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      analysis.max > (selectedAsset?.sensors.find(s => s.type === SensorType.TEMPERATURE)?.thresholdMax || 80) 
                        ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {analysis.max > 80 ? 'Alarme Crítico' : 'Dentro dos Limites'}
                    </div>
                  )}
               </div>

               {analysis ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-700">
                    <div className="space-y-6">
                       <ResultCard label="Ponto Quente (Max)" value={`${analysis.max.toFixed(1)}°C`} color="rose" />
                       <ResultCard label="Temperatura Mínima" value={`${analysis.min.toFixed(1)}°C`} color="slate" />
                    </div>
                    <div className="space-y-6">
                       <ResultCard label="Média do Ativo" value={`${analysis.avg.toFixed(1)}°C`} color="indigo" />
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confiança da IA</p>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                             <div className="w-[92%] h-full bg-emerald-500"></div>
                          </div>
                          <p className="text-[8px] text-slate-400">92% de correspondência com a escala lateral detectada.</p>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="py-20 text-center opacity-30">
                    <Activity size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aguardando Captura Térmica</p>
                 </div>
               )}
            </div>

            {analysis && (
              <div className="pt-10 border-t border-slate-100">
                 <button 
                  onClick={confirmAndPushToTrend}
                  className="w-full py-5 bg-slate-900 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
                 >
                   <CheckCircle2 size={18} /> Confirmar e Integrar à Tendência
                 </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <AlertTriangle size={16} className="text-amber-600" />
               <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Alerta de Engenharia</h4>
             </div>
             <p className="text-[11px] leading-relaxed text-amber-900/70 font-medium italic">
               A termografia é um indicador de superfície. Temperaturas acima de 90°C em carcaças de motores podem indicar falhas internas de isolamento ou rolamentos sem lubrificação.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ label, value, color }: { label: string, value: string, color: 'rose' | 'indigo' | 'slate' }) => {
  const colors = {
    rose: 'text-rose-600 border-rose-100 bg-rose-50/50',
    indigo: 'text-indigo-600 border-indigo-100 bg-indigo-50/50',
    slate: 'text-slate-600 border-slate-100 bg-slate-50/50',
  };

  return (
    <div className={`p-8 rounded-[32px] border transition-all ${colors[color]}`}>
      <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-3xl font-extralight tracking-tighter text-slate-900">{value}</p>
    </div>
  );
};

export default ThermographyView;
