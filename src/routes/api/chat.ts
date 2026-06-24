import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});
const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth: require a valid Supabase bearer token
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
        if (claimsError || !claimsData?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing AI key", { status: 500 });
        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = bodySchema.safeParse(rawBody);
        if (!parsed.success) {
          return new Response("Invalid request payload", { status: 400 });
        }
        const body = parsed.data;
        const systemMsg = {
          role: "system",
          content:
            "You are TrustOS Assistant, a friendly cybersecurity helper. Answer in plain, non-technical language. If a user asks whether a link/email/message is safe, give a clear verdict (Safe / Caution / Danger), short reasoning, and one practical tip. Keep replies under 150 words.",
        };
        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [systemMsg, ...body.messages],
            stream: true,
          }),
        });
        if (!upstream.ok) {
          if (upstream.status === 429) return new Response("Rate limit reached. Try again in a moment.", { status: 429 });
          if (upstream.status === 402) return new Response("AI credits exhausted.", { status: 402 });
          return new Response("AI service error", { status: 502 });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});