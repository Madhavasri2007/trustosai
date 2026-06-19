import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LayoutDashboard, Globe, Mail, Lock, MessageSquare, Bot, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      if (!session) navigate({ to: "/auth" });
      else { setEmail(session.user.email ?? null); setReady(true); }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate({ to: "/auth" });
      else { setEmail(data.session.user.email ?? null); setReady(true); }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen flex">
      <Sidebar email={email} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan/website", label: "Website", icon: Globe },
  { to: "/scan/email", label: "Email", icon: Mail },
  { to: "/scan/password", label: "Password", icon: Lock },
  { to: "/reports", label: "Scam Reports", icon: MessageSquare },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
] as const;

function Sidebar({ email }: { email: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border/60 glass rounded-none hidden md:flex flex-col p-4 h-screen sticky top-0">
      <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg px-2 py-2">
        <Shield className="h-6 w-6 text-primary" /> TrustOS AI
      </Link>
      <nav className="mt-6 space-y-1 flex-1">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === n.to
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/50 pt-3 mt-3">
        <div className="px-3 text-xs text-muted-foreground truncate">{email}</div>
        <Button variant="ghost" size="sm" className="w-full justify-start mt-2" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </aside>
  );
}