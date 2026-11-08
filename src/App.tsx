import { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { FlowProvider } from './store/FlowContext';
import Sidebar from './components/shell/Sidebar';
import Topbar from './components/shell/Topbar';
import FlowSenseHub from './components/flowsense/FlowSenseHub';
import AnalyticsPage from './components/flowsense/AnalyticsPage';
import Dashboard from './components/dashboard/Dashboard';
import ReportForm from './components/report/ReportForm';
import AnalysisView from './components/analysis/AnalysisView';
import ReviewDashboard from './components/review/ReviewDashboard';
import AlertsView from './components/alerts/AlertsView';
import TasksPanel from './components/tasks/TasksPanel';
import ResolutionView from './components/resolution/ResolutionView';
import PrivacySafety from './components/privacy/PrivacySafety';
import BobStory from './components/bobstory/BobStory';

function AppContent() {
  const { state, dispatch } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tab = state.activeTab;

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — pushed right on desktop */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">
        {/* Top bar */}
        <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto scrollbar-thin"
          tabIndex={-1}
        >
          {tab === 'flowsense'  && <FlowSenseHub />}
          {tab === 'analytics'  && <AnalyticsPage />}
          {tab === 'dashboard'  && <Dashboard />}
          {tab === 'report'     && <ReportForm />}
          {tab === 'analysis'   && <AnalysisView />}
          {tab === 'review'     && <ReviewDashboard />}
          {tab === 'alerts'     && <AlertsView />}
          {tab === 'tasks'      && <TasksPanel />}
          {tab === 'resolution' && <ResolutionView />}
          {tab === 'privacy'    && <PrivacySafety />}
          {tab === 'bobstory'   && <BobStory />}
        </main>

        {/* Footer */}
        <footer className="h-9 bg-white border-t border-surface-200 flex items-center px-5 gap-3 text-xs text-slate-400 flex-shrink-0">
          <span className="font-semibold text-slate-500">RainReady FlowSense</span>
          <span>·</span>
          <span>IBM Bobathon 2026 · Student Category</span>
          <span>·</span>
          <span className="text-amber-600">🔬 Prototype · Simulated Data</span>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'privacy' })}
            className="ml-auto text-navy-600 hover:underline"
            aria-label="Privacy and Safety"
          >
            Privacy & Safety
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <FlowProvider>
        <AppContent />
      </FlowProvider>
    </AppProvider>
  );
}
