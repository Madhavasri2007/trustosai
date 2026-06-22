import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/payment")({
  head: () => ({ meta: [{ title: "Payment Screenshot Detector — TrustOS AI" }] }),
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