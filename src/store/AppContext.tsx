import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Report, Alert, Task, DashboardMetrics, ReviewDecision, TaskStatus } from '../types';
import {
  SEEDED_REPORTS, SEEDED_ALERTS, SEEDED_TASKS, SEEDED_METRICS, DEMO_ANALYSIS
} from '../data/seedData';

// ─── State ────────────────────────────────────────────────────────────────────
interface AppState {
  reports: Report[];
  alerts: Alert[];
  tasks: Task[];
  metrics: DashboardMetrics;
  currentReportId: string | null;
  activeTab: string;
}

const initialState: AppState = {
  reports: SEEDED_REPORTS,
  alerts: SEEDED_ALERTS,
  tasks: SEEDED_TASKS,
  metrics: SEEDED_METRICS,
  currentReportId: null,
  activeTab: 'dashboard',
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT'; payload: Partial<Report> & { id: string } }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Partial<Task> & { id: string } }
  | { type: 'APPLY_REVIEW'; payload: ReviewDecision }
  | { type: 'SET_CURRENT_REPORT'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: Partial<DashboardMetrics> }
  | { type: 'RESOLVE_REPORT'; payload: { reportId: string; taskId: string } };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [action.payload, ...state.reports],
        metrics: { ...state.metrics, reportsReceived: state.metrics.reportsReceived + 1 },
      };

    case 'UPDATE_REPORT': {
      const updated = state.reports.map(r =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      );
      return { ...state, reports: updated };
    }

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
        metrics: {
          ...state.metrics,
          activeAlerts: state.metrics.activeAlerts + 1,
          reportsVerified: state.metrics.reportsVerified + 1,
        },
      };

    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'UPDATE_TASK': {
      const updated = state.tasks.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      return { ...state, tasks: updated };
    }

    case 'APPLY_REVIEW': {
      const { reportId, decision } = action.payload;
      const updatedReports = state.reports.map(r => {
        if (r.id !== reportId) return r;
        if (decision === 'approve') {
          return { ...r, status: 'verified' as const, verificationStatus: 'verified' as const };
        } else if (decision === 'reject') {
          return { ...r, status: 'rejected' as const, verificationStatus: 'rejected' as const };
        } else {
          return { ...r, verificationStatus: 'needs_info' as const };
        }
      });
      return { ...state, reports: updatedReports };
    }

    case 'SET_CURRENT_REPORT':
      return { ...state, currentReportId: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'UPDATE_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } };

    case 'RESOLVE_REPORT': {
      const { reportId, taskId } = action.payload;
      const updatedReports = state.reports.map(r =>
        r.id === reportId ? { ...r, status: 'resolved' as const } : r
      );
      const updatedTasks = state.tasks.map(t =>
        t.id === taskId
          ? { ...t, status: 'resolved' as TaskStatus, updatedAt: new Date().toISOString() }
          : t
      );
      const updatedAlerts = state.alerts.map(a =>
        a.reportId === reportId ? { ...a, isActive: false } : a
      );
      // Update neighbourhood stats
      const report = state.reports.find(r => r.id === reportId);
      const updatedNeighbourhoods = state.metrics.neighbourhoods.map(n => {
        if (report && n.name === report.neighbourhood) {
          return { ...n, activeAlerts: Math.max(0, n.activeAlerts - 1), riskLevel: 'info' as const };
        }
        return n;
      });
      return {
        ...state,
        reports: updatedReports,
        tasks: updatedTasks,
        alerts: updatedAlerts,
        metrics: {
          ...state.metrics,
          activeAlerts: Math.max(0, state.metrics.activeAlerts - 1),
          resolvedIncidents: state.metrics.resolvedIncidents + 1,
          avgResponseMinutes: Math.round(state.metrics.avgResponseMinutes * 0.9),
          neighbourhoods: updatedNeighbourhoods,
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  submitReport: (report: Report) => void;
  approveReport: (reportId: string, note: string) => void;
  rejectReport: (reportId: string, note: string) => void;
  resolveTask: (taskId: string, reportId: string, note: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, note?: string) => void;
  addDemoReport: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const submitReport = useCallback((report: Report) => {
    dispatch({ type: 'ADD_REPORT', payload: report });
  }, []);

  const approveReport = useCallback((reportId: string, note: string) => {
    const report = state.reports.find(r => r.id === reportId);
    if (!report?.analysis) return;

    dispatch({ type: 'APPLY_REVIEW', payload: { reportId, decision: 'approve', reviewerNote: note, reviewedAt: new Date().toISOString() } });

    // Create alert
    const alert: Alert = {
      id: `alt-${Date.now()}`,
      reportId,
      neighbourhood: report.analysis.neighbourhood,
      level: report.analysis.riskScore.level,
      title: `Waterlogging Alert — ${report.analysis.neighbourhood}`,
      description: `Verified waterlogging at ${report.analysis.location}. ${report.analysis.estimatedDepth ?? ''} water reported.`,
      affectedArea: `${report.analysis.affectedRoad} and surrounding lanes`,
      severity: report.analysis.severity,
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'Human Reviewer',
      doList: [
        `Use ${report.analysis.routeSuggestion?.safeAlternative ?? 'alternate routes'}`,
        'Allow extra travel time',
        'Drive with caution near the flood zone',
        'Follow BBMP advisory updates',
      ],
      avoidList: [
        report.analysis.affectedRoad,
        'Riding two-wheelers through standing water',
        'Parking on flooded roads',
      ],
      notifiedCount: Math.floor(Math.random() * 200) + 400,
      isActive: true,
    };
    dispatch({ type: 'ADD_ALERT', payload: alert });

    // Create task
    const task: Task = {
      id: `tsk-${Date.now()}`,
      reportId,
      title: `Deploy response team — ${report.analysis.neighbourhood}`,
      location: report.analysis.location,
      neighbourhood: report.analysis.neighbourhood,
      priority: report.analysis.severity,
      assignedTo: 'BBMP Zone 5 (HSR / Koramangala)',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requiredAction: 'Deploy water-pump unit, erect diversion signage, clear blocked drain',
      notes: [],
    };
    dispatch({ type: 'ADD_TASK', payload: task });

    // Update neighbourhood
    const updatedNeighbourhoods = state.metrics.neighbourhoods.map(n => {
      if (n.name === report.analysis!.neighbourhood) {
        return { ...n, activeAlerts: n.activeAlerts + 1, riskLevel: 'danger' as const, lastIncident: 'Just now' };
      }
      return n;
    });
    dispatch({ type: 'UPDATE_METRICS', payload: { neighbourhoods: updatedNeighbourhoods } });
  }, [state.reports, state.metrics.neighbourhoods]);

  const rejectReport = useCallback((reportId: string, _note: string) => {
    dispatch({ type: 'APPLY_REVIEW', payload: { reportId, decision: 'reject', reviewerNote: _note, reviewedAt: new Date().toISOString() } });
  }, []);

  const resolveTask = useCallback((taskId: string, reportId: string, note: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedNotes = note
      ? [...task.notes, { id: `note-${Date.now()}`, author: task.assignedTo, text: note, timestamp: new Date().toISOString() }]
      : task.notes;
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: 'resolved', notes: updatedNotes, updatedAt: new Date().toISOString() } });
    dispatch({ type: 'RESOLVE_REPORT', payload: { reportId, taskId } });
  }, [state.tasks]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, note?: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedNotes = note
      ? [...task.notes, { id: `note-${Date.now()}`, author: task.assignedTo, text: note, timestamp: new Date().toISOString() }]
      : task.notes;
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status, notes: updatedNotes, updatedAt: new Date().toISOString() } });
  }, [state.tasks]);

  const addDemoReport = useCallback((): string => {
    const id = `rpt-demo-${Date.now()}`;
    const demoReport: Report = {
      id,
      description: 'There is knee-deep water near the HSR Layout underpass. Two-wheelers are getting stuck and traffic is building up.',
      location: 'HSR Layout Underpass (18th Cross)',
      neighbourhood: 'HSR Layout',
      incidentType: 'waterlogging',
      language: 'en',
      anonymous: false,
      reporterAlias: 'Demo_User',
      submittedAt: new Date().toISOString(),
      status: 'analysed',
      verificationStatus: 'pending',
      duplicateGroupId: 'HSR-2024-11-08',
      duplicateCount: 4,
      analysis: { ...DEMO_ANALYSIS },
      isDemo: true,
    };
    dispatch({ type: 'ADD_REPORT', payload: demoReport });
    dispatch({ type: 'SET_CURRENT_REPORT', payload: id });
    return id;
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, submitReport, approveReport, rejectReport, resolveTask, updateTaskStatus, addDemoReport }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
