
import React, { useState } from 'react';
import { X, Factory, Plus, Trash2, Activity, Thermometer, Droplets, Info, Save } from 'lucide-react';
import { Asset, SensorType, Sensor } from '../types';

interface AddAssetModalProps {
  onClose: () => void;
  onAdd: (asset: Asset) => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSensors, setSelectedSensors] = useState<SensorType[]>([SensorType.VIBRATION]);

  const toggleSensor = (type: SensorType) => {
    if (selectedSensors.includes(type)) {
      setSelectedSensors(selectedSensors.filter(s => s !== type));
    } else {
      setSelectedSensors([...selectedSensors, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    // Fix: Added missing 'severity' property to satisfy the Asset type requirement.
    // Initializing with 'A' as healthScore is 100 and status is operational.
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: name, 
      location,
      status: 'operational',
      severity: 'A',
      healthScore: 100,
      mtbf: 0,
      mttr: 0,
      sensors: selectedSensors.map(type => {
        let label = 'Sensor';
        let unit = '';
        let max = 100;

        switch (type) {
          case SensorType.VIBRATION: label = 'Vibração'; unit = 'mm/s'; max = 4.5; break;
          case SensorType.TEMPERATURE: label = 'Temperatura'; unit = '°C'; max = 85; break;
          case SensorType.FLOW: label = 'Caudal'; unit = 'm³/h'; max = 100; break;
          case SensorType.PRESSURE: label = 'Pressão'; unit = 'bar'; max = 10; break;
          case SensorType.CURRENT: label = 'Corrente'; unit = 'A'; max = 50; break;
        }

        // Fix: Added missing 'dataSource' property to satisfy the Sensor type requirement.
        return {
          id: `s-${Math.random().toString(36).substr(2, 9)}`,
          type,
          label,
          unit,
          currentValue: 0,
          thresholdMin: 0,
          thresholdMax: max,
          history: [],
          dataSource: 'continuous'
        };
      })
    };

    onAdd(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-50 animate-in zoom-in-95">
        <div className="bg-white p-6 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <Plus className="text-slate-300" size={20} />
            <h3 className="text-slate-800 font-semibold tracking-tight">Novo Ativo Industrial</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">TAG do Equipamento</label>
              <input 
                autoFocus
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: PMP-01A"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 focus:border-indigo-300 transition-all outline-none text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Localização</label>
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Área de Enchimento"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 focus:border-indigo-300 transition-all outline-none text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Monitoramento Ativo</label>
            <div className="grid grid-cols-2 gap-3">
              <SensorToggle active={selectedSensors.includes(SensorType.VIBRATION)} onClick={() => toggleSensor(SensorType.VIBRATION)} label="Vibração" icon={<Activity size={14}/>} />
              <SensorToggle active={selectedSensors.includes(SensorType.TEMPERATURE)} onClick={() => toggleSensor(SensorType.TEMPERATURE)} label="Temperatura" icon={<Thermometer size={14}/>} />
              <SensorToggle active={selectedSensors.includes(SensorType.FLOW)} onClick={() => toggleSensor(SensorType.FLOW)} label="Caudal" icon={<Droplets size={14}/>} />
              <SensorToggle active={selectedSensors.includes(SensorType.PRESSURE)} onClick={() => toggleSensor(SensorType.PRESSURE)} label="Pressão" icon={<Plus size={14}/>} />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-medium text-slate-400">Cancelar</button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 transition-all"
            >
              Criar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SensorToggle = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      active ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-50 text-slate-400 hover:border-slate-100'
    }`}
  >
    <span className={active ? 'text-indigo-600' : 'text-slate-300'}>{icon}</span>
    <span className="text-[11px] tracking-tight">{label}</span>
  </button>
);

export default AddAssetModal;
