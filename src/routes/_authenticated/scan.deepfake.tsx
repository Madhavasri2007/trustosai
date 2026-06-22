import { createFileRoute } from "@tanstack/react-router";
import { Scan } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/deepfake")({
  head: () => ({ meta: [{ title: "Deepfake Detector — TrustOS AI" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={Scan} title="Deepfake Detector" desc="Heuristic AI analysis for signs of image manipulation or AI generation." />
      <ImageScanCard kind="deepfake" ctaLabel="Analyze Image" helpText="Portrait or scene image — PNG / JPG up to 5MB" />
      <p className="text-xs text-muted-foreground mt-4">Note: AI-based heuristic, not forensic-grade. Treat findings as guidance, not proof.</p>
    </div>
  );
}