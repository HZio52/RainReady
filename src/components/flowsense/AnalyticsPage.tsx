import { useFlow } from '../../store/FlowContext';
import { useApp } from '../../store/AppContext';
import { clsx } from 'clsx';

// Simple SVG bar chart
function BarChart({ data, label, max }: { data: { label: string; value: number; color: string }[]; label: string; max?: number }) {
  const peak = max ?? Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <p className="section-title">{label}</p>
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-bold tabular-nums text-slate-700">{d.value}</span>
            <div className="w-full rounded-t-sm transition-all duration-700" style={{ height: `${(d.value / peak) * 80}px`, background: d.color }} />
            <span className="text-2xs text-slate-400 text-center leading-tight">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple mini-line using SVG
function SparkLine({ values, color = '#14b8a6' }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 120, h = 32;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricBlock({ label, value, sub, note, trend }: { label: string; value: string; sub?: string; note?: string; trend?: number[] }) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="text-2xl font-black tabular-nums text-slate-900">{value}</p>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
      {note && <p className="text-xs text-amber-600 italic">{note}</p>}
      {trend && <div className="mt-2"><SparkLine values={trend} /></div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { flowState } = useFlow();
  const { state } = useApp();
  const { metrics, incidents } = flowState;

  const causeData = [
    { label: 'Flooding',    value: incidents.filter(i => i.predictedCause === 'flooding').length,       color: '#3b82f6' },
    { label: 'Blockage',    value: incidents.filter(i => i.predictedCause === 'road_blockage').length,  color: '#f59e0b' },
    { label: 'Traffic',     value: incidents.filter(i => i.predictedCause === 'heavy_traffic').length,  color: '#8b5cf6' },
    { label: 'Accident',    value: incidents.filter(i => i.predictedCause === 'accident').length,       color: '#ef4444' },
    { label: 'Other',       value: incidents.filter(i => !['flooding','road_blockage','heavy_traffic','accident'].includes(i.predictedCause)).length, color: '#6b7280' },
  ];

  const statusData = [
    { label: 'Active',     value: incidents.filter(i => i.resolutionStatus === 'active').length,     color: '#ef4444' },
    { label: 'Improving',  value: incidents.filter(i => i.resolutionStatus === 'improving').length,  color: '#f59e0b' },
    { label: 'Resolved',   value: metrics.resolvedToday,                                              color: '#14b8a6' },
    { label: 'False Alarm',value: metrics.falseAlerts,                                                color: '#9ca3af' },
  ];

  const detectionTrend = [110, 95, 82, 68, metrics.avgDetectionSeconds];

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-8 fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Analytics & Impact</h1>
        <p className="text-sm text-slate-500 mt-1">Prototype measurements · All values are simulated unless otherwise stated</p>
      </div>

      {/* Primary impact target */}
      <div className="card p-6 bg-navy-950 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-300 mb-3">Primary Impact Target</p>
        <p className="text-2xl font-black leading-tight text-balance mb-2">
          Generate an explainable road-condition alert in under 2 minutes — without requiring a person to stand at the location.
        </p>
        <div className="flex flex-wrap gap-6 mt-4">
          <div>
            <p className="text-3xl font-black tabular-nums text-teal-400">{metrics.avgDetectionSeconds}s</p>
            <p className="text-xs text-navy-300 mt-0.5">Avg detection time (simulated)</p>
          </div>
          <div>
            <p className="text-3xl font-black tabular-nums text-teal-400">&lt; 120s</p>
            <p className="text-xs text-navy-300 mt-0.5">Prototype target</p>
          </div>
          <div>
            <p className="text-3xl font-black tabular-nums text-teal-400">{metrics.duplicateCitizenReportsAvoided}</p>
            <p className="text-xs text-navy-300 mt-0.5">Duplicate reports avoided (simulated)</p>
          </div>
        </div>
        <p className="text-xs text-navy-400 mt-4 italic">⚠ Prototype measurement. No real-world field data has been collected.</p>
      </div>

      {/* Metric blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricBlock label="Avg Detection Time"   value={`${metrics.avgDetectionSeconds}s`} sub="Target: < 120s" note="Prototype" trend={detectionTrend} />
        <MetricBlock label="Active Incidents"      value={String(metrics.activeIncidents)}    sub="Current session" />
        <MetricBlock label="Resolved Today"        value={String(metrics.resolvedToday)}      sub="Simulated" />
        <MetricBlock label="False Alerts"          value={String(metrics.falseAlerts)}        sub="Human-rejected" />
        <MetricBlock label="Emergency Warnings"    value={String(metrics.emergencyWarnings)}  sub="Corridors" />
        <MetricBlock label="Segments Monitored"    value={String(metrics.segmentsMonitored)}  sub="Bengaluru roads" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <BarChart label="Incidents by Predicted Cause" data={causeData} />
          <p className="text-xs text-slate-400 mt-3 italic">Simulated prototype data</p>
        </div>
        <div className="card p-5">
          <BarChart label="Incidents by Status" data={statusData} />
          <p className="text-xs text-slate-400 mt-3 italic">Session data</p>
        </div>
      </div>

      {/* Workflow timing */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Workflow Timing</h2>
        <div className="space-y-4">
          {[
            { label: 'Movement anomaly → Detection',        value: `${metrics.avgDetectionSeconds}s`, target: '< 120s', ok: metrics.avgDetectionSeconds < 120 },
            { label: 'Detection → Human review',            value: '~2m',  target: '< 5m',   ok: true },
            { label: 'Human review → Public alert',         value: '~1m',  target: 'Manual', ok: true },
            { label: 'Detection → Route recommendation',    value: '~30s', target: '< 2m',   ok: true },
            { label: 'Alert → Recovery monitoring start',   value: 'Auto', target: 'Instant', ok: true },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{row.label}</p>
              </div>
              <p className="text-sm font-bold tabular-nums text-slate-900 w-16 text-right flex-shrink-0">{row.value}</p>
              <p className="text-xs text-slate-400 w-20 text-right flex-shrink-0">{row.target}</p>
              <span className={clsx('text-xs font-semibold flex-shrink-0', row.ok ? 'text-teal-600' : 'text-amber-600')}>
                {row.ok ? '✓' : '~'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-600 italic mt-4">All timing values are simulated prototype estimates.</p>
      </div>

      {/* Community report stats */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Community Reports (Manual System)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Total Reports" value={String(state.metrics.reportsReceived)} />
          <Stat label="Verified"      value={String(state.metrics.reportsVerified)} />
          <Stat label="Duplicates Removed" value={String(state.metrics.duplicatesRemoved)} />
          <Stat label="Resolved"      value={String(state.metrics.resolvedIncidents)} />
        </div>
      </div>

      {/* Honesty box */}
      <div className="alert-warning">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Prototype Limitations</p>
          <ul className="text-xs text-amber-800 mt-1 space-y-0.5 list-disc list-inside">
            <li>All movement telemetry is simulated — no real mobile data or GPS</li>
            <li>No real weather API — rainfall is seeded in the demo scenario</li>
            <li>Timing figures are illustrative prototype targets, not measured results</li>
            <li>State resets on page refresh (browser memory only)</li>
            <li>5 road segments seeded; production would monitor hundreds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-50 rounded-xl border border-surface-200 p-4 text-center">
      <p className="text-2xl font-black tabular-nums text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
}
