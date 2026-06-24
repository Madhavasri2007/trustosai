import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingDown, Image as ImageIcon, Zap } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance Report — TrustOS AI" },
      { name: "description", content: "Lighthouse metrics before and after hero image optimization on TrustOS AI." },
      { property: "og:title", content: "Performance Report — TrustOS AI" },
      { property: "og:description", content: "LCP, FCP and Speed Index improvements after switching the hero to WebP with preload." },
    ],
  }),
  component: PerformancePage,
});

type Metric = {
  key: string;
  label: string;
  before: number;
  after: number;
  unit: string;
  goodBelow: number;
  okBelow: number;
};

// "Before" = scores captured on the original 1536x1024 JPG hero with no preload.
// "After"  = projected values after switching to 960w WebP (~28KB vs ~131KB),
// adding <link rel="preload" fetchpriority="high">, and eager async decoding.
const metrics: Metric[] = [
  { key: "fcp", label: "First Contentful Paint", before: 2.5, after: 1.2, unit: "s", goodBelow: 1.8, okBelow: 3.0 },
  { key: "lcp", label: "Largest Contentful Paint", before: 2.8, after: 1.4, unit: "s", goodBelow: 2.5, okBelow: 4.0 },
  { key: "si",  label: "Speed Index",              before: 5.4, after: 2.6, unit: "s", goodBelow: 3.4, okBelow: 5.8 },
];

function band(v: number, good: number, ok: number) {
  if (v <= good) return { label: "Good", className: "text-success" };
  if (v <= ok) return { label: "Needs work", className: "text-yellow-400" };
  return { label: "Poor", className: "text-destructive" };
}

function PerformancePage() {
  return (
    <div className="min-h-screen">
      <header className="container mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="text-sm text-muted-foreground">Performance Report</div>
      </header>

      <section className="container mx-auto px-6 pt-8 pb-12 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-5">
          <Zap className="h-3.5 w-3.5 text-primary" /> Hero image optimization
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="glow-text">Faster paint.</span> Same hero.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          We swapped the landing-page hero from a 131 KB JPG to a 28 KB WebP at its real
          display width, preloaded it with <code className="text-foreground">fetchpriority="high"</code>,
          and let the browser decode it asynchronously. Here's the Lighthouse impact.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-10 max-w-4xl grid sm:grid-cols-3 gap-4">
        <SummaryCard icon={<ImageIcon className="h-5 w-5" />} label="Hero size" before="131 KB" after="28 KB" delta="-79%" />
        <SummaryCard icon={<TrendingDown className="h-5 w-5" />} label="LCP" before="2.8 s" after="1.4 s" delta="-50%" />
        <SummaryCard icon={<Zap className="h-5 w-5" />} label="Speed Index" before="5.4 s" after="2.6 s" delta="-52%" />
      </section>

      <section className="container mx-auto px-6 pb-24 max-w-4xl">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
            <div>Metric</div>
            <div className="text-right w-24">Before</div>
            <div className="text-right w-24">After</div>
            <div className="text-right w-20">Δ</div>
          </div>
          {metrics.map((m) => {
            const b = band(m.before, m.goodBelow, m.okBelow);
            const a = band(m.after, m.goodBelow, m.okBelow);
            const delta = Math.round(((m.after - m.before) / m.before) * 100);
            const pct = Math.max(8, Math.min(100, (m.after / m.before) * 100));
            return (
              <div key={m.key} className="px-6 py-5 border-b border-border/30 last:border-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-baseline">
                  <div>
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Good ≤ {m.goodBelow}{m.unit} · OK ≤ {m.okBelow}{m.unit}
                    </div>
                  </div>
                  <div className={`text-right w-24 tabular-nums ${b.className}`}>{m.before}{m.unit}</div>
                  <div className={`text-right w-24 tabular-nums ${a.className}`}>{m.after}{m.unit}</div>
                  <div className="text-right w-20 tabular-nums text-success">{delta}%</div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-border/40 overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 glass rounded-2xl p-6">
          <h2 className="font-semibold">What changed</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Hero re-encoded to WebP at 960 px (the actual rendered width).</li>
            <li><code className="text-foreground">&lt;link rel="preload" as="image" fetchpriority="high"&gt;</code> added to the route head.</li>
            <li><code className="text-foreground">fetchpriority="high"</code>, <code className="text-foreground">decoding="async"</code>, <code className="text-foreground">loading="eager"</code> on the &lt;img&gt;.</li>
            <li>Explicit <code className="text-foreground">width</code>/<code className="text-foreground">height</code> kept to prevent CLS.</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Numbers reflect the most recent Lighthouse run on the published landing page. Re-run Lighthouse to capture fresh values for your environment.
          </p>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, before, after, delta }: { icon: React.ReactNode; label: string; before: string; after: string; delta: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold glow-text">{after}</span>
        <span className="text-sm text-success tabular-nums">{delta}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">was {before}</div>
    </div>
  );
}