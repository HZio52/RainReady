import { useState } from 'react';
import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import type { RoadSegment, RainfallIntensity } from '../../types/flowsense';
import { TimeAgo } from '../ui/Badges';

const RAIN_LABELS: Record<RainfallIntensity, string> = {
  none: '☀️ No Rain', light: '🌦 Light', moderate: '🌧️ Moderate', heavy: '⛈ Heavy', very_heavy: '🌊 Very Heavy',
};

const STATUS_META = {
  normal:  { label: 'Normal',              dot: 'bg-teal-500',  card: '',                      text: 'text-teal-700'   },
  slow:    { label: 'Movement Anomaly',    dot: 'bg-amber-500', card: 'border-l-4 border-l-amber-400', text: 'text-amber-700' },
  blocked: { label: 'High-Confidence Hazard', dot: 'bg-red-500', card: 'border-l-4 border-l-red-500', text: 'text-red-700' },
  unknown: { label: 'Data Unavailable',    dot: 'bg-slate-300', card: '',                      text: 'text-slate-500'  },
};

function SpeedBar({ current, normal }: { current: number; normal: number }) {
  const pct = Math.min(100, Math.round((current / normal) * 100));
  const color = pct >= 75 ? 'bg-teal-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 speed-bar-track">
        <div className={clsx('speed-bar-fill', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono tabular-nums text-slate-600 w-24 text-right">
        <span className={clsx('font-bold', pct < 40 ? 'text-red-600' : pct < 75 ? 'text-amber-600' : 'text-teal-600')}>{current}</span>
        <span className="text-slate-400"> / {normal} km/h</span>
      </span>
    </div>
  );
}

function SegmentCard({ seg }: { seg: RoadSegment }) {
  const meta = STATUS_META[seg.status];
  const speedDrop = Math.round(((seg.normalAvgSpeed - seg.currentAvgSpeed) / seg.normalAvgSpeed) * 100);
  const timeDelta = seg.currentTravelTime - seg.normalTravelTime;

  return (
    <div className={clsx('card p-5 transition-all duration-500', meta.card)}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', meta.dot, seg.status === 'blocked' && 'live-pulse')} aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900">{seg.name}</h3>
          </div>
          <p className="text-xs text-slate-500 ml-5">{seg.neighbourhood}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('badge text-xs', meta.text, seg.status === 'normal' ? 'badge-normal' : seg.status === 'slow' ? 'badge-warning' : 'badge-danger')}>
            {meta.label}
          </span>
          {seg.emergencyPriority && <span className="badge bg-navy-50 text-navy-700 border-navy-100">🚑 Emergency Corridor</span>}
        </div>
      </div>

      {/* Speed bar */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Average Speed (current / normal)</p>
        <SpeedBar current={seg.currentAvgSpeed} normal={seg.normalAvgSpeed} />
        {speedDrop > 20 && (
          <p className="text-xs text-red-500 font-semibold mt-1">⬇ {speedDrop}% below normal baseline</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <Stat label="Travel Time" value={`${seg.currentTravelTime}m`} sub={`+${timeDelta}m` } warn={timeDelta > 5} />
        <Stat label="Samples"     value={String(seg.movementSampleCount)} sub="anonymous" />
        <Stat label="Stopped"     value={String(seg.stoppedMovementCount)} sub="< 2 km/h" warn={seg.stoppedMovementCount > 20} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span>{RAIN_LABELS[seg.rainfallIntensity]}</span>
          <span>·</span>
          <span>Flood risk: <span className={clsx('font-semibold', seg.historicalFloodRisk === 'high' ? 'text-red-500' : seg.historicalFloodRisk === 'medium' ? 'text-amber-500' : 'text-teal-500')}>{seg.historicalFloodRisk.toUpperCase()}</span></span>
        </span>
        <span>Updated <TimeAgo iso={seg.lastUpdated} /></span>
      </div>

      {/* Simulated label */}
      <div className="mt-2 flex items-center gap-1 text-2xs text-amber-600">
        <span>🔬</span><span>Simulated aggregated telemetry · No individual tracking</span>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className="bg-surface-50 rounded-lg py-2 px-1">
      <p className={clsx('text-base font-black tabular-nums', warn ? 'text-red-600' : 'text-slate-800')}>{value}</p>
      <p className="text-xs text-slate-600 font-medium leading-none mt-0.5">{label}</p>
      {sub && <p className="text-2xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function RoadConditions() {
  const { flowState, runSimulation, restoreNormal } = useFlow();
  const { segments, metrics } = flowState;
  const [filter, setFilter] = useState<'all' | 'normal' | 'slow' | 'blocked'>('all');
  const [neighbourhood, setNeighbourhood] = useState('all');

  const neighbourhoods = ['all', ...new Set(segments.map(s => s.neighbourhood))];
  const filtered = segments
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => neighbourhood === 'all' || s.neighbourhood === neighbourhood);

  const counts = {
    blocked: segments.filter(s => s.status === 'blocked').length,
    slow:    segments.filter(s => s.status === 'slow').length,
    normal:  segments.filter(s => s.status === 'normal').length,
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Live Road Conditions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Anonymised aggregated movement data · {metrics.segmentsMonitored} segments monitored</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => runSimulation()} disabled={flowState.activeSimulation} className="btn btn-sm btn-warning">
            ⛈️ Simulate Rain
          </button>
          <button onClick={() => restoreNormal()} className="btn btn-sm btn-secondary">☀️ Restore</button>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <p className="section-title">Legend</p>
        <div className="flex flex-wrap gap-6">
          {[
            { dot: 'bg-teal-500', label: 'Normal — expected movement' },
            { dot: 'bg-amber-500', label: 'Movement anomaly — below baseline' },
            { dot: 'bg-red-500', label: 'High-confidence hazard' },
            { dot: 'bg-navy-500', label: 'Emergency route priority' },
            { dot: 'bg-slate-300', label: 'Data unavailable' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-2 text-xs text-slate-600">
              <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', l.dot)} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryChip count={counts.normal}  label="Normal"    color="bg-teal-50 border-teal-200 text-teal-700"  dot="bg-teal-500" />
        <SummaryChip count={counts.slow}    label="Anomaly"   color="bg-amber-50 border-amber-200 text-amber-700" dot="bg-amber-500" />
        <SummaryChip count={counts.blocked} label="Hazard"    color="bg-red-50 border-red-200 text-red-700"    dot="bg-red-500" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border border-surface-200 overflow-hidden">
          {(['all', 'normal', 'slow', 'blocked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                filter === f ? 'bg-navy-700 text-white' : 'bg-white text-slate-600 hover:bg-surface-100'
              )}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'All' : STATUS_META[f].label}
            </button>
          ))}
        </div>
        <select
          className="input text-xs py-1.5 w-44"
          value={neighbourhood}
          onChange={e => setNeighbourhood(e.target.value)}
          aria-label="Filter by neighbourhood"
        >
          {neighbourhoods.map(n => <option key={n} value={n}>{n === 'all' ? 'All Neighbourhoods' : n}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} segment{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Segments */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-semibold text-slate-700">No road segments match your filters</p>
          <button onClick={() => { setFilter('all'); setNeighbourhood('all'); }} className="btn btn-sm btn-secondary mt-3">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(seg => <SegmentCard key={seg.id} seg={seg} />)}
        </div>
      )}

      {/* Privacy notice */}
      <div className="card p-4 bg-teal-50 border-teal-200">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0">🔒</span>
          <p className="text-xs text-teal-800 leading-relaxed">
            <strong>Privacy-safe by design.</strong> All data shown is anonymised and aggregated at the road-segment level.
            No individual phones, vehicle IDs or personal routes are tracked or displayed.
            Minimum 50 anonymous movement samples required before any anomaly is shown.
            All telemetry in this prototype is <strong>simulated</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ count, label, color, dot }: { count: number; label: string; color: string; dot: string }) {
  return (
    <div className={clsx('rounded-xl border p-3 text-center', color)}>
      <p className="text-2xl font-black tabular-nums">{count}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
    </div>
  );
}
