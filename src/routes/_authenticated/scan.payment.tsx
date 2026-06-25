import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/payment")({
  head: () => ({
    meta: [
      { title: "Payment Screenshot Detector — TrustOS AI" },
      { name: "description", content: "Detect fake or tampered UPI, bank and payment app screenshots before you ship a product or release funds." },
      { property: "og:title", content: "Payment Screenshot Detector — TrustOS AI" },
      { property: "og:description", content: "Detect fake or tampered UPI, bank and payment app screenshots before you ship a product or release funds." },
      { property: "og:url", content: "https://trustosai.lovable.app/scan/payment" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/scan/payment" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={Receipt} title="Payment Screenshot Detector" desc="Upload a payment confirmation (UPI / bank / wallet) — we'll flag signs of forgery." />
      <ImageScanCard kind="payment" ctaLabel="Verify Payment" helpText="Screenshot of payment receipt — PNG / JPG up to 5MB" />
    </div>
  );
}