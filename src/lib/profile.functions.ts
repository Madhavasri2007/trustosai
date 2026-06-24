import { safeThrow } from "@/lib/safe-error";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("id, display_name, trust_score, created_at").eq("id", context.userId).maybeSingle();
    const { data: roles } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    const { data: scans } = await context.supabase
      .from("scans").select("id", { count: "exact", head: false });
    return {
      profile: profile ?? { id: context.userId, display_name: null, trust_score: 100, created_at: new Date().toISOString() },
      roles: (roles ?? []).map((r) => r.role),
      scanCount: scans?.length ?? 0,
      email: (context.claims as { email?: string } | null)?.email ?? null,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ display_name: z.string().trim().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles").update({ display_name: data.display_name, updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) safeThrow(error, "db");
    return { ok: true };
  });