import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/qr")({
  head: () => ({
    meta: [
      { title: "QR Code Scanner — TrustOS AI" },
      { name: "description", content: "Upload or capture a QR code and TrustOS AI will decode it and rate the destination for safety." },
      { property: "og:title", content: "QR Code Safety Scanner — TrustOS AI" },
      { property: "og:description", content: "Upload or capture a QR code and TrustOS AI will decode it and rate the destination for safety." },
      { property: "og:url", content: "https://trustosai.lovable.app/scan/qr" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/scan/qr" }],
  }),
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