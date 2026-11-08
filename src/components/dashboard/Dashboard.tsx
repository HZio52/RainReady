import { useApp } from '../../store/AppContext';
import type { NeighbourhoodStats } from '../../types';
import { TimeAgo } from '../ui/Badges';
import { clsx } from 'clsx';

export default function Dashboard() {
  const { state, dispatch, addDemoReport } = useApp();
  const { metrics, reports, alerts } = state;

  function handleLoadDemo() {
    addDemoReport();
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' });
  }

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6 fade-up">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-br from-navy-800 to-navy-900 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black mb-1">🌧️ RainReady Community Reports</h1>
            <p className="text-navy-200 text-sm max-w-md">Community-powered, AI-assisted, human-verified flood alerts</p>
            <p className="text-navy-300 text-xs mt-1 italic">ನಮ್ಮ ಬೆಂಗಳೂರಿಗಾಗಿ · Hamare Bengaluru ke liye</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleLoadDemo} className="btn bg-white text-navy-800 hover:bg-navy-50 font-bold text-sm px-4 py-2.5">
              🚀 Load HSR Layout Demo
            </button>
            <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'flowsense' })} className="btn bg-teal-600 text-white hover:bg-teal-700 text-sm px-4 py-2.5">
              📡 Open FlowSense →
            </button>
            <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'report' })} className="btn bg-navy-700 border border-navy-600 text-white hover:bg-navy-600 text-sm px-4 py-2.5">
              📝 Submit a Report
            </button>
          </div>
        </div>
      </div>

      {/* Prototype banner */}
      <div className="alert-warning">
        <span className="text-lg flex-shrink-0">🔬</span>
        <p className="text-sm text-amber-800">
          <strong>Prototype / Demo Data</strong> — This is an IBM Bobathon demonstration. All data is simulated. No real emergency services are connected.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Active Alerts"       value={metrics.activeAlerts}           icon="🚨" highlight={metrics.activeAlerts > 0} />
        <KpiCard label="Reports Received"    value={metrics.reportsReceived}        icon="📝" />
        <KpiCard label="Reports Verified"    value={metrics.reportsVerified}        icon="✅" />
        <KpiCard label="Duplicates Removed"  value={metrics.duplicatesRemoved}      icon="🔁" />
        <KpiCard label="Avg Response"        value={`${metrics.avgResponseMinutes}m`} icon="⏱" />
        <KpiCard label="Resolved"            value={metrics.resolvedIncidents}      icon="🎉" />
      </div>

      {/* Agent workflow */}
      <div className="card p-4 bg-surface-50">
        <p className="section-title">🤖 Agentic AI Pipeline</p>
        <div className="flex items-center overflow-x-auto gap-0 no-scrollbar">
          {['👁 Observe','🧠 Understand','🔁 Verify','📊 Assess Risk','✅ Recommend','🔧 Coordinate','🔔 Follow Up'].map((p, i, a) => (
            <div key={p} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1 px-3">
                <span className="text-sm">{p.split(' ')[0]}</span>
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{p.split(' ').slice(1).join(' ')}</span>
              </div>
              {i < a.length - 1 && <span className="text-slate-300 font-bold">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Neighbourhood risk */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Neighbourhood Risk Summary</h2>
          <div className="space-y-3">
            {metrics.neighbourhoods.map(n => <NeighbourhoodRow key={n.name} stats={n} />)}
          </div>
        </div>
        {/* Recent reports */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Reports</h2>
          {recentReports.length === 0 ? (
            <p className="text-sm text-slate-400">No reports yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReports.map(r => (
                <div key={r.id} className="flex items-start gap-3 border-b border-surface-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-lg flex-shrink-0">
                    {r.incidentType === 'waterlogging' ? '💧' : r.incidentType === 'flood' ? '🌊' : r.incidentType === 'blocked_drain' ? '🚧' : '⚠️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{r.neighbourhood} · {r.location}</p>
                    <p className="text-xs text-slate-500 truncate">{r.description.slice(0, 65)}{r.description.length > 65 ? '…' : ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx('text-xs font-semibold',
                        r.verificationStatus === 'verified' ? 'text-teal-600' :
                        r.verificationStatus === 'rejected' ? 'text-red-500' :
                        r.status === 'resolved' ? 'text-slate-400' : 'text-amber-600'
                      )}>
                        {r.status === 'resolved' ? '✅ Resolved' : r.verificationStatus === 'verified' ? '✓ Verified' : r.verificationStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                      <span className="text-xs text-slate-400"><TimeAgo iso={r.submittedAt} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'review' })} className="mt-4 text-xs text-navy-600 hover:underline font-medium">
            Review all reports →
          </button>
        </div>
      </div>

      {/* Active alerts */}
      {alerts.filter(a => a.isActive).length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Active Alerts</h2>
            <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'alerts' })} className="text-xs text-navy-600 hover:underline font-medium">View all →</button>
          </div>
          <div className="space-y-2">
            {alerts.filter(a => a.isActive).slice(0, 3).map(a => (
              <div key={a.id} className={clsx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm border',
                a.level === 'danger'  ? 'bg-red-50 border-red-200' :
                a.level === 'caution' ? 'bg-amber-50 border-amber-200' :
                'bg-navy-50 border-navy-200'
              )}>
                <span>{a.level === 'danger' ? '🔴' : a.level === 'caution' ? '🟡' : 'ℹ️'}</span>
                <span className="flex-1 font-medium truncate text-slate-800">{a.title}</span>
                <span className="text-xs text-slate-400 flex-shrink-0"><TimeAgo iso={a.verifiedAt} /></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, highlight = false }: { label: string; value: string | number; icon: string; highlight?: boolean }) {
  return (
    <div className={clsx('card p-4', highlight && 'border-l-4 border-l-red-400')}>
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <p className={clsx('text-2xl font-black mt-1 tabular-nums', highlight ? 'text-red-600' : 'text-slate-900')}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function NeighbourhoodRow({ stats }: { stats: NeighbourhoodStats }) {
  const dotColor = stats.riskLevel === 'danger' ? 'bg-red-500' : stats.riskLevel === 'caution' ? 'bg-amber-500' : 'bg-teal-500';
  const barColor = stats.riskLevel === 'danger' ? 'bg-red-400' : stats.riskLevel === 'caution' ? 'bg-amber-400' : 'bg-teal-400';
  const pct = Math.min(100, (stats.totalReports / 15) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-800">{stats.name}</span>
          <div className="flex items-center gap-2">
            {stats.activeAlerts > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">{stats.activeAlerts} alert{stats.activeAlerts > 1 ? 's' : ''}</span>
            )}
            <span className={clsx('text-xs font-semibold',
              stats.riskLevel === 'danger' ? 'text-red-600' : stats.riskLevel === 'caution' ? 'text-amber-600' : 'text-teal-600'
            )}>
              {stats.riskLevel === 'danger' ? '🔴 High' : stats.riskLevel === 'caution' ? '🟡 Medium' : '🟢 Low'}
            </span>
          </div>
        </div>
        <div className="speed-bar-track">
          <div className={clsx('speed-bar-fill', barColor)} style={{ width: `${pct}%` }} />
        </div>
        {stats.lastIncident && <p className="text-2xs text-slate-400 mt-0.5">Last: {stats.lastIncident}</p>}
      </div>
    </div>
  );
}
