import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { ImageScanCard } from "@/components/ImageScanCard";
import { ScanPageHeader } from "@/components/ScanPageHeader";

export const Route = createFileRoute("/_authenticated/scan/document")({
  head: () => ({ meta: [{ title: "Document Verification — TrustOS AI" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={FileCheck2} title="Document Verification" desc="Upload an ID, certificate, or contract — we'll look for tampering or forgery." />
      <ImageScanCard kind="document" ctaLabel="Verify Document" helpText="Image of the document — PNG / JPG up to 5MB" />
    </div>
  );
}