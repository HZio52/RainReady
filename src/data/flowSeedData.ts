import type {
  RoadSegment, MovementWindow, FlowIncident, FlowMetrics,
  FlowAgentStep, FlowRiskFactor, FlowRoute, FlowTimelineEntry, EmergencyRouteInfo
} from '../types/flowsense';

// ─── Normal ("healthy") road segments — 5 Bengaluru neighbourhoods ────────────
export const NORMAL_SEGMENTS: RoadSegment[] = [
  {
    id: 'seg-hsr-underpass',
    name: 'HSR Layout Underpass (18th Cross)',
    neighbourhood: 'HSR Layout',
    lat: 12.9121, lng: 77.6446,
    normalAvgSpeed: 28, currentAvgSpeed: 28,
    normalTravelTime: 4, currentTravelTime: 4,
    movementSampleCount: 120, stoppedMovementCount: 3,
    speedVariance: 4.2,
    historicalFloodRisk: 'high',
    nearbyCriticalLocations: ['Agara Lake Junction', 'HSR BDA Complex', 'Apollo Clinic (800m)'],
    emergencyPriority: true,
    status: 'normal',
    rainfallIntensity: 'none',
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'seg-koramangala-5th',
    name: 'Koramangala 5th Block Main Road',
    neighbourhood: 'Koramangala',
    lat: 12.9352, lng: 77.6245,
    normalAvgSpeed: 22, currentAvgSpeed: 22,
    normalTravelTime: 6, currentTravelTime: 6,
    movementSampleCount: 95, stoppedMovementCount: 2,
    speedVariance: 3.8,
    historicalFloodRisk: 'medium',
    nearbyCriticalLocations: ['Forum Mall', 'Koramangala BDA Complex'],
    emergencyPriority: false,
    status: 'normal',
    rainfallIntensity: 'none',
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'seg-whitefield-itpl',
    name: 'ITPL Main Road, Whitefield',
    neighbourhood: 'Whitefield',
    lat: 12.9866, lng: 77.7284,
    normalAvgSpeed: 35, currentAvgSpeed: 35,
    normalTravelTime: 5, currentTravelTime: 5,
    movementSampleCount: 145, stoppedMovementCount: 4,
    speedVariance: 5.1,
    historicalFloodRisk: 'low',
    nearbyCriticalLocations: ['ITPL Tech Park', 'Whitefield Railway Station'],
    emergencyPriority: false,
    status: 'normal',
    rainfallIntensity: 'none',
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'seg-yelahanka-main',
    name: 'Yelahanka New Town Main Road',
    neighbourhood: 'Yelahanka',
    lat: 13.1007, lng: 77.5963,
    normalAvgSpeed: 30, currentAvgSpeed: 24,
    normalTravelTime: 5, currentTravelTime: 7,
    movementSampleCount: 80, stoppedMovementCount: 9,
    speedVariance: 6.0,
    historicalFloodRisk: 'medium',
    nearbyCriticalLocations: ['CRPF School', 'Yelahanka Bus Stand'],
    emergencyPriority: false,
    status: 'slow',
    rainfallIntensity: 'light',
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'seg-rajajinagar-chord',
    name: 'Chord Road, Rajajinagar',
    neighbourhood: 'Rajajinagar',
    lat: 12.9974, lng: 77.5552,
    normalAvgSpeed: 32, currentAvgSpeed: 32,
    normalTravelTime: 7, currentTravelTime: 7,
    movementSampleCount: 110, stoppedMovementCount: 2,
    speedVariance: 3.5,
    historicalFloodRisk: 'low',
    nearbyCriticalLocations: ['Rajajinagar Metro Station'],
    emergencyPriority: false,
    status: 'normal',
    rainfallIntensity: 'none',
    lastUpdated: new Date().toISOString(),
    isSimulated: true,
  },
];

// ─── Abnormal segment state for HSR Underpass (rain simulation) ───────────────
export const ABNORMAL_HSR_SEGMENT: Partial<RoadSegment> = {
  currentAvgSpeed: 4,
  currentTravelTime: 22,
  movementSampleCount: 86,
  stoppedMovementCount: 47,
  speedVariance: 8.9,
  status: 'blocked',
  rainfallIntensity: 'heavy',
  lastUpdated: new Date().toISOString(),
};

// ─── Demo movement windows for HSR Underpass ─────────────────────────────────
const now = Date.now();
export const DEMO_MOVEMENT_WINDOWS: MovementWindow[] = [
  {
    id: 'mw-001', roadSegmentId: 'seg-hsr-underpass',
    windowStart: new Date(now - 30 * 60000).toISOString(),
    windowEnd:   new Date(now - 20 * 60000).toISOString(),
    avgSpeed: 26, travelTime: 4, sampleCount: 118, stoppedCount: 4,
    direction: 'both', rainfallIntensity: 'none', isSimulated: true,
  },
  {
    id: 'mw-002', roadSegmentId: 'seg-hsr-underpass',
    windowStart: new Date(now - 20 * 60000).toISOString(),
    windowEnd:   new Date(now - 10 * 60000).toISOString(),
    avgSpeed: 14, travelTime: 9, sampleCount: 102, stoppedCount: 18,
    direction: 'both', rainfallIntensity: 'moderate', isSimulated: true,
  },
  {
    id: 'mw-003', roadSegmentId: 'seg-hsr-underpass',
    windowStart: new Date(now - 10 * 60000).toISOString(),
    windowEnd:   new Date(now).toISOString(),
    avgSpeed: 4, travelTime: 22, sampleCount: 86, stoppedCount: 47,
    direction: 'both', rainfallIntensity: 'heavy', isSimulated: true,
  },
];

// ─── Demo agent trace for HSR Underpass anomaly ───────────────────────────────
export const DEMO_AGENT_TRACE: FlowAgentStep[] = [
  {
    phase: 'observe',
    label: 'Observe — Movement data ingested',
    detail: 'HSR Layout Underpass: current avg speed 4 km/h (86 anonymous movement samples in last 10 min). Last updated: just now.',
    status: 'done',
    timestamp: new Date(now - 11 * 60000).toISOString(),
  },
  {
    phase: 'compare',
    label: 'Compare — Baseline deviation calculated',
    detail: 'Normal avg speed: 28 km/h → Current: 4 km/h (−86%). Normal travel time: 4 min → Current: 22 min (+450%). Stopped movements: 47 out of 86 samples (55%).',
    status: 'done',
    timestamp: new Date(now - 10 * 60000).toISOString(),
  },
  {
    phase: 'detect',
    label: 'Detect — Severe anomaly flagged',
    detail: 'Speed reduction > 75% sustained for > 10 minutes with high stopped-movement count. Anomaly confidence threshold exceeded. Minimum sample count (50) met: 86 samples.',
    status: 'done',
    timestamp: new Date(now - 9 * 60000).toISOString(),
  },
  {
    phase: 'corroborate',
    label: 'Corroborate — Evidence gathered',
    detail: 'Simulated weather feed: Heavy rainfall active. Historical flood-risk index for this segment: HIGH. Nearest citizen report (within 500m): 1 unverified waterlogging report.',
    status: 'done',
    timestamp: new Date(now - 8 * 60000).toISOString(),
  },
  {
    phase: 'classify',
    label: 'Classify — Cause estimated',
    detail: 'Heavy rainfall + high historical flood risk + severe speed reduction + high stopped-movement count → Predicted cause: Flooding / Severe waterlogging. Alternative causes considered: accident (lower probability given rainfall), signal failure (no signal at this location).',
    status: 'done',
    timestamp: new Date(now - 7 * 60000).toISOString(),
  },
  {
    phase: 'score',
    label: 'Score — Risk calculated',
    detail: 'Risk score: 91/100. Factors: speed reduction 86% (+30), stopped movements 55% (+25), rainfall heavy (+15), historical flood risk high (+12), emergency corridor (+9).',
    status: 'done',
    timestamp: new Date(now - 6 * 60000).toISOString(),
  },
  {
    phase: 'recommend',
    label: 'Recommend — Action plan ready',
    detail: 'Risk ≥ 85 and emergency corridor → Immediate human review required. Recommend: public caution alert, redirect emergency traffic via 27th Main Road, dispatch BBMP inspection.',
    status: 'done',
    timestamp: new Date(now - 5 * 60000).toISOString(),
  },
  {
    phase: 'followup',
    label: 'Follow-up — Monitoring active',
    detail: 'System will re-evaluate movement window every 10 minutes. Alert will auto-escalate if speed remains < 8 km/h. Incident will be marked improving when speed exceeds 15 km/h.',
    status: 'pending',
  },
];

// ─── Demo risk factors ────────────────────────────────────────────────────────
export const DEMO_FLOW_RISK_FACTORS: FlowRiskFactor[] = [
  { label: 'Speed Reduction',          contribution: 30, detail: 'Average speed fell 86% from normal (28 → 4 km/h) — strongest single anomaly signal.' },
  { label: 'Stopped Movements',        contribution: 25, detail: '47 of 86 anonymous samples are effectively stopped (< 2 km/h), sustained for 11+ minutes.' },
  { label: 'Rainfall Intensity',       contribution: 15, detail: 'Heavy rainfall detected on simulated weather feed — strongly correlated with underpass flooding.' },
  { label: 'Historical Flood Risk',    contribution: 12, detail: 'This segment has a HIGH historical flood-risk index based on past incident data.' },
  { label: 'Emergency Corridor',       contribution: 9,  detail: 'This road is on an ambulance corridor — blockage has amplified civic impact.' },
];

// ─── Demo route ───────────────────────────────────────────────────────────────
export const DEMO_FLOW_ROUTE: FlowRoute = {
  blockedRoad: 'HSR Layout Underpass (18th Cross)',
  safeAlternative: '27th Main Road via Sector 2',
  additionalMinutes: 8,
  reason: 'HSR Layout Underpass has a high-confidence blockage. 27th Main Road is showing normal movement (avg 28 km/h).',
  waypoints: [
    { name: 'HSR Layout Sector 6',     type: 'start' },
    { name: 'HSR Layout Underpass',    type: 'avoid' },
    { name: '27th Main Road junction', type: 'via'   },
    { name: 'Agara Lake Road',         type: 'via'   },
    { name: 'BDA Complex, HSR Layout', type: 'end'   },
  ],
};

// ─── Demo emergency routes ────────────────────────────────────────────────────
export const DEMO_EMERGENCY_ROUTES: EmergencyRouteInfo[] = [
  {
    vehicleType: 'ambulance',
    currentRoute: 'HSR Layout Underpass → Agara Lake Road → NIMHANS',
    routeStatus: 'blocked',
    recommendedRoute: '27th Main Road → Outer Ring Road connector → NIMHANS',
    reason: 'Direct route has high-confidence blockage (risk 91/100). 27th Main Road is clear.',
    estimatedDelayAvoided: 12,
    disclaimer: 'RainReady FlowSense provides decision support only. Emergency operators remain responsible for route decisions.',
  },
  {
    vehicleType: 'fire',
    currentRoute: 'HSR Layout Underpass → Sector 1',
    routeStatus: 'at_risk',
    recommendedRoute: '24th Main Road → HSR Sector 1 via Agara',
    reason: 'Underpass flooding risk may delay heavy vehicles. Alternative recommended.',
    estimatedDelayAvoided: 7,
    disclaimer: 'RainReady FlowSense provides decision support only. Emergency operators remain responsible for route decisions.',
  },
  {
    vehicleType: 'police',
    currentRoute: 'HSR Layout Underpass patrol route',
    routeStatus: 'at_risk',
    recommendedRoute: '27th Main Road + perimeter patrol',
    reason: 'Underpass blocked — rerouting prevents patrol vehicles from being stranded.',
    estimatedDelayAvoided: 5,
    disclaimer: 'RainReady FlowSense provides decision support only. Emergency operators remain responsible for route decisions.',
  },
];

// ─── Demo incident (created when simulation triggers) ────────────────────────
export function buildDemoIncident(): FlowIncident {
  const t = new Date();
  const timeline: FlowTimelineEntry[] = [
    { time: new Date(t.getTime() - 11 * 60000).toISOString(), label: 'Abnormal movement detected', detail: 'Avg speed dropped to 4 km/h (normal: 28 km/h).', type: 'detect' },
    { time: new Date(t.getTime() - 10 * 60000).toISOString(), label: 'Heavy rainfall corroborated', detail: 'Simulated weather feed: heavy rainfall active.', type: 'corroborate' },
    { time: new Date(t.getTime() - 9  * 60000).toISOString(), label: 'Flooding predicted — 93% confidence', detail: 'Risk score: 91/100.', type: 'classify' },
    { time: new Date(t.getTime() - 7  * 60000).toISOString(), label: 'Awaiting human review', detail: 'Incident queued for reviewer approval.', type: 'review' },
  ];
  return {
    id: `fi-demo-${Date.now()}`,
    roadSegmentId: 'seg-hsr-underpass',
    predictedCause: 'flooding',
    severity: 'high',
    confidence: 93,
    detectedAt: new Date(t.getTime() - 11 * 60000).toISOString(),
    evidence: [
      'Average speed reduced by 86% (28 → 4 km/h)',
      'Travel time increased by 450% (4 → 22 min)',
      '47 of 86 anonymous movement samples stopped',
      'Heavy rainfall confirmed on simulated weather feed',
      'High historical flood-risk index for this road segment',
      'Anomaly sustained for 11+ continuous minutes',
    ],
    verificationStatus: 'pending',
    publicAlertStatus: 'awaiting_review',
    emergencyImpact: true,
    resolutionStatus: 'active',
    riskScore: 91,
    riskFactors: DEMO_FLOW_RISK_FACTORS,
    agentTrace: DEMO_AGENT_TRACE,
    routeSuggestion: DEMO_FLOW_ROUTE,
    timeline,
  };
}

// ─── FlowSense metrics baseline ───────────────────────────────────────────────
export const SEEDED_FLOW_METRICS: FlowMetrics = {
  segmentsMonitored: 5,
  activeIncidents: 0,
  alertsGenerated: 3,
  avgDetectionSeconds: 68,
  emergencyWarnings: 1,
  resolvedToday: 2,
  falseAlerts: 0,
  duplicateCitizenReportsAvoided: 8,
};
