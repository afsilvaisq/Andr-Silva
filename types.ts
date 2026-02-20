
export enum SensorType {
  VIBRATION = 'vibration',
  TEMPERATURE = 'temperature',
  FLOW = 'flow',
  PRESSURE = 'pressure',
  CURRENT = 'current',
  ULTRASOUND = 'ultrasound'
}

export type UserRole = 'admin' | 'client';
export type SeverityLevel = 'A' | 'B' | 'C' | 'D';
export type DataSource = 'continuous' | 'periodic';

export interface SensorReading {
  timestamp: string;
  value: number;
  anomalyScore?: number; 
  isAnomaly?: boolean; 
}

export interface Sensor {
  id: string;
  type: SensorType;
  label: string;
  unit: string;
  currentValue: number;
  history: SensorReading[];
  thresholdMax: number;
  thresholdMin: number;
  dataSource: DataSource;
}

export interface LubricationPoint {
  id: string;
  label: string;
  lubricant: string;
  quantity: string;
  frequency: string;
  lastDate: string;
}

export interface LubeExpertReading {
  timestamp: string;
  frictionBefore: number;
  frictionAfter: number;
  status: 'good' | 'over' | 'under' | 'suspect';
}

export interface CriticalityAssessment {
  probability: number; 
  impactEnvironment: number; 
  impactEconomic: number; 
  impactHuman: number; 
}

export interface FailureMode {
  id: string;
  component: string;
  mode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  action: string;
  resSeverity: number;
  resOccurrence: number;
  resDetection: number;
  resRPN: number;
}

export interface FiveWhys {
  problem: string;
  whys: string[];
  rootCause: string;
}

export interface IshikawaData {
  machine: string[];
  method: string[];
  manpower: string[];
  material: string[];
  measurement: string[];
  environment: string[];
}

export interface FaultTreeNode {
  id: string;
  label: string;
  gate: 'AND' | 'OR' | 'NONE';
  children: FaultTreeNode[];
}

export interface RCAAttachment {
  id: string;
  name: string;
  data: string;
  type: string;
}

export interface RCAAction {
  id: string;
  what: string;
  who: string;
  when: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface RCARecord {
  id: string;
  assetId: string;
  timestamp: string;
  methodology: string;
  status: 'open' | 'closed';
  fiveWhys: FiveWhys;
  ishikawa: IshikawaData;
  faultTree?: FaultTreeNode;
  attachments?: RCAAttachment[];
  actions: RCAAction[];
}

export interface MaintenanceReport {
  id: string;
  timestamp: string;
  author: string;
  location: string;
  severity: SeverityLevel;
  anomalyDescription: string;
  diagnosis: string;
  recommendations: string;
}

export interface Asset {
  id: string;
  name: string;
  location: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  severity: SeverityLevel;
  sensors: Sensor[];
  mtbf: number; 
  mttr: number; 
  healthScore: number; 
  criticality?: CriticalityAssessment;
  fmeca?: FailureMode[];
  reports?: MaintenanceReport[];
  cluster?: string;
  lubricationPoints?: LubricationPoint[];
  lubeHistory?: LubeExpertReading[];
}

export interface MaintenanceAlert {
  id: string;
  assetId: string;
  assetName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}
