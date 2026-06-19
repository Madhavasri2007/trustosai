import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { scanEmail } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RiskGauge } from "@/components/RiskGauge";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan/email")({
  head: () => ({ meta: [{ title: "Email Phishing Detector — TrustOS AI" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(scanEmail);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scanEmail>> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try { setResult(await fn({ data: { content } })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Scan failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <header className="mb-6 flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Mail className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Email Phishing Detector</h1>
          <p className="text-muted-foreground text-sm mt-1">Paste a suspicious email and let our AI flag scam patterns.</p>
        </div>
      </header>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-3">
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Paste the full email content here…" required />
        <Button type="submit" disabled={loading || content.length < 20} className="btn-hero">{loading ? "Analyzing…" : "Analyze Email"}</Button>
      </form>
      {result && (
        <div className="mt-6 space-y-4">
          <RiskGauge score={result.risk_score} verdict={result.verdict} />
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Analysis</h3>
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