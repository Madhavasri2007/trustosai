import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanPageHeader } from "@/components/ScanPageHeader";
import { UserCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — TrustOS AI" },
      { name: "description", content: "Manage your TrustOS AI display name and review your personal scan and trust statistics." },
      { property: "og:title", content: "Your TrustOS Profile — TrustOS AI" },
      { property: "og:description", content: "Manage your TrustOS AI display name and review your personal scan and trust statistics." },
      { property: "og:url", content: "https://trustosai.lovable.app/profile" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/profile" }],
  }),
  component: Page,
});

function Page() {
  const get = useServerFn(getProfile);
  const update = useServerFn(updateProfile);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profile"], queryFn: () => get() });
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (q.data?.profile.display_name) setName(q.data.profile.display_name); }, [q.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await update({ data: { display_name: name } }); toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile"] }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <ScanPageHeader icon={UserCircle2} title="Your Profile" desc="Manage your TrustOS AI account." />
      {q.isLoading ? <div className="text-muted-foreground">Loading…</div> : q.data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Trust Score" value={`${q.data.profile.trust_score}/100`} />
            <Stat label="Scans Run" value={q.data.scanCount} />
            <Stat label="Role" value={q.data.roles.includes("admin") ? "Admin" : "User"} />
            <Stat label="Member Since" value={new Date(q.data.profile.created_at).toLocaleDateString()} />
          </div>
          <form onSubmit={save} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={q.data.email ?? ""} disabled className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="dn">Display name</Label>
              <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required maxLength={80} />
            </div>
            <Button type="submit" disabled={saving} className="btn-hero">{saving ? "Saving…" : "Save changes"}</Button>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}