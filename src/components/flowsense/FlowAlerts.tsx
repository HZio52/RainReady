import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import { EmptyState, TimeAgo } from '../ui/Badges';
import { SimulatedDataTag } from './FlowBadges';

export default function FlowAlerts() {
  const { flowState, flowDispatch } = useFlow();
  const { incidents, segments } = flowState;

  const approved = incidents.filter(i => i.publicAlertStatus === 'approved');
  const resolved = incidents.filter(i => i.resolutionStatus === 'resolved' && i.publicAlertStatus !== 'approved');

  if (approved.length === 0 && resolved.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <EmptyState
          icon="🚨"
          title="No public alerts yet"
          subtitle="Approve an incident in the Human Review tab to publish a public warning."
        />
        <div className="text-center mt-4">
          <button onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-review' })} className="btn-primary">
            Go to Human Review →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Public Alerts</h1>
          <p className="text-sm text-gray-500">Human-verified road-hazard warnings from FlowSense</p>
        </div>
        <SimulatedDataTag />
      </div>

      {approved.map(incident => {
        const seg = segments.find(s => s.id === incident.roadSegmentId);
        return (
          <div key={incident.id} className="rounded-xl border border-red-300 overflow-hidden">
            {/* Alert header */}
            <div className="bg-red-600 text-white px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <h2 className="font-bold text-xl">VERIFIED ROAD HAZARD</h2>
                    <p className="text-red-100 text-sm">{seg?.name ?? incident.roadSegmentId}</p>
                  </div>
                </div>
                <div className="text-sm text-red-100 space-y-0.5 text-right">
                  <p>✅ Human-verified</p>
                  <p>Detected <TimeAgo iso={incident.detectedAt} /></p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-red-50 p-5 space-y-4">
              <p className="text-base text-red-900 font-medium">
                Severe waterlogging is likely affecting this road.
                Average movement speed has fallen from <strong>{seg?.normalAvgSpeed ?? 28} km/h</strong> to <strong>{seg?.currentAvgSpeed ?? 4} km/h</strong>.
                Avoid the {seg?.name ?? 'road'} until further notice.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox label="Current Speed"   value={`${seg?.currentAvgSpeed ?? 4} km/h`} danger />
                <StatBox label="Normal Speed"    value={`${seg?.normalAvgSpeed ?? 28} km/h`} />
                <StatBox label="Travel Time"     value={`${seg?.currentTravelTime ?? 22} min`} danger />
                <StatBox label="Confidence"      value={`${incident.confidence}%`} />
              </div>

              {/* Route */}
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommended Alternative</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <p className="font-semibold text-gray-900">{incident.routeSuggestion.safeAlternative}</p>
                    <p className="text-sm text-gray-600">+{incident.routeSuggestion.additionalMinutes} extra minutes · {incident.routeSuggestion.reason}</p>
                  </div>
                </div>
              </div>

              {/* Do / Avoid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">What to do ✓</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Use {incident.routeSuggestion.safeAlternative}</li>
                    <li>• Allow extra travel time</li>
                    <li>• Follow BBMP/traffic updates</li>
                    <li>• Drive slowly near flood zones</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 uppercase mb-2">What to avoid ✗</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• {incident.routeSuggestion.blockedRoad}</li>
                    <li>• Riding two-wheelers through standing water</li>
                    <li>• Parking near the flood zone</li>
                  </ul>
                </div>
              </div>

              {/* Privacy / disclaimer */}
              <div className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-500">
                <p>🔬 <strong>Detection method:</strong> Anonymised aggregated movement data. No individual phones or vehicles tracked.</p>
                <p className="mt-1">⚠️ This alert is AI-generated and human-verified. It is not a replacement for official emergency services. In an emergency, call <strong>112</strong>.</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatBox({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={clsx('rounded-lg p-3 text-center', danger ? 'bg-red-100' : 'bg-white border border-gray-200')}>
      <p className={clsx('text-xl font-black', danger ? 'text-red-700' : 'text-gray-800')}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
