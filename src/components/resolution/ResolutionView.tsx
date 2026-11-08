import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { TimeAgo, EmptyState } from '../ui/Badges';

export default function ResolutionView() {
  const { state, dispatch } = useApp();
  const [followUpText, setFollowUpText] = useState('');
  const [followUpSent, setFollowUpSent] = useState(false);

  const resolvedReports = state.reports.filter(r => r.status === 'resolved');
  const resolvedTasks = state.tasks.filter(t => t.status === 'resolved');

  if (resolvedReports.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <EmptyState icon="⏳" title="No resolved incidents yet" subtitle="Resolve a task to see the resolution timeline here." />
        <div className="text-center mt-4">
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'tasks' })}
            className="btn-primary"
          >
            Go to Tasks →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 fade-in">
      <h1 className="text-xl font-bold text-gray-900">Resolution &amp; Follow-Up</h1>

      {resolvedReports.map(report => {
        const task = resolvedTasks.find(t => t.reportId === report.id);
        return (
          <div key={report.id} className="card p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <div>
                <h2 className="font-bold text-gray-900">{report.neighbourhood} — {report.incidentType.replace('_', ' ')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{report.location}</p>
              </div>
            </div>

            {/* Resolution timeline */}
            <div className="space-y-0 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolution Timeline</p>
              {([
                  { icon: '📝', label: 'Report submitted', time: report.submittedAt, color: 'bg-blue-100 text-blue-700', offset: 0 },
                  { icon: '🤖', label: 'AI analysis completed', time: report.submittedAt, color: 'bg-purple-100 text-purple-700', offset: 12000 },
                  { icon: '✅', label: 'Human review approved', time: report.submittedAt, color: 'bg-green-100 text-green-700', offset: 30000 },
                  { icon: '🚨', label: 'Public alert broadcast', time: report.submittedAt, color: 'bg-red-100 text-red-700', offset: 32000 },
                  { icon: '🔧', label: 'Response team dispatched', time: task?.createdAt ?? report.submittedAt, color: 'bg-amber-100 text-amber-700', offset: 0 },
                  { icon: '🎉', label: 'Incident resolved', time: task?.updatedAt ?? new Date().toISOString(), color: 'bg-green-100 text-green-700', offset: 0 },
                ] as { icon: string; label: string; time: string; color: string; offset: number }[]).map((step, i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${step.color}`}>{step.icon}</div>
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-gray-800">{step.label}</p>
                      <p className="text-xs text-gray-400">
                        <TimeAgo iso={new Date(new Date(step.time).getTime() + step.offset).toISOString()} />
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Total time */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800 mb-4">
              <strong>⏱ Total response time:</strong> ~{state.metrics.avgResponseMinutes} minutes (prototype estimate)
              <span className="text-xs text-green-600 ml-2">Target: under 5 minutes in production</span>
            </div>

            {/* Follow-up prompt */}
            {!followUpSent ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">🔔 Follow-Up Check</p>
                <p className="text-sm text-gray-600 mb-3">
                  Is the situation at <strong>{report.location}</strong> still unsafe? Let the community know.
                </p>
                <textarea
                  rows={2}
                  className="input-field resize-none text-sm mb-3"
                  placeholder="Describe current conditions (e.g. 'Water has receded, road is now clear') …"
                  value={followUpText}
                  onChange={e => setFollowUpText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setFollowUpSent(true)}
                    className="btn-primary text-sm"
                    disabled={!followUpText.trim()}
                  >
                    Submit Follow-Up
                  </button>
                  <button onClick={() => setFollowUpSent(true)} className="btn-secondary text-sm">
                    ✅ All Clear — No Follow-Up Needed
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                <strong>✅ Follow-up recorded.</strong> Thank you for helping the community stay informed.
                {followUpText && <p className="mt-1 italic">"{followUpText}"</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
