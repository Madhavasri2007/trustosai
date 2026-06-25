import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/document")({
  head: () => ({
    meta: [
      { title: "Document Verification — TrustOS AI" },
      { name: "description", content: "Verify IDs, certificates and PDFs for tampering, forgery, and metadata anomalies." },
      { property: "og:title", content: "Document Verification — TrustOS AI" },
      { property: "og:description", content: "Verify IDs, certificates and PDFs for tampering, forgery, and metadata anomalies." },
      { property: "og:url", content: "https://trustosai.lovable.app/scan/document" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/scan/document" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={FileCheck2} title="Document Verification" desc="Upload an ID, certificate, or contract — we'll look for tampering or forgery." />
      <ImageScanCard kind="document" ctaLabel="Verify Document" helpText="PNG, JPG or PDF up to 7MB" />
    </div>
  );
}