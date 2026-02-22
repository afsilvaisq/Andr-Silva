
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, SensorType, UserRole, SensorReading, SeverityLevel, Sensor, DataSource } from './types';
import AssetCard from './components/AssetCard';
import ReliabilityDashboard from './components/ReliabilityDashboard';
import IoTGateway from './components/IoTGateway';
import CriticalityView from './components/CriticalityView';
import FMECAView from './components/FMECAView';
import RiskMatrixView from './components/RiskMatrixView';
import LiveMonitoringView from './components/LiveMonitoringView';
import ReportsView from './components/ReportsView';
import BalancingView from './components/BalancingView';
import IntegrationView from './components/IntegrationView';
import DimensionalControlView from './components/DimensionalControlView';
import AlignmentView from './components/AlignmentView';
import KPIView from './components/KPIView';
import RDIView from './components/RDIView';
import ThermographyView from './components/ThermographyView';
import RCAView from './components/RCAView';
import MLAnalyticsView from './components/MLAnalyticsView';
import LubricationView from './components/LubricationView';
import CSIImportModal from './components/CSIImportModal';
import AddAssetModal from './components/AddAssetModal';
import { db } from './services/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { 
  Search, 
  LayoutDashboard, 
  Menu, 
  X,
  ShieldAlert,
  User,
  ShieldCheck,
  LogOut,
  Upload,
  Activity,
  Cpu,
  Grid3X3,
  Waves,
  FileText,
  RotateCw,
  Link as LinkIcon,
  Ruler,
  ArrowRightLeft,
  BarChart3,
  Video,
  Thermometer,
  SearchCode,
  Database,
  BrainCircuit,
  Droplets
} from 'lucide-react';

const STORAGE_KEY = 'reliability-pro-assets-v3';

const calculateSeverity = (value: number, unit: string): SeverityLevel => {
  if (unit === 'G') {
    if (value < 1.5) return 'A';
    if (value < 3.0) return 'C'; 
    return 'D'; 
  }
  if (value <= 2.8) return 'A';
  if (value <= 4.5) return 'C';
  return 'D';
};

const getHealthScore = (severity: SeverityLevel): number => {
  switch (severity) {
    case 'A': return 100;
    case 'B': return 100;
    case 'C': return 55;
    case 'D': return 15;
    default: return 100;
  }
};

const generateMockAssets = (): Asset[] => {
  return [
    {
      id: 'a1',
      name: 'Trit P 006',
      location: 'Área de Trituração',
      status: 'operational',
      severity: 'A',
      healthScore: 100,
      mtbf: 1500,
      mttr: 4.0,
      criticality: { probability: 1, impactEnvironment: 2, impactEconomic: 5, impactHuman: 2 },
      sensors: [
        { id: 'IOT-01', type: SensorType.VIBRATION, label: 'Vibração L1 (Online)', unit: 'mm/s', currentValue: 0.8, thresholdMin: 0, thresholdMax: 4.5, history: Array.from({length: 40}).map((_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 0.5 + Math.random() * 2.0 })), dataSource: 'continuous' },
        { id: 'IOT-03', type: SensorType.TEMPERATURE, label: 'Temp Mancal', unit: '°C', currentValue: 42, thresholdMin: 0, thresholdMax: 85, history: Array.from({length: 20}).map((_, i) => ({ timestamp: new Date(Date.now() - i * 86400000).toISOString(), value: 38 + Math.random() * 10 })), dataSource: 'continuous' }
      ],
      fmeca: [],
      reports: [],
      lubricationPoints: [
        { id: 'lp-1', label: 'Rolamento LA (Lado Acoplado)', lubricant: 'SKF LGHP 2', quantity: '25g', frequency: '2000h', lastDate: '2024-10-15' },
        { id: 'lp-2', label: 'Rolamento LNA (Lado Oposto)', lubricant: 'SKF LGHP 2', quantity: '20g', frequency: '2000h', lastDate: '2024-10-15' }
      ],
      lubeHistory: [
        { timestamp: '2024-08-01', frictionBefore: 42, frictionAfter: 12, status: 'good' },
        { timestamp: '2024-09-10', frictionBefore: 45, frictionAfter: 14, status: 'good' },
        { timestamp: '2024-10-15', frictionBefore: 48, frictionAfter: 13, status: 'good' }
      ]
    }
  ];
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<SeverityLevel | null>(null);
  const [showGateway, setShowGateway] = useState(false);
  const [showCSIImport, setShowCSIImport] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [view, setView] = useState<'dashboard' | 'kpi' | 'criticality' | 'matrix' | 'live' | 'reports' | 'balancing' | 'integrations' | 'dimensional' | 'alignment' | 'rdi' | 'thermography' | 'rca' | 'ml' | 'lubrication'>('dashboard');

  useEffect(() => {
    const assetsRef = ref(db, 'assets');
    const unsubscribe = onValue(assetsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array if needed (Firebase stores as object if keys are strings)
        const assetsList = Object.values(data) as Asset[];
        setAssets(assetsList);
        if (assetsList.length > 0 && !selectedAssetId) {
          setSelectedAssetId(assetsList[0].id);
        }
      } else {
        // Initial data if DB is empty
        const initial = generateMockAssets();
        set(assetsRef, initial.reduce((acc, asset) => ({ ...acc, [asset.id]: asset }), {}));
      }
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Removed localStorage useEffect

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  const severityStats = useMemo(() => {
    return assets.reduce((acc, asset) => {
      acc[asset.severity] = (acc[asset.severity] || 0) + 1;
      return acc;
    }, { A: 0, B: 0, C: 0, D: 0 } as Record<SeverityLevel, number>);
  }, [assets]);

  const handleUpdateAsset = (updated: Asset) => {
    setIsSaving(true);
    const assetRef = ref(db, `assets/${updated.id}`);
    update(assetRef, updated).finally(() => {
      setTimeout(() => setIsSaving(false), 500);
    });
  };

  const handleCSIImport = (data: Array<{ tag: string, unit: string, readings: SensorReading[] }>) => {
    const newAssetsMap: Record<string, Asset> = {};
    // We'll work with the current assets to update or add
    const currentAssets = [...assets];
    
    data.forEach(item => {
      const [assetName, pointTag] = item.tag.split(" - ");
      let assetIdx = currentAssets.findIndex(a => a.name.toLowerCase() === assetName.toLowerCase());
      
      let asset: Asset;
      if (assetIdx === -1) {
        asset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: assetName,
          location: 'Importação AMS',
          status: 'operational',
          severity: 'A',
          healthScore: 100,
          mtbf: 0, mttr: 0,
          sensors: [],
          fmeca: [],
          reports: []
        };
        currentAssets.push(asset);
        assetIdx = currentAssets.length - 1;
      } else {
        asset = { ...currentAssets[assetIdx] };
      }

      const lastVal = item.readings[item.readings.length - 1]?.value || 0;
      const sensorUniqueId = `${pointTag}_${item.unit}`;
      const sensorIdx = asset.sensors.findIndex(s => s.id === sensorUniqueId && s.dataSource === 'periodic');
      
      if (sensorIdx !== -1) {
        asset.sensors[sensorIdx] = { ...asset.sensors[sensorIdx], currentValue: lastVal, history: item.readings };
      } else {
        asset.sensors.push({ id: sensorUniqueId, type: SensorType.VIBRATION, label: `${pointTag} (${item.unit})`, unit: item.unit, currentValue: lastVal, thresholdMin: 0, thresholdMax: item.unit === 'G' ? 3.0 : 4.5, history: item.readings, dataSource: 'periodic' });
      }

      const primarySensors = asset.sensors.filter(s => s.type === SensorType.VIBRATION);
      let maxSeverity: SeverityLevel = 'A';
      for (const s of primarySensors) {
        const sev = calculateSeverity(s.currentValue, s.unit);
        if (sev === 'D') { maxSeverity = 'D'; break; }
        else if (sev === 'C') { maxSeverity = 'C'; }
      }
      asset.severity = maxSeverity;
      asset.healthScore = getHealthScore(maxSeverity);
      asset.status = maxSeverity === 'D' ? 'critical' : maxSeverity === 'C' ? 'warning' : 'operational';
      
      currentAssets[assetIdx] = asset;
    });

    // Batch update to Firebase
    const updates: Record<string, Asset> = {};
    currentAssets.forEach(a => {
      updates[`assets/${a.id}`] = a;
    });
    
    setIsSaving(true);
    update(ref(db), updates).finally(() => {
      setTimeout(() => setIsSaving(false), 500);
    });
    
    setShowCSIImport(false);
  };

  const handleIncomingData = (assetId: string, sensorType: SensorType, value: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    let sensorFound = false;
    const updatedSensors = asset.sensors.map(sensor => {
      if (sensor.type === sensorType && sensor.dataSource === 'continuous') {
        sensorFound = true;
        return { ...sensor, currentValue: value, history: [...sensor.history.slice(-39), { timestamp: new Date().toISOString(), value }] };
      }
      return sensor;
    });

    if (!sensorFound) {
      updatedSensors.push({ id: `IOT-${sensorType.toUpperCase()}`, type: sensorType, label: `${sensorType} (Online)`, unit: sensorType === SensorType.VIBRATION ? 'mm/s' : '°C', currentValue: value, thresholdMin: 0, thresholdMax: 4.5, history: [{ timestamp: new Date().toISOString(), value }], dataSource: 'continuous' });
    }

    const maxVib = Math.max(...updatedSensors.filter(s => s.type === SensorType.VIBRATION).map(s => s.currentValue), 0);
    const severity = calculateSeverity(maxVib, 'mm/s');
    
    const updatedAsset: Asset = { 
      ...asset, 
      sensors: updatedSensors, 
      severity, 
      status: severity === 'D' ? 'critical' : severity === 'C' ? 'warning' : 'operational', 
      healthScore: getHealthScore(severity) 
    };

    setIsSaving(true);
    update(ref(db, `assets/${assetId}`), updatedAsset).finally(() => {
      setTimeout(() => setIsSaving(false), 500);
    });
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = activeSeverityFilter ? a.severity === activeSeverityFilter : true;
      return matchesSearch && matchesSeverity;
    });
  }, [assets, searchTerm, activeSeverityFilter]);

  const toggleSeverityFilter = (severity: SeverityLevel) => {
    setActiveSeverityFilter(prev => prev === severity ? null : severity);
  };

  if (!userRole) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden text-slate-900 font-light">
        <div className="relative bg-white rounded-[40px] p-12 w-full max-w-lg text-center shadow-2xl border border-slate-100">
          <div className="inline-flex mb-8">
            <div className="bg-slate-900/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner">
              <Cpu className="text-black w-8 h-8 font-light" />
            </div>
          </div>
          <h1 className="text-3xl font-extralight text-slate-900 mb-2 tracking-tighter">ReliabilityTech</h1>
          <p className="text-slate-400 mb-10 text-[10px] font-light tracking-[0.2em] uppercase text-center">Gestão de Fiabilidade Industrial</p>
          <div className="grid gap-3">
            <button onClick={() => setUserRole('admin')} className="flex items-center gap-5 p-5 bg-white border border-slate-100 hover:border-black/20 hover:bg-slate-50 rounded-3xl transition-all group text-left">
              <div className="bg-slate-50 p-3.5 rounded-2xl group-hover:bg-black group-hover:text-white transition-all border border-slate-100">
                <ShieldCheck size={22} className="text-slate-500 group-hover:text-white font-light" />
              </div>
              <div>
                <p className="font-light text-slate-900 text-xs">Administrador</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-light mt-0.5">Gestão Engenharia</p>
              </div>
            </button>
            <button onClick={() => setUserRole('client')} className="flex items-center gap-5 p-5 bg-white border border-slate-100 hover:border-black/20 hover:bg-slate-50 rounded-3xl transition-all group text-left">
              <div className="bg-slate-50 p-3.5 rounded-2xl group-hover:bg-black group-hover:text-white transition-all border border-slate-100">
                <User size={22} className="text-slate-500 group-hover:text-white font-light" />
              </div>
              <div>
                <p className="font-light text-slate-900 text-xs">Cliente Operacional</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-light mt-0.5">Consulta Técnica</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-600 overflow-hidden font-light">
      {showGateway && <IoTGateway assets={assets} onClose={() => setShowGateway(false)} onDataReceived={handleIncomingData} />}
      {showCSIImport && <CSIImportModal assets={assets} onImport={handleCSIImport} onClose={() => setShowCSIImport(false)} />}
      {showAddAsset && <AddAssetModal onAdd={(a) => { 
        setIsSaving(true);
        set(ref(db, `assets/${a.id}`), a).then(() => {
          setSelectedAssetId(a.id);
          setShowAddAsset(false);
        }).finally(() => {
          setTimeout(() => setIsSaving(false), 500);
        });
      }} onClose={() => setShowAddAsset(false)} />}

      <aside className={`${sidebarOpen ? 'w-56' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50`}>
        <div className="p-6 flex items-center gap-4">
          <div className="bg-slate-900/5 p-2 rounded-xl flex items-center justify-center border border-slate-100">
            <Cpu className="text-black w-3.5 h-3.5 font-light" />
          </div>
          {sidebarOpen && <h1 className="font-extralight text-[10px] tracking-[0.2em] text-slate-900 uppercase">RELIABILITYTECH</h1>}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <SidebarItem icon={<LayoutDashboard />} label="Insights" active={view === 'dashboard'} sidebarOpen={sidebarOpen} onClick={() => setView('dashboard')} />
          <SidebarItem icon={<BarChart3 />} label="KPIs" active={view === 'kpi'} sidebarOpen={sidebarOpen} onClick={() => setView('kpi')} />
          <SidebarItem icon={<BrainCircuit />} label="ML Analytics" active={view === 'ml'} sidebarOpen={sidebarOpen} onClick={() => setView('ml')} />
          <SidebarItem icon={<Waves />} label="Live Monitoring" active={view === 'live'} sidebarOpen={sidebarOpen} onClick={() => setView('live')} />
          <SidebarItem icon={<Droplets />} label="Lubrificação" active={view === 'lubrication'} sidebarOpen={sidebarOpen} onClick={() => setView('lubrication')} />
          <SidebarItem icon={<Video />} label="Motion RDI" active={view === 'rdi'} sidebarOpen={sidebarOpen} onClick={() => setView('rdi')} />
          <SidebarItem icon={<Thermometer />} label="Termografia" active={view === 'thermography'} sidebarOpen={sidebarOpen} onClick={() => setView('thermography')} />
          <SidebarItem icon={<SearchCode />} label="RCA" active={view === 'rca'} sidebarOpen={sidebarOpen} onClick={() => setView('rca')} />
          <SidebarItem icon={<ShieldAlert />} label="Criticidade" active={view === 'criticality'} sidebarOpen={sidebarOpen} onClick={() => setView('criticality')} />
          <SidebarItem icon={<Grid3X3 />} label="Matriz RRP" active={view === 'matrix'} sidebarOpen={sidebarOpen} onClick={() => setView('matrix')} />
          <div className="my-4 border-t border-slate-50 mx-2" />
          <p className={`px-4 text-[8px] font-light text-slate-300 uppercase tracking-widest mb-2 ${!sidebarOpen && 'hidden'}`}>Cálculos ISO</p>
          <SidebarItem icon={<ArrowRightLeft />} label="Alinhamento" active={view === 'alignment'} sidebarOpen={sidebarOpen} onClick={() => setView('alignment')} />
          <SidebarItem icon={<RotateCw />} label="Equilibragem" active={view === 'balancing'} sidebarOpen={sidebarOpen} onClick={() => setView('balancing')} />
          <SidebarItem icon={<Ruler />} label="Dimensional" active={view === 'dimensional'} sidebarOpen={sidebarOpen} onClick={() => setView('dimensional')} />
          <SidebarItem icon={<LinkIcon />} label="Integrações" active={view === 'integrations'} sidebarOpen={sidebarOpen} onClick={() => setView('integrations')} />
          <SidebarItem icon={<FileText />} label="Relatórios" active={view === 'reports'} sidebarOpen={sidebarOpen} onClick={() => setView('reports')} />
          {userRole === 'admin' && (
            <div className="pt-4 border-t border-slate-50 mt-4 mx-2">
              <SidebarItem icon={<Upload />} label="Sincronizar" sidebarOpen={sidebarOpen} onClick={() => setShowCSIImport(true)} />
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setUserRole(null)} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all text-[10px] font-light uppercase tracking-wider">
            <LogOut size={14} /> {sidebarOpen && <span>Encerrar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">{sidebarOpen ? <X size={16} /> : <Menu size={16} />}</button>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
              <input type="text" placeholder="Pesquisar ativos ou locais..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-1.5 text-[11px] font-light rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className={`transition-colors ${isSaving ? 'text-emerald-500' : 'text-slate-300'}`}>
                  <Database size={14} className={isSaving ? 'animate-bounce' : ''} />
                </div>
                <span className="text-[9px] font-light text-slate-400 uppercase tracking-widest">
                  {isSaving ? 'A Gravar...' : 'Sincronizado'}
                </span>
             </div>
             <button onClick={() => setShowGateway(true)} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"><Activity size={16} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#f8fafc]">
          {view === 'dashboard' && (
            <div className="flex h-full flex-col lg:flex-row">
              <section className="w-full lg:w-[280px] border-r border-slate-200 bg-white flex flex-col">
                <div className="p-4 border-b border-slate-100 space-y-4">
                   <div className="grid grid-cols-4 gap-1.5">
                      {(['A', 'B', 'C', 'D'] as SeverityLevel[]).map(s => (
                        <SeverityCounter key={s} label={s} count={severityStats[s] || 0} color={s === 'A' || s === 'B' ? 'emerald' : s === 'C' ? 'amber' : 'rose'} isActive={activeSeverityFilter === s} onClick={() => toggleSeverityFilter(s)} />
                      ))}
                   </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2 no-scrollbar">
                  {filteredAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} isActive={selectedAssetId === asset.id} onClick={(a) => setSelectedAssetId(a.id)} />
                  ))}
                </div>
              </section>
              <section className="flex-1 p-6 overflow-y-auto">
                {selectedAsset ? <ReliabilityDashboard asset={selectedAsset} userRole={userRole} onUpdateAsset={handleUpdateAsset} /> : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Cpu size={40} className="text-slate-200 font-light mb-4" />
                    <h3 className="text-sm font-light text-slate-400 mb-1">Selecione um Ativo Industrial</h3>
                  </div>
                )}
              </section>
            </div>
          )}
          {view === 'kpi' && <section className="p-8"><KPIView assets={assets} /></section>}
          {view === 'ml' && <section className="p-8"><MLAnalyticsView assets={assets} /></section>}
          {view === 'live' && <section className="p-8"><LiveMonitoringView assets={assets} /></section>}
          {view === 'lubrication' && <section className="p-8"><LubricationView assets={assets} onUpdateAsset={handleUpdateAsset} /></section>}
          {view === 'rdi' && <section className="p-8"><RDIView assets={assets} /></section>}
          {view === 'thermography' && <section className="p-8"><ThermographyView assets={assets} onUpdateAsset={handleUpdateAsset} /></section>}
          {view === 'rca' && <section className="p-8"><RCAView assets={assets} /></section>}
          {view === 'reports' && <section className="p-8"><ReportsView assets={assets} onUpdateAsset={handleUpdateAsset} userRole={userRole} /></section>}
          {view === 'criticality' && <section className="p-8"><CriticalityView assets={assets} onUpdateAsset={handleUpdateAsset} userRole={userRole} /></section>}
          {view === 'matrix' && <section className="p-8"><RiskMatrixView assets={assets} /></section>}
          {view === 'balancing' && <section className="p-8"><BalancingView assets={assets} /></section>}
          {view === 'integrations' && <section className="p-8"><IntegrationView assets={assets} onIncomingData={handleIncomingData} /></section>}
          {view === 'dimensional' && <section className="p-8"><DimensionalControlView assets={assets} /></section>}
          {view === 'alignment' && <section className="p-8"><AlignmentView assets={assets} /></section>}
        </div>
      </main>
    </div>
  );
};

const SeverityCounter: React.FC<{ label: string; count: number; color: 'emerald' | 'amber' | 'rose'; isActive: boolean; onClick: () => void }> = ({ label, count, color, isActive, onClick }) => {
  const baseColors = {
    emerald: 'text-emerald-600 border-emerald-100 bg-emerald-50/50',
    amber: 'text-amber-600 border-amber-100 bg-amber-50/50',
    rose: 'text-rose-600 border-rose-100 bg-rose-50/50',
  };
  const activeColors = {
    emerald: 'bg-emerald-500 border-emerald-600 text-white',
    amber: 'bg-amber-400 border-amber-500 text-white',
    rose: 'bg-rose-500 border-rose-600 text-white',
  };
  return (
    <button onClick={onClick} className={`p-2 rounded-xl text-center border transition-all flex-1 ${isActive ? activeColors[color] : baseColors[color] + ' hover:bg-white'}`}>
      <p className="text-[8px] font-light mb-0.5">{label}</p>
      <p className="text-xs font-light">{count}</p>
    </button>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; sidebarOpen: boolean; onClick?: () => void }> = ({ icon, label, active = false, sidebarOpen, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
    <div className="flex items-center gap-3">
      <div className={`${active ? 'text-white' : 'text-slate-300'}`}>{React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 1.5 }) : icon}</div>
      {sidebarOpen && <span className="text-[11px] font-light uppercase tracking-wider">{label}</span>}
    </div>
  </div>
);

export default App;
