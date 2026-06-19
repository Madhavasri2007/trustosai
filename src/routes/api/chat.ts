import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing AI key", { status: 500 });
        const body = await request.json() as { messages: Array<{ role: string; content: string }> };
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
            messages: [systemMsg, ...(body.messages ?? [])],
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