import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { scanImage } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/RiskGauge";
import { toast } from "sonner";
import { Upload, Camera, FileText } from "lucide-react";

type Kind = "qr" | "payment" | "deepfake" | "document";

const ACCEPT_MAP: Record<Kind, string> = {
  qr: "image/*",
  payment: "image/*",
  deepfake: "image/*",
  document: "image/*,application/pdf",
};

export function ImageScanCard({ kind, ctaLabel, helpText }: { kind: Kind; ctaLabel: string; helpText: string }) {
  const fn = useServerFn(scanImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [mime, setMime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scanImage>> | null>(null);

  function onFile(file: File) {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (kind === "document") {
      if (!isImage && !isPdf) return toast.error("Upload an image or PDF.");
    } else if (!isImage) {
      return toast.error("Please upload an image.");
    }
    if (file.size > 7_500_000) return toast.error("File must be under 7MB.");
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setFilename(file.name);
      setMime(file.type);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!preview) return;
    setLoading(true);
    try { setResult(await fn({ data: { kind, dataUrl: preview, filename: filename ?? undefined } })); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Scan failed"); }
    finally { setLoading(false); }
  }

  const accept = ACCEPT_MAP[kind];
  const isPdfPreview = mime === "application/pdf";

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        {preview ? (
          <div className="space-y-4">
            {isPdfPreview ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <FileText className="h-12 w-12" />
                <div className="text-sm font-medium text-foreground">{filename}</div>
                <div className="text-xs">PDF document ready to verify</div>
              </div>
            ) : (
              <img src={preview} alt="upload preview" className="max-h-72 mx-auto rounded-lg border border-border/60" />
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => inputRef.current?.click()}>Replace</Button>
              {kind !== "document" && (
                <Button variant="outline" onClick={() => cameraRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-1" /> Camera
                </Button>
              )}
              <Button onClick={submit} disabled={loading} className="btn-hero">{loading ? "Analyzing…" : ctaLabel}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-border/60 rounded-xl py-12 flex flex-col items-center gap-3 hover:border-primary/60 transition-colors text-muted-foreground"
            >
              <Upload className="h-8 w-8" />
              <div className="text-sm">Click to upload {kind === "document" ? "an image or PDF" : "an image"}</div>
              <div className="text-xs">{helpText}</div>
            </button>
            {kind !== "document" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => cameraRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" /> Capture with camera
              </Button>
            )}
          </div>
        )}
      </div>
      {result && (
        <>
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
        </>
      )}
    </div>
  );
}