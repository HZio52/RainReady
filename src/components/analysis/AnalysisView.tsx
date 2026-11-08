import { useApp } from '../../store/AppContext';
import type { Report, AgentStep } from '../../types';
import { SeverityBadge, VerificationBadge, ConfidenceBar, EmptyState } from '../ui/Badges';
import { clsx } from 'clsx';

const PHASE_COLORS: Record<AgentStep['phase'], string> = {
  observe:    'bg-blue-100 text-blue-700 border-blue-200',
  understand: 'bg-purple-100 text-purple-700 border-purple-200',
  verify:     'bg-amber-100 text-amber-700 border-amber-200',
  assess:     'bg-orange-100 text-orange-700 border-orange-200',
  recommend:  'bg-teal-100 text-teal-700 border-teal-200',
  coordinate: 'bg-green-100 text-green-700 border-green-200',
  followup:   'bg-gray-100 text-gray-600 border-gray-200',
};

const PHASE_LABELS: Record<AgentStep['phase'], string> = {
  observe:    '👁 Observe',
  understand: '🧠 Understand',
  verify:     '🔁 Verify',
  assess:     '📊 Assess',
  recommend:  '✅ Recommend',
  coordinate: '🔧 Coordinate',
  followup:   '🔔 Follow-up',
};

export default function AnalysisView() {
  const { state } = useApp();
  const currentReport = state.reports.find(r => r.id === state.currentReportId)
    ?? state.reports.find(r => r.analysis !== undefined && r.verificationStatus === 'pending');

  if (!currentReport) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <EmptyState icon="🔍" title="No analysis to display" subtitle="Submit a report to see the AI analysis pipeline." />
      </div>
    );
  }

  const { analysis, duplicateCount, duplicateGroupId } = currentReport;

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <EmptyState icon="⏳" title="Analysis pending" subtitle="The AI agent is still processing this report." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">AI Analysis Report</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{currentReport.location}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={analysis.severity} />
          <VerificationBadge status={currentReport.verificationStatus} />
        </div>
      </div>

      {/* Original report text */}
      <div className="card p-4 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Original Report</p>
        <p className="text-sm text-gray-800 italic">"{currentReport.description}"</p>
        <p className="text-xs text-gray-400 mt-2">Language: {currentReport.language.toUpperCase()} · Anonymous: {currentReport.anonymous ? 'Yes' : 'No'}</p>
      </div>

      {/* Extracted facts */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Extracted Incident Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-sm">
          <FactRow label="Incident Type"    value={analysis.incidentType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
          <FactRow label="Location"         value={analysis.location} />
          <FactRow label="Neighbourhood"    value={analysis.neighbourhood} />
          <FactRow label="Severity"         value={analysis.severity.toUpperCase()} highlight />
          <FactRow label="Estimated Depth"  value={analysis.estimatedDepth ?? '—'} />
          <FactRow label="Affected Road"    value={analysis.affectedRoad} />
        </div>
        {analysis.nearbyVulnerablePlaces.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nearby Vulnerable Locations</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.nearbyVulnerablePlaces.map(p => (
                <span key={p} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confidence + Duplicates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Confidence Score</h3>
          <ConfidenceBar score={analysis.confidenceScore} />
          <p className="text-xs text-gray-500 mt-2">
            {analysis.confidenceScore >= 80
              ? 'High confidence — strong evidence from report text and corroborating reports.'
              : analysis.confidenceScore >= 60
                ? 'Moderate confidence — human verification recommended.'
                : 'Low confidence — requires manual verification before broadcast.'}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Duplicate Detection</h3>
          {duplicateGroupId ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-amber-600">{duplicateCount ?? 1}</span>
                <span className="text-sm text-gray-600">matching reports</span>
              </div>
              <p className="text-xs text-gray-500">Cluster ID: <code className="font-mono bg-gray-100 px-1 rounded">{duplicateGroupId}</code></p>
              <p className="text-xs text-green-700 mt-2 font-medium">✓ Corroborating evidence increases confidence</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No duplicates found for this report.</p>
          )}
        </div>
      </div>

      {/* Risk Score */}
      <RiskScorePanel riskScore={analysis.riskScore} />

      {/* Recommended action */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Recommended Next Action</p>
        <p className="text-sm font-medium text-blue-900">{analysis.recommendedAction}</p>
        {analysis.confidenceScore >= 75 && (
          <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            ⚠️ Risk score ≥ 75 — <strong>Human approval required</strong> before this alert is broadcast publicly.
          </p>
        )}
      </div>

      {/* Agent Decision Trace */}
      {analysis.agentSteps.length > 0 && <AgentDecisionTrace steps={analysis.agentSteps} />}
    </div>
  );
}

function FactRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={clsx('font-semibold text-sm', highlight ? 'text-red-600' : 'text-gray-800')}>{value}</p>
    </div>
  );
}

function RiskScorePanel({ riskScore }: { riskScore: import('../../types').RiskScore }) {
  const { total, level, factors } = riskScore;
  const ringColor = level === 'danger' ? 'text-red-600' : level === 'caution' ? 'text-amber-600' : 'text-blue-600';
  const bgColor   = level === 'danger' ? 'bg-red-50 border-red-200' : level === 'caution' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';

  return (
    <div className={clsx('card p-5 border', bgColor)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Risk Score</h2>
          <p className="text-xs text-gray-500 mt-0.5">Prototype estimate · Not an official emergency prediction</p>
        </div>
        <div className={clsx('text-4xl font-black', ringColor)}>{total}<span className="text-lg font-normal text-gray-400">/100</span></div>
      </div>
      <div className="space-y-3">
        {factors.map(f => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{f.label}</span>
              <span className="text-gray-500 font-mono text-xs">+{f.contribution}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={clsx('h-1.5 rounded-full', level === 'danger' ? 'bg-red-500' : level === 'caution' ? 'bg-amber-500' : 'bg-blue-500')}
                style={{ width: `${(f.contribution / 35) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{f.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentDecisionTrace({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 mb-1">🤖 AI Decision Trace</h2>
      <p className="text-xs text-gray-500 mb-4">Agentic pipeline: Observe → Understand → Verify → Assess → Recommend → Coordinate → Follow-up</p>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                step.status === 'done'    ? 'bg-green-100 text-green-700 border border-green-300' :
                step.status === 'running' ? 'bg-blue-100 text-blue-700 border border-blue-300 agent-pulse' :
                step.status === 'pending' ? 'bg-gray-100 text-gray-400 border border-gray-200' :
                'bg-gray-50 text-gray-300 border border-gray-100'
              )}>{step.status === 'done' ? '✓' : i + 1}</div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            {/* Content */}
            <div className="flex-1 pb-3">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border', PHASE_COLORS[step.phase])}>
                  {PHASE_LABELS[step.phase]}
                </span>
                <span className="text-sm font-medium text-gray-800">{step.label.split('—')[1]?.trim()}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{step.detail}</p>
              {step.timestamp && (
                <p className="text-xs text-gray-400 mt-1">{formatTime(step.timestamp)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
