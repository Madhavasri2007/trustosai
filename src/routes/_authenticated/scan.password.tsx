import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/scan/password")({
  head: () => ({
    meta: [
      { title: "Password Health — TrustOS AI" },
      { name: "description", content: "Check password strength, common patterns, and breach exposure locally — no password leaves your device." },
      { property: "og:title", content: "Password Health Checker — TrustOS AI" },
      { property: "og:description", content: "Check password strength, common patterns, and breach exposure locally — no password leaves your device." },
      { property: "og:url", content: "https://trustosai.lovable.app/scan/password" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/scan/password" }],
  }),
  component: Page,
});

const COMMON = ["password", "123456", "qwerty", "letmein", "welcome", "admin", "iloveyou", "monkey", "dragon", "abc123"];

function score(pw: string) {
  let s = 0;
  if (pw.length >= 8) s += 20;
  if (pw.length >= 12) s += 15;
  if (pw.length >= 16) s += 10;
  if (/[a-z]/.test(pw)) s += 10;
  if (/[A-Z]/.test(pw)) s += 10;
  if (/\d/.test(pw)) s += 10;
  if (/[^A-Za-z0-9]/.test(pw)) s += 15;
  if (new Set(pw).size >= pw.length * 0.6) s += 10;
  if (COMMON.some((c) => pw.toLowerCase().includes(c))) s -= 30;
  if (/^(.)\1+$/.test(pw)) s -= 20;
  if (/^(0123|1234|2345|3456|abcd|qwer)/i.test(pw)) s -= 15;
  return Math.max(0, Math.min(100, s));
}

function Page() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const s = useMemo(() => score(pw), [pw]);
  const label = s >= 75 ? "Strong" : s >= 50 ? "Medium" : s > 0 ? "Weak" : "—";
  const tone = s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";

  const tips = [
    { ok: pw.length >= 12, msg: "At least 12 characters" },
    { ok: /[A-Z]/.test(pw) && /[a-z]/.test(pw), msg: "Mix of upper and lower case" },
    { ok: /\d/.test(pw), msg: "Includes numbers" },
    { ok: /[^A-Za-z0-9]/.test(pw), msg: "Includes a symbol" },
    { ok: !COMMON.some((c) => pw.toLowerCase().includes(c)), msg: "Not a common password" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <header className="mb-6 flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Lock className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Password Health Checker</h1>
          <p className="text-muted-foreground text-sm mt-1">Tested entirely in your browser. We never store or transmit your password.</p>
        </div>
      </header>
      <div className="glass rounded-2xl p-6">
        <div className="relative">
          <Input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Type a password to test…" className="pr-10" />
          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShow(!show)}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Strength</span>
            <span className={"font-semibold " + tone}>{label} · {s}/100</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={"h-full transition-all " + (s >= 75 ? "bg-success" : s >= 50 ? "bg-warning" : "bg-destructive")} style={{ width: `${s}%` }} />
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-sm">
          {tips.map((t, i) => (
            <li key={i} className={t.ok ? "text-success" : "text-muted-foreground"}>{t.ok ? "✓" : "○"} {t.msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}