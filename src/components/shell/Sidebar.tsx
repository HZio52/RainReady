import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useApp } from '../../store/AppContext';
import { useFlow } from '../../store/FlowContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge: null | 'live' | 'count' | 'pending';
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'FlowSense',
    items: [
      { id: 'flowsense',      label: 'Overview',          icon: '⊞',  badge: null      },
      { id: 'flow-roads',     label: 'Road Conditions',   icon: '≡',  badge: 'live'    },
      { id: 'flow-incidents', label: 'Incidents',         icon: '⚠',  badge: 'count'   },
      { id: 'flow-review',    label: 'Review Queue',      icon: '✓',  badge: 'pending' },
      { id: 'flow-alerts',    label: 'Public Alerts',     icon: '🔔', badge: null      },
      { id: 'flow-emergency', label: 'Emergency Routes',  icon: '🚑', badge: null      },
      { id: 'analytics',      label: 'Analytics',         icon: '📊', badge: null      },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'dashboard', label: 'Reports Dashboard', icon: '🌧️', badge: null },
      { id: 'report',    label: 'Submit Report',     icon: '📝', badge: null },
      { id: 'tasks',     label: 'Response Tasks',    icon: '🔧', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'privacy',  label: 'Privacy & Safety',   icon: '🔒', badge: null },
      { id: 'bobstory', label: 'Built with IBM Bob',  icon: '🌟', badge: null },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { state, dispatch } = useApp();
  const { flowState, flowDispatch } = useFlow();
  const pendingReviews = flowState.incidents.filter(i => i.verificationStatus === 'pending').length;
  const activeIncidents = flowState.metrics.activeIncidents;
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const activeTab = state.activeTab;

  function navigate(id: string) {
    if (id.startsWith('flow-')) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'flowsense' });
      flowDispatch({ type: 'SET_FLOW_TAB', payload: id });
    } else if (id === 'flowsense') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'flowsense' });
      flowDispatch({ type: 'SET_FLOW_TAB', payload: 'flow-dashboard' });
    } else if (id === 'analytics') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'analytics' });
    } else {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: id });
    }
    onClose();
  }

  function isActive(id: string): boolean {
    if (id === 'flowsense' && activeTab === 'flowsense' && flowState.activeTab === 'flow-dashboard') return true;
    if (id.startsWith('flow-') && activeTab === 'flowsense') return flowState.activeTab === id;
    if (id === 'analytics') return activeTab === 'analytics';
    return activeTab === id;
  }

  function getBadge(item: NavItem) {
    if (item.badge === 'live') {
      return <span className="w-2 h-2 bg-teal-500 rounded-full live-pulse ml-auto flex-shrink-0" aria-label="Live" />;
    }
    if (item.badge === 'count' && activeIncidents > 0) {
      return <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5 min-w-[1.25rem] text-center flex-shrink-0">{activeIncidents}</span>;
    }
    if (item.badge === 'pending' && pendingReviews > 0) {
      return <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 min-w-[1.25rem] text-center flex-shrink-0">{pendingReviews}</span>;
    }
    return null;
  }

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy-700 flex items-center justify-center text-white text-xl flex-shrink-0">
            📡
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">RainReady</p>
            <p className="text-xs font-semibold text-teal-600 leading-tight">FlowSense</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-500 rounded-full live-pulse flex-shrink-0" />
          <span className="text-xs text-slate-500">Simulation active · Demo data</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">🕐 {timeStr} IST · Bengaluru</p>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
        style={{ scrollbarWidth: 'thin' }}
        aria-label="Main navigation"
      >
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <ul className="space-y-0.5" role="list">
              {section.items.map(item => {
                const active = isActive(item.id);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500',
                        active
                          ? 'bg-navy-50 text-navy-700'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-surface-100'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="flex-shrink-0 text-base w-5 text-center">{item.icon}</span>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {getBadge(item)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-bold flex-shrink-0">
            CO
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">Civic Operations</p>
            <p className="text-xs text-slate-400 truncate">Bengaluru BBMP Zone 5</p>
          </div>
        </div>
        <div className="mt-3 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700 font-medium">🔬 Prototype telemetry</p>
          <p className="text-xs text-amber-600 mt-0.5">Simulated aggregated data</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-200 fixed left-0 top-0 bottom-0 z-40"
        aria-label="Application sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slides in */}
      <aside
        className={clsx(
          'flex lg:hidden flex-col w-72 bg-white border-r border-surface-200 fixed left-0 top-0 bottom-0 z-40 transition-transform duration-200',
          open ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        )}
        aria-label="Application sidebar"
        aria-hidden={!open}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-100 text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          aria-label="Close sidebar"
        >
          ✕
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
