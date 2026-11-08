import { clsx } from 'clsx';
import type { Severity, AlertLevel, VerificationStatus, TaskStatus } from '../../types';

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
      severity === 'critical' && 'bg-red-200 text-red-800',
      severity === 'high'     && 'bg-red-100 text-red-700',
      severity === 'medium'   && 'bg-amber-100 text-amber-700',
      severity === 'low'      && 'bg-green-100 text-green-700',
    )}>
      {severity === 'critical' ? '🔴 Critical' : severity === 'high' ? '🟠 High' : severity === 'medium' ? '🟡 Medium' : '🟢 Low'}
    </span>
  );
}

export function AlertLevelBadge({ level }: { level: AlertLevel }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
      level === 'danger'  && 'bg-red-100 text-red-700',
      level === 'caution' && 'bg-amber-100 text-amber-700',
      level === 'info'    && 'bg-blue-100 text-blue-700',
    )}>
      {level === 'danger' ? '🔴 Danger' : level === 'caution' ? '🟡 Caution' : 'ℹ️ Info'}
    </span>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = {
    pending:    { cls: 'bg-gray-100 text-gray-600', label: '⏳ Pending' },
    verified:   { cls: 'bg-green-100 text-green-700', label: '✅ Verified' },
    rejected:   { cls: 'bg-red-100 text-red-700', label: '❌ Rejected' },
    needs_info: { cls: 'bg-amber-100 text-amber-700', label: '❓ Needs Info' },
  };
  const { cls, label } = config[status];
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>{label}</span>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = {
    open:        { cls: 'bg-blue-100 text-blue-700',   label: '📋 Open' },
    in_progress: { cls: 'bg-amber-100 text-amber-700', label: '🔧 In Progress' },
    resolved:    { cls: 'bg-green-100 text-green-700', label: '✅ Resolved' },
    cancelled:   { cls: 'bg-gray-100 text-gray-500',   label: '✖ Cancelled' },
  };
  const { cls, label } = config[status];
  return <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>{label}</span>;
}

export function PrototypeBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
      <span>🔬</span>
      <span><strong>Prototype / Demo Data</strong> — This is a Bobathon demonstration. Data is simulated. No real emergency services are connected.</span>
    </div>
  );
}

export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8';
  return (
    <svg className={clsx(s, 'animate-spin text-blue-600')} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-semibold text-gray-700">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
}

export function TimeAgo({ iso }: { iso: string }) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs  = Math.floor(mins / 60);
  if (mins < 1) return <span>Just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  if (hrs < 24) return <span>{hrs}h ago</span>;
  return <span>{Math.floor(hrs / 24)}d ago</span>;
}

export function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={clsx('h-2 rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-10 text-right">{score}%</span>
    </div>
  );
}
