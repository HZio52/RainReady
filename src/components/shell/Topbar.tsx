import { clsx } from 'clsx';
import { useApp } from '../../store/AppContext';
import { useFlow } from '../../store/FlowContext';

const PAGE_TITLES: Record<string, string> = {
  flowsense:       'Overview',
  'flow-roads':    'Road Conditions',
  'flow-incidents':'Incidents',
  'flow-review':   'Review Queue',
  'flow-alerts':   'Public Alerts',
  'flow-emergency':'Emergency Routes',
  analytics:       'Analytics & Impact',
  dashboard:       'Reports Dashboard',
  report:          'Submit Report',
  review:          'Human Review',
  alerts:          'Alerts',
  tasks:           'Response Tasks',
  resolution:      'Resolution',
  privacy:         'Privacy & Safety',
  bobstory:        'Built with IBM Bob',
  analysis:        'AI Analysis',
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { state } = useApp();
  const { flowState } = useFlow();

  const tab = state.activeTab;
  const flowTab = flowState.activeTab;
  const titleKey = tab === 'flowsense' ? flowTab : tab;
  const pageTitle = PAGE_TITLES[titleKey] ?? 'RainReady FlowSense';

  const hasActiveIncident = flowState.incidents.some(i => i.resolutionStatus === 'active');
  const pendingReviews = flowState.incidents.filter(i => i.verificationStatus === 'pending').length;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

  return (
    <header
      className="h-14 bg-white border-b border-surface-200 flex items-center px-4 gap-4 sticky top-0 z-30"
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden btn-ghost p-2 -ml-1"
        aria-label="Open navigation menu"
      >
        <MenuIcon />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-900 truncate">{pageTitle}</h1>
          {hasActiveIncident && (
            <span className="chip-high hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" />
              Active Hazard
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-none mt-0.5 hidden sm:block">
          Bengaluru · {dateStr} {timeStr} IST
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Simulation status */}
        <div className={clsx(
          'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
          flowState.activeSimulation
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-surface-100 text-slate-500'
        )}>
          <span className={clsx('w-1.5 h-1.5 rounded-full', flowState.activeSimulation ? 'bg-amber-500 live-pulse' : 'bg-slate-400')} />
          {flowState.activeSimulation ? 'Simulation active' : 'Demo mode'}
        </div>

        {/* Pending review badge */}
        {pendingReviews > 0 && (
          <button
            onClick={() => {}}
            className="relative btn-ghost p-2"
            aria-label={`${pendingReviews} items pending review`}
          >
            <BellIcon />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-2xs font-bold rounded-full flex items-center justify-center">
              {pendingReviews}
            </span>
          </button>
        )}

        {/* Data freshness */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
          <span>Updated just now</span>
        </div>

        {/* Role chip */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-surface-200">
          <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-bold">
            CO
          </div>
          <span className="text-xs font-medium text-slate-600 hidden lg:block">Civic Ops</span>
        </div>
      </div>
    </header>
  );
}

function MenuIcon()  { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>; }
function BellIcon()  { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>; }
