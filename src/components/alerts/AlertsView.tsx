import { useApp } from '../../store/AppContext';
import type { Alert } from '../../types';
import { AlertLevelBadge, SeverityBadge, TimeAgo, EmptyState } from '../ui/Badges';
import { clsx } from 'clsx';
import RoutePanel from './RoutePanel';
import { DEMO_ANALYSIS } from '../../data/seedData';

export default function AlertsView() {
  const { state } = useApp();
  const activeAlerts = state.alerts.filter(a => a.isActive);
  const inactiveAlerts = state.alerts.filter(a => !a.isActive);

  // Find the most-recently-created alert that has a route suggestion
  const latestAlert = state.alerts[0];
  const latestReport = latestAlert ? state.reports.find(r => r.id === latestAlert.reportId) : null;
  const routeSuggestion = latestReport?.analysis?.routeSuggestion ?? DEMO_ANALYSIS.routeSuggestion;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Public Alerts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Human-verified flood and waterlogging warnings</p>
      </div>

      {activeAlerts.length === 0 && inactiveAlerts.length === 0 ? (
        <EmptyState icon="✅" title="No active alerts" subtitle="All neighbourhoods are clear. New alerts appear here after human verification." />
      ) : (
        <>
          {activeAlerts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Active Alerts ({activeAlerts.length})
              </h2>
              <div className="space-y-4">
                {activeAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
              </div>
            </section>
          )}

          {/* Route panel shown below top alert */}
          {activeAlerts.length > 0 && routeSuggestion && (
            <RoutePanel route={routeSuggestion} />
          )}

          {inactiveAlerts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Resolved ({inactiveAlerts.length})
              </h2>
              <div className="space-y-3">
                {inactiveAlerts.map(a => <AlertCard key={a.id} alert={a} resolved />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function AlertCard({ alert, resolved = false }: { alert: Alert; resolved?: boolean }) {
  const levelStyle = {
    danger:  'border-red-300 bg-red-50',
    caution: 'border-amber-300 bg-amber-50',
    info:    'border-blue-200 bg-blue-50',
  }[alert.level];

  const headerStyle = {
    danger:  'bg-red-600 text-white',
    caution: 'bg-amber-500 text-white',
    info:    'bg-blue-600 text-white',
  }[alert.level];

  return (
    <div className={clsx('rounded-xl border overflow-hidden', levelStyle, resolved && 'opacity-60')}>
      {/* Alert header */}
      <div className={clsx('px-4 py-3 flex flex-wrap items-center justify-between gap-2', headerStyle)}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{alert.level === 'danger' ? '🔴' : alert.level === 'caution' ? '🟡' : 'ℹ️'}</span>
          <h3 className="font-bold text-base">{alert.title}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <span>✅ Human Verified</span>
          <span>·</span>
          <TimeAgo iso={alert.verifiedAt} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-800">{alert.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <InfoCell label="Affected Area"    value={alert.affectedArea} />
          <InfoCell label="Severity"         value={alert.severity.toUpperCase()} />
          <InfoCell label="Verified by"      value={alert.verifiedBy} />
          <InfoCell label="People Notified"  value={`~${alert.notifiedCount.toLocaleString()}`} />
          <InfoCell label="Verification"     value="Human-reviewed ✓" />
          {resolved && <InfoCell label="Status" value="✅ Resolved" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-700 uppercase mb-1.5">What to do ✓</p>
            <ul className="text-sm text-green-800 space-y-1">
              {alert.doList.map((item, i) => <li key={i}>• {item}</li>)}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700 uppercase mb-1.5">What to avoid ✗</p>
            <ul className="text-sm text-red-800 space-y-1">
              {alert.avoidList.map((item, i) => <li key={i}>• {item}</li>)}
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-1">
          ⚠️ This alert is community-generated and AI-assisted. It is not a replacement for official emergency services.
          Call <strong>112</strong> in a life-threatening emergency.
        </p>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
