import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — TrustOS AI" },
      { name: "description", content: "Sign in or create your free TrustOS AI account to start scanning websites, emails, passwords, and payments for scams." },
      { property: "og:title", content: "Sign in — TrustOS AI" },
      { property: "og:description", content: "Access your TrustOS AI account to verify websites, messages and files before you trust them." },
      { property: "og:url", content: "https://trustosai.lovable.app/auth" },
    ],
    links: [{ rel: "canonical", href: "https://trustosai.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email if confirmation is required.");
    navigate({ to: "/dashboard" });
  }

  async function handleGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error("Google sign-in failed");
    else if (!res.redirected) navigate({ to: "/dashboard" });
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <Shield className="h-7 w-7 text-primary" /> TrustOS AI
      </Link>
      <h1 className="text-2xl font-semibold mb-6 text-center">Access Your Account</h1>
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <Field label="Email" id="email" type="email" value={email} onChange={setEmail} />
              <Field label="Password" id="password" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={loading} className="btn-hero w-full h-11">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <Field label="Name" id="name" value={name} onChange={setName} />
              <Field label="Email" id="email2" type="email" value={email} onChange={setEmail} />
              <Field label="Password" id="password2" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={loading} className="btn-hero w-full h-11">
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-3 my-6 text-xs text-muted-foreground">
          <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
        </div>
        <Button variant="outline" className="w-full h-11" onClick={handleGoogle}>
          Continue with Google
        </Button>
      </div>
    </main>
  );
}

function Field({ label, id, type = "text", value, onChange }: { label: string; id: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required className="mt-1.5" />
    </div>
  );
}