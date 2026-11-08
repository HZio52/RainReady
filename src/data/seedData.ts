import type {
  Report, Alert, Task, DashboardMetrics, NeighbourhoodStats, AgentStep, AIAnalysis, RiskScore, RouteSuggestion
} from '../types';

// ─── Seeded neighbourhood stats ──────────────────────────────────────────────
export const NEIGHBOURHOOD_STATS: NeighbourhoodStats[] = [
  { name: 'HSR Layout',    activeAlerts: 2, riskLevel: 'danger',  lastIncident: '2 hours ago',  totalReports: 14 },
  { name: 'Koramangala',   activeAlerts: 1, riskLevel: 'caution', lastIncident: '5 hours ago',  totalReports: 9  },
  { name: 'Whitefield',    activeAlerts: 0, riskLevel: 'info',    lastIncident: '1 day ago',    totalReports: 4  },
  { name: 'Yelahanka',     activeAlerts: 1, riskLevel: 'caution', lastIncident: '3 hours ago',  totalReports: 6  },
  { name: 'Rajajinagar',   activeAlerts: 0, riskLevel: 'info',    lastIncident: '2 days ago',   totalReports: 3  },
];

// ─── Seeded demo AI analysis for the HSR Layout flood report ─────────────────
export const DEMO_AGENT_STEPS: AgentStep[] = [
  {
    id: 'obs-1',
    phase: 'observe',
    label: 'Observe — Incoming report received',
    detail: 'Text report received in English. Location token: "HSR Layout underpass". Keywords detected: "knee-deep water", "two-wheelers stuck", "traffic building up".',
    status: 'done',
    timestamp: new Date(Date.now() - 18000).toISOString(),
  },
  {
    id: 'und-1',
    phase: 'understand',
    label: 'Understand — NLP extraction',
    detail: 'Incident type: Waterlogging/Flood hazard. Severity signals: "knee-deep" → High. Depth estimate: ~50–60 cm. Affected road: HSR Layout underpass approach. Confidence: 92%.',
    status: 'done',
    timestamp: new Date(Date.now() - 15000).toISOString(),
  },
  {
    id: 'ver-1',
    phase: 'verify',
    label: 'Verify — Duplicate & cross-reference check',
    detail: '4 matching reports in the last 2 hours from the same locality. Cross-referencing BBMP drainage alert feed (mock). Duplicate cluster identified: group HSR-2024-11-08.',
    status: 'done',
    timestamp: new Date(Date.now() - 12000).toISOString(),
  },
  {
    id: 'ass-1',
    phase: 'assess',
    label: 'Assess — Risk scoring',
    detail: 'Risk score: 82/100 (High). Factors: High severity (+30), knee-deep water (+25), 4 corroborating reports (+15), proximity to Agara Lake junction (+7), peak traffic corridor (+5).',
    status: 'done',
    timestamp: new Date(Date.now() - 9000).toISOString(),
  },
  {
    id: 'rec-1',
    phase: 'recommend',
    label: 'Recommend — Action plan',
    detail: 'Risk score ≥ 75 → Human verification required before broadcast. Recommended: issue neighbourhood alert after reviewer approval. Safer route: 27th Main Road via Sector 2 (+8 min).',
    status: 'done',
    timestamp: new Date(Date.now() - 6000).toISOString(),
  },
  {
    id: 'coo-1',
    phase: 'coordinate',
    label: 'Coordinate — Task created',
    detail: 'Response task auto-drafted for BBMP Zone 5 coordinator. Priority: High. Required action: Deploy water-pump unit and erect diversion signage.',
    status: 'done',
    timestamp: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: 'fol-1',
    phase: 'followup',
    label: 'Follow-up — Monitoring scheduled',
    detail: 'System will re-query reporter in 2 hours. Resolution check scheduled. Dashboard metrics will update on task closure.',
    status: 'pending',
  },
];

export const DEMO_RISK_SCORE: RiskScore = {
  total: 82,
  level: 'danger',
  factors: [
    { label: 'Incident Severity',          contribution: 30, detail: 'Reporter described "knee-deep" water — classified as High severity.' },
    { label: 'Estimated Water Depth',      contribution: 25, detail: 'Knee-deep (~50–60 cm) is dangerous for two-wheelers and elderly pedestrians.' },
    { label: 'Corroborating Reports',      contribution: 15, detail: '4 independent reports in the same 2-hour window confirm the incident.' },
    { label: 'Nearby Vulnerable Locations',contribution: 7,  detail: 'Agara Lake junction and HSR BDA Complex are within 500 m.' },
    { label: 'Peak Traffic Corridor',      contribution: 5,  detail: 'HSR underpass handles ~8,000 vehicles/day; flooding causes major diversion.' },
  ],
};

export const DEMO_ROUTE: RouteSuggestion = {
  unsafeRoad: 'HSR Layout Underpass (18th Cross)',
  safeAlternative: '27th Main Road via Sector 2',
  additionalMinutes: 8,
  reason: 'HSR Layout underpass has knee-deep standing water. 27th Main Road is clear and avoids the flood zone.',
  waypoints: [
    { name: 'HSR Layout Sector 6',       type: 'start' },
    { name: 'HSR Layout Underpass',       type: 'avoid' },
    { name: '27th Main Road junction',    type: 'waypoint' },
    { name: 'Agara Lake Road',            type: 'waypoint' },
    { name: 'BDA Complex, HSR Layout',    type: 'end' },
  ],
};

export const DEMO_ANALYSIS: AIAnalysis = {
  incidentType: 'waterlogging',
  location: 'HSR Layout Underpass (18th Cross)',
  neighbourhood: 'HSR Layout',
  severity: 'high',
  estimatedDepth: 'Knee-deep (~50–60 cm)',
  affectedRoad: 'HSR Layout Underpass approach, 18th Cross',
  nearbyVulnerablePlaces: [
    'Agara Lake Junction',
    'HSR BDA Complex',
    'Little Flower School (650 m)',
    'Apollo Clinic (800 m)',
  ],
  confidenceScore: 92,
  recommendedAction: 'Human verification required. Issue neighbourhood alert upon approval. Deploy drainage response team.',
  agentSteps: DEMO_AGENT_STEPS,
  riskScore: DEMO_RISK_SCORE,
  routeSuggestion: DEMO_ROUTE,
};

// ─── Seeded existing reports (other than the demo report) ────────────────────
export const SEEDED_REPORTS: Report[] = [
  {
    id: 'rpt-002',
    description: 'Water logging near Koramangala 5th block. Auto rickshaws refusing to go.',
    location: 'Koramangala 5th Block',
    neighbourhood: 'Koramangala',
    incidentType: 'waterlogging',
    severity: 'medium',
    language: 'en',
    anonymous: false,
    reporterAlias: 'Resident_K7',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'verified',
    verificationStatus: 'verified',
    analysis: {
      incidentType: 'waterlogging',
      location: 'Koramangala 5th Block',
      neighbourhood: 'Koramangala',
      severity: 'medium',
      estimatedDepth: 'Ankle-deep (~15–20 cm)',
      affectedRoad: 'Koramangala 5th Block Main Road',
      nearbyVulnerablePlaces: ['Forum Mall', 'Koramangala BDA Complex'],
      confidenceScore: 78,
      recommendedAction: 'Monitor and update public advisory',
      agentSteps: [],
      riskScore: { total: 55, level: 'caution', factors: [] },
    },
  },
  {
    id: 'rpt-003',
    description: 'yelahanka new town lo chinna chinna neerupotam unna, gutter overflow ayindi',
    location: 'Yelahanka New Town',
    neighbourhood: 'Yelahanka',
    incidentType: 'blocked_drain',
    severity: 'medium',
    language: 'hinglish',
    anonymous: true,
    reporterAlias: 'Anonymous',
    submittedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    status: 'analysed',
    verificationStatus: 'pending',
    analysis: {
      incidentType: 'blocked_drain',
      location: 'Yelahanka New Town',
      neighbourhood: 'Yelahanka',
      severity: 'medium',
      affectedRoad: 'Yelahanka New Town Main Road',
      nearbyVulnerablePlaces: ['CRPF School', 'Yelahanka Bus Stand'],
      confidenceScore: 71,
      recommendedAction: 'Dispatch drain-clearing crew',
      agentSteps: [],
      riskScore: { total: 48, level: 'caution', factors: [] },
    },
  },
  {
    id: 'rpt-004',
    description: 'ಹೆಚ್‌ಎಸ್‌ಆರ್ ಲೇಔಟ್ ಅಂಡರ್‌ಪಾಸ್ ಹತ್ತಿರ ಮೊಣಕಾಲು ಮಟ್ಟದ ನೀರು ನಿಂತಿದೆ',
    location: 'HSR Layout Underpass',
    neighbourhood: 'HSR Layout',
    incidentType: 'waterlogging',
    severity: 'high',
    language: 'kn',
    anonymous: false,
    reporterAlias: 'Resident_H3',
    submittedAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
    status: 'analysed',
    verificationStatus: 'pending',
    duplicateGroupId: 'HSR-2024-11-08',
    duplicateCount: 4,
  },
  {
    id: 'rpt-005',
    description: 'HSR underpass mein paani bahut zyada hai, bike wale phans rahe hain bhai',
    location: 'HSR Layout Underpass',
    neighbourhood: 'HSR Layout',
    incidentType: 'waterlogging',
    severity: 'high',
    language: 'hinglish',
    anonymous: true,
    reporterAlias: 'Anonymous',
    submittedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    status: 'analysed',
    verificationStatus: 'pending',
    duplicateGroupId: 'HSR-2024-11-08',
    duplicateCount: 4,
  },
];

// ─── Seeded active alerts ─────────────────────────────────────────────────────
export const SEEDED_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    reportId: 'rpt-002',
    neighbourhood: 'Koramangala',
    level: 'caution',
    title: 'Waterlogging — Koramangala 5th Block',
    description: 'Ankle-deep waterlogging reported on Koramangala 5th Block Main Road. Auto-rickshaws and two-wheelers are avoiding the area.',
    affectedArea: 'Koramangala 5th Block Main Road and surrounding lanes',
    severity: 'medium',
    verifiedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    verifiedBy: 'Reviewer_A',
    doList: ['Use Inner Ring Road as an alternative', 'Allow extra 10 minutes travel time', 'Drive slowly through puddles'],
    avoidList: ['5th Block Main Road near the park', 'Two-wheeler riding through standing water'],
    notifiedCount: 340,
    isActive: true,
  },
  {
    id: 'alt-002',
    reportId: 'rpt-003',
    neighbourhood: 'Yelahanka',
    level: 'caution',
    title: 'Drain Overflow — Yelahanka New Town',
    description: 'Blocked drain causing minor flooding near Yelahanka New Town Main Road. Drain-clearing crew has been alerted.',
    affectedArea: 'Yelahanka New Town Main Road (near Bus Stand)',
    severity: 'medium',
    verifiedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    verifiedBy: 'Reviewer_B',
    doList: ['Use alternate lanes', 'Report additional drain blockages'],
    avoidList: ['Parking near the drain', 'Allowing children near overflow area'],
    notifiedCount: 215,
    isActive: true,
  },
];

// ─── Seeded tasks ─────────────────────────────────────────────────────────────
export const SEEDED_TASKS: Task[] = [
  {
    id: 'tsk-001',
    reportId: 'rpt-002',
    title: 'Deploy water-pump — Koramangala 5th Block',
    location: 'Koramangala 5th Block Main Road',
    neighbourhood: 'Koramangala',
    priority: 'medium',
    assignedTo: 'BBMP Zone 4 (South)',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    requiredAction: 'Pump out standing water and clear blocked storm drain',
    notes: [
      {
        id: 'note-001',
        author: 'BBMP_Zone4',
        text: 'Team dispatched. ETA 30 minutes.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'tsk-002',
    reportId: 'rpt-003',
    title: 'Clear blocked drain — Yelahanka New Town',
    location: 'Yelahanka New Town (near Bus Stand)',
    neighbourhood: 'Yelahanka',
    priority: 'medium',
    assignedTo: 'BBMP Zone 1 (North)',
    status: 'open',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    requiredAction: 'Clear blocked drain and prevent overflow onto road',
    notes: [],
  },
];

// ─── Dashboard metrics (seeded baseline) ─────────────────────────────────────
export const SEEDED_METRICS: DashboardMetrics = {
  activeAlerts: 2,
  reportsReceived: 23,
  reportsVerified: 11,
  duplicatesRemoved: 7,
  avgResponseMinutes: 18,
  resolvedIncidents: 9,
  neighbourhoods: NEIGHBOURHOOD_STATS,
};
