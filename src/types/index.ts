// ─── Core domain types for RainReady Bengaluru ───────────────────────────────

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType = 'waterlogging' | 'flood' | 'blocked_drain' | 'pothole' | 'traffic_hazard';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_info';
export type TaskStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled';
export type Language = 'en' | 'kn' | 'hinglish';
export type AlertLevel = 'info' | 'caution' | 'danger';

export interface Report {
  id: string;
  description: string;
  location: string;
  neighbourhood: string;
  incidentType: IncidentType;
  severity?: Severity;
  language: Language;
  anonymous: boolean;
  reporterAlias: string;
  imageUrl?: string;
  submittedAt: string;         // ISO string
  status: 'processing' | 'analysed' | 'verified' | 'rejected' | 'resolved';
  verificationStatus: VerificationStatus;
  analysis?: AIAnalysis;
  duplicateGroupId?: string;
  duplicateCount?: number;
  isDemo?: boolean;
}

export interface AIAnalysis {
  incidentType: IncidentType;
  location: string;
  neighbourhood: string;
  severity: Severity;
  estimatedDepth?: string;
  affectedRoad: string;
  nearbyVulnerablePlaces: string[];
  confidenceScore: number;      // 0–100
  recommendedAction: string;
  agentSteps: AgentStep[];
  riskScore: RiskScore;
  routeSuggestion?: RouteSuggestion;
}

export interface AgentStep {
  id: string;
  phase: 'observe' | 'understand' | 'verify' | 'assess' | 'recommend' | 'coordinate' | 'followup';
  label: string;
  detail: string;
  status: 'pending' | 'running' | 'done' | 'skipped';
  timestamp?: string;
}

export interface RiskScore {
  total: number;               // 0–100
  factors: RiskFactor[];
  level: AlertLevel;
}

export interface RiskFactor {
  label: string;
  contribution: number;        // 0–100
  detail: string;
}

export interface RouteSuggestion {
  unsafeRoad: string;
  safeAlternative: string;
  additionalMinutes: number;
  reason: string;
  waypoints: RouteWaypoint[];
}

export interface RouteWaypoint {
  name: string;
  type: 'start' | 'avoid' | 'waypoint' | 'end';
}

export interface Alert {
  id: string;
  reportId: string;
  neighbourhood: string;
  level: AlertLevel;
  title: string;
  description: string;
  affectedArea: string;
  severity: Severity;
  verifiedAt: string;
  verifiedBy: string;
  doList: string[];
  avoidList: string[];
  notifiedCount: number;
  isActive: boolean;
}

export interface Task {
  id: string;
  reportId: string;
  title: string;
  location: string;
  neighbourhood: string;
  priority: Severity;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  requiredAction: string;
  notes: TaskNote[];
}

export interface TaskNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface NeighbourhoodStats {
  name: string;
  activeAlerts: number;
  riskLevel: AlertLevel;
  lastIncident?: string;
  totalReports: number;
}

export interface DashboardMetrics {
  activeAlerts: number;
  reportsReceived: number;
  reportsVerified: number;
  duplicatesRemoved: number;
  avgResponseMinutes: number;
  resolvedIncidents: number;
  neighbourhoods: NeighbourhoodStats[];
}

export interface ReviewDecision {
  reportId: string;
  decision: 'approve' | 'reject' | 'request_info';
  reviewerNote: string;
  reviewedAt: string;
}
