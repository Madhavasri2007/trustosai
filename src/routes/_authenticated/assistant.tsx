import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — TrustOS AI" }] }),
  component: Page,
});

type Msg = { role: "user" | "assistant"; content: string };

function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your TrustOS Assistant. Ask me if a link, email, or message looks safe — or anything about staying secure online." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        setMessages([...next, { role: "assistant", content: "Please sign in again to continue." }]);
        setLoading(false); return;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        setMessages([...next, { role: "assistant", content: "Sorry, I couldn't respond. Please try again." }]);
        setLoading(false); return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          const l = line.trim();
          if (!l.startsWith("data:")) continue;
          const payload = l.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const j = JSON.parse(payload);
            const delta = j.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = m.slice();
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } finally { setLoading(false); requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9 })); }
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border/50 px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Bot className="h-5 w-5" /></div>
        <div>
          <h1 className="font-semibold">AI Security Assistant</h1>
          <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={m.role === "user"
                ? "bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 max-w-[80%]"
                : "glass rounded-2xl px-4 py-2.5 max-w-[80%]"}>
                <p className="text-sm whitespace-pre-wrap">{m.content || "…"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border/50 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me about a link, email, or anything security…" disabled={loading} />
          <Button type="submit" disabled={loading || !input.trim()} className="btn-hero"><Send className="h-4 w-4" /></Button>
        </div>
      </form>
    </div>
  );
}