import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import {
  RoadStatusBadge, RainfallBadge, SpeedBar, SimulatedDataTag, PrivacySafeTag
} from './FlowBadges';
import { TimeAgo } from '../ui/Badges';
import type { RoadSegment } from '../../types/flowsense';

const PHASE_LABELS = [
  '', '🌧️ Rainfall increasing…', '⬇️ Speed dropping…', '🔴 Severe blockage detected…',
  '🤖 Anomaly detector triggered…', '📋 Incident created — review required',
];

export default function FlowDashboard() {
  const { flowState, runSimulation, restoreNormal, flowDispatch } = useFlow();
  const { segments, incidents, metrics, activeSimulation, simulationPhase } = flowState;

  const activeIncidents = incidents.filter(i => i.resolutionStatus === 'active' || i.resolutionStatus === 'improving');
  const hsrSeg = segments.find(s => s.id === 'seg-hsr-underpass')!;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-700 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black mb-1">📡 RainReady FlowSense</h1>
            <p className="text-teal-100 text-sm max-w-md">
              Automatic road-condition detection from anonymised aggregated movement patterns
            </p>
            <div className="flex items-center gap-2 mt-2">
              <SimulatedDataTag />
              <PrivacySafeTag />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => runSimulation()}
              disabled={activeSimulation}
              className="bg-white text-teal-700 font-bold px-4 py-2.5 rounded-lg hover:bg-teal-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeSimulation ? '⏳ Simulation running…' : '⛈️ Simulate Heavy Rain near HSR Layout'}
            </button>
            <button
              onClick={restoreNormal}
              className="bg-teal-600 border border-teal-400 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-teal-500 transition-colors text-sm"
            >
              ☀️ Restore Normal Traffic
            </button>
          </div>
        </div>
      </div>

      {/* Simulation progress bar */}
      {activeSimulation && simulationPhase > 0 && (
        <div className="card p-4 bg-amber-50 border-amber-300 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="agent-pulse text-xl">⛈️</span>
            <p className="text-sm font-semibold text-amber-900">{PHASE_LABELS[simulationPhase]}</p>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div
              className="bg-amber-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${(simulationPhase / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard label="Segments Monitored"   value={metrics.segmentsMonitored}  icon="📡" />
        <KpiCard label="Active Incidents"     value={metrics.activeIncidents}    icon="🔴" highlight={metrics.activeIncidents > 0} />
        <KpiCard label="Alerts Generated"     value={metrics.alertsGenerated}    icon="🚨" />
        <KpiCard label="Avg Detection"        value={`${metrics.avgDetectionSeconds}s`}   icon="⏱" />
        <KpiCard label="Emergency Warnings"   value={metrics.emergencyWarnings}  icon="🚑" />
        <KpiCard label="Resolved Today"       value={metrics.resolvedToday}      icon="✅" />
        <KpiCard label="False Alerts"         value={metrics.falseAlerts}        icon="❌" />
        <KpiCard label="Duplicate Reports Avoided" value={metrics.duplicateCitizenReportsAvoided} icon="🔁" />
      </div>

      {/* Agentic pipeline banner */}
      <AgentPipelineBanner />

      {/* Active incidents strip */}
      {activeIncidents.length > 0 && (
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-red-900">⚠️ Active Incidents ({activeIncidents.length})</h2>
            <button onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-incidents' })} className="text-sm text-blue-600 hover:underline">View all →</button>
          </div>
          {activeIncidents.map(i => {
            const seg = segments.find(s => s.id === i.roadSegmentId);
            return (
              <div key={i.id} className="flex items-center gap-3 text-sm bg-white border border-red-200 rounded-lg px-3 py-2">
                <span>🔴</span>
                <span className="flex-1 font-medium">{seg?.name ?? i.roadSegmentId}</span>
                <span className="text-gray-500">{i.predictedCause.replace('_', ' ')} · {i.confidence}% confidence</span>
                <span className="text-xs text-gray-400"><TimeAgo iso={i.detectedAt} /></span>
              </div>
            );
          })}
        </div>
      )}

      {/* Road segment grid */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Road Segments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map(seg => <SegmentCard key={seg.id} segment={seg} isHighlighted={seg.id === 'seg-hsr-underpass' && activeSimulation} />)}
        </div>
      </div>

      {/* Privacy banner */}
      <PrivacyInfoBanner />
    </div>
  );
}

function SegmentCard({ segment: s, isHighlighted }: { segment: RoadSegment; isHighlighted: boolean }) {
  const speedReductionPct = Math.round(((s.normalAvgSpeed - s.currentAvgSpeed) / s.normalAvgSpeed) * 100);
  const travelTimeIncreasePct = Math.round(((s.currentTravelTime - s.normalTravelTime) / s.normalTravelTime) * 100);

  const borderColor =
    s.status === 'blocked' ? 'border-red-300 bg-red-50' :
    s.status === 'slow'    ? 'border-amber-300 bg-amber-50' :
    'border-gray-200 bg-white';

  return (
    <div className={clsx('rounded-xl border p-4 transition-all duration-700', borderColor, isHighlighted && 'ring-2 ring-red-400 shadow-lg')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{s.name}</p>
          <p className="text-xs text-gray-500">{s.neighbourhood}</p>
        </div>
        <RoadStatusBadge status={s.status} />
      </div>

      {/* Speed bar */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Avg Speed (current / normal)</p>
        <SpeedBar current={s.currentAvgSpeed} normal={s.normalAvgSpeed} />
        {speedReductionPct > 20 && (
          <p className="text-xs text-red-600 font-medium mt-0.5">⬇️ {speedReductionPct}% below normal</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
        <StatRow label="Travel time" value={`${s.currentTravelTime}m`} note={`normal ${s.normalTravelTime}m`} warn={travelTimeIncreasePct > 50} />
        <StatRow label="Samples"     value={`${s.movementSampleCount}`} note="anon. events" />
        <StatRow label="Stopped"     value={`${s.stoppedMovementCount}`} note="< 2 km/h" warn={s.stoppedMovementCount > 20} />
        <StatRow label="Flood risk"  value={s.historicalFloodRisk.toUpperCase()} warn={s.historicalFloodRisk === 'high'} />
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <RainfallBadge intensity={s.rainfallIntensity} />
        {s.emergencyPriority && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">🚑 Emergency Corridor</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>Updated <TimeAgo iso={s.lastUpdated} /></span>
        <span className="text-amber-600 font-medium">🔬 Simulated</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, note, warn }: { label: string; value: string; note?: string; warn?: boolean }) {
  return (
    <div>
      <span className="text-gray-400">{label}: </span>
      <span className={clsx('font-semibold', warn ? 'text-red-600' : 'text-gray-700')}>{value}</span>
      {note && <span className="text-gray-400"> ({note})</span>}
    </div>
  );
}

function KpiCard({ label, value, icon, highlight = false }: { label: string; value: string | number; icon: string; highlight?: boolean }) {
  return (
    <div className={clsx('card p-3', highlight && 'border-red-300 bg-red-50')}>
      <div className="text-xl mb-1">{icon}</div>
      <div className={clsx('text-xl font-black', highlight ? 'text-red-700' : 'text-gray-900')}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function AgentPipelineBanner() {
  const phases = [
    { icon: '👁', label: 'Observe' },
    { icon: '📐', label: 'Compare' },
    { icon: '⚡', label: 'Detect' },
    { icon: '🔗', label: 'Corroborate' },
    { icon: '🏷️', label: 'Classify' },
    { icon: '📊', label: 'Score' },
    { icon: '✅', label: 'Recommend' },
    { icon: '🔔', label: 'Follow Up' },
  ];
  return (
    <div className="card p-4 bg-gray-50">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🤖 FlowSense Agentic Pipeline — Fully Automatic Detection</p>
      <div className="flex items-center overflow-x-auto gap-0">
        {phases.map((p, i) => (
          <div key={p.label} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-base">{p.icon}</span>
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{p.label}</span>
            </div>
            {i < phases.length - 1 && <span className="text-gray-300 text-base font-bold">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyInfoBanner() {
  return (
    <div className="card p-4 bg-green-50 border-green-200">
      <div className="flex items-start gap-3">
        <span className="text-xl">🔒</span>
        <div>
          <p className="text-sm font-semibold text-green-900 mb-1">Privacy-First Design</p>
          <p className="text-xs text-green-800 leading-relaxed">
            FlowSense uses only <strong>anonymised, aggregated road-segment statistics</strong> — no individual phones, vehicle IDs or personal routes are tracked.
            All metrics shown (average speed, sample count, stopped vehicles) are aggregated across multiple anonymous movement events.
            A minimum of 50 movement samples is required before any anomaly is flagged.
            All data in this prototype is <strong>simulated</strong> and stored only in browser memory.
          </p>
        </div>
      </div>
    </div>
  );
}
