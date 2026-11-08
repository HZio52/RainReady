import { useApp } from '../store/AppContext';
import { clsx } from 'clsx';

const tabs = [
  { id: 'dashboard',  label: 'Dashboard',    icon: '📊' },
  { id: 'flowsense',  label: 'FlowSense',    icon: '📡' },
  { id: 'report',     label: 'Report',        icon: '📝' },
  { id: 'analysis',   label: 'AI Analysis',   icon: '🤖' },
  { id: 'review',     label: 'Review',        icon: '🔍' },
  { id: 'alerts',     label: 'Alerts',        icon: '🚨' },
  { id: 'tasks',      label: 'Tasks',         icon: '🔧' },
  { id: 'resolution', label: 'Resolution',    icon: '✅' },
  { id: 'bobstory',   label: 'Built w/ Bob',  icon: '🌟' },
];

export default function Nav() {
  const { state, dispatch } = useApp();
  const pendingReviews = state.reports.filter(r => r.verificationStatus === 'pending' && r.status === 'analysed').length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Brand bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌧️</span>
            <div>
              <span className="font-bold text-gray-900 text-lg leading-none">RainReady</span>
              <span className="block text-xs text-blue-600 leading-none font-medium">Bengaluru</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            <span>Live prototype · Demo data</span>
          </div>
        </div>

        {/* Tab nav */}
        <nav className="flex gap-0 -mb-px overflow-x-auto" aria-label="Main navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
              className={clsx(
                'relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
                state.activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              )}
              aria-current={state.activeTab === tab.id ? 'page' : undefined}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'review' && pendingReviews > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {pendingReviews}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
