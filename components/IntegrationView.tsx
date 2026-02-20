
import React, { useState } from 'react';
import { Asset, SensorType } from '../types';
import { 
  Link as LinkIcon, 
  Terminal, 
  Copy, 
  Check, 
  Activity, 
  Cpu, 
  Globe, 
  FileJson,
  Upload,
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface IntegrationViewProps {
  assets: Asset[];
  onIncomingData: (assetId: string, sensorType: SensorType, value: number) => void;
}

const IntegrationView: React.FC<IntegrationViewProps> = ({ assets, onIncomingData }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'files'>('api');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiExample = `{
  "assetId": "a1",
  "sensorType": "vibration",
  "value": 3.45,
  "timestamp": "${new Date().toISOString()}"
}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-light">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-extralight text-slate-900 tracking-tight uppercase">Central de Integrações</h2>
          <p className="text-slate-500 text-[10px] font-light uppercase tracking-[0.2em] flex items-center gap-2">
            <LinkIcon size={12} className="text-indigo-600" />
            Conectividade e Ingestão de Dados
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('api')}
          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'api' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          REST API / Webhooks
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === 'files' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Relatórios AMS/CSI
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
        <div className="xl:col-span-2 space-y-8">
          {activeTab === 'api' && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
              <div className="flex items-center gap-4">
                <Globe className="text-indigo-600" size={24} />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ingestão via Webhook</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronização em Tempo Real</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Endpoint Estruturado</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Utilize o nosso endpoint de telemetria industrial para ligar os seus CLPs, gateways IIoT ou software de terceiros diretamente à plataforma.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Exemplo de Payload JSON</h4>
                   <button 
                    onClick={() => handleCopy(apiExample)}
                    className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest"
                   >
                     {copied ? <Check size={12} /> : <Copy size={12} />}
                     Copiar JSON
                   </button>
                </div>
                <pre className="bg-slate-900 p-8 rounded-[40px] text-indigo-300 text-xs font-mono shadow-2xl overflow-x-auto">
                  {apiExample}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
              <div className="flex items-center gap-4">
                <Database className="text-indigo-600" size={24} />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Importação de Histórico</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Compatibilidade Emerson AMS Manager</p>
                </div>
              </div>
              <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-start gap-6">
                 <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600">
                    <Upload size={24} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-bold text-indigo-900">Processamento de Ficheiros .TXT</p>
                    <p className="text-[11px] text-indigo-800/70 leading-relaxed">
                      O motor de importação deteta automaticamente TAGs de ativos, pontos de medição e unidades (mm/s e G-s) para reconstruir a tendência histórica do seu parque de máquinas.
                    </p>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
             <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
                <Zap size={120} />
             </div>
             <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-6">ESTADO DO ECOSSISTEMA</h4>
             <div className="space-y-6">
                <IntegrationStat label="API Gateway" status="Active" color="emerald" />
                <IntegrationStat label="Cloud Sync" status="Operational" color="emerald" />
                <IntegrationStat label="CSI Engine" status="Ready" color="indigo" />
             </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">SUPORTE TÉCNICO</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed">
               Para integrações personalizadas via OPC-UA ou drivers específicos de fabricante, contacte a equipa de engenharia de sistemas.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const IntegrationStat = ({ label, status, color }: { label: string, status: string, color: 'emerald' | 'indigo' }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
     <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
        color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
     }`}>{status}</span>
  </div>
);

export default IntegrationView;
