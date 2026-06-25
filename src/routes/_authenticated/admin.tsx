import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOverview, deleteReport, isCurrentUserAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { ScanPageHeader } from "@/components/ScanPageHeader";
import { ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TrustOS AI" },
      { name: "description", content: "Moderate scam reports, manage users, and review scan activity across TrustOS AI." },
      { property: "og:title", content: "Admin Dashboard — TrustOS AI" },
      { property: "og:description", content: "Moderate scam reports, manage users, and review scan activity across TrustOS AI." },
      { property: "og:url", content: "https://trustosai.lovable.app/admin" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/admin" }],
  }),
  component: Page,
});

function Page() {
  const checkFn = useServerFn(isCurrentUserAdmin);
  const overviewFn = useServerFn(adminOverview);
  const delFn = useServerFn(deleteReport);
  const qc = useQueryClient();

  const access = useQuery({ queryKey: ["admin-access"], queryFn: () => checkFn() });
  const data = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn(),
    enabled: access.data?.isAdmin === true,
  });

  if (access.isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!access.data?.isAdmin) {
    return (
      <div className="p-10 max-w-2xl mx-auto">
        <ScanPageHeader icon={ShieldAlert} title="Admin Dashboard" desc="Restricted area." />
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">You don't have admin access. Contact a TrustOS administrator to be granted the admin role.</p>
        </div>
      </div>
    );
  }

  async function remove(id: string) {
    try { await delFn({ data: { id } }); toast.success("Report removed"); qc.invalidateQueries({ queryKey: ["admin-overview"] }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  }

  const d = data.data;
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <ScanPageHeader icon={ShieldAlert} title="Admin Dashboard" desc="Platform-wide moderation and analytics." />
      {data.isLoading || !d ? <div className="text-muted-foreground">Loading data…</div> : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Stat label="Total Users" value={d.stats.totalUsers} />
            <Stat label="Total Scans" value={d.stats.totalScans} />
            <Stat label="Risky Scans" value={d.stats.riskyScans} />
            <Stat label="Community Reports" value={d.stats.totalReports} />
          </div>

          <Section title="Recent Users">
            <ul className="divide-y divide-border/50">
              {d.users.map((u) => (
                <li key={u.id} className="p-3 flex justify-between text-sm">
                  <div className="truncate">{u.display_name ?? "—"} <span className="text-muted-foreground">· {u.id.slice(0, 8)}</span></div>
                  <div className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Recent Scans">
            <ul className="divide-y divide-border/50">
              {d.recentScans.map((s) => (
                <li key={s.id} className="p-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.scan_type}</div>
                    <div className="truncate">{s.input}</div>
                  </div>
                  <div className="text-xs font-semibold opacity-80">{s.verdict} · {s.risk_score}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Recent Community Reports">
            <ul className="divide-y divide-border/50">
              {d.recentReports.map((r) => (
                <li key={r.id} className="p-3 flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.category}</div>
                    <div className="truncate font-medium">{r.target}</div>
                    <div className="text-muted-foreground truncate">{r.description}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">{title}</h2>
      <div className="glass rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
}