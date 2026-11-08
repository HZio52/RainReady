import { useState } from 'react';
import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import { CauseBadge, ResolutionBadge, SimulatedDataTag } from './FlowBadges';
import { SeverityBadge, ConfidenceBar, EmptyState, TimeAgo } from '../ui/Badges';
import { AgentTracePanel } from './FlowIncidents';

export default function FlowReview() {
  const { flowState, approveIncident, rejectIncident, flowDispatch } = useFlow();
  const { incidents, segments } = flowState;
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null);
  const [done, setDone] = useState<'approve' | 'reject' | null>(null);

  const pending = incidents.filter(i => i.verificationStatus === 'pending');
  const selected = pending[0];

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center fade-in">
        {done === 'approve' ? (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Alert Approved & Broadcast</h2>
            <p className="text-gray-600 text-sm">Public alert issued. Emergency corridor advisory sent. Navigating to Alerts…</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Incident Rejected</h2>
            <p className="text-gray-600 text-sm">Incident marked as false alarm and will not be broadcast.</p>
            <button className="btn-secondary mt-4" onClick={() => { setDone(null); }}>Back</button>
          </>
        )}
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <EmptyState icon="✅" title="No incidents pending review" subtitle="Incidents requiring human verification will appear here." />
        <div className="text-center mt-4">
          <button onClick={() => flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' })} className="btn-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const seg = segments.find(s => s.id === selected.roadSegmentId);

  function handleApprove() {
    approveIncident(selected.id, note);
    setDone('approve');
  }
  function handleReject() {
    rejectIncident(selected.id, note);
    setDone('reject');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Human Review</h1>
          <p className="text-sm text-gray-500">Verify automatically detected incidents before broadcast</p>
        </div>
        <div className="flex items-center gap-2">
          <SimulatedDataTag />
          <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">{pending.length} pending</span>
        </div>
      </div>

      {/* Incident summary */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-2 mb-3">
          <h2 className="font-bold text-gray-900 text-base flex-1">{seg?.name ?? selected.roadSegmentId}</h2>
          <SeverityBadge severity={selected.severity} />
          <CauseBadge cause={selected.predictedCause} />
        </div>

        {/* Evidence */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evidence</p>
          <ul className="space-y-1">
            {selected.evidence.map((e, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-red-500 flex-shrink-0">•</span>{e}
              </li>
            ))}
          </ul>
        </div>

        {/* Confidence */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Detection Confidence</p>
          <ConfidenceBar score={selected.confidence} />
        </div>

        {/* Risk */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-black text-red-600">{selected.riskScore}</span>
          <span className="text-gray-500">/100 risk score</span>
          {selected.emergencyImpact && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">🚑 Emergency Corridor Impact</span>
          )}
        </div>

        {/* Why human review */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 mb-3">
          <strong>⚠️ Human review required</strong> — Risk score ≥ 85 and this road is an emergency corridor.
          System policy requires reviewer approval before broadcasting a public warning.
        </div>

        {/* Route preview */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-teal-700 uppercase mb-1">Safer Route (if approved)</p>
          <p className="text-sm text-teal-900">
            <strong>Avoid:</strong> {selected.routeSuggestion.blockedRoad}<br />
            <strong>Use:</strong> {selected.routeSuggestion.safeAlternative} (+{selected.routeSuggestion.additionalMinutes} min)
          </p>
        </div>
      </div>

      {/* Agent trace */}
      <div className="card p-5">
        <AgentTracePanel steps={selected.agentTrace} />
      </div>

      {/* Reviewer note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="flow-review-note">
          Reviewer Note (optional)
        </label>
        <textarea
          id="flow-review-note"
          rows={2}
          className="input-field resize-none text-sm"
          placeholder="Add context or reason for your decision…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {/* Actions */}
      {confirm === null ? (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setConfirm('approve')} className="btn-success flex-1 min-w-[160px]">
            ✅ Approve & Broadcast Alert
          </button>
          <button onClick={() => setConfirm('reject')} className="btn-danger flex-1 min-w-[120px]">
            ❌ Reject — False Alarm
          </button>
        </div>
      ) : confirm === 'approve' ? (
        <div className="card p-4 bg-green-50 border-green-300 space-y-3">
          <p className="text-sm font-semibold text-green-900">Confirm: Broadcast public warning for {seg?.neighbourhood}?</p>
          <p className="text-xs text-green-700">Emergency corridor advisory will also be issued. This cannot be undone automatically.</p>
          <div className="flex gap-3">
            <button onClick={handleApprove} className="btn-success flex-1">Yes, Broadcast</button>
            <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card p-4 bg-red-50 border-red-300 space-y-3">
          <p className="text-sm font-semibold text-red-900">Confirm: Reject this incident as a false alarm?</p>
          <div className="flex gap-3">
            <button onClick={handleReject} className="btn-danger flex-1">Yes, Reject</button>
            <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
