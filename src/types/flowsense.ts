// ─── FlowSense: Aggregated Mobility Intelligence Types ────────────────────────
// All data is AGGREGATED and ANONYMISED — no individual tracking.

import type { AlertLevel, Severity } from './index';

export type RoadStatus = 'normal' | 'slow' | 'blocked' | 'unknown';
export type PredictedCause = 'flooding' | 'accident' | 'road_blockage' | 'heavy_traffic' | 'signal_failure' | 'unknown';
export type RainfallIntensity = 'none' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
export type EmergencyVehicleType = 'ambulance' | 'fire' | 'police' | 'disaster_response';
export type IncidentResolution = 'active' | 'improving' | 'resolved' | 'false_alarm';
export type DetectionAlertStatus = 'none' | 'awaiting_review' | 'approved' | 'rejected';

// Road segment — aggregated movement profile for a road stretch
export interface RoadSegment {
  id: string;
  name: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  normalAvgSpeed: number;          // km/h — historical average
  currentAvgSpeed: number;         // km/h — latest 10-min window
  normalTravelTime: number;        // minutes
  currentTravelTime: number;       // minutes
  movementSampleCount: number;     // anonymous movement events in window
  stoppedMovementCount: number;    // samples with speed < 2 km/h
  speedVariance: number;           // standard deviation of speed in window
  historicalFloodRisk: 'low' | 'medium' | 'high';
  nearbyCriticalLocations: string[];
  emergencyPriority: boolean;      // is this on an ambulance / emergency corridor?
  status: RoadStatus;
  rainfallIntensity: RainfallIntensity;
  lastUpdated: string;             // ISO
  isSimulated: true;               // always true — label all telemetry
}

// A single aggregated time-window snapshot (10-minute bucket)
export interface MovementWindow {
  id: string;
  roadSegmentId: string;
  windowStart: string;             // ISO
  windowEnd: string;               // ISO
  avgSpeed: number;
  travelTime: number;
  sampleCount: number;
  stoppedCount: number;
  direction: 'both' | 'inbound' | 'outbound';
  rainfallIntensity: RainfallIntensity;
  isSimulated: true;
}

// Detected anomaly/incident from the automatic detection engine
export interface FlowIncident {
  id: string;
  roadSegmentId: string;
  predictedCause: PredictedCause;
  severity: Severity;
  confidence: number;              // 0–100
  detectedAt: string;              // ISO
  evidence: string[];              // human-readable evidence bullets
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'needs_info';
  publicAlertStatus: DetectionAlertStatus;
  emergencyImpact: boolean;
  reviewerNote?: string;
  reviewedAt?: string;
  resolutionStatus: IncidentResolution;
  riskScore: number;               // 0–100
  riskFactors: FlowRiskFactor[];
  agentTrace: FlowAgentStep[];
  routeSuggestion: FlowRoute;
  timeline: FlowTimelineEntry[];
}

export interface FlowRiskFactor {
  label: string;
  contribution: number;
  detail: string;
}

export interface FlowAgentStep {
  phase: 'observe' | 'compare' | 'detect' | 'corroborate' | 'classify' | 'score' | 'recommend' | 'followup';
  label: string;
  detail: string;
  status: 'done' | 'running' | 'pending';
  timestamp?: string;
}

export interface FlowRoute {
  blockedRoad: string;
  safeAlternative: string;
  additionalMinutes: number;
  reason: string;
  waypoints: { name: string; type: 'start' | 'avoid' | 'via' | 'end' }[];
}

export interface EmergencyRouteInfo {
  vehicleType: EmergencyVehicleType;
  currentRoute: string;
  routeStatus: 'clear' | 'at_risk' | 'blocked';
  recommendedRoute: string;
  reason: string;
  estimatedDelayAvoided: number;   // minutes
  disclaimer: string;
}

export interface FlowTimelineEntry {
  time: string;                    // ISO
  label: string;
  detail?: string;
  type: 'detect' | 'corroborate' | 'classify' | 'review' | 'alert' | 'emergency' | 'recover' | 'resolve';
}

// FlowSense-specific dashboard metrics
export interface FlowMetrics {
  segmentsMonitored: number;
  activeIncidents: number;
  alertsGenerated: number;
  avgDetectionSeconds: number;     // prototype target: < 120s
  emergencyWarnings: number;
  resolvedToday: number;
  falseAlerts: number;
  duplicateCitizenReportsAvoided: number;
}
