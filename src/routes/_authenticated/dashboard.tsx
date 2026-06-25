import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { recentScans, scanStats } from "@/lib/scans.functions";
import { Globe, Mail, Lock, MessageSquare, Bot, ShieldCheck, AlertTriangle, Activity, FileSearch, QrCode, Receipt, ShoppingBag, Scan, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TrustOS AI" },
      { name: "description", content: "See your digital Trust Score, recent scans, and quick-launch every TrustOS AI scanner from one place." },
      { property: "og:title", content: "Your Trust Dashboard — TrustOS AI" },
      { property: "og:description", content: "See your digital Trust Score, recent scans, and quick-launch every TrustOS AI scanner from one place." },
      { property: "og:url", content: "https://trustosai.lovable.app/dashboard" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/dashboard" }],
  }),
  component: Dashboard,
});

const quick = [
  { to: "/scan/website", label: "Scan Website", icon: Globe },
  { to: "/scan/shopping", label: "Shopping Site", icon: ShoppingBag },
  { to: "/scan/qr", label: "QR Code", icon: QrCode },
  { to: "/scan/email", label: "Scan Email", icon: Mail },
  { to: "/scan/payment", label: "Payment Receipt", icon: Receipt },
  { to: "/scan/deepfake", label: "Deepfake", icon: Scan },
  { to: "/scan/document", label: "Document", icon: FileCheck2 },
  { to: "/scan/password", label: "Check Password", icon: Lock },
  { to: "/reports", label: "Scam Reports", icon: MessageSquare },
  { to: "/assistant", label: "Ask AI", icon: Bot },
] as const;

function Dashboard() {
  const stats = useServerFn(scanStats);
  const recent = useServerFn(recentScans);
  const sq = useQuery({ queryKey: ["scan-stats"], queryFn: () => stats() });
  const rq = useQuery({ queryKey: ["recent-scans"], queryFn: () => recent() });
  const s = sq.data ?? { total: 0, safe: 0, risky: 0, trustScore: 100 };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here's your digital trust overview.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Trust Score" value={`${s.trustScore}/100`} icon={ShieldCheck} accent="text-success" />
        <StatCard label="Total Scans" value={s.total} icon={Activity} />
        <StatCard label="Safe Results" value={s.safe} icon={ShieldCheck} accent="text-success" />
        <StatCard label="Risks Found" value={s.risky} icon={AlertTriangle} accent="text-destructive" />
      </div>

      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Quick actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="glass rounded-xl p-4 flex flex-col gap-2 hover:border-primary/60 transition-colors">
            <q.icon className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium">{q.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Recent scans</h2>
      <div className="glass rounded-2xl overflow-hidden">
        {rq.isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (rq.data?.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <FileSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No scans yet. Try a quick action above.
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {rq.data!.map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.scan_type}</div>
                  <div className="truncate text-sm">{r.input}</div>
                </div>
                <div className={
                  "text-xs font-semibold px-2.5 py-1 rounded-full border " +
                  (r.verdict === "SAFE" ? "border-success/40 text-success bg-success/10"
                    : r.verdict === "DANGER" ? "border-destructive/40 text-destructive bg-destructive/10"
                    : r.verdict === "WARNING" ? "border-warning/40 text-warning bg-warning/10"
                    : "border-primary/40 text-primary bg-primary/10")
                }>{r.verdict}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: React.ReactNode; icon: React.ElementType; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={"h-4 w-4 " + (accent ?? "text-primary")} />
      </div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}