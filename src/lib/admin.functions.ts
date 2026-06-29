import { safeThrow } from "@/lib/safe-error";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error) safeThrow(error, "db");
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [scans, reports, profiles, views, authList] = await Promise.all([
      supabaseAdmin.from("scans").select("id, scan_type, input, risk_score, verdict, created_at, user_id").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("reports").select("id, category, target, description, created_at, user_id").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("profiles").select("id, display_name, trust_score, created_at").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("page_views").select("id, user_id, path, created_at").order("created_at", { ascending: false }).limit(100),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    if (scans.error) safeThrow(scans.error, "db");
    if (reports.error) safeThrow(reports.error, "db");
    if (profiles.error) safeThrow(profiles.error, "db");
    if (views.error) safeThrow(views.error, "db");
    const authUsers = authList.data?.users ?? [];
    const authMap = new Map(authUsers.map((u: any) => [u.id, u]));
    const viewCounts = new Map<string, number>();
    for (const v of views.data ?? []) viewCounts.set(v.user_id, (viewCounts.get(v.user_id) ?? 0) + 1);
    const users = (profiles.data ?? []).map((p) => {
      const a: any = authMap.get(p.id);
      return {
        ...p,
        email: a?.email ?? null,
        last_sign_in_at: a?.last_sign_in_at ?? null,
        page_views: viewCounts.get(p.id) ?? 0,
      };
    }).sort((a, b) => (b.last_sign_in_at ?? "").localeCompare(a.last_sign_in_at ?? ""));
    const total = scans.data?.length ?? 0;
    const risky = (scans.data ?? []).filter((s) => s.verdict === "WARNING" || s.verdict === "DANGER").length;
    const emailById = new Map(users.map((u) => [u.id, u.email] as const));
    const recentViews = (views.data ?? []).slice(0, 50).map((v) => ({ ...v, email: emailById.get(v.user_id) ?? null }));
    return {
      stats: {
        totalUsers: users.length,
        totalScans: total,
        riskyScans: risky,
        totalReports: reports.data?.length ?? 0,
        totalViews: views.data?.length ?? 0,
      },
      recentScans: scans.data ?? [],
      recentReports: reports.data ?? [],
      users,
      recentViews,
    };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reports").delete().eq("id", data.id);
    if (error) safeThrow(error, "db");
    return { ok: true };
  });

export const isCurrentUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any).rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: Boolean(data) };
  });