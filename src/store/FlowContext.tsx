import { createContext, useContext, useReducer, useCallback, useRef, type ReactNode } from 'react';
import type { RoadSegment, FlowIncident, FlowMetrics, MovementWindow } from '../types/flowsense';
import {
  NORMAL_SEGMENTS, ABNORMAL_HSR_SEGMENT, DEMO_MOVEMENT_WINDOWS,
  buildDemoIncident, SEEDED_FLOW_METRICS,
} from '../data/flowSeedData';

// ─── State ────────────────────────────────────────────────────────────────────
interface FlowState {
  segments: RoadSegment[];
  incidents: FlowIncident[];
  movementWindows: MovementWindow[];
  metrics: FlowMetrics;
  activeSimulation: boolean;   // HSR rain simulation running
  simulationPhase: number;     // 0–8 steps of the simulation
  activeTab: string;           // sub-tab within FlowSense
}

const initialFlowState: FlowState = {
  segments: NORMAL_SEGMENTS,
  incidents: [],
  movementWindows: DEMO_MOVEMENT_WINDOWS,
  metrics: SEEDED_FLOW_METRICS,
  activeSimulation: false,
  simulationPhase: 0,
  activeTab: 'flow-dashboard',
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type FlowAction =
  | { type: 'UPDATE_SEGMENT'; payload: Partial<RoadSegment> & { id: string } }
  | { type: 'ADD_INCIDENT'; payload: FlowIncident }
  | { type: 'UPDATE_INCIDENT'; payload: Partial<FlowIncident> & { id: string } }
  | { type: 'SET_SIMULATION'; payload: boolean }
  | { type: 'SET_SIM_PHASE'; payload: number }
  | { type: 'SET_FLOW_TAB'; payload: string }
  | { type: 'UPDATE_FLOW_METRICS'; payload: Partial<FlowMetrics> }
  | { type: 'RESET_SEGMENTS' }
  | { type: 'ADD_TIMELINE_ENTRY'; payload: { incidentId: string; entry: FlowIncident['timeline'][0] } };

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'UPDATE_SEGMENT': {
      const updated = state.segments.map(s =>
        s.id === action.payload.id ? { ...s, ...action.payload, lastUpdated: new Date().toISOString() } : s
      );
      return { ...state, segments: updated };
    }

    case 'ADD_INCIDENT':
      return {
        ...state,
        incidents: [action.payload, ...state.incidents],
        metrics: { ...state.metrics, activeIncidents: state.metrics.activeIncidents + 1 },
      };

    case 'UPDATE_INCIDENT': {
      const updated = state.incidents.map(i =>
        i.id === action.payload.id ? { ...i, ...action.payload } : i
      );
      return { ...state, incidents: updated };
    }

    case 'ADD_TIMELINE_ENTRY': {
      const updated = state.incidents.map(i => {
        if (i.id !== action.payload.incidentId) return i;
        return { ...i, timeline: [...i.timeline, action.payload.entry] };
      });
      return { ...state, incidents: updated };
    }

    case 'SET_SIMULATION':
      return { ...state, activeSimulation: action.payload };

    case 'SET_SIM_PHASE':
      return { ...state, simulationPhase: action.payload };

    case 'SET_FLOW_TAB':
      return { ...state, activeTab: action.payload };

    case 'UPDATE_FLOW_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } };

    case 'RESET_SEGMENTS':
      return {
        ...state,
        segments: NORMAL_SEGMENTS.map(s => ({ ...s, lastUpdated: new Date().toISOString() })),
        activeSimulation: false,
        simulationPhase: 0,
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface FlowContextValue {
  flowState: FlowState;
  flowDispatch: React.Dispatch<FlowAction>;
  runSimulation: () => Promise<void>;
  restoreNormal: () => void;
  approveIncident: (incidentId: string, note: string) => void;
  rejectIncident: (incidentId: string, note: string) => void;
  resolveIncident: (incidentId: string) => void;
}

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowState, flowDispatch] = useReducer(flowReducer, initialFlowState);
  const incidentIdRef = useRef<string | null>(null);

  const runSimulation = useCallback(async () => {
    if (flowState.activeSimulation) return;
    flowDispatch({ type: 'SET_SIMULATION', payload: true });
    flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' });

    const steps = [
      // Phase 0 — start rainfall, speed starts dropping
      async () => {
        flowDispatch({ type: 'UPDATE_SEGMENT', payload: { id: 'seg-hsr-underpass', rainfallIntensity: 'heavy', currentAvgSpeed: 18, currentTravelTime: 8, status: 'slow' } });
        flowDispatch({ type: 'SET_SIM_PHASE', payload: 1 });
      },
      // Phase 1 — speed drops further, stopped count rises
      async () => {
        flowDispatch({ type: 'UPDATE_SEGMENT', payload: { id: 'seg-hsr-underpass', currentAvgSpeed: 9, currentTravelTime: 14, stoppedMovementCount: 28, movementSampleCount: 92 } });
        flowDispatch({ type: 'SET_SIM_PHASE', payload: 2 });
      },
      // Phase 2 — full abnormal state
      async () => {
        flowDispatch({ type: 'UPDATE_SEGMENT', payload: { id: 'seg-hsr-underpass', ...ABNORMAL_HSR_SEGMENT } });
        flowDispatch({ type: 'SET_SIM_PHASE', payload: 3 });
      },
      // Phase 3 — anomaly detector fires, create incident
      async () => {
        const incident = buildDemoIncident();
        incidentIdRef.current = incident.id;
        flowDispatch({ type: 'ADD_INCIDENT', payload: incident });
        flowDispatch({ type: 'SET_SIM_PHASE', payload: 4 });
        flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' });
      },
      // Phase 4 — move to review (auto-navigate handled in component)
      async () => {
        flowDispatch({ type: 'SET_SIM_PHASE', payload: 5 });
        flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-incidents' });
      },
    ];

    for (const step of steps) {
      await delay(900);
      await step();
    }
  }, [flowState.activeSimulation]);

  const restoreNormal = useCallback(() => {
    flowDispatch({ type: 'RESET_SEGMENTS' });
    // Mark active incident as improving then resolved
    const activeIncident = flowState.incidents.find(i => i.resolutionStatus === 'active');
    if (activeIncident) {
      flowDispatch({ type: 'ADD_TIMELINE_ENTRY', payload: {
        incidentId: activeIncident.id,
        entry: { time: new Date().toISOString(), label: 'Movement beginning to recover', detail: 'Avg speed rising above 15 km/h. Rainfall reducing.', type: 'recover' },
      }});
      flowDispatch({ type: 'UPDATE_INCIDENT', payload: { id: activeIncident.id, resolutionStatus: 'improving' } });
      setTimeout(() => {
        flowDispatch({ type: 'ADD_TIMELINE_ENTRY', payload: {
          incidentId: activeIncident.id,
          entry: { time: new Date().toISOString(), label: 'Incident marked resolved', detail: 'Avg speed returned to normal. Alert deactivated.', type: 'resolve' },
        }});
        flowDispatch({ type: 'UPDATE_INCIDENT', payload: { id: activeIncident.id, resolutionStatus: 'resolved', publicAlertStatus: 'rejected' } });
        flowDispatch({ type: 'UPDATE_FLOW_METRICS', payload: {
          activeIncidents: Math.max(0, flowState.metrics.activeIncidents - 1),
          resolvedToday: flowState.metrics.resolvedToday + 1,
        }});
      }, 2000);
    }
    flowDispatch({ type: 'SET_SIM_PHASE', payload: 0 });
    flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' });
  }, [flowState.incidents, flowState.metrics]);

  const approveIncident = useCallback((incidentId: string, note: string) => {
    const now = new Date().toISOString();
    flowDispatch({ type: 'UPDATE_INCIDENT', payload: {
      id: incidentId,
      verificationStatus: 'verified',
      publicAlertStatus: 'approved',
      reviewerNote: note,
      reviewedAt: now,
    }});
    flowDispatch({ type: 'ADD_TIMELINE_ENTRY', payload: {
      incidentId,
      entry: { time: now, label: 'Human review completed — alert approved', detail: note || 'Reviewer approved the alert.', type: 'review' },
    }});
    flowDispatch({ type: 'ADD_TIMELINE_ENTRY', payload: {
      incidentId,
      entry: { time: new Date(Date.now() + 1000).toISOString(), label: 'Public alert published', detail: 'Verified road hazard broadcast to nearby commuters.', type: 'alert' },
    }});
    flowDispatch({ type: 'ADD_TIMELINE_ENTRY', payload: {
      incidentId,
      entry: { time: new Date(Date.now() + 2000).toISOString(), label: 'Emergency route redirected', detail: 'Ambulance corridor advisory issued via 27th Main Road.', type: 'emergency' },
    }});
    flowDispatch({ type: 'UPDATE_FLOW_METRICS', payload: { alertsGenerated: flowState.metrics.alertsGenerated + 1, emergencyWarnings: flowState.metrics.emergencyWarnings + 1 }});
    flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-alerts' });
  }, [flowState.metrics]);

  const rejectIncident = useCallback((incidentId: string, note: string) => {
    flowDispatch({ type: 'UPDATE_INCIDENT', payload: {
      id: incidentId, verificationStatus: 'rejected', publicAlertStatus: 'rejected', reviewerNote: note, reviewedAt: new Date().toISOString(),
    }});
    flowDispatch({ type: 'UPDATE_FLOW_METRICS', payload: { falseAlerts: flowState.metrics.falseAlerts + 1, activeIncidents: Math.max(0, flowState.metrics.activeIncidents - 1) }});
  }, [flowState.metrics]);

  const resolveIncident = useCallback((incidentId: string) => {
    const now = new Date().toISOString();
    flowDispatch({ type: 'UPDATE_INCIDENT', payload: { id: incidentId, resolutionStatus: 'resolved', publicAlertStatus: 'rejected' }});
    flowDispatch({ type: 'ADD_TIMELINE_ENTRY', payload: { incidentId, entry: { time: now, label: 'Incident manually resolved', type: 'resolve' }}});
    flowDispatch({ type: 'UPDATE_FLOW_METRICS', payload: {
      activeIncidents: Math.max(0, flowState.metrics.activeIncidents - 1),
      resolvedToday: flowState.metrics.resolvedToday + 1,
    }});
  }, [flowState.metrics]);

  return (
    <FlowContext.Provider value={{ flowState, flowDispatch, runSimulation, restoreNormal, approveIncident, rejectIncident, resolveIncident }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used inside FlowProvider');
  return ctx;
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
