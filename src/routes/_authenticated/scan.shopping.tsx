import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { scanShopping } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskGauge } from "@/components/RiskGauge";
import { ScanPageHeader } from "@/components/ScanPageHeader";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan/shopping")({
  head: () => ({
    meta: [
      { title: "Shopping Site Checker — TrustOS AI" },
      { name: "description", content: "Check e-commerce stores for fake-shop signals, missing trust badges, and high-risk patterns before you pay." },
      { property: "og:title", content: "Shopping Site Checker — TrustOS AI" },
      { property: "og:description", content: "Check e-commerce stores for fake-shop signals, missing trust badges, and high-risk patterns before you pay." },
      { property: "og:url", content: "https://trustosai.lovable.app/scan/shopping" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/scan/shopping" }],
  }),
  component: Page,
});

function Page() {
  const fn = useServerFn(scanShopping);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scanShopping>> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try { setResult(await fn({ data: { url } })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Scan failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={ShoppingBag} title="Shopping Site Checker" desc="Before you check out — verify the store for fake-shop and dropshipping red flags." />
      <form onSubmit={submit} className="glass rounded-2xl p-6 flex gap-3">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://store.example.com" type="url" required />
        <Button type="submit" disabled={loading} className="btn-hero">{loading ? "Checking…" : "Check Store"}</Button>
      </form>
      {result && (
        <div className="mt-6 space-y-4">
          <RiskGauge score={result.risk_score} verdict={result.verdict} />
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-2">What we found</h3>
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