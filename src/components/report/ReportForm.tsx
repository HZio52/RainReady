import { useState, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import type { Report, IncidentType, Language } from '../../types';
import { LoadingSpinner, PrototypeBanner } from '../ui/Badges';
import { DEMO_ANALYSIS } from '../../data/seedData';

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'waterlogging',   label: '💧 Waterlogging' },
  { value: 'flood',          label: '🌊 Flood' },
  { value: 'blocked_drain',  label: '🚧 Blocked Drain' },
  { value: 'pothole',        label: '🕳️ Pothole' },
  { value: 'traffic_hazard', label: '⚠️ Traffic Hazard' },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en',      label: 'English' },
  { value: 'kn',      label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'hinglish', label: 'Hinglish' },
];

const NEIGHBOURHOODS = ['HSR Layout', 'Koramangala', 'Whitefield', 'Yelahanka', 'Rajajinagar', 'Other'];

type Step = 'form' | 'processing' | 'result';

export default function ReportForm() {
  const { submitReport, addDemoReport, dispatch } = useApp();
  const [step, setStep] = useState<Step>('form');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [agentProgress, setAgentProgress] = useState(0);

  const [form, setForm] = useState({
    description: '',
    location: '',
    neighbourhood: '',
    incidentType: 'waterlogging' as IncidentType,
    language: 'en' as Language,
    anonymous: false,
    imageUrl: '',
  });

  function set(k: keyof typeof form, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k as string]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.description.trim() || form.description.trim().length < 10)
      e.description = 'Please describe the incident in at least 10 characters.';
    if (!form.location.trim())
      e.location = 'Please enter a location or road name.';
    if (!form.neighbourhood)
      e.neighbourhood = 'Please select a neighbourhood.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function loadDemo() {
    setForm({
      description: 'There is knee-deep water near the HSR Layout underpass. Two-wheelers are getting stuck and traffic is building up.',
      location: 'HSR Layout Underpass (18th Cross)',
      neighbourhood: 'HSR Layout',
      incidentType: 'waterlogging',
      language: 'en',
      anonymous: false,
      imageUrl: '',
    });
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const isDemo =
      form.description.includes('knee-deep') && form.location.includes('HSR Layout');

    setStep('processing');

    // Simulate AI processing stages
    const stages = [0, 20, 40, 60, 80, 100];
    for (const p of stages) {
      await delay(420);
      setAgentProgress(p);
    }

    const id = `rpt-${Date.now()}`;
    const report: Report = {
      id,
      description: form.description,
      location: form.location,
      neighbourhood: form.neighbourhood,
      incidentType: form.incidentType,
      language: form.language,
      anonymous: form.anonymous,
      reporterAlias: form.anonymous ? 'Anonymous' : `Resident_${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      imageUrl: form.imageUrl || undefined,
      submittedAt: new Date().toISOString(),
      status: 'analysed',
      verificationStatus: 'pending',
      duplicateGroupId: isDemo ? 'HSR-2024-11-08' : undefined,
      duplicateCount: isDemo ? 4 : undefined,
      analysis: isDemo ? { ...DEMO_ANALYSIS } : buildBasicAnalysis(form),
      isDemo,
    };
    submitReport(report);
    dispatch({ type: 'SET_CURRENT_REPORT', payload: id });
    setSubmittedId(id);
    setStep('result');
  }

  function goToReview() {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'review' });
  }

  if (step === 'processing') {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center fade-in px-4">
        <div className="card p-8">
          <div className="flex justify-center mb-4"><LoadingSpinner size="lg" /></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Agent Processing…</h2>
          <p className="text-sm text-gray-500 mb-6">Analysing your report through the agentic pipeline</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${agentProgress}%` }} />
          </div>
          <div className="text-left space-y-2 mt-4">
            {[
              { pct: 10, label: '🔎 Observe — Reading report text' },
              { pct: 30, label: '🧠 Understand — Extracting incident details' },
              { pct: 50, label: '🔁 Verify — Checking for duplicates' },
              { pct: 70, label: '📊 Assess — Computing risk score' },
              { pct: 90, label: '✅ Recommend — Preparing action plan' },
            ].map(s => (
              <div key={s.pct} className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${agentProgress >= s.pct ? 'text-gray-800 opacity-100' : 'text-gray-300 opacity-40'}`}>
                <span className={agentProgress >= s.pct && agentProgress < s.pct + 25 ? 'agent-pulse' : ''}>{agentProgress >= s.pct ? '✓' : '○'}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && submittedId) {
    return <SubmitSuccess reportId={submittedId} onReview={goToReview} onNew={() => { setStep('form'); setForm({ description: '', location: '', neighbourhood: '', incidentType: 'waterlogging', language: 'en', anonymous: false, imageUrl: '' }); setAgentProgress(0); }} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Report a Civic Incident</h1>
        <p className="text-sm text-gray-500 mt-1">ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ · Samasya report karein</p>
      </div>

      <div className="mb-4">
        <PrototypeBanner />
      </div>

      {/* Demo shortcut */}
      <div className="card p-4 mb-5 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-xl">🚀</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">Demo: HSR Layout Flood Report</p>
            <p className="text-xs text-blue-700 mt-0.5">Load a pre-built demo scenario to see the full AI analysis pipeline</p>
          </div>
          <button onClick={loadDemo} className="btn-secondary text-xs px-3 py-1.5 border-blue-300 text-blue-700 hover:bg-blue-100">
            Load Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
            Describe the incident <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            className={`input-field resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Describe what you see — water level, road name, impact on traffic or people…"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            aria-describedby={errors.description ? 'desc-error' : undefined}
          />
          {errors.description && <p id="desc-error" className="text-xs text-red-600 mt-1">{errors.description}</p>}
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 characters</p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
            Location / Road name <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            className={`input-field ${errors.location ? 'border-red-400' : ''}`}
            placeholder="e.g. HSR Layout Underpass, 18th Cross"
            value={form.location}
            onChange={e => set('location', e.target.value)}
          />
          {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
          <p className="text-xs text-gray-400 mt-1">Neighbourhood-level only — your exact address will not be shared publicly</p>
        </div>

        {/* Neighbourhood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="neighbourhood">
            Neighbourhood <span className="text-red-500">*</span>
          </label>
          <select
            id="neighbourhood"
            className={`input-field ${errors.neighbourhood ? 'border-red-400' : ''}`}
            value={form.neighbourhood}
            onChange={e => set('neighbourhood', e.target.value)}
          >
            <option value="">Select neighbourhood…</option>
            {NEIGHBOURHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {errors.neighbourhood && <p className="text-xs text-red-600 mt-1">{errors.neighbourhood}</p>}
        </div>

        {/* Incident type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INCIDENT_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('incidentType', t.value)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  form.incidentType === t.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
                aria-pressed={form.incidentType === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language & options row */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lang">Language</label>
            <select id="lang" className="input-field" value={form.language} onChange={e => set('language', e.target.value as Language)}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={form.anonymous}
                onChange={e => set('anonymous', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Report anonymously</span>
            </label>
          </div>
        </div>

        {/* Image upload placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo (optional)
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500 cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Upload photo"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) set('imageUrl', URL.createObjectURL(f));
            }} />
            {form.imageUrl ? (
              <div>
                <img src={form.imageUrl} alt="Preview" className="h-24 mx-auto rounded object-cover mb-1" />
                <span className="text-xs text-green-600">Photo attached</span>
              </div>
            ) : (
              <>📷 Click to attach a photo<br /><span className="text-xs">Do not include images that show personal details</span></>
            )}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3 text-base">
          Submit Report →
        </button>
      </form>
    </div>
  );
}

function SubmitSuccess({ reportId, onReview, onNew }: { reportId: string; onReview: () => void; onNew: () => void }) {
  const { state } = useApp();
  const report = state.reports.find(r => r.id === reportId);
  const analysis = report?.analysis;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 fade-in">
      <div className="card p-5 border-green-200 bg-green-50 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">✅</span>
          <div>
            <h2 className="font-bold text-green-900">Report Submitted Successfully</h2>
            <p className="text-sm text-green-700">AI analysis complete · Awaiting human review</p>
          </div>
        </div>
        <p className="text-xs text-green-700">Report ID: <code className="font-mono">{reportId}</code></p>
      </div>

      {analysis && (
        <div className="card p-5 space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">AI Analysis Summary</h3>
            <span className="badge-info">Prototype Agent</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Incident" value={analysis.incidentType.replace('_', ' ')} />
            <InfoRow label="Location" value={analysis.location} />
            <InfoRow label="Severity" value={analysis.severity.toUpperCase()} highlight={analysis.severity === 'high' || analysis.severity === 'critical'} />
            <InfoRow label="Est. Depth" value={analysis.estimatedDepth ?? '—'} />
            <InfoRow label="Confidence" value={`${analysis.confidenceScore}%`} />
            <InfoRow label="Duplicates" value={`${report?.duplicateCount ?? 0} matching reports`} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
            <strong>⚠️ Human review required</strong> — High severity alert will be broadcast only after a reviewer approves.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onReview} className="btn-primary flex-1">Open Reviewer Dashboard →</button>
        <button onClick={onNew} className="btn-secondary flex-1">Submit Another Report</button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${highlight ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function buildBasicAnalysis(form: { description: string; location: string; neighbourhood: string; incidentType: IncidentType }): import('../../types').AIAnalysis {
  return {
    incidentType: form.incidentType,
    location: form.location,
    neighbourhood: form.neighbourhood,
    severity: 'medium',
    affectedRoad: form.location,
    nearbyVulnerablePlaces: [],
    confidenceScore: 65,
    recommendedAction: 'Review and issue advisory if verified',
    agentSteps: [],
    riskScore: {
      total: 45,
      level: 'caution',
      factors: [
        { label: 'Incident Severity', contribution: 25, detail: 'Medium severity based on description.' },
        { label: 'Location Density', contribution: 20, detail: 'Urban area — moderate population density.' },
      ],
    },
  };
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
