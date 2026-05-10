import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Compass, Map, Wallet, ListChecks, Share2, Sparkles, Globe2, Calendar, ArrowRight,
  Plane, Star, Check, MapPin, Camera, Coffee, Mountain, Waves, Building2, ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traveloop — Plan smarter. Travel better." },
      { name: "description", content: "The most beautiful way to plan multi-city trips. Itineraries, budgets, packing checklists, and shareable trip pages — all in one place." },
      { property: "og:title", content: "Traveloop — Plan smarter. Travel better." },
      { property: "og:description", content: "Design unforgettable multi-city itineraries with budgets, packing lists, and shareable trip pages." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Header />
      <Hero />
      <Marquee />
      <Stats />
      <Bento />
      <ItineraryShowcase />
      <Destinations />
      <Steps />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ───────────────────────── Header ───────────────────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f(); window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className={`container mx-auto px-4`}>
        <div className={`flex items-center justify-between rounded-2xl px-4 md:px-6 h-14 transition-all ${scrolled ? "glass shadow-card" : "bg-transparent"}`}>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${scrolled ? "bg-gradient-hero shadow-glow" : "bg-white/20 backdrop-blur"}`}>
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className={scrolled ? "text-gradient" : "text-white"}>Traveloop</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { l: "Features", h: "#features" },
              { l: "Destinations", h: "#destinations" },
              { l: "How it works", h: "#steps" },
              { l: "Reviews", h: "#reviews" },
            ].map((n) => (
              <a key={n.h} href={n.h} className={`px-3 py-1.5 text-sm rounded-lg transition ${scrolled ? "text-foreground/70 hover:text-foreground hover:bg-accent" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                {n.l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className={scrolled ? "" : "text-white hover:bg-white/10 hover:text-white"}>Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className={scrolled ? "bg-gradient-hero shadow-glow" : "bg-white text-primary hover:bg-white/90"}>
                Get started <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Aurora orbs */}
      <div className="absolute -top-32 -left-20 w-[40rem] h-[40rem] rounded-full bg-amber/40 blur-3xl animate-aurora" />
      <div className="absolute top-40 -right-32 w-[36rem] h-[36rem] rounded-full bg-teal/40 blur-3xl animate-aurora" style={{ animationDelay: "4s" }} />
      <div className="absolute -bottom-32 left-1/3 w-[32rem] h-[32rem] rounded-full bg-emerald/30 blur-3xl animate-aurora" style={{ animationDelay: "8s" }} />
      {/* Grid + noise */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-noise opacity-50 mix-blend-overlay" />

      <div className="container mx-auto px-6 relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="animate-fade-up text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-white text-xs mb-6 border border-white/20">
              <span className="relative flex w-2 h-2"><span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-amber" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber" /></span>
              Trusted by 12,000+ adventurers worldwide
            </div>
            <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              Plan trips like a <span className="text-shimmer italic font-serif">storyteller</span>,<br />
              not a spreadsheet.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-xl">
              Traveloop turns your next adventure into a beautifully designed itinerary —
              with smart budgets, packing checklists, and shareable trip pages your friends will actually open.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-7 text-base shadow-glow group">
                  Start free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-14 px-7 text-base border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur">
                  See how it works
                </Button>
              </a>
            </div>
            <div className="mt-10 flex items-center gap-5 text-white/75 text-sm">
              <div className="flex -space-x-2">
                {["a", "b", "c", "d"].map((i, idx) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white/20">
                    <img src={`https://i.pravatar.cc/64?img=${idx + 12}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 text-amber">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber" />)}
                </div>
                <span className="text-xs">4.9/5 · loved by travelers in 87 countries</span>
              </div>
            </div>
          </div>

          {/* Visual: stacked tilted cards */}
          <HeroVisual />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative perspective-1000 hidden lg:block">
      {/* Compass ring */}
      <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full border border-white/15 animate-spin-slow opacity-60" />
      <div className="absolute -top-4 -right-4 w-60 h-60 rounded-full border border-dashed border-white/20 animate-spin-slow opacity-50" style={{ animationDirection: "reverse" }} />

      {/* Flight path SVG */}
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full text-white/40" fill="none">
        <path d="M 30 250 Q 200 50 380 200" stroke="currentColor" strokeWidth="1.5" className="animate-dash" />
        <circle cx="30" cy="250" r="4" className="fill-amber" />
        <circle cx="380" cy="200" r="4" className="fill-amber" />
      </svg>

      {/* Ticket / itinerary card */}
      <div className="relative preserve-3d" style={{ transform: "rotateY(-12deg) rotateX(8deg)" }}>
        <div className="glass rounded-3xl shadow-glow p-5 w-[26rem] max-w-full text-foreground border border-white/40 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center"><Plane className="w-4 h-4 text-white" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Trip · Live preview</p>
                <p className="font-semibold text-sm">Mediterranean Loop</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald/20 text-emerald font-medium">On track</span>
          </div>

          {/* Stops */}
          <div className="space-y-2 mb-4">
            {[
              { c: "Rome", d: "Apr 12", icon: Building2, gr: "bg-gradient-sunset" },
              { c: "Florence", d: "Apr 16", icon: Camera, gr: "bg-gradient-ocean" },
              { c: "Amalfi Coast", d: "Apr 20", icon: Waves, gr: "bg-gradient-forest" },
            ].map((s) => (
              <div key={s.c} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 border border-border/50">
                <div className={`w-9 h-9 rounded-lg ${s.gr} flex items-center justify-center`}><s.icon className="w-4 h-4 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.c}</p>
                  <p className="text-[11px] text-muted-foreground">{s.d} · 4 nights</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>

          {/* Budget */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[{ l: "Spent", v: "$1,840", c: "text-primary" }, { l: "Remaining", v: "$660", c: "text-emerald" }, { l: "Per day", v: "$184", c: "" }].map((b) => (
              <div key={b.l} className="rounded-xl bg-secondary/60 p-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.l}</p>
                <p className={`text-sm font-bold ${b.c}`}>{b.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating mini cards */}
        <div className="absolute -left-8 top-32 glass rounded-2xl p-3 shadow-card w-44 border border-white/40 animate-float" style={{ animationDelay: "1s" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-sunset flex items-center justify-center"><Coffee className="w-4 h-4 text-white" /></div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Activity added</p>
              <p className="text-xs font-semibold">Espresso tour</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-4 glass rounded-2xl p-3 shadow-card w-48 border border-white/40 animate-float">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-forest flex items-center justify-center"><ListChecks className="w-4 h-4 text-white" /></div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Packing</p>
              <div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full w-3/4 bg-gradient-hero" /></div><span className="text-[10px] font-bold">75%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Marquee ───────────────────────── */
function Marquee() {
  const cities = [
    "✦ Tokyo", "✦ Paris", "✦ Reykjavik", "✦ Marrakech", "✦ Bali", "✦ Cape Town",
    "✦ Buenos Aires", "✦ Kyoto", "✦ Lisbon", "✦ Cairo", "✦ Hanoi", "✦ Oslo", "✦ Cusco",
  ];
  return (
    <section className="relative py-8 border-y border-border bg-background overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...cities, ...cities].map((c, i) => (
          <span key={i} className="mx-8 text-2xl md:text-3xl font-bold text-muted-foreground/40 tracking-tight">{c}</span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Stats ───────────────────────── */
function Stats() {
  const stats = [
    { n: "12k+", l: "Travelers planning" },
    { n: "87", l: "Countries covered" },
    { n: "240k", l: "Stops mapped" },
    { n: "4.9★", l: "Avg user rating" },
  ];
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-gradient">{s.n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Bento Features ───────────────────────── */
function Bento() {
  return (
    <section id="features" className="py-24 bg-secondary/40 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Everything in one workspace</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Designed for the way <span className="text-gradient italic font-serif">you actually travel</span></h2>
          <p className="mt-4 text-muted-foreground text-lg">From dream to departure — every detail in one elegant space.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[14rem]">
          {/* Big tile */}
          <div className="md:col-span-2 md:row-span-2 group relative rounded-3xl overflow-hidden bg-gradient-hero p-8 text-white shadow-card hover:shadow-glow transition-all">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-amber/30 blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-5"><Map className="w-6 h-6" /></div>
              <h3 className="text-3xl font-bold mb-2">Multi-city itineraries that flow</h3>
              <p className="text-white/85 max-w-md">Drag stops, autosync dates, and visualise your whole journey on a beautiful timeline. Every detail looks great whether you're planning Paris or Patagonia.</p>
              {/* mini timeline */}
              <div className="mt-7 flex items-center gap-2">
                {["Rome", "Florence", "Venice", "Milan"].map((c, i) => (
                  <div key={c} className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-medium">{c}</div>
                    {i < 3 && <div className="w-6 h-px bg-white/40" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card hover:-translate-y-1 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-sunset flex items-center justify-center mb-4"><Wallet className="w-5 h-5 text-white" /></div>
            <h3 className="font-bold text-lg">Smart budgets</h3>
            <p className="text-sm text-muted-foreground mt-1">Track expenses by category with live charts and alerts.</p>
            <div className="mt-3 flex gap-1 items-end h-10">
              {[60, 90, 35, 75, 50, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-sunset" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card hover:-translate-y-1 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-forest flex items-center justify-center mb-4"><ListChecks className="w-5 h-5 text-white" /></div>
            <h3 className="font-bold text-lg">Packing checklists</h3>
            <p className="text-sm text-muted-foreground mt-1">Auto-grouped by category, with a satisfying progress bar.</p>
            <div className="mt-3 space-y-1.5">
              {["Passport", "Adapter", "Sunscreen"].map((t, i) => (
                <div key={t} className="flex items-center gap-2 text-xs"><div className={`w-4 h-4 rounded border flex items-center justify-center ${i < 2 ? "bg-emerald border-emerald" : "border-border"}`}>{i < 2 && <Check className="w-2.5 h-2.5 text-white" />}</div>{t}</div>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="rounded-3xl bg-gradient-ocean p-6 text-white shadow-card hover:-translate-y-1 transition">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-4"><Share2 className="w-5 h-5" /></div>
            <h3 className="font-bold text-lg">Public trip pages</h3>
            <p className="text-sm text-white/85 mt-1">One link. Stunning layout. Friends actually open it.</p>
            <div className="mt-3 px-3 py-2 rounded-lg bg-white/15 backdrop-blur border border-white/20 text-[11px] font-mono truncate">traveloop.app/share/italy-loop</div>
          </div>

          {/* Notes */}
          <div className="rounded-3xl bg-card border border-border p-6 shadow-card hover:-translate-y-1 transition">
            <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center mb-4"><Sparkles className="w-5 h-5 text-white" /></div>
            <h3 className="font-bold text-lg">Trip journal</h3>
            <p className="text-sm text-muted-foreground mt-1">Pin notes, ideas and memories to specific stops.</p>
          </div>

          {/* Discovery — wide */}
          <div className="md:col-span-2 rounded-3xl bg-card border border-border p-6 shadow-card hover:-translate-y-1 transition flex items-center gap-6">
            <div className="flex-1">
              <div className="w-11 h-11 rounded-xl bg-gradient-forest flex items-center justify-center mb-4"><Globe2 className="w-5 h-5 text-white" /></div>
              <h3 className="font-bold text-lg">Discover destinations & activities</h3>
              <p className="text-sm text-muted-foreground mt-1">Browse curated cities and add experiences to your trip in one click.</p>
            </div>
            <div className="hidden sm:grid grid-cols-2 gap-2 w-44">
              {[
                { i: Building2, g: "bg-gradient-ocean" },
                { i: Mountain, g: "bg-gradient-forest" },
                { i: Waves, g: "bg-gradient-hero" },
                { i: Camera, g: "bg-gradient-sunset" },
              ].map((t, i) => (
                <div key={i} className={`aspect-square rounded-xl ${t.g} flex items-center justify-center`}><t.i className="w-5 h-5 text-white" /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Itinerary Showcase ───────────────────────── */
function ItineraryShowcase() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { l: "Itinerary", icon: Map },
    { l: "Budget", icon: Wallet },
    { l: "Checklist", icon: ListChecks },
    { l: "Share", icon: Share2 },
  ];
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full bg-gradient-hero opacity-[0.04] blur-3xl pointer-events-none" />
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Take a peek</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Switch between <span className="text-gradient italic font-serif">every view</span></h2>
        </div>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {tabs.map((t, i) => (
            <button key={t.l} onClick={() => setTab(i)} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${tab === i ? "bg-gradient-hero text-white shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.l}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl glass shadow-card p-6 md:p-8 border border-border">
          {tab === 0 && <PreviewItinerary />}
          {tab === 1 && <PreviewBudget />}
          {tab === 2 && <PreviewChecklist />}
          {tab === 3 && <PreviewShare />}
        </div>
      </div>
    </section>
  );
}

function PreviewItinerary() {
  const stops = [
    { c: "Rome", d: "Apr 12 → 16", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600", n: 2 },
    { c: "Florence", d: "Apr 16 → 20", img: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600", n: 3 },
    { c: "Amalfi Coast", d: "Apr 20 → 24", img: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600", n: 4 },
  ];
  return (
    <div className="space-y-3">
      {stops.map((s, i) => (
        <div key={s.c} className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border">
          <div className="relative">
            <img src={s.img} alt={s.c} className="w-16 h-16 rounded-xl object-cover" />
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-hero text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" />{s.c}</p>
            <p className="text-xs text-muted-foreground">{s.d}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Activities</p>
            <p className="font-bold">{s.n}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewBudget() {
  const cats = [
    { l: "Stay", v: 820, c: "bg-gradient-ocean" },
    { l: "Food", v: 410, c: "bg-gradient-sunset" },
    { l: "Transport", v: 360, c: "bg-gradient-hero" },
    { l: "Activities", v: 250, c: "bg-gradient-forest" },
  ];
  const total = cats.reduce((s, c) => s + c.v, 0);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Total spent</p><p className="text-3xl font-bold text-gradient">${total}</p></div>
        <div className="text-right"><p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p><p className="text-xl font-semibold">$2,500</p></div>
      </div>
      <div className="space-y-3">
        {cats.map((c) => (
          <div key={c.l}>
            <div className="flex justify-between text-sm mb-1"><span>{c.l}</span><span className="font-semibold">${c.v}</span></div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className={`h-full ${c.c}`} style={{ width: `${(c.v / total) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewChecklist() {
  const items = [
    { c: "Documents", t: "Passport", d: true },
    { c: "Documents", t: "Travel insurance", d: true },
    { c: "Tech", t: "Universal adapter", d: true },
    { c: "Tech", t: "Camera + SD cards", d: false },
    { c: "Clothing", t: "Light jacket", d: false },
    { c: "Clothing", t: "Walking shoes", d: false },
  ];
  const done = items.filter(i => i.d).length;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold">Italy trip · {done}/{items.length} packed</p>
        <div className="w-32 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-gradient-hero" style={{ width: `${(done / items.length) * 100}%` }} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((i, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${i.d ? "bg-emerald border-emerald" : "border-border"}`}>{i.d && <Check className="w-3 h-3 text-white" />}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${i.d ? "line-through text-muted-foreground" : ""}`}>{i.t}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.c}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewShare() {
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-hero text-white shadow-glow mb-6">
        <Share2 className="w-4 h-4" />
        <span className="font-mono text-sm">traveloop.app/share/italy-loop</span>
        <button className="text-xs px-2 py-1 rounded-md bg-white/20">Copy</button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 max-w-xl mx-auto">
        {[
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400",
          "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=400",
          "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=400",
        ].map((src) => (
          <div key={src} className="aspect-[4/5] rounded-2xl overflow-hidden shadow-card">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">A polished travel-blog page — generated automatically.</p>
    </div>
  );
}

/* ───────────────────────── Destinations ───────────────────────── */
function Destinations() {
  const list = [
    { name: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", tag: "Romantic" },
    { name: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", tag: "Vibrant" },
    { name: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", tag: "Tropical" },
    { name: "Reykjavik", country: "Iceland", img: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800", tag: "Adventure" },
    { name: "Marrakech", country: "Morocco", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800", tag: "Cultural" },
    { name: "Cape Town", country: "South Africa", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800", tag: "Wild" },
    { name: "Lisbon", country: "Portugal", img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800", tag: "Coastal" },
    { name: "Cusco", country: "Peru", img: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800", tag: "Ancient" },
  ];
  return (
    <section id="destinations" className="py-24 bg-secondary/40">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Trending now</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Get inspired</h2>
          </div>
          <Link to="/signup" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">Browse the full library <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((d, i) => (
            <div key={d.name} className="group relative h-72 rounded-3xl overflow-hidden shadow-card cursor-pointer animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/20 backdrop-blur text-white border border-white/30">{d.tag}</div>
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <p className="text-xs opacity-80 uppercase tracking-wider">{d.country}</p>
                <h3 className="text-2xl font-bold">{d.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Steps ───────────────────────── */
function Steps() {
  const steps = [
    { t: "Create your trip", d: "Name it, pick dates, set a budget, and choose a stunning cover.", icon: Plane },
    { t: "Build your itinerary", d: "Add cities, activities, and pin notes to each stop on the timeline.", icon: Map },
    { t: "Travel & share", d: "Pack with confidence using checklists, then share a beautiful trip page.", icon: Share2 },
  ];
  return (
    <section id="steps" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">From dream to departure in <span className="text-gradient italic font-serif">three steps</span></h2>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          {steps.map((s, i) => (
            <div key={s.t} className="relative text-center animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-3xl bg-gradient-hero opacity-20 blur-xl" />
                <div className="relative w-24 h-24 rounded-3xl bg-card border border-border shadow-card flex items-center justify-center">
                  <s.icon className="w-9 h-9 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-hero text-white text-sm font-bold flex items-center justify-center shadow-glow">{i + 1}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Testimonials ───────────────────────── */
function Testimonials() {
  const reviews = [
    { n: "Aria L.", r: "Solo traveler", q: "Finally, a planner that feels like the trip itself — beautiful and effortless. I shared my Japan loop and got 10 friends asking how I made it.", img: 32 },
    { n: "Marco P.", r: "Backpacker", q: "The budget view alone saved my Europe trip. I caught I was over by $400 before flying out.", img: 14 },
    { n: "Priya S.", r: "Family planner", q: "Packing checklists with categories are a lifesaver when wrangling three kids. Love the share link to send to grandparents.", img: 5 },
  ];
  return (
    <section id="reviews" className="py-24 bg-secondary/40">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Reviews</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Travelers <span className="text-gradient italic font-serif">love it</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.n} className="rounded-3xl bg-card border border-border p-6 shadow-card flex flex-col">
              <div className="flex gap-0.5 text-amber mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber" />)}</div>
              <p className="text-foreground/85 flex-1">"{r.q}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={`https://i.pravatar.cc/64?img=${r.img}`} alt={r.n} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm">{r.n}</p>
                  <p className="text-xs text-muted-foreground">{r.r}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */
function FinalCTA() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[2.5rem] bg-gradient-hero p-10 md:p-20 text-center text-white shadow-glow overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber/30 blur-3xl animate-aurora" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-teal/30 blur-3xl animate-aurora" style={{ animationDelay: "5s" }} />
          <div className="relative">
            <Calendar className="w-10 h-10 mx-auto mb-5 opacity-80" />
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Your next chapter <span className="text-shimmer italic font-serif">awaits</span></h2>
            <p className="mt-5 text-white/85 text-lg max-w-xl mx-auto">Free to start. Beautiful by default. Build your first trip in under five minutes.</p>
            <div className="mt-9 flex flex-wrap gap-3 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 text-base">
                  Start planning free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur">Sign in</Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/70">No credit card · Free forever for personal trips</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow"><Compass className="w-5 h-5 text-white" /></div>
              <span className="text-gradient">Traveloop</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">Plan smarter. Travel better. The most beautiful way to organize multi-city trips.</p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Product</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#destinations" className="hover:text-foreground">Destinations</a></li>
              <li><a href="#steps" className="hover:text-foreground">How it works</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Get started</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/signup" className="hover:text-foreground">Create account</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Traveloop. Plan smarter. Travel better.</p>
          <p className="flex items-center gap-2">Made with <span className="text-destructive">♥</span> for travelers everywhere</p>
        </div>
      </div>
    </footer>
  );
}
