import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Task, TaskStatus } from '../../types';
import { SeverityBadge, TaskStatusBadge, TimeAgo, EmptyState } from '../ui/Badges';
import { clsx } from 'clsx';

export default function TasksPanel() {
  const { state, updateTaskStatus, resolveTask } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);

  const tasks = state.tasks;
  const selectedTask = tasks.find(t => t.id === selected);

  function handleStatusChange(task: Task, status: TaskStatus) {
    if (status === 'resolved') {
      setResolveTarget(task.id);
    } else {
      updateTaskStatus(task.id, status, note || undefined);
      setNote('');
    }
  }

  function confirmResolve(task: Task) {
    // Find the linked report
    const reportId = task.reportId;
    resolveTask(task.id, reportId, note || 'Task resolved by coordinator.');
    setResolveTarget(null);
    setNote('');
    setSelected(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Response Coordination</h1>
          <p className="text-sm text-gray-500">Tasks for volunteers and civic coordinators</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
            {tasks.filter(t => t.status === 'open').length} Open
          </span>
          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
            {tasks.filter(t => t.status === 'in_progress').length} In Progress
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
            {tasks.filter(t => t.status === 'resolved').length} Resolved
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon="🔧" title="No tasks yet" subtitle="Tasks are auto-created when a high-severity alert is approved." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Task list */}
          <div className="lg:col-span-1 space-y-2">
            {tasks.map(task => (
              <button
                key={task.id}
                onClick={() => { setSelected(task.id); setNote(''); setResolveTarget(null); }}
                className={clsx(
                  'w-full text-left card p-3 transition-all hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  selected === task.id ? 'border-blue-500 bg-blue-50' : ''
                )}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{task.title}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <TaskStatusBadge status={task.status} />
                  <SeverityBadge severity={task.priority} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5"><TimeAgo iso={task.createdAt} /></p>
              </button>
            ))}
          </div>

          {/* Task detail */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <TaskDetail
                task={selectedTask}
                note={note}
                onNoteChange={setNote}
                resolveTarget={resolveTarget}
                onStatusChange={handleStatusChange}
                onConfirmResolve={confirmResolve}
                onCancelResolve={() => setResolveTarget(null)}
              />
            ) : (
              <div className="card p-6 text-center text-sm text-gray-500">
                Select a task to view details and take action
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DetailProps {
  task: Task;
  note: string;
  onNoteChange: (v: string) => void;
  resolveTarget: string | null;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onConfirmResolve: (task: Task) => void;
  onCancelResolve: () => void;
}

function TaskDetail({ task, note, onNoteChange, resolveTarget, onStatusChange, onConfirmResolve, onCancelResolve }: DetailProps) {
  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <h2 className="font-bold text-gray-900 text-base flex-1">{task.title}</h2>
          <SeverityBadge severity={task.priority} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div><span className="text-gray-500">Location:</span> <strong>{task.location}</strong></div>
          <div><span className="text-gray-500">Assigned:</span> <strong>{task.assignedTo}</strong></div>
          <div><span className="text-gray-500">Created:</span> <TimeAgo iso={task.createdAt} /></div>
          <div><span className="text-gray-500">Updated:</span> <TimeAgo iso={task.updatedAt} /></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <TaskStatusBadge status={task.status} />
        </div>
      </div>

      {/* Required action */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Required Action</p>
        <p className="text-sm text-blue-900 font-medium">{task.requiredAction}</p>
      </div>

      {/* Notes timeline */}
      {task.notes.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Notes</p>
          <div className="space-y-3">
            {task.notes.map(n => (
              <div key={n.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {n.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">{n.author}</span>
                    <span className="text-xs text-gray-400"><TimeAgo iso={n.timestamp} /></span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{n.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note + Actions (only if not resolved) */}
      {task.status !== 'resolved' && task.status !== 'cancelled' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="task-note">Add Update Note</label>
            <textarea
              id="task-note"
              rows={2}
              className="input-field resize-none text-sm"
              placeholder="Add a status update, observation, or note…"
              value={note}
              onChange={e => onNoteChange(e.target.value)}
            />
          </div>

          {resolveTarget === task.id ? (
            <div className="card p-4 bg-green-50 border-green-300 space-y-3">
              <p className="text-sm font-semibold text-green-900">Mark this task as resolved?</p>
              <p className="text-xs text-green-700">This will close the associated alert and update dashboard metrics.</p>
              <div className="flex gap-3">
                <button onClick={() => onConfirmResolve(task)} className="btn-success flex-1">
                  ✅ Confirm Resolved
                </button>
                <button onClick={onCancelResolve} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {task.status === 'open' && (
                <button onClick={() => onStatusChange(task, 'in_progress')} className="btn-secondary flex-1 min-w-[140px]">
                  🔧 Start — Mark In Progress
                </button>
              )}
              <button onClick={() => onStatusChange(task, 'resolved')} className="btn-success flex-1 min-w-[140px]">
                ✅ Mark Resolved
              </button>
            </div>
          )}
        </>
      )}

      {task.status === 'resolved' && (
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-900">Task Resolved</p>
              <p className="text-xs text-green-700">Alert closed · Dashboard metrics updated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
