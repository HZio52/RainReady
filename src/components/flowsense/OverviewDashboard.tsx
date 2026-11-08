import { useFlow } from '../../store/FlowContext';
import { useApp } from '../../store/AppContext';
import { clsx } from 'clsx';
import { TimeAgo } from '../ui/Badges';
import type { FlowIncident, RoadSegment } from '../../types/flowsense';

// ── Critical Alert Banner ──────────────────────────────────────────────────────
function CriticalBanner() {
  const { flowState, flowDispatch } = useFlow();
  const active = flowState.incidents.find(i => i.resolutionStatus === 'active' && i.severity === 'high');
  if (!active) return null;
  const seg = flowState.segments.find(s => s.id === active.roadSegmentId);

  return (
    <div className="bg-red-600 text-white rounded-xl p-4 fade-up" role="alert" aria-live="assertive">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-white rounded-full live-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-red-200">High-confidence road hazard detected</span>
          </div>
          <p className="font-bold text-lg leading-tight">{seg?.name ?? 'Road Segment'}</p>
          <p className="text-red-100 text-sm mt-0.5">Severe waterlogging likely · Avg speed dropped from {seg?.normalAvgSpeed ?? 28} km/h to {seg?.currentAvgSpeed ?? 4} km/h</p>
          <p className="text-red-200 text-xs mt-1">Human verification required before public broadcast</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-review' })}
            className="btn bg-white text-red-700 hover:bg-red-50 font-semibold text-xs px-3 py-1.5"
          >
            Review Now
          </button>
          <button
            onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-emergency' })}
            className="btn bg-red-700 text-white border border-red-500 hover:bg-red-800 text-xs px-3 py-1.5"
          >
            Route Impact
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KPI Metric Card ───────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon, status, trend,
}: {
  label: string; value: string | number; sub?: string; icon: string;
  status?: 'normal' | 'warning' | 'danger'; trend?: string;
}) {
  const borderColor = status === 'danger' ? 'border-l-4 border-l-red-400' : status === 'warning' ? 'border-l-4 border-l-amber-400' : '';
  return (
    <div className={clsx('metric-card', borderColor)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xl" aria-hidden="true">{icon}</span>
        {trend && <span className="text-xs text-slate-400">{trend}</span>}
      </div>
      <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Road Segment Mini-card ─────────────────────────────────────────────────────
function SegmentMini({ seg }: { seg: RoadSegment }) {
  const pct = Math.round(((seg.normalAvgSpeed - seg.currentAvgSpeed) / seg.normalAvgSpeed) * 100);
  const statusCls = seg.status === 'blocked' ? 'border-red-300 bg-red-50' : seg.status === 'slow' ? 'border-amber-200 bg-amber-50' : 'border-surface-200 bg-white';
  const dotCls    = seg.status === 'blocked' ? 'bg-red-500' : seg.status === 'slow' ? 'bg-amber-500' : 'bg-teal-500';
  return (
    <div className={clsx('rounded-xl border px-4 py-3 flex items-center gap-3 transition-all', statusCls)}>
      <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', dotCls)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{seg.name}</p>
        <p className="text-xs text-slate-500">{seg.neighbourhood}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={clsx('text-base font-black tabular-nums', seg.status === 'blocked' ? 'text-red-600' : seg.status === 'slow' ? 'text-amber-600' : 'text-teal-600')}>
          {seg.currentAvgSpeed} <span className="text-xs font-normal">km/h</span>
        </p>
        {pct > 15 && <p className="text-xs text-red-500 font-medium">↓{pct}%</p>}
      </div>
    </div>
  );
}

// ── AI Activity Trace (mini) ───────────────────────────────────────────────────
function MiniTrace({ incident }: { incident: FlowIncident }) {
  const done = incident.agentTrace.filter(s => s.status === 'done');
  return (
    <div className="space-y-2">
      {done.slice(-3).map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-xs text-teal-600 flex-shrink-0">✓</div>
          <div>
            <p className="text-xs font-semibold text-slate-700 capitalize">{step.phase}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Overview Dashboard ────────────────────────────────────────────────────────
export default function OverviewDashboard() {
  const { flowState, runSimulation, restoreNormal, flowDispatch } = useFlow();
  const { state, dispatch, addDemoReport } = useApp();
  const { segments, incidents, metrics, activeSimulation } = flowState;
  const activeIncidents = incidents.filter(i => i.resolutionStatus === 'active' || i.resolutionStatus === 'improving');
  const latestIncident = activeIncidents[0];

  function handleLoadDemo() {
    addDemoReport();
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto fade-up">

      {/* Critical banner */}
      <CriticalBanner />

      {/* Demo controls strip */}
      <div className="card p-4 bg-slate-50 border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">🎬</span>
            <div>
              <p className="text-xs font-semibold text-slate-700">Demo Mode</p>
              <p className="text-xs text-slate-400">Simulated aggregated mobility telemetry</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button
              onClick={() => runSimulation()}
              disabled={activeSimulation}
              className={clsx('btn btn-sm', activeSimulation ? 'btn-secondary opacity-60' : 'btn-warning')}
            >
              {activeSimulation ? (
                <><span className="agent-running">⛈️</span> Simulation running…</>
              ) : '⛈️ Simulate Heavy Rain — HSR Layout'}
            </button>
            <button onClick={() => restoreNormal()} className="btn btn-sm btn-secondary">☀️ Restore Normal</button>
            <button onClick={handleLoadDemo} className="btn btn-sm btn-secondary">📝 Report Demo</button>
          </div>
        </div>
        {activeSimulation && (
          <div className="mt-3 h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: `${(flowState.simulationPhase / 5) * 100}%`, transition: 'width 0.7s ease' }} />
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Active Hazards"       value={metrics.activeIncidents}  icon="⚠️" status={metrics.activeIncidents > 0 ? 'danger' : 'normal'} sub={metrics.activeIncidents > 0 ? 'Requires attention' : 'All clear'} />
        <MetricCard label="Segments Monitored"   value={metrics.segmentsMonitored} icon="📡" sub="Bengaluru roads" />
        <MetricCard label="Avg Detection Time"   value={`${metrics.avgDetectionSeconds}s`} icon="⏱" sub="Target: < 120s" trend="Prototype" />
        <MetricCard label="Verified Alerts"      value={metrics.alertsGenerated}  icon="✅" sub="This session" />
        <MetricCard label="Emergency Warnings"   value={metrics.emergencyWarnings} icon="🚑" sub="Corridors affected" status={metrics.emergencyWarnings > 0 ? 'warning' : 'normal'} />
        <MetricCard label="Resolved Today"       value={metrics.resolvedToday}    icon="🎉" sub="Simulated data" />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Road conditions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Live Road Conditions</h2>
            <button
              onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-roads' })}
              className="text-xs text-navy-600 hover:underline font-medium"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {segments.map(seg => <SegmentMini key={seg.id} seg={seg} />)}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-teal-500 rounded-full" />Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full" />Movement anomaly</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full" />High-confidence hazard</span>
          </div>
        </div>

        {/* RIGHT: Incidents + AI trace */}
        <div className="space-y-4">
          {/* Active incidents */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Active Incidents</h2>
            {activeIncidents.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm font-medium text-slate-700">No active hazards</p>
                <p className="text-xs text-slate-400 mt-1">All monitored roads are clear</p>
              </div>
            ) : activeIncidents.map(inc => {
              const seg = segments.find(s => s.id === inc.roadSegmentId);
              return (
                <div key={inc.id} className="card p-4 border-l-4 border-l-red-400 mb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{seg?.name ?? inc.roadSegmentId}</p>
                      <p className="text-xs text-slate-500">{seg?.neighbourhood} · <TimeAgo iso={inc.detectedAt} /></p>
                    </div>
                    <span className="chip-high">{inc.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{inc.predictedCause.replace('_', ' ')} · Risk {inc.riskScore}/100</p>
                  <button
                    onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-incidents' })}
                    className="btn btn-sm btn-secondary w-full"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          {/* AI activity trace */}
          {latestIncident && (
            <div className="card p-4">
              <p className="section-title">AI Activity Trace</p>
              <MiniTrace incident={latestIncident} />
              <button
                onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-incidents' })}
                className="text-xs text-navy-600 hover:underline font-medium mt-3 block"
              >
                Full trace →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Recent reports from community */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Recent Community Reports</h2>
          <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' })} className="text-xs text-navy-600 hover:underline font-medium">View all →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.reports.slice(0, 3).map(r => (
            <div key={r.id} className="flex items-start gap-3 rounded-lg bg-surface-50 border border-surface-200 p-3">
              <span className="text-lg flex-shrink-0">
                {r.incidentType === 'waterlogging' ? '💧' : r.incidentType === 'flood' ? '🌊' : r.incidentType === 'blocked_drain' ? '🚧' : '⚠️'}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{r.neighbourhood}</p>
                <p className="text-xs text-slate-500 truncate">{r.description.slice(0, 55)}…</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={clsx('text-xs font-semibold',
                    r.verificationStatus === 'verified' ? 'text-teal-600' :
                    r.verificationStatus === 'rejected' ? 'text-red-500' : 'text-amber-600'
                  )}>
                    {r.verificationStatus === 'verified' ? '✓ Verified' : r.verificationStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400"><TimeAgo iso={r.submittedAt} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
