import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listReports, createReport } from "@/lib/reports.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Scam Reports — TrustOS AI" },
      { name: "description", content: "Browse and submit community-reported scams across websites, phone numbers, UPI, email and messages." },
      { property: "og:title", content: "Community Scam Reports — TrustOS AI" },
      { property: "og:description", content: "Browse and submit community-reported scams across websites, phone numbers, UPI, email and messages." },
      { property: "og:url", content: "https://trustosai.lovable.app/reports" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/reports" }],
  }),
  component: Page,
});

const CATS = ["website", "phone", "email", "upi", "message", "other"] as const;

function Page() {
  const list = useServerFn(listReports);
  const create = useServerFn(createReport);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<typeof CATS[number]>("website");
  const [target, setTarget] = useState("");
  const [desc, setDesc] = useState("");
  const q = useQuery({ queryKey: ["reports", search], queryFn: () => list({ data: { search } }) });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create({ data: { category: cat, target, description: desc } });
      toast.success("Report submitted");
      setTarget(""); setDesc("");
      qc.invalidateQueries({ queryKey: ["reports"] });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-6 flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><MessageSquare className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Scam Report Community</h1>
          <p className="text-muted-foreground text-sm mt-1">Search community reports or warn others about a scam you've encountered.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr,360px] gap-6">
        <section>
          <div className="glass rounded-2xl p-3 flex gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground self-center ml-2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search target or description…" className="border-0 bg-transparent" />
          </div>
          <div className="space-y-3">
            {q.isLoading && <div className="text-muted-foreground">Loading…</div>}
            {q.data?.length === 0 && <div className="text-muted-foreground glass rounded-2xl p-8 text-center">No reports yet.</div>}
            {q.data?.map((r) => (
              <article key={r.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary">{r.category}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="font-semibold mt-2 break-all">{r.target}</div>
                <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
              </article>
            ))}
          </div>
        </section>

        <aside>
          <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-3 sticky top-6">
            <h3 className="font-semibold">Report a scam</h3>
            <Select value={cat} onValueChange={(v) => setCat(v as typeof CATS[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="URL, phone, email, UPI…" required />
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the scam (min 10 chars)…" rows={4} required />
            <Button type="submit" className="btn-hero w-full">Submit report</Button>
          </form>
        </aside>
      </div>
    </div>
  );
}