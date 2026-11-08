import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import { CauseBadge, ResolutionBadge, AgentPhaseIcon, SimulatedDataTag } from './FlowBadges';
import { TimeAgo, EmptyState, SeverityBadge, ConfidenceBar } from '../ui/Badges';
import type { FlowIncident, FlowAgentStep } from '../../types/flowsense';

const PHASE_COLORS: Record<FlowAgentStep['phase'], string> = {
  observe:     'bg-blue-100 text-blue-700 border-blue-200',
  compare:     'bg-purple-100 text-purple-700 border-purple-200',
  detect:      'bg-red-100 text-red-700 border-red-200',
  corroborate: 'bg-amber-100 text-amber-700 border-amber-200',
  classify:    'bg-orange-100 text-orange-700 border-orange-200',
  score:       'bg-teal-100 text-teal-700 border-teal-200',
  recommend:   'bg-green-100 text-green-700 border-green-200',
  followup:    'bg-gray-100 text-gray-600 border-gray-200',
};

export default function FlowIncidentsView() {
  const { flowState, flowDispatch } = useFlow();
  const { incidents, segments } = flowState;

  if (incidents.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <EmptyState
          icon="📡"
          title="No incidents detected yet"
          subtitle='Click "Simulate Heavy Rain near HSR Layout" on the dashboard to trigger automatic detection.'
        />
        <div className="text-center mt-4">
          <button
            onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' })}
            className="btn-primary"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detected Incidents</h1>
          <p className="text-sm text-gray-500">Automatically detected from aggregated movement anomalies</p>
        </div>
        <SimulatedDataTag />
      </div>
      {incidents.map(incident => {
        const seg = segments.find(s => s.id === incident.roadSegmentId);
        return <IncidentCard key={incident.id} incident={incident} segmentName={seg?.name ?? incident.roadSegmentId} />;
      })}
    </div>
  );
}

function IncidentCard({ incident, segmentName }: { incident: FlowIncident; segmentName: string }) {
  const { flowDispatch } = useFlow();

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-base">{segmentName}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Detected <TimeAgo iso={incident.detectedAt} /></p>
        </div>
        <SeverityBadge severity={incident.severity} />
        <CauseBadge cause={incident.predictedCause} />
        <ResolutionBadge status={incident.resolutionStatus} />
      </div>

      {/* Confidence */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Detection Confidence</p>
        <ConfidenceBar score={incident.confidence} />
      </div>

      {/* Evidence */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evidence</p>
        <ul className="space-y-1">
          {incident.evidence.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-red-500 flex-shrink-0 mt-0.5">•</span>
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* Risk score */}
      <RiskFactorsPanel incident={incident} />

      {/* Agent trace */}
      <AgentTracePanel steps={incident.agentTrace} />

      {/* Actions */}
      {incident.verificationStatus === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-review' })}
            className="btn-primary flex-1"
          >
            🔍 Open Human Review →
          </button>
        </div>
      )}
      {incident.verificationStatus === 'verified' && incident.publicAlertStatus === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
          ✅ Alert approved and broadcast · <TimeAgo iso={incident.reviewedAt!} />
        </div>
      )}
    </div>
  );
}

function RiskFactorsPanel({ incident }: { incident: FlowIncident }) {
  const levelColor = incident.riskScore >= 75 ? 'bg-red-50 border-red-200' : incident.riskScore >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
  const scoreColor = incident.riskScore >= 75 ? 'text-red-600' : incident.riskScore >= 50 ? 'text-amber-600' : 'text-blue-600';
  return (
    <div className={clsx('rounded-lg border p-4', levelColor)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800">Risk Score</p>
        <span className={clsx('text-3xl font-black', scoreColor)}>{incident.riskScore}<span className="text-sm font-normal text-gray-400">/100</span></span>
      </div>
      <div className="space-y-2">
        {incident.riskFactors.map(f => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-gray-700 font-medium">{f.label}</span>
              <span className="text-gray-500 font-mono">+{f.contribution}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className={clsx('h-1.5 rounded-full', incident.riskScore >= 75 ? 'bg-red-500' : 'bg-amber-500')} style={{ width: `${(f.contribution / 35) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{f.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentTracePanel({ steps }: { steps: FlowAgentStep[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🤖 AI Decision Trace</p>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.phase} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                step.status === 'done'    ? 'bg-green-100 border border-green-300 text-green-700' :
                step.status === 'running' ? 'bg-blue-100 border border-blue-300 text-blue-700 agent-pulse' :
                'bg-gray-100 border border-gray-200 text-gray-400'
              )}>
                <AgentPhaseIcon phase={step.phase} />
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" style={{ minHeight: 12 }} />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border', PHASE_COLORS[step.phase])}>
                  {step.phase.charAt(0).toUpperCase() + step.phase.slice(1)}
                </span>
                <span className="text-xs font-medium text-gray-800">{step.label.split('—')[1]?.trim() ?? step.label}</span>
                {step.status === 'pending' && <span className="text-xs text-gray-400 italic">Monitoring…</span>}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{step.detail}</p>
              {step.timestamp && <p className="text-xs text-gray-400 mt-0.5"><TimeAgo iso={step.timestamp} /></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
