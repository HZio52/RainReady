export default function PrivacySafety() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-in">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Safety &amp; Privacy</h1>
      <p className="text-sm text-gray-500 mb-6">How RainReady Bengaluru protects residents and community trust</p>

      <div className="space-y-4">
        <PolicyCard icon="👤" title="Reporter Identity Protection">
          <p>Reporter identities are <strong>never</strong> displayed in public alerts. Neighbourhood-level location is used instead of exact addresses. You can also submit reports anonymously.</p>
        </PolicyCard>

        <PolicyCard icon="🔍" title="Human Review Before High-Impact Alerts">
          <p>All high-severity or high-risk-score alerts require a human reviewer to approve before they are broadcast publicly. Low-confidence reports are <strong>not</strong> automatically broadcast.</p>
          <p className="mt-2">The AI analysis is advisory only — a human always makes the final broadcast decision.</p>
        </PolicyCard>

        <PolicyCard icon="📷" title="Uploaded Images">
          <p>When you upload a photo, please ensure it does not include identifiable personal details such as faces, vehicle number plates, or home addresses. Images are used only to support verification.</p>
        </PolicyCard>

        <PolicyCard icon="🚑" title="Not a Replacement for Emergency Services">
          <p>RainReady Bengaluru is a community awareness tool. It does <strong>not</strong> replace emergency services.</p>
          <p className="mt-2">In a life-threatening emergency, call <strong className="text-red-700">112</strong> (national emergency) or <strong className="text-red-700">101</strong> (fire and flood rescue).</p>
        </PolicyCard>

        <PolicyCard icon="📊" title="AI System Limitations">
          <p>The AI analysis in this prototype is simulated for demonstration. Severity, depth, and risk estimates are algorithmic approximations and should not be treated as official measurements.</p>
          <p className="mt-2">The risk score is labelled as a <em>prototype estimate</em> and is not an official emergency prediction.</p>
        </PolicyCard>

        <PolicyCard icon="🔒" title="Data Storage">
          <p>All data in this prototype is stored in browser memory only. No data is sent to any server. Reports are lost when the page is refreshed.</p>
          <p className="mt-2">A production deployment would require appropriate data governance, consent mechanisms, and DPDP Act compliance (India).</p>
        </PolicyCard>

        <PolicyCard icon="🌐" title="Accessibility">
          <p>RainReady Bengaluru is designed to be usable on mobile devices with large touch targets, high colour contrast, and keyboard accessibility.</p>
          <p className="mt-2">Content is available in English, Kannada (ಕನ್ನಡ), and Hinglish to reach more Bengaluru residents.</p>
        </PolicyCard>
      </div>
    </div>
  );
}

function PolicyCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{title}</h2>
          <div className="text-sm text-gray-700 space-y-1 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
