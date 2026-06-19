import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { scanWebsite } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskGauge } from "@/components/RiskGauge";
import { toast } from "sonner";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan/website")({
  head: () => ({ meta: [{ title: "Website Scanner — TrustOS AI" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(scanWebsite);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scanWebsite>> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const r = await fn({ data: { url } });
      setResult(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Header icon={Globe} title="Website Safety Checker" desc="Get an AI-powered trust score and plain-English explanation for any URL." />
      <form onSubmit={submit} className="glass rounded-2xl p-6 flex gap-3">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" type="url" required />
        <Button type="submit" disabled={loading} className="btn-hero">{loading ? "Scanning…" : "Scan"}</Button>
      </form>
      {result && (
        <div className="mt-6 space-y-4">
          <RiskGauge score={result.risk_score} verdict={result.verdict} />
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Why we think so</h3>
            <p className="text-sm text-muted-foreground">{result.explanation}</p>
            {result.signals.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {result.signals.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <header className="mb-6 flex items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Icon className="h-6 w-6" /></div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{desc}</p>
      </div>
    </header>
  );
}