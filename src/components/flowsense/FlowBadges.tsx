import { clsx } from 'clsx';
import type { RoadStatus, PredictedCause, RainfallIntensity, EmergencyVehicleType, IncidentResolution } from '../../types/flowsense';

export function RoadStatusBadge({ status }: { status: RoadStatus }) {
  const cfg = {
    normal:  { cls: 'bg-green-100 text-green-700 border-green-200',  label: '🟢 Normal' },
    slow:    { cls: 'bg-amber-100 text-amber-700 border-amber-200',  label: '🟡 Slow' },
    blocked: { cls: 'bg-red-100 text-red-700 border-red-200',        label: '🔴 Blocked' },
    unknown: { cls: 'bg-gray-100 text-gray-500 border-gray-200',     label: '⬜ Unknown' },
  };
  const { cls, label } = cfg[status];
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', cls)}>{label}</span>;
}

export function RainfallBadge({ intensity }: { intensity: RainfallIntensity }) {
  const cfg = {
    none:      { cls: 'bg-gray-100 text-gray-500', label: '☀️ No Rain' },
    light:     { cls: 'bg-blue-50 text-blue-600',  label: '🌦 Light' },
    moderate:  { cls: 'bg-blue-100 text-blue-700', label: '🌧️ Moderate' },
    heavy:     { cls: 'bg-indigo-100 text-indigo-700', label: '⛈ Heavy' },
    very_heavy:{ cls: 'bg-purple-100 text-purple-700', label: '🌊 Very Heavy' },
  };
  const { cls, label } = cfg[intensity];
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>{label}</span>;
}

export function CauseBadge({ cause }: { cause: PredictedCause }) {
  const labels: Record<PredictedCause, string> = {
    flooding:      '💧 Flooding',
    accident:      '🚨 Accident',
    road_blockage: '🚧 Blockage',
    heavy_traffic: '🚗 Heavy Traffic',
    signal_failure:'🚦 Signal Failure',
    unknown:       '❓ Unknown',
  };
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{labels[cause]}</span>;
}

export function ResolutionBadge({ status }: { status: IncidentResolution }) {
  const cfg = {
    active:    { cls: 'bg-red-100 text-red-700',    label: '🔴 Active' },
    improving: { cls: 'bg-amber-100 text-amber-700',label: '🟡 Improving' },
    resolved:  { cls: 'bg-green-100 text-green-700',label: '✅ Resolved' },
    false_alarm:{ cls:'bg-gray-100 text-gray-500',  label: '❌ False Alarm' },
  };
  const { cls, label } = cfg[status];
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>{label}</span>;
}

export function EmergencyVehicleBadge({ type }: { type: EmergencyVehicleType }) {
  const labels: Record<EmergencyVehicleType, string> = {
    ambulance:         '🚑 Ambulance',
    fire:              '🚒 Fire',
    police:            '🚓 Police',
    disaster_response: '🆘 Disaster Response',
  };
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{labels[type]}</span>;
}

export function SimulatedDataTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      🔬 Simulated Data
    </span>
  );
}

export function PrivacySafeTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      🔒 Anonymised Aggregates
    </span>
  );
}

export function SpeedBar({ current, normal }: { current: number; normal: number }) {
  const pct = Math.min(100, (current / normal) * 100);
  const color = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={clsx('h-2 rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-20 text-right whitespace-nowrap">
        {current} <span className="text-gray-400 font-normal">/ {normal} km/h</span>
      </span>
    </div>
  );
}

export function AgentPhaseIcon({ phase }: { phase: string }) {
  const icons: Record<string, string> = {
    observe:     '👁',
    compare:     '📐',
    detect:      '⚡',
    corroborate: '🔗',
    classify:    '🏷️',
    score:       '📊',
    recommend:   '✅',
    followup:    '🔔',
  };
  return <span>{icons[phase] ?? '•'}</span>;
}
