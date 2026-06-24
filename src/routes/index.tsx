import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shield, Globe, QrCode, Mail, CreditCard, Eye, FileCheck, Lock, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-shield.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrustOS AI — Verify Before You Trust" },
      { name: "description", content: "Scan websites, emails, passwords, and payment screenshots with AI to detect scams and digital threats before they reach you." },
      { property: "og:title", content: "TrustOS AI — Verify Before You Trust" },
      { property: "og:description", content: "AI-powered digital trust verification platform." },
    ],
    links: [
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Globe, title: "Website Safety", desc: "Trust score for any URL: SSL, domain age, blacklists, redirects." },
  { icon: Mail, title: "Email Phishing", desc: "Spot scam emails, fake links, and urgency-based social engineering." },
  { icon: Lock, title: "Password Health", desc: "Strength, common patterns, and exposure — checked locally." },
  { icon: CreditCard, title: "Payment Verify", desc: "Detect tampered payment screenshots and fake UPI transfers." },
  { icon: Eye, title: "Deepfake Detection", desc: "AI-powered analysis for manipulated images and videos." },
  { icon: FileCheck, title: "Document Trust", desc: "Validate documents for tampering and metadata anomalies." },
];

const stats = [
  { value: "120K+", label: "Scams blocked" },
  { value: "98.4%", label: "Detection accuracy" },
  { value: "<2s", label: "Avg scan time" },
  { value: "24/7", label: "AI guardian" },
];

const steps = [
  { n: "01", title: "Submit", desc: "Paste a URL, email, or upload a file you want verified." },
  { n: "02", title: "Analyze", desc: "Our AI cross-checks signals across reputation, structure, and content." },
  { n: "03", title: "Decide", desc: "Get a clear trust score with a plain-English explanation." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center px-6 pt-20 pb-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered digital safety assistant
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="glow-text">TrustOS AI</span>
              <br /> Your digital safety assistant.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Verify websites, messages, payments and files <em>before</em> trusting them. Built for a world full of scams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-hero h-12 px-7 text-base font-semibold">
                <Link to="/auth">Start Scanning <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <a href="#features">Learn More</a>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["No card required", "Free tier", "Encrypted by default"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="Glowing digital shield representing AI cybersecurity"
              width={960}
              height={540}
              fetchPriority="high"
              decoding="async"
              loading="eager"
              className="relative rounded-2xl border border-border shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-6 -mt-6">
        <div className="glass rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
          {stats.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <div className="text-3xl font-bold glow-text">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl font-bold">Everything you need to verify trust</h2>
          <p className="mt-4 text-muted-foreground">Six AI-powered scanners that work together to keep you safe online.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-primary/60 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/25">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-14">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="glass rounded-2xl p-8">
              <div className="text-5xl font-bold glow-text">{s.n}</div>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold">Stop guessing. Start verifying.</h2>
            <p className="mt-3 text-muted-foreground">Create a free account and run your first scan in seconds.</p>
            <Button asChild size="lg" className="btn-hero h-12 px-8 mt-8">
              <Link to="/auth">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="container mx-auto px-6 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <Shield className="h-6 w-6 text-primary" />
        TrustOS AI
      </Link>
      <nav className="hidden md:flex gap-8 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground">Features</a>
        <a href="#features" className="hover:text-foreground">How it works</a>
      </nav>
      <div className="flex gap-2">
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
        <Button asChild className="btn-hero"><Link to="/auth">Get started</Link></Button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 mt-8">
      <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> TrustOS AI © {new Date().getFullYear()}
        </div>
        <div>Verify Before You Trust.</div>
      </div>
    </footer>
  );
}
