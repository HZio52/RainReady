import { useFlow } from '../../store/FlowContext';
import { clsx } from 'clsx';
import { EmptyState, TimeAgo } from '../ui/Badges';
import { EmergencyVehicleBadge, SimulatedDataTag } from './FlowBadges';
import { DEMO_EMERGENCY_ROUTES } from '../../data/flowSeedData';
import type { EmergencyRouteInfo } from '../../types/flowsense';

const STATUS_COLORS = {
  clear:    'bg-green-50 border-green-200',
  at_risk:  'bg-amber-50 border-amber-200',
  blocked:  'bg-red-50 border-red-200',
};

const STATUS_LABELS = {
  clear:   '🟢 Clear',
  at_risk: '🟡 At Risk',
  blocked: '🔴 Blocked',
};

export default function EmergencyRouting() {
  const { flowState } = useFlow();
  const { incidents } = flowState;

  const hasActiveIncident = incidents.some(i => i.emergencyImpact && (i.resolutionStatus === 'active' || i.resolutionStatus === 'improving'));
  const routes = hasActiveIncident ? DEMO_EMERGENCY_ROUTES : DEMO_EMERGENCY_ROUTES.map(r => ({ ...r, routeStatus: 'clear' as const }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Emergency Routing</h1>
          <p className="text-sm text-gray-500">Decision support for emergency vehicle operators</p>
        </div>
        <SimulatedDataTag />
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-blue-900">
            <strong>RainReady FlowSense provides decision support only.</strong><br />
            Emergency operators remain fully responsible for route decisions.
            This is a prototype using simulated data. No real ambulance or emergency systems are connected.
          </p>
        </div>
      </div>

      {!hasActiveIncident && (
        <div className="card p-4 bg-green-50 border-green-200 text-center">
          <p className="text-green-800 font-semibold">✅ All emergency corridors are currently clear</p>
          <p className="text-xs text-green-600 mt-1">Run the rain simulation to see emergency routing in action</p>
        </div>
      )}

      {routes.map(route => (
        <EmergencyRouteCard key={route.vehicleType} route={route} />
      ))}
    </div>
  );
}

function EmergencyRouteCard({ route }: { route: EmergencyRouteInfo }) {
  return (
    <div className={clsx('rounded-xl border p-5 space-y-4', STATUS_COLORS[route.routeStatus])}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <EmergencyVehicleBadge type={route.vehicleType} />
        <span className={clsx('text-sm font-semibold px-2 py-1 rounded', {
          'bg-green-100 text-green-700': route.routeStatus === 'clear',
          'bg-amber-100 text-amber-700': route.routeStatus === 'at_risk',
          'bg-red-100 text-red-700':    route.routeStatus === 'blocked',
        })}>
          {STATUS_LABELS[route.routeStatus]}
        </span>
      </div>

      {/* Route cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={clsx('rounded-lg p-3 border', route.routeStatus === 'blocked' ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200')}>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Route</p>
          <p className={clsx('text-sm font-semibold', route.routeStatus === 'blocked' ? 'text-red-700 line-through' : 'text-gray-800')}>
            {route.currentRoute}
          </p>
          {route.routeStatus !== 'clear' && (
            <p className="text-xs text-red-600 font-medium mt-1">⚠️ High risk — avoid</p>
          )}
        </div>
        <div className="bg-green-50 border border-green-300 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommended Route</p>
          <p className="text-sm font-semibold text-green-800">{route.recommendedRoute}</p>
          {route.estimatedDelayAvoided > 0 && (
            <p className="text-xs text-green-700 font-medium mt-1">⏱ Saves ~{route.estimatedDelayAvoided} min</p>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
        <strong>Reason:</strong> {route.reason}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 italic">{route.disclaimer}</p>
    </div>
  );
}
