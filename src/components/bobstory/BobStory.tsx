export default function BobStory() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-in">
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-black mb-2">🤖 Built with IBM Bob</h1>
        <p className="text-purple-100 text-sm max-w-lg">
          RainReady Bengaluru was designed and developed using IBM Bob as the AI-assisted development partner.
          This page documents the development process honestly.
        </p>
      </div>

      <div className="space-y-4">
        {/* Problem decomposition */}
        <StoryCard icon="🧩" title="Problem Decomposition" phase="Planning">
          <p>Bob was used to break the problem into an end-to-end civic tech use case:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Citizen reports a flood incident</li>
            <li>AI extracts and analyses the report</li>
            <li>System detects duplicates and scores risk</li>
            <li>Human reviewer approves before broadcast</li>
            <li>Community receives a hyperlocal alert</li>
            <li>Responders are coordinated via tasks</li>
            <li>Resolution is tracked and metrics update</li>
          </ol>
          <ScreenshotPlaceholder label="Bob conversation: problem decomposition and scope definition" />
        </StoryCard>

        {/* Architecture */}
        <StoryCard icon="🏗️" title="Product Architecture" phase="Design">
          <p>Bob helped design a clean, maintainable React + TypeScript + Tailwind architecture:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Single-page app with tab-based navigation</li>
            <li>Central <code>AppContext</code> reducer for shared state</li>
            <li>Typed domain models (<code>Report</code>, <code>Alert</code>, <code>Task</code>, <code>AIAnalysis</code>)</li>
            <li>Seeded demo data layer for reliable demo flow</li>
            <li>Component-per-feature folder structure</li>
          </ul>
          <ScreenshotPlaceholder label="Bob conversation: architecture and component design decisions" />
        </StoryCard>

        {/* Agent design */}
        <StoryCard icon="🤖" title="Agentic AI Workflow Design" phase="Core Feature">
          <p>The seven-phase agentic pipeline was designed with Bob's guidance:</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['👁 Observe', '🧠 Understand', '🔁 Verify', '📊 Assess Risk', '✅ Recommend', '🔧 Coordinate', '🔔 Follow Up'].map(p => (
              <span key={p} className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded text-xs font-medium">{p}</span>
            ))}
          </div>
          <p className="mt-3 text-sm">
            Each phase is made visible in the UI via the AI Decision Trace panel so reviewers and demo audiences can follow the agent's reasoning.
          </p>
          <ScreenshotPlaceholder label="Bob conversation: agent step design and decision trace UI" />
        </StoryCard>

        {/* UI generation */}
        <StoryCard icon="🎨" title="UI Generation and Refinement" phase="Implementation">
          <p>Bob generated the initial component structure and Tailwind styling for:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>The public reporting form with validation and loading states</li>
            <li>The AI analysis panel with risk score visualisation</li>
            <li>The reviewer dashboard with approve/reject confirmation flows</li>
            <li>The route panel with waypoint timeline</li>
            <li>The task coordination panel with status transitions</li>
            <li>The dashboard with KPI cards and neighbourhood risk summary</li>
          </ul>
          <ScreenshotPlaceholder label="Bob conversation: component generation and UI refinement" />
        </StoryCard>

        {/* Debugging */}
        <StoryCard icon="🐛" title="Debugging and Type Safety" phase="Testing">
          <p>Bob assisted with resolving TypeScript strict-mode errors, fixing React state mutation patterns, and ensuring consistent type usage across the <code>Report</code>, <code>Alert</code>, and <code>Task</code> domain models.</p>
          <ScreenshotPlaceholder label="Bob conversation: TypeScript debugging session" />
        </StoryCard>

        {/* Accessibility */}
        <StoryCard icon="♿" title="Accessibility Improvements" phase="Quality">
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Added <code>aria-label</code>, <code>aria-describedby</code>, and <code>aria-current</code> attributes</li>
            <li>Ensured all buttons and interactive elements have visible focus rings</li>
            <li>Colour-blind-safe status indicators with text labels alongside colour coding</li>
            <li>Large touch targets (min 44×44 px) for mobile users</li>
            <li>Keyboard-navigable tab bar and form controls</li>
          </ul>
          <ScreenshotPlaceholder label="Bob conversation: accessibility review and fixes" />
        </StoryCard>

        {/* Privacy review */}
        <StoryCard icon="🔒" title="Privacy and Safety Review" phase="Compliance">
          <p>Bob reviewed the prototype for privacy risks and recommended:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Anonymous reporting option</li>
            <li>Neighbourhood-level location display (not exact address)</li>
            <li>Human review gate before high-severity broadcast</li>
            <li>Clear labelling of prototype/demo data</li>
            <li>Disclaimer that the app does not replace emergency services</li>
          </ul>
          <ScreenshotPlaceholder label="Bob conversation: privacy policy review" />
        </StoryCard>

        {/* Impact */}
        <StoryCard icon="📈" title="Measurable Impact Target" phase="Outcome">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <p className="font-semibold text-green-900 text-sm">Primary metric (prototype target):</p>
            <p className="text-green-800 text-sm mt-1">
              "Reduce the time from flood incident to verified public alert from ~30 minutes to under 5 minutes."
            </p>
            <p className="text-xs text-green-600 mt-2">This is a target measurement. No real field data has been collected yet.</p>
          </div>
          <ScreenshotPlaceholder label="Bob conversation: impact metric definition and validation" />
        </StoryCard>

        {/* Submission summary */}
        <div className="card p-5 bg-blue-50 border-blue-200">
          <h2 className="font-semibold text-gray-900 mb-3">📋 Hackathon Submission Summary</h2>
          <div className="space-y-3 text-sm">
            <SummaryRow label="Problem"    value="Bengaluru floods cause road accidents and delayed community response due to fragmented, unverified social-media reports." />
            <SummaryRow label="Solution"   value="RainReady Bengaluru: an agentic AI civic platform that converts citizen flood reports into verified hyperlocal alerts, safer routes, and coordinated response tasks." />
            <SummaryRow label="Prototype"  value="React + TypeScript + Vite + Tailwind SPA with seeded demo data, a seven-phase AI agent pipeline, human review workflow, alerts, route guidance, and task coordination." />
            <SummaryRow label="IBM Bob Usage" value="IBM Bob was used as the AI development partner throughout: problem decomposition, architecture design, component generation, TypeScript debugging, accessibility review, and privacy audit." />
            <SummaryRow label="Measurable Impact" value="Target: reduce verified alert broadcast time from ~30 min to under 5 min. Prototype demonstrates the full pipeline in under 3 minutes." />
            <SummaryRow label="Privacy & Human Review" value="High-impact alerts require human approval. Reporter identity is hidden from public alerts. Exact addresses are not stored or displayed. The system does not replace emergency services." />
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ icon, title, phase, children }: { icon: string; title: string; phase: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{phase}</span>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

function ScreenshotPlaceholder({ label }: { label: string }) {
  return (
    <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
      <div className="text-2xl mb-2">📸</div>
      <p className="text-xs text-gray-400 italic">[Screenshot placeholder]</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-1">Add a screenshot of your IBM Bob conversation here</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}
