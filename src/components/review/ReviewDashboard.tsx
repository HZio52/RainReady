import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Report } from '../../types';
import { SeverityBadge, VerificationBadge, ConfidenceBar, TimeAgo, EmptyState, AlertLevelBadge } from '../ui/Badges';
import { clsx } from 'clsx';

export default function ReviewDashboard() {
  const { state, approveReport, rejectReport, dispatch } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(
    state.currentReportId ?? state.reports.find(r => r.verificationStatus === 'pending' && r.analysis)?.id ?? null
  );
  const [reviewNote, setReviewNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const pendingReports = state.reports.filter(r => r.verificationStatus === 'pending' && r.analysis);
  const selected = pendingReports.find(r => r.id === selectedId) ?? pendingReports[0];

  function handleApprove() {
    if (!selected) return;
    approveReport(selected.id, reviewNote);
    setDone('approve');
    setConfirmAction(null);
    // Navigate to alerts
    setTimeout(() => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'alerts' });
    }, 1800);
  }

  function handleReject() {
    if (!selected) return;
    rejectReport(selected.id, reviewNote);
    setDone('reject');
    setConfirmAction(null);
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center fade-in">
        {done === 'approve' ? (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Alert Approved & Broadcast</h2>
            <p className="text-gray-600 text-sm">The alert has been issued for {selected?.analysis?.neighbourhood}. A response task has been created.</p>
            <p className="text-xs text-gray-400 mt-2">Redirecting to Alerts…</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Report Rejected</h2>
            <p className="text-gray-600 text-sm">The report has been marked rejected and will not be broadcast.</p>
            <button className="btn-secondary mt-4" onClick={() => { setDone(null); setSelectedId(null); }}>
              Back to Review
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Human Review Dashboard</h1>
          <p className="text-sm text-gray-500">High-severity alerts require human approval before broadcast</p>
        </div>
        <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
          {pendingReports.length} pending review
        </span>
      </div>

      {pendingReports.length === 0 ? (
        <EmptyState icon="✅" title="No reports pending review" subtitle="All submitted reports have been reviewed." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: report list */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">Pending Reports</h2>
            {pendingReports.map(r => (
              <button
                key={r.id}
                onClick={() => { setSelectedId(r.id); setReviewNote(''); setConfirmAction(null); }}
                className={clsx(
                  'w-full text-left card p-3 transition-all hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selectedId === r.id ? 'border-blue-500 bg-blue-50' : ''
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-1">{r.neighbourhood}</p>
                  <SeverityBadge severity={r.severity ?? r.analysis?.severity ?? 'medium'} />
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-1">{r.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <TimeAgo iso={r.submittedAt} />
                  {r.duplicateCount && <span>· {r.duplicateCount} duplicates</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-2">
            {selected ? (
              <ReportReviewPanel
                report={selected}
                reviewNote={reviewNote}
                onNoteChange={setReviewNote}
                confirmAction={confirmAction}
                onSetConfirm={setConfirmAction}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <div className="card p-6 text-center text-gray-500 text-sm">Select a report to review</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface PanelProps {
  report: Report;
  reviewNote: string;
  onNoteChange: (v: string) => void;
  confirmAction: 'approve' | 'reject' | null;
  onSetConfirm: (v: 'approve' | 'reject' | null) => void;
  onApprove: () => void;
  onReject: () => void;
}

function ReportReviewPanel({ report, reviewNote, onNoteChange, confirmAction, onSetConfirm, onApprove, onReject }: PanelProps) {
  const { analysis } = report;
  if (!analysis) return null;

  return (
    <div className="space-y-4 fade-in">
      {/* Report header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-2 mb-3">
          <h2 className="font-bold text-gray-900 text-lg flex-1">{report.incidentType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
          <SeverityBadge severity={analysis.severity} />
          <VerificationBadge status={report.verificationStatus} />
        </div>
        <p className="text-sm text-gray-700 italic mb-3">"{report.description}"</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Location:</span> <strong>{report.location}</strong></div>
          <div><span className="text-gray-500">Submitted:</span> <TimeAgo iso={report.submittedAt} /></div>
          <div><span className="text-gray-500">Reporter:</span> <strong>{report.reporterAlias}</strong></div>
          <div><span className="text-gray-500">Language:</span> <strong>{report.language.toUpperCase()}</strong></div>
        </div>
      </div>

      {/* AI explanation */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🤖 AI Explanation
          <span className="badge-info ml-auto">Prototype Agent</span>
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">What was observed</p>
            <p className="text-sm text-gray-700">
              The report text contains strong waterlogging keywords: "knee-deep water", "two-wheelers getting stuck", "traffic building up".
              Location resolved to <strong>{analysis.location}</strong>.
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Why this severity was assigned</p>
            <p className="text-sm text-gray-700">
              Depth estimate "knee-deep" maps to ~50–60 cm — dangerous for two-wheelers and elderly pedestrians.
              Combined with {report.duplicateCount ?? 0} corroborating reports, severity is <strong className="text-red-600">HIGH</strong>.
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Confidence & duplicates</p>
            <ConfidenceBar score={analysis.confidenceScore} />
            {report.duplicateCount && (
              <p className="text-xs text-green-700 mt-1 font-medium">✓ {report.duplicateCount} independent reports confirm this incident</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Why human review is required</p>
            <p className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2 border border-amber-200">
              Risk score ≥ 75 and severity HIGH → system policy requires a human to verify before broadcasting a public alert.
              This prevents false alarms and protects community trust.
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Score</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-red-600">{analysis.riskScore.total}</span>
              <span className="text-gray-500">/100</span>
              <AlertLevelBadge level={analysis.riskScore.level} />
            </div>
          </div>
        </div>
      </div>

      {/* Route suggestion preview */}
      {analysis.routeSuggestion && (
        <div className="card p-4 bg-teal-50 border-teal-200">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">Safer Route (if approved)</p>
          <p className="text-sm text-teal-900">
            <strong>Avoid:</strong> {analysis.routeSuggestion.unsafeRoad}<br />
            <strong>Use:</strong> {analysis.routeSuggestion.safeAlternative} (+{analysis.routeSuggestion.additionalMinutes} min)
          </p>
        </div>
      )}

      {/* Reviewer note */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="reviewer-note">Reviewer Note (optional)</label>
        <textarea
          id="reviewer-note"
          rows={2}
          className="input-field resize-none text-sm"
          placeholder="Add context, correction, or reason for approval/rejection…"
          value={reviewNote}
          onChange={e => onNoteChange(e.target.value)}
        />
      </div>

      {/* Actions */}
      {confirmAction === null ? (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onSetConfirm('approve')} className="btn-success flex-1 min-w-[140px]">
            ✅ Approve & Broadcast Alert
          </button>
          <button onClick={() => onSetConfirm('reject')} className="btn-danger flex-1 min-w-[120px]">
            ❌ Reject Report
          </button>
          <button
            onClick={() => alert('Request-more-info feature: system will notify reporter (demo mode)')}
            className="btn-secondary text-sm px-3"
          >
            ❓ Request Info
          </button>
        </div>
      ) : confirmAction === 'approve' ? (
        <div className="card p-4 bg-green-50 border-green-300 space-y-3">
          <p className="text-sm font-semibold text-green-900">Confirm: Approve and broadcast alert to {analysis.neighbourhood}?</p>
          <p className="text-xs text-green-700">This will issue a public warning and create a response task for BBMP.</p>
          <div className="flex gap-3">
            <button onClick={onApprove} className="btn-success flex-1">Yes, Broadcast Alert</button>
            <button onClick={() => onSetConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card p-4 bg-red-50 border-red-300 space-y-3">
          <p className="text-sm font-semibold text-red-900">Confirm: Reject this report?</p>
          <p className="text-xs text-red-700">The report will be marked rejected and will not be broadcast.</p>
          <div className="flex gap-3">
            <button onClick={onReject} className="btn-danger flex-1">Yes, Reject</button>
            <button onClick={() => onSetConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
