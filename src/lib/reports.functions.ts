import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Category = z.enum(["website", "phone", "email", "upi", "message", "other"]);

export const listReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ search: z.string().max(200).optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("reports")
      .select("id, category, target, description, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.search) q = q.or(`target.ilike.%${data.search}%,description.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      category: Category,
      target: z.string().trim().min(2).max(300),
      description: z.string().trim().min(10).max(2000),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reports").insert({
      user_id: context.userId,
      category: data.category,
      target: data.target,
      description: data.description,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });