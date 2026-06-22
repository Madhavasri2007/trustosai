import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/qr")({
  head: () => ({ meta: [{ title: "QR Code Scanner — TrustOS AI" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={QrCode} title="QR Code Scanner" desc="Upload a QR code image — we'll decode it and check the destination for scams." />
      <ImageScanCard kind="qr" ctaLabel="Scan QR" helpText="PNG, JPG up to 5MB" />
    </div>
  );
}