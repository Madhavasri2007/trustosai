import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-3-flash-preview";

type Content = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

async function callAI(system: string, user: Content): Promise<{ text: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI gateway error ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  return { text: json.choices?.[0]?.message?.content ?? "{}" };
}

const Verdict = z.object({
  risk_score: z.number().int().min(0).max(100),
  verdict: z.enum(["SAFE", "CAUTION", "WARNING", "DANGER"]),
  explanation: z.string(),
  signals: z.array(z.string()).default([]),
});

function parseVerdict(text: string) {
  try {
    const obj = JSON.parse(text);
    return Verdict.parse(obj);
  } catch {
    return { risk_score: 50, verdict: "CAUTION" as const, explanation: text.slice(0, 300), signals: [] };
  }
}

/* ---------------- Website scan ---------------- */
export const scanWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const url = data.url;
    const u = new URL(url);
    const heuristics: string[] = [];
    if (u.protocol !== "https:") heuristics.push("No HTTPS — connection is not encrypted.");
    if (/\d{3,}/.test(u.hostname)) heuristics.push("Hostname contains long digit sequences.");
    if (u.hostname.split(".").length > 3) heuristics.push("Unusually deep subdomain structure.");
    if (/(login|verify|secure|update|bank|wallet|gift)/i.test(u.pathname)) heuristics.push("URL path uses sensitive keywords.");
    if (u.hostname.length > 40) heuristics.push("Very long hostname.");

    const system = `You are a cybersecurity analyst. Analyze a URL and return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"plain english, 2-3 sentences for non-technical users","signals":["short bullet","..."]}. Lower score = safer. Consider phishing patterns, lookalike domains, suspicious TLDs, brand impersonation, structure.`;
    const user = `URL: ${url}\nClient-side heuristics already detected: ${heuristics.join(" | ") || "none"}.\nReturn JSON only.`;

    const { text } = await callAI(system, user);
    const parsed = parseVerdict(text);
    const allSignals = [...heuristics, ...parsed.signals];

    const { data: saved, error } = await context.supabase
      .from("scans")
      .insert({
        user_id: context.userId,
        scan_type: "website",
        input: url,
        risk_score: parsed.risk_score,
        verdict: parsed.verdict,
        explanation: parsed.explanation,
        details: { signals: allSignals },
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ...parsed, signals: allSignals, id: saved.id };
  });

/* ---------------- Email scan ---------------- */
export const scanEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ content: z.string().min(20).max(10000) }).parse(d))
  .handler(async ({ data, context }) => {
    const system = `You are a phishing/scam-email analyst. Return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"2-3 sentence plain explanation","signals":["specific red flags"]}. Look for urgency, fake links, sender spoofing, prize/payment scams, credential harvesting.`;
    const { text } = await callAI(system, `Email content:\n"""${data.content}"""\nReturn JSON only.`);
    const parsed = parseVerdict(text);
    const { data: saved, error } = await context.supabase
      .from("scans")
      .insert({
        user_id: context.userId,
        scan_type: "email",
        input: data.content.slice(0, 500),
        risk_score: parsed.risk_score,
        verdict: parsed.verdict,
        explanation: parsed.explanation,
        details: { signals: parsed.signals },
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ...parsed, id: saved.id };
  });

/* ---------------- Recent scans ---------------- */
export const recentScans = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("id, scan_type, input, risk_score, verdict, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const scanStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("risk_score, verdict");
    if (error) throw new Error(error.message);
    const total = data.length;
    const safe = data.filter((s) => s.verdict === "SAFE").length;
    const risky = data.filter((s) => s.verdict === "WARNING" || s.verdict === "DANGER").length;
    const avg = total ? Math.round(data.reduce((a, s) => a + s.risk_score, 0) / total) : 0;
    const trustScore = Math.max(0, 100 - avg);
    return { total, safe, risky, trustScore };
  });

/* ---------------- Shopping site scan ---------------- */
export const scanShopping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const system = `You are an e-commerce fraud analyst. Return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"2-3 sentences for shoppers","signals":["red flags"]}. Look for fake stores, brand impersonation, unrealistic discounts, suspicious payment options, missing contact info, lookalike domains, dropshipping scams.`;
    const { text } = await callAI(system, `Shopping URL: ${data.url}\nReturn JSON only.`);
    const parsed = parseVerdict(text);
    const { data: saved, error } = await context.supabase.from("scans").insert({
      user_id: context.userId, scan_type: "shopping", input: data.url,
      risk_score: parsed.risk_score, verdict: parsed.verdict, explanation: parsed.explanation,
      details: { signals: parsed.signals },
    }).select().single();
    if (error) throw new Error(error.message);
    return { ...parsed, id: saved.id };
  });

/* ---------------- Image-based scans (QR, payment, deepfake, document) ---------------- */
const ImageKind = z.enum(["qr", "payment", "deepfake", "document"]);

const KIND_PROMPTS: Record<z.infer<typeof ImageKind>, { label: string; system: string }> = {
  qr: {
    label: "QR Code",
    system: `You are a QR code safety analyst. Decode/read the QR content in the image and analyze the destination. Return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"2-3 sentences (include the decoded URL/text)","signals":["red flags"]}. Flag phishing URLs, payment requests, suspicious shorteners, UPI/crypto scams.`,
  },
  payment: {
    label: "Payment Screenshot",
    system: `You are a payment-fraud analyst. Examine the payment confirmation screenshot (UPI / bank / wallet / receipt). Return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"2-3 sentences","signals":["red flags"]}. Flag mismatched fonts, edited amounts, fake transaction IDs, status inconsistencies, watermark issues, common forgery patterns.`,
  },
  deepfake: {
    label: "Deepfake / Image Authenticity",
    system: `You are a media-authenticity analyst. Look for signs the image is AI-generated, deepfaked, or manipulated. Return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"2-3 sentences","signals":["specific artifacts"]}. Note: this is heuristic; never claim 100% certainty.`,
  },
  document: {
    label: "Document Verification",
    system: `You are a document-fraud analyst. Examine the ID/certificate/document image. Return STRICT JSON: {"risk_score":0-100,"verdict":"SAFE|CAUTION|WARNING|DANGER","explanation":"2-3 sentences","signals":["specific concerns"]}. Flag template mismatches, font inconsistencies, missing security features, edited fields, low-quality reproductions.`,
  },
};

export const scanImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      kind: ImageKind,
      dataUrl: z.string().startsWith("data:image/").max(8_000_000),
      filename: z.string().max(200).optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const cfg = KIND_PROMPTS[data.kind];
    const { text } = await callAI(cfg.system, [
      { type: "text", text: `Analyze this image as a ${cfg.label}. Return JSON only.` },
      { type: "image_url", image_url: { url: data.dataUrl } },
    ]);
    const parsed = parseVerdict(text);
    const { data: saved, error } = await context.supabase.from("scans").insert({
      user_id: context.userId, scan_type: data.kind, input: data.filename ?? `${cfg.label} upload`,
      risk_score: parsed.risk_score, verdict: parsed.verdict, explanation: parsed.explanation,
      details: { signals: parsed.signals },
    }).select().single();
    if (error) throw new Error(error.message);
    return { ...parsed, id: saved.id };
  });