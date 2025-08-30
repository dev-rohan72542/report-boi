Role: You are a senior front-end engineer + product designer.
Goal: Transform the existing Daily Life Tracker app’s desktop UI into a dark-mode first, cyber-neon, glassmorphism dashboard (like a futuristic analytics tool). Preserve all logic; change only presentation and small UX affordances.

Constraints

Stack: React + Tailwind + shadcn/ui (Radix) (current project uses these).

Keep components accessible (WCAG AA), keyboard-navigable, and responsive ≥ 1280px desktop, ≥ 1024px laptop, ≥ 768px tablet, and mobile stacked.

Do not break TypeScript types or existing APIs.

No new dependencies unless essential. Prefer Tailwind utilities + CSS variables.

Design System (create design tokens)

Add these tokens in src/styles/tokens.css and import globally:

:root {
  --bg: #0b1220;                       /* deep navy/black */
  --panel: rgba(20, 28, 46, 0.6);      /* glass card */
  --panel-strong: rgba(20, 28, 46, 0.9);
  --border: rgba(255,255,255,0.08);
  --fg: #e6ecff;
  --muted: #9fb0d7;

  --accent: #38e8ff;   /* neon cyan */
  --accent-2: #8a66ff; /* neon violet */
  --accent-3: #ff5fd2; /* neon magenta */

  --glow: 0 0 24px rgba(56,232,255,0.35);
  --shadow-xxl: 0 10px 30px rgba(0,0,0,0.55);

  --radius-xl: 18px;
  --blur: 14px;
}


Update Tailwind config tailwind.config.ts:

import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panelStrong: "var(--panel-strong)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        accent3: "var(--accent-3)",
        border: "var(--border)"
      },
      borderRadius: { xl: "var(--radius-xl)" },
      boxShadow: {
        glow: "var(--glow)",
        xxl: "var(--shadow-xxl)"
      },
      backdropBlur: { glass: "var(--blur)" },
      fontFamily: {
        display: ["Inter", "SF Pro Display", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      }
    }
  },
  plugins: []
};
export default config;


Global base styles src/styles/globals.css (ensure imported once):

@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { background: radial-gradient(1200px 800px at 70% -10%, #14203a 0%, #0b1220 55%, #070b14 100%); color: var(--fg); }

.card-glass {
  @apply rounded-xl border border-border shadow-xxl;
  background: var(--panel);
  backdrop-filter: blur(var(--blur));
}

.neon-accent {
  box-shadow: var(--glow);
}

.neon-divider {
  background: linear-gradient(90deg, transparent, var(--accent) 40%, var(--accent2) 60%, transparent);
  height: 1px; opacity: .5;
}

.btn-neon {
  @apply rounded-full px-4 py-2 text-sm font-medium;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #06101c; /* readable on neon */
  box-shadow: var(--glow);
}

Component refactors (keep logic; change UI)
1) App shell

Wrap page in a glass container with a neon header strip.

Add a top bar: title on left, date-range control centered, actions (search, import/export, profile) on right.

Modify src/App.tsx (or index.tsx main view):

Apply className="mx-auto max-w-[1480px] p-6" to outer container.

Replace header with:

<header className="card-glass p-4 md:p-5 mb-4 md:mb-6 relative overflow-hidden">
  <div className="absolute inset-x-0 -top-px neon-divider" />
  <div className="flex items-center gap-3 justify-between">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-accent/20 ring-1 ring-accent/50 neon-accent" />
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Daily Life Tracker</h1>
    </div>
    <div className="hidden md:flex items-center gap-2">
      {/* date range inputs already exist: reuse */}
    </div>
    <div className="flex items-center gap-2">
      <Button variant="secondary" className="card-glass px-3 py-2">Import</Button>
      <Button className="btn-neon">Export</Button>
    </div>
  </div>
</header>

2) Metric cards row

Create a component src/components/MetricCard.tsx:

export function MetricCard({label, value, sparkline}:{label:string; value:React.ReactNode; sparkline?:React.ReactNode}) {
  return (
    <div className="card-glass p-4 md:p-5 flex flex-col gap-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
      {sparkline}
    </div>
  );
}


Use it in a 4-column grid on desktop:

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
  <MetricCard label="Work Hours" value={kpis.workTotal} />
  <MetricCard label="Qur'an Study" value={kpis.quranTotal} />
  <MetricCard label="Exercise" value={kpis.exerciseTotal} />
  <MetricCard label="Contacts" value={kpis.communicationTotal} />
</div>


(Optional: use tiny SVG path lines with stroke=var(--accent) for sparkline.)

3) Table styling (desktop)

Wrap the table in a glass card, add sticky header and neon focus:

<Card className="card-glass">
  <CardContent className="p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-[1200px] text-xs">
        <thead className="sticky top-0 z-10 bg-panelStrong backdrop-blur-glass">
          <tr className="text-muted">
            {/* existing th cells; add className="px-3 py-3 text-left border-b border-border" */}
          </tr>
        </thead>
        <tbody>
          {/* each <tr> add hover:bg-white/5 transition-colors */}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>


Inputs and controls in table:

Input fields: className="bg-transparent border-border focus:ring-0 focus:border-accent focus:shadow-glow"

Small toggles or selects use panel background.

4) Right analytics sidebar (optional if already present)

Add a right column on ≥ xl:

<div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
  <section> {/* table + controls */} </section>
  <aside className="hidden xl:flex flex-col gap-4">
    <div className="card-glass p-4">Trends</div>
    <div className="card-glass p-4">Distribution</div>
    <div className="card-glass p-4">Streaks</div>
  </aside>
</div>

5) Buttons & tabs

Primary actions use .btn-neon.

Secondary actions: className="card-glass px-3 py-2 hover:bg-white/10 transition"

Tabs list: className="card-glass p-1 rounded-xl" and each trigger with data-[state=active]:bg-white/10.

6) Sidebar editor (you already added)

Change panel classes to bg-panelStrong backdrop-blur-glass border border-border shadow-xxl.

Header bottom border: border-b border-border.

Primary CTA inside drawer uses .btn-neon.

Code-mod tasks (let’s do them now)

Create src/styles/tokens.css & import it in your app root (e.g., main.tsx or index.tsx).

Update tailwind.config.ts exactly as above.

Update global styles in src/styles/globals.css.

Refactor header, metrics grid, table wrapper, and drawer classes as above—do not touch data logic.

Ensure lang="bn" remains on root; English labels may be used in metrics for clarity.

QA Checklist

 Dark background with subtle radial gradient.

 All cards have glass blur + border and neon hover glow on interactive elements.

 Table header sticky; rows readable; inputs clear focus ring (neon).

 Metrics visible at a glance; values match current totals.

 A11y: color contrast ≥ 4.5:1, focusable controls visible, aria-labels preserved.

 Responsive: ≥ 1280px shows right sidebar; smaller screens collapse gracefully.

Deliverables

Modified Tailwind config, tokens, global CSS.

Updated header/metrics/table/drawer JSX classes.

No breaking changes; build passes; UI visually matches cyber-neon glass dashboard.