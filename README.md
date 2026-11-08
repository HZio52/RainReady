# 🌧️ RainReady FlowSense

**IBM Bobathon 2026 — "Build with Bob. Better Bengaluru." — Student Category**

> Detect blocked roads before people get trapped.
> Community-powered · AI-assisted · Human-verified · Privacy-safe

---

## Problem Statement

Every monsoon, Bengaluru roads flood without warning. Residents are stuck because:

- Flood reports are fragmented across WhatsApp, Twitter, and word-of-mouth
- There is no automatic detection — someone must physically stand in the rain and report
- Duplicate reports are not consolidated
- High-severity alerts are broadcast without human review, causing alert fatigue
- Emergency vehicles (ambulances, fire trucks) have no early-warning rerouting

**Primary Impact Target (Prototype):**
> Generate an explainable road-condition alert in under 2 minutes — without requiring a person to stand at the location.

*This is a prototype target. No real-world field data has been collected.*

---

## Why Manual Reporting Is Not Enough

| Problem | Impact |
|---------|--------|
| Resident must physically see the flood | 15–30 min delay before any report |
| Reports are scattered and unverified | False alarms, alert fatigue |
| No duplicate grouping | Same incident reported 10 times |
| No human review gate | Unverified alerts reach thousands |
| Emergency vehicles get no advance warning | 10–15 min detour avoidance delay |

---

## Solution — RainReady FlowSense

FlowSense automatically detects abnormal road conditions by analysing **anonymised, aggregated movement patterns** on road segments. It correlates these with weather context and historical flood risk, then routes high-confidence detections through a human review queue before broadcasting a public alert.

### Two complementary modules

| Module | Description |
|--------|-------------|
| **FlowSense** | Automatic crowd-sensing: detects road blockages from aggregated telemetry |
| **Community Reports** | Manual reporting: residents submit waterlogging/flood reports |

---

## Target Users

1. Bengaluru residents and daily commuters
2. Students and delivery workers
3. Resident Welfare Associations (RWAs)
4. BBMP civic coordinators
5. Emergency vehicle operators (decision support only)

---

## Features

### FlowSense (Automatic Detection)

| Feature | Description |
|---------|-------------|
| **Live Road Conditions** | 5 Bengaluru road segments with speed, travel time, stopped-movement count |
| **Anomaly Detection** | 8-phase agentic pipeline: Observe → Compare → Detect → Corroborate → Classify → Score → Recommend → Follow Up |
| **Risk Scoring** | 0–100 risk score with per-factor explanation |
| **AI Decision Trace** | Step-by-step reasoning visible in the UI |
| **Rain Simulation** | One-click simulation: HSR Layout heavy rain scenario |
| **Human Review Queue** | High-risk incidents require reviewer approval before broadcast |
| **Public Alerts** | Verified ROAD HAZARD banner with do/avoid lists and route |
| **Emergency Routes** | Ambulance, fire, police, disaster response route cards with disclaimer |
| **Recovery Monitoring** | Follow-up agent marks incidents improving → resolved |
| **Analytics** | Detection time, incident breakdown, workflow timing, impact metrics |

### Community Reports (Manual)

| Feature | Description |
|---------|-------------|
| **Multilingual Form** | English, Kannada (ಕನ್ನಡ), Hinglish with anonymous option |
| **AI Analysis** | NLP extraction: type, severity, depth estimate, confidence score |
| **Duplicate Detection** | Groups similar reports; corroboration boosts confidence |
| **Human Review** | Approve / reject / request-info workflow |
| **Safer Route** | Waypoint route panel with detour time |
| **Response Tasks** | BBMP coordinator task panel with status tracking |
| **Resolution Timeline** | Full incident lifecycle with follow-up prompt |

---

## Privacy Model

> **No individual tracking. Ever.**

FlowSense uses only **anonymised, aggregated road-segment statistics**:

- Average speed per road segment
- Anonymous movement sample count
- Stopped-movement count (vehicles below 2 km/h)
- Travel-time change vs baseline
- Rainfall intensity (simulated)
- Historical flood-risk index

**What is never shown:**
- Individual phone locations or IDs
- Vehicle identities or registration numbers
- Personal routes or travel history
- Exact home or work addresses

**Minimum sample threshold:** A road segment must have ≥ 50 anonymous movement samples before any anomaly is flagged.

**High-impact alerts:** Require human reviewer approval before public broadcast.

---

## Architecture

```
src/
├── types/
│   ├── index.ts              # Core types: Report, Alert, Task, AIAnalysis
│   └── flowsense.ts          # FlowSense types: RoadSegment, FlowIncident, EmergencyRouteInfo
│
├── data/
│   ├── seedData.ts           # Community report seed data (5 neighbourhoods)
│   └── flowSeedData.ts       # Road segment seed data + demo scenario
│
├── store/
│   ├── AppContext.tsx         # Community reports state (useReducer + Context)
│   └── FlowContext.tsx        # FlowSense state + simulation engine
│
├── components/
│   ├── shell/
│   │   ├── Sidebar.tsx        # Persistent sidebar navigation
│   │   └── Topbar.tsx         # Sticky top bar with status indicators
│   ├── flowsense/
│   │   ├── OverviewDashboard.tsx   # Main FlowSense overview
│   │   ├── RoadConditions.tsx      # Live road segment cards
│   │   ├── FlowIncidents.tsx       # Detected incidents + AI trace
│   │   ├── FlowReview.tsx          # Human review workflow
│   │   ├── FlowAlerts.tsx          # Public alert display
│   │   ├── EmergencyRouting.tsx    # Emergency vehicle routes
│   │   ├── FlowResolution.tsx      # Recovery monitoring + timeline
│   │   ├── AnalyticsPage.tsx       # Impact metrics + charts
│   │   └── FlowSenseHub.tsx        # Tab router
│   ├── dashboard/            # Community reports dashboard
│   ├── report/               # Public report form
│   ├── analysis/             # AI analysis view
│   ├── review/               # Human review dashboard
│   ├── alerts/               # Public alerts + route panel
│   ├── tasks/                # Response task panel
│   ├── resolution/           # Resolution timeline
│   ├── privacy/              # Privacy & safety policy
│   ├── bobstory/             # IBM Bob development story
│   └── ui/Badges.tsx         # Shared UI components
│
├── App.tsx                   # Root with sidebar layout
├── index.css                 # Design system (Tailwind + custom)
└── main.tsx                  # Entry point
```

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS v3 · in-memory state (no backend required)

---

## Agentic AI Workflow — FlowSense

```
👁 Observe → 📐 Compare → ⚡ Detect → 🔗 Corroborate → 🏷️ Classify → 📊 Score → ✅ Recommend → 🔔 Follow Up
```

### Community Report Workflow

```
👁 Observe → 🧠 Understand → 🔁 Verify → 📊 Assess Risk → ✅ Recommend → 🔧 Coordinate → 🔔 Follow Up
```

---

## Local Setup

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Install & run

```bash
# 1. Extract the project ZIP (or clone the repository)
cd rainready-flowsense

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# → Opens at http://localhost:5173
```

### Other commands

```bash
npm run typecheck   # TypeScript check (no emit)
npm run build       # Production build → dist/
npm run preview     # Preview production build locally
```

---

## Demo Walkthrough (< 3 minutes)

### FlowSense automatic detection demo

| Step | Action |
|------|--------|
| 1 | Open **http://localhost:5173** — FlowSense Overview loads |
| 2 | See 5 road segments, all showing normal green speeds |
| 3 | Click **⛈️ Simulate Heavy Rain — HSR Layout** |
| 4 | Watch the progress bar — speed drops, HSR segment turns red |
| 5 | Critical banner appears: "High-confidence road hazard detected" |
| 6 | Sidebar Review Queue shows a red badge |
| 7 | Click **Review Now** in the banner |
| 8 | Review AI evidence: 93% confidence · Risk 91/100 · 8-phase trace |
| 9 | Click **✅ Approve & Broadcast Alert** → confirm |
| 10 | Navigate to **Public Alerts** — VERIFIED ROAD HAZARD displayed |
| 11 | Click **Emergency Routes** — ambulance corridor shows 🔴 Blocked |
| 12 | Click **Road Conditions** — HSR card shows speed at 14% of normal |
| 13 | Click **☀️ Restore Normal Traffic** |
| 14 | Follow-up agent marks incident Improving → Resolved |
| 15 | Click **Analytics** — detection time, resolved count updated |

### Community report demo

| Step | Action |
|------|--------|
| 1 | Click **Reports Dashboard** in sidebar |
| 2 | Click **🚀 Load HSR Layout Demo** |
| 3 | On Report tab → click **Submit Report →** |
| 4 | Watch AI processing animation |
| 5 | See analysis: 92% confidence · 4 duplicates · Risk 82/100 |
| 6 | Click **Open Reviewer Dashboard →** |
| 7 | Approve the alert |
| 8 | See public alert + route panel (+8 min via 27th Main Road) |
| 9 | Go to Tasks → Mark Resolved |
| 10 | Go to Resolution → see full timeline |

---

## Simulated Data Limitations

| Limitation | Detail |
|-----------|--------|
| No real mobility data | All movement telemetry is scripted simulation |
| No real weather API | Rainfall toggled by the simulation button |
| No real NLP model | Analysis is pre-scripted for the HSR Layout scenario |
| No backend | Browser memory only — page refresh resets state |
| No real maps | Route waypoints are illustrative, not GPS-routed |
| No SMS/push | "Notified count" is a simulated number |
| No BBMP API | Civic response is a simulated workflow |
| 5 segments only | Production would monitor hundreds of segments |

---

## Emergency Support Limitations

- FlowSense provides **decision support only**
- The system does **not** control or dispatch real emergency vehicles
- Emergency operators remain fully responsible for routing decisions
- In a life-threatening emergency, call **112** (national emergency)
- This prototype has no integration with KSRTC, BBMP or emergency dispatch

---

## Privacy and Safety Decisions

- No individual phones, vehicle IDs or personal routes are tracked
- Minimum 50-sample threshold before anomaly detection fires
- Neighbourhood-level location only — no exact addresses
- Anonymous community reporting option
- High-severity alerts require human approval before broadcast
- All risk scores clearly labelled as prototype estimates
- App does not replace emergency services

---

## IBM Bob Development Story

IBM Bob was used as the AI-assisted development partner throughout this project:

| Phase | Bob's Contribution |
|-------|--------------------|
| Problem decomposition | Broke the civic use case into end-to-end modules |
| Architecture design | Designed React + TypeScript + Tailwind stack and folder structure |
| Agentic workflow | Designed the 8-phase FlowSense detection pipeline |
| Data model | Defined `RoadSegment`, `FlowIncident`, `MovementWindow` types |
| Component generation | Generated UI components, forms, dashboards, trace panels |
| Simulation engine | Built the rain simulation and recovery monitoring logic |
| UI redesign | Implemented sidebar shell, design system tokens, Tailwind config |
| Debugging | Fixed TypeScript errors, PostCSS config issues, blank-page crashes |
| Accessibility | Added focus rings, ARIA labels, keyboard navigation, reduced-motion |
| Privacy review | Recommended anonymisation thresholds and human-review gates |

See the **Built with IBM Bob** page in the app for the full story with screenshot placeholders.

---

## Future Integrations

> All items below are clearly marked as future work. None are currently implemented.

- Opt-in mobile telemetry from approved data providers
- Connected vehicle data (V2X)
- Live weather API (OpenWeatherMap or IMD)
- OpenStreetMap routing (Leaflet.js)
- Municipal IoT flood sensors (BBMP)
- Emergency service coordination (ERSS 112)
- Verified community reports integration
- DPDP Act (India) compliant data governance
- Offline-capable PWA for low-connectivity areas
- Multilingual voice input (Kannada, Hindi, English)

---

## Deployment

This is a fully static frontend application. No server is required.

### Deploy to Vercel / Netlify

```bash
npm run build
# Upload the dist/ folder to Vercel, Netlify, or any static host
```

### Environment variables

No environment variables are required. All data is local and simulated.

If a real backend is added later, create a `.env` file:

```
VITE_API_BASE_URL=https://your-backend.example.com
VITE_TELEMETRY_KEY=your_key_here
```

---

## Submission Summary

| Field | Value |
|-------|-------|
| **Project Name** | RainReady FlowSense |
| **Category** | Student |
| **Problem** | Bengaluru flood detection is slow, manual and fragmented |
| **Solution** | Agentic AI civic platform detecting road hazards from aggregated movement patterns |
| **Primary Metric** | Alert in < 2 min without manual report (prototype target) |
| **IBM Bob Usage** | Full development partner: architecture, components, debugging, accessibility, privacy |
| **Privacy** | Aggregated only · No individual tracking · Human review gate |
| **Emergency** | Decision support only · Does not control real vehicles |

---

*Built with ❤️ for Namma Bengaluru · IBM Bobathon 2026 · Student Category*
*Developed with IBM Bob as AI-assisted development partner*
