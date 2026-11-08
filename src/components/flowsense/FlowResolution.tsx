import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import { EmptyState, TimeAgo } from '../ui/Badges';
import { ResolutionBadge, CauseBadge, SimulatedDataTag } from './FlowBadges';

const TYPE_COLORS: Record<string, string> = {
  detect:      'bg-red-100 text-red-700',
  corroborate: 'bg-amber-100 text-amber-700',
  classify:    'bg-orange-100 text-orange-700',
  review:      'bg-blue-100 text-blue-700',
  alert:       'bg-purple-100 text-purple-700',
  emergency:   'bg-indigo-100 text-indigo-700',
  recover:     'bg-teal-100 text-teal-700',
  resolve:     'bg-green-100 text-green-700',
};
const TYPE_ICONS: Record<string, string> = {
  detect: '⚡', corroborate: '🔗', classify: '🏷️', review: '👤',
  alert: '🚨', emergency: '🚑', recover: '📈', resolve: '✅',
};

export default function FlowResolution() {
  const { flowState, resolveIncident, restoreNormal, flowDispatch } = useFlow();
  const { incidents, segments, metrics } = flowState;

  if (incidents.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <EmptyState icon="⏳" title="No incidents yet" subtitle="Run the simulation to create an incident and then follow the resolution flow." />
        <div className="text-center mt-4">
          <button onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' })} className="btn-primary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Resolution Monitoring</h1>
          <p className="text-sm text-gray-500">Follow-up agent tracks recovery and marks incidents resolved</p>
        </div>
        <SimulatedDataTag />
      </div>

      {/* Impact metrics */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">📊 Impact Metrics (Prototype)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ImpactBox label="Avg Detection Time" value={`${metrics.avgDetectionSeconds}s`} note="target: < 120s" />
          <ImpactBox label="Segments Monitored" value={String(metrics.segmentsMonitored)} note="simulated" />
          <ImpactBox label="Duplicate Reports Avoided" value={String(metrics.duplicateCitizenReportsAvoided)} note="simulated" />
          <ImpactBox label="Emergency Warnings" value={String(metrics.emergencyWarnings)} note="simulated" />
        </div>
        <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          🔬 All values are simulated prototype measurements. No real-world field data has been collected.
        </p>
      </div>

      {incidents.map(incident => {
        const seg = segments.find(s => s.id === incident.roadSegmentId);
        return (
          <div key={incident.id} className="card p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900">{seg?.name ?? incident.roadSegmentId}</h2>
                <p className="text-xs text-gray-500">Detected <TimeAgo iso={incident.detectedAt} /></p>
              </div>
              <CauseBadge cause={incident.predictedCause} />
              <ResolutionBadge status={incident.resolutionStatus} />
            </div>

            {/* Timeline */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolution Timeline</p>
              <div className="space-y-0">
                {incident.timeline.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0', TYPE_COLORS[entry.type] ?? 'bg-gray-100 text-gray-600')}>
                        {TYPE_ICONS[entry.type] ?? '•'}
                      </div>
                      {i < incident.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-gray-800">{entry.label}</p>
                      {entry.detail && <p className="text-xs text-gray-500 mt-0.5">{entry.detail}</p>}
                      <p className="text-xs text-gray-400 mt-0.5"><TimeAgo iso={entry.time} /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution actions */}
            {(incident.resolutionStatus === 'active' || incident.resolutionStatus === 'improving') && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-sm text-gray-600">🔔 Follow-up agent is monitoring. Restore normal traffic or manually resolve:</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={restoreNormal} className="btn-secondary text-sm">
                    ☀️ Restore Normal Traffic
                  </button>
                  <button onClick={() => resolveIncident(incident.id)} className="btn-success text-sm">
                    ✅ Manually Resolve
                  </button>
                </div>
              </div>
            )}

            {incident.resolutionStatus === 'resolved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎉</span>
                  <p className="font-semibold text-green-900">Incident Resolved</p>
                </div>
                <p className="text-xs text-green-700">Movement has returned to normal. Dashboard metrics updated.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ImpactBox({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
      <p className="text-xl font-black text-gray-800">{value}</p>
      <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-amber-600 italic mt-0.5">{note}</p>
    </div>
  );
}
