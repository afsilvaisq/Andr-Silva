
import React, { useState } from 'react';
import { Terminal, Send, Code, Info, CheckCircle2, X } from 'lucide-react';
import { Asset, SensorType } from '../types';

interface IoTGatewayProps {
  assets: Asset[];
  onDataReceived: (assetId: string, sensorType: SensorType, value: number) => void;
  onClose: () => void;
}

const IoTGateway: React.FC<IoTGatewayProps> = ({ assets, onDataReceived, onClose }) => {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [payload, setPayload] = useState('');
  const [success, setSuccess] = useState(false);

  const updateExample = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset && asset.sensors.length > 0) {
      const sensor = asset.sensors[0];
      const json = JSON.stringify({
        assetId: id,
        sensorType: sensor.type,
        value: Number((sensor.currentValue + (Math.random() * 2 - 1)).toFixed(2)),
        timestamp: new Date().toISOString()
      }, null, 2);
      setPayload(json);
    }
  };

  const handleSend = () => {
    try {
      const data = JSON.parse(payload);
      if (data.assetId && data.sensorType && typeof data.value === 'number') {
        onDataReceived(data.assetId, data.sensorType, data.value);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e) {
      alert("Erro no JSON.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Terminal className="text-indigo-200" size={24} />
            <h3 className="font-semibold text-white uppercase tracking-tight text-lg">Gateway IoT</h3>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors p-2"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Ativo de Destino</label>
              <select 
                value={selectedAssetId}
                onChange={(e) => {
                  setSelectedAssetId(e.target.value);
                  updateExample(e.target.value);
                }}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
              >
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>

              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold text-[10px] uppercase tracking-widest">
                  <Info size={14} /> Integração Direta
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                  Utilize este gateway para simular a entrada de dados via MQTT ou Webhooks de telemetria industrial.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Payload JSON</label>
              <div className="relative">
                <textarea 
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={10}
                  className="w-full font-mono text-[10px] p-5 bg-slate-900 text-indigo-300 rounded-2xl focus:ring-0 outline-none shadow-inner"
                />
                {success && (
                  <div className="absolute inset-0 bg-slate-900/95 rounded-2xl flex items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-3 text-indigo-400">
                      <CheckCircle2 size={40} className="animate-bounce" />
                      <span className="font-semibold uppercase tracking-widest text-xs">Dados Publicados</span>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleSend}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                <Send size={18} />
                Enviar Telemetria
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTGateway;
