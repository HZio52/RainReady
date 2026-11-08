import type { RouteSuggestion } from '../../types';
import { clsx } from 'clsx';

const WAYPOINT_ICONS = { start: '🟢', avoid: '🔴', waypoint: '🔵', end: '🏁' };

export default function RoutePanel({ route }: { route: RouteSuggestion }) {
  return (
    <div className="card p-5 border-teal-200 bg-teal-50">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🗺️</span>
        <div>
          <h2 className="font-bold text-teal-900">Safer Route Recommendation</h2>
          <p className="text-xs text-teal-600">AI-suggested detour · Prototype data</p>
        </div>
      </div>

      {/* Route summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-600 uppercase mb-1">🚫 Avoid</p>
          <p className="text-sm font-semibold text-red-800">{route.unsafeRoad}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-600 uppercase mb-1">✅ Use Instead</p>
          <p className="text-sm font-semibold text-green-800">{route.safeAlternative}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-600 uppercase mb-1">⏱ Extra Time</p>
          <p className="text-2xl font-black text-amber-700">+{route.additionalMinutes}<span className="text-sm font-normal text-amber-600"> min</span></p>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-white border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-800 mb-4">
        <strong>Why:</strong> {route.reason}
      </div>

      {/* Route visual (map-like timeline) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Route Waypoints</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-gray-200" />
          <div className="space-y-0">
            {route.waypoints.map((wp, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className={clsx(
                  'relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  wp.type === 'start'    ? 'bg-green-100 border-2 border-green-400' :
                  wp.type === 'avoid'   ? 'bg-red-100 border-2 border-red-400' :
                  wp.type === 'end'     ? 'bg-blue-100 border-2 border-blue-400' :
                  'bg-gray-100 border-2 border-gray-300'
                )}>
                  {WAYPOINT_ICONS[wp.type]}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className={clsx('text-sm font-medium',
                    wp.type === 'avoid'   ? 'text-red-700 line-through' :
                    wp.type === 'start'   ? 'text-green-800' :
                    wp.type === 'end'     ? 'text-blue-800' :
                    'text-gray-700'
                  )}>{wp.name}</p>
                  {wp.type === 'avoid' && (
                    <p className="text-xs text-red-600 font-medium">⚠️ Flooded — avoid this road</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        📍 Route is illustrative prototype data. Use Google Maps / Apple Maps for real-time navigation.
        Conditions may change — always check current road status.
      </p>
    </div>
  );
}
