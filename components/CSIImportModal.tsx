
import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, X, Activity, Database, History, Calendar } from 'lucide-react';
import { Asset, SensorReading } from '../types';

interface CSIImportModalProps {
  assets: Asset[];
  onImport: (data: Array<{ tag: string, unit: string, readings: SensorReading[] }>) => void;
  onClose: () => void;
}

const monthsMap: Record<string, string> = {
  'jan': 'Jan', 'fev': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'mai': 'May', 'jun': 'Jun',
  'jul': 'Jul', 'ago': 'Aug', 'set': 'Sep', 'out': 'Oct', 'nov': 'Nov', 'dez': 'Dec'
};

const CSIImportModal: React.FC<CSIImportModalProps> = ({ assets, onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Array<{ assetName: string, pointTag: string, readings: SensorReading[], unit: string, matched: boolean }>>([]);

  const parseDate = (dateStr: string, timeStr: string): string => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return new Date().toISOString();
      
      const day = parts[0];
      const monthPt = parts[1].toLowerCase();
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      
      const monthEn = monthsMap[monthPt] || 'Jan';
      const d = new Date(`${day} ${monthEn} ${year} ${timeStr}`);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processAMSFile(selectedFile);
    }
  };

  const processAMSFile = async (file: File) => {
    const text = await file.text();
    const results: Array<{ assetName: string, pointTag: string, readings: SensorReading[], unit: string, matched: boolean }> = [];
    const lines = text.split(/\r?\n/);
    
    let currentAsset = "";
    let currentPoint = "";
    let currentUnit = "";
    let isCollectingData = false;
    let pointReadings: SensorReading[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Detecta cabeçalho do ponto: "Asset Name - PointTag - Description"
      const pointHeaderMatch = line.match(/^(.+?)\s+-\s+([\w\d.]+)-/);
      if (pointHeaderMatch) {
        if (currentAsset && pointReadings.length > 0) {
          savePoint(currentAsset, currentPoint, currentUnit, pointReadings, results);
        }
        currentAsset = pointHeaderMatch[1].trim();
        currentPoint = pointHeaderMatch[2].trim();
        pointReadings = [];
        isCollectingData = false;
        continue;
      }

      // Detecta início da tabela de dados: Velocidade ou Aceleração
      const unitMatch = line.match(/^(mm\/sec|G-s)$/i);
      if (unitMatch) {
        if (currentAsset && pointReadings.length > 0) {
          savePoint(currentAsset, currentPoint, currentUnit, pointReadings, results);
        }
        currentUnit = unitMatch[1].toLowerCase() === 'g-s' ? 'G' : 'mm/s';
        pointReadings = [];
        isCollectingData = true;
        continue;
      }

      if (isCollectingData) {
        const rowMatch = line.match(/^(\d{2}-[a-z]{3}-\d{2,4})\s+(\d{2}:\d{2})\s+([.\d,]+)/i);
        if (rowMatch) {
          const dateStr = rowMatch[1];
          const timeStr = rowMatch[2];
          let valStr = rowMatch[3].replace(',', '.');
          
          const dots = (valStr.match(/\./g) || []).length;
          if (dots > 1) {
            valStr = valStr.replace(/\.(?=[^.]*\.)/g, ''); 
          }

          const valNum = parseFloat(valStr);
          if (!isNaN(valNum)) {
            pointReadings.push({
              timestamp: parseDate(dateStr, timeStr),
              value: valNum
            });
          }
        }

        // Se encontrar outro bloco que não seja dados, salva o que tem
        if (line.includes("Baseline Value") || line === "Microns" || line.includes("----")) {
          if (currentAsset && pointReadings.length > 0) {
            savePoint(currentAsset, currentPoint, currentUnit, pointReadings, results);
          }
          pointReadings = [];
          isCollectingData = false;
        }
      }
    }

    if (currentAsset && pointReadings.length > 0) {
      savePoint(currentAsset, currentPoint, currentUnit, pointReadings, results);
    }

    setParsedData(results);
  };

  const savePoint = (asset: string, point: string, unit: string, readings: SensorReading[], results: any[]) => {
    if (!unit) return;
    
    const sortedReadings = [...readings].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const matched = assets.some(a => a.name.toLowerCase() === asset.toLowerCase());
    const existingIdx = results.findIndex(r => r.assetName === asset && r.pointTag === point && r.unit === unit);
    
    if (existingIdx !== -1) {
      const combined = [...results[existingIdx].readings, ...sortedReadings];
      const unique = Array.from(new Map(combined.map(r => [r.timestamp, r])).values());
      results[existingIdx].readings = unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      results.push({
        assetName: asset,
        pointTag: point,
        unit,
        readings: sortedReadings,
        matched
      });
    }
  };

  const confirmImport = () => {
    const importData = parsedData.map(d => ({
      tag: `${d.assetName} - ${d.pointTag}`,
      unit: d.unit,
      readings: d.readings
    }));
    onImport(importData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white p-6 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <History className="text-slate-400" size={20} />
            <div>
              <h3 className="text-slate-800 font-light">Histórico AMS Manager</h3>
              <p className="text-slate-400 text-[9px] uppercase tracking-widest">Sincronização de Dados Velocidade e Aceleração</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8">
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-80 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group">
              <div className="flex flex-col items-center justify-center text-center px-10">
                <Upload className="text-slate-300 w-10 h-10 mb-4 group-hover:text-indigo-600 transition-colors" />
                <p className="text-slate-600 text-sm mb-1 font-light">Selecione o relatório (.txt) com mm/sec e G-s</p>
                <p className="text-slate-300 text-[10px] uppercase tracking-widest font-light">Formato AMS Machinery Manager</p>
              </div>
              <input type="file" className="hidden" accept=".txt" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <FileText className="text-indigo-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-700 font-light">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-light">
                       Detetados {parsedData.length} blocos de medição (Vibração/Aceleração)
                    </p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setParsedData([]); }} className="text-[10px] font-light text-rose-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 hover:bg-rose-50">Remover</button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 font-light">Ativo</th>
                        <th className="px-6 py-3 font-light">Ponto</th>
                        <th className="px-6 py-3 font-light">Unidade</th>
                        <th className="px-6 py-3 font-light">Último Valor</th>
                        <th className="px-6 py-3 text-right font-light">Mapeamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {parsedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 font-light text-slate-700">{item.assetName}</td>
                          <td className="px-6 py-3 text-slate-400">{item.pointTag}</td>
                          <td className="px-6 py-3">
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.unit === 'G' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {item.unit}
                             </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-slate-900 font-light">{item.readings[item.readings.length - 1]?.value.toFixed(3)}</span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            {item.matched ? (
                              <span className="text-[9px] text-emerald-600 font-light uppercase tracking-tighter">Vinculado</span>
                            ) : (
                              <span className="text-[9px] text-indigo-500 font-light uppercase tracking-tighter italic">Novo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={onClose} className="flex-1 py-3 text-slate-400 text-xs font-light">Cancelar</button>
                <button 
                  onClick={confirmImport}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-full text-xs font-light hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                >
                  Importar Tendências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSIImportModal;
