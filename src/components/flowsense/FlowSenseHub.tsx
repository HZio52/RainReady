import { useFlow } from '../../store/FlowContext';
import OverviewDashboard from './OverviewDashboard';
import RoadConditions from './RoadConditions';
import FlowIncidents from './FlowIncidents';
import FlowReview from './FlowReview';
import FlowAlerts from './FlowAlerts';
import EmergencyRouting from './EmergencyRouting';
import FlowResolution from './FlowResolution';
import AnalyticsPage from './AnalyticsPage';

export default function FlowSenseHub() {
  const { flowState } = useFlow();
  const tab = flowState.activeTab;

  return (
    <div className="page-content">
      {tab === 'flow-dashboard'  && <OverviewDashboard />}
      {tab === 'flow-roads'      && <RoadConditions />}
      {tab === 'flow-incidents'  && <FlowIncidents />}
      {tab === 'flow-review'     && <FlowReview />}
      {tab === 'flow-alerts'     && <FlowAlerts />}
      {tab === 'flow-emergency'  && <EmergencyRouting />}
      {tab === 'flow-resolution' && <FlowResolution />}
    </div>
  );
}
