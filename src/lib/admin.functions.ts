import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: ReturnType<typeof Object>; userId: string }) {
  const { data, error } = await (ctx.supabase as any).rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [scans, reports, users] = await Promise.all([
      supabaseAdmin.from("scans").select("id, scan_type, input, risk_score, verdict, created_at, user_id").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("reports").select("id, category, target, description, created_at, user_id").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("profiles").select("id, display_name, trust_score, created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    if (scans.error) throw new Error(scans.error.message);
    if (reports.error) throw new Error(reports.error.message);
    if (users.error) throw new Error(users.error.message);
    const total = scans.data?.length ?? 0;
    const risky = (scans.data ?? []).filter((s) => s.verdict === "WARNING" || s.verdict === "DANGER").length;
    return {
      stats: {
        totalScans: total,
        riskyScans: risky,
        totalReports: reports.data?.length ?? 0,
        totalUsers: users.data?.length ?? 0,
      },
      recentScans: scans.data ?? [],
      recentReports: reports.data ?? [],
      users: users.data ?? [],
    };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isCurrentUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any).rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: Boolean(data) };
  });