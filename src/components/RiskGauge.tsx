import { cn } from "@/lib/utils";

export function RiskGauge({ score, verdict }: { score: number; verdict: string }) {
  const tone =
    verdict === "SAFE" ? "text-success border-success/40 bg-success/10"
    : verdict === "DANGER" ? "text-destructive border-destructive/40 bg-destructive/10"
    : verdict === "WARNING" ? "text-warning border-warning/40 bg-warning/10"
    : "text-primary border-primary/40 bg-primary/10";
  const safety = Math.max(0, 100 - score);
  return (
    <div className={cn("rounded-2xl border p-6 flex items-center gap-6", tone)}>
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="none"
            strokeDasharray={`${(safety / 100) * 276.46} 276.46`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{safety}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">trust</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider opacity-70">Verdict</div>
        <div className="text-2xl font-bold">{verdict}</div>
        <div className="text-sm opacity-80 mt-1">Risk score {score}/100</div>
      </div>
    </div>
  );
}