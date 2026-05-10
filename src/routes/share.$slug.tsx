import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Compass, Calendar, MapPin, Wallet, Sparkles, Clock, DollarSign, Copy, Twitter, Facebook, Linkedin, Mail, Download, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/share/$slug")({
  head: () => ({ meta: [{ title: "Shared Trip — Traveloop" }] }),
  component: SharedTrip,
});

function SharedTrip() {
  const { slug } = useParams({ from: "/share/$slug" });
  const { user } = useAuth();
  const nav = useNavigate();
  const [copying, setCopying] = useState(false);

  const q = useQuery({
    queryKey: ["share-public", slug],
    queryFn: async () => {
      const { data: share } = await supabase.from("shared_trips").select("*").eq("slug", slug).eq("is_public", true).maybeSingle();
      if (!share) return null;
      const [trip, stops, budget, notes, checklist] = await Promise.all([
        supabase.from("trips").select("*").eq("id", share.trip_id).single(),
        supabase.from("stops").select("*").eq("trip_id", share.trip_id).order("stop_order"),
        supabase.from("budget_items").select("*").eq("trip_id", share.trip_id),
        supabase.from("notes").select("title, content, created_at").eq("trip_id", share.trip_id).order("created_at", { ascending: false }),
        supabase.from("checklist_items").select("title, category").eq("trip_id", share.trip_id),
      ]);
      const stopIds = (stops.data ?? []).map((s: { id: string }) => s.id);
      const acts = stopIds.length
        ? (await supabase.from("activities").select("*").in("stop_id", stopIds).order("created_at")).data ?? []
        : [];
      return { trip: trip.data, stops: stops.data ?? [], acts, budget: budget.data ?? [], notes: notes.data ?? [], checklist: checklist.data ?? [] };
    },
  });

  const copyTrip = useMutation({
    mutationFn: async () => {
      if (!user || !q.data?.trip) throw new Error("Login required");
      setCopying(true);
      const src = q.data;
      const srcTrip = src.trip!;
      const { data: newTrip, error: tripErr } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          name: `${srcTrip.name} (copy)`,
          description: srcTrip.description,
          cover_image: srcTrip.cover_image,
          start_date: srcTrip.start_date,
          end_date: srcTrip.end_date,
          planned_budget: srcTrip.planned_budget,
        })
        .select()
        .single();
      if (tripErr || !newTrip) throw tripErr || new Error("Failed");

      const stopIdMap = new Map<string, string>();
      for (const s of src.stops) {
        const { data: ns, error: stopErr } = await supabase
          .from("stops")
          .insert({
            trip_id: newTrip.id,
            city: s.city,
            country: s.country,
            start_date: s.start_date,
            end_date: s.end_date,
            stop_order: s.stop_order,
            notes: s.notes,
          })
          .select()
          .single();
        if (stopErr || !ns) throw stopErr || new Error("Failed");
        stopIdMap.set(s.id, ns.id);
      }
      if (src.acts.length) {
        await supabase.from("activities").insert(
          src.acts.map((a: any) => ({
            stop_id: stopIdMap.get(a.stop_id)!,
            title: a.title,
            description: a.description,
            category: a.category,
            cost: a.cost,
            duration: a.duration,
            start_time: a.start_time,
            image_url: a.image_url,
          })),
        );
      }
      if (src.budget.length) {
        await supabase.from("budget_items").insert(
          src.budget.map((b: any) => ({ trip_id: newTrip.id, category: b.category, title: b.title, amount: b.amount, note: b.note })),
        );
      }
      if (src.checklist.length) {
        await supabase.from("checklist_items").insert(
          src.checklist.map((c: any) => ({ trip_id: newTrip.id, title: c.title, category: c.category, is_packed: false })),
        );
      }
      if (src.notes.length) {
        await supabase.from("notes").insert(
          src.notes.map((n: any) => ({ trip_id: newTrip.id, title: n.title, content: n.content })),
        );
      }
      return newTrip.id;
    },
    onSuccess: (id) => {
      setCopying(false);
      toast.success("Trip copied to your account!");
      nav({ to: "/trips/$tripId", params: { tripId: id } });
    },
    onError: (e: any) => {
      setCopying(false);
      toast.error(e?.message ?? "Failed to copy");
    },
  });

  if (q.isLoading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
  if (!q.data?.trip) return <div className="min-h-screen flex items-center justify-center text-center"><div><h1 className="text-2xl font-bold">Trip not found</h1><p className="text-muted-foreground mt-2">This link may be private or invalid.</p></div></div>;

  const { trip, stops, acts, budget, notes } = q.data;
  const spent = budget.reduce((s: number, b: any) => s + Number(b.amount), 0);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this trip: ${trip.name}`;

  const socialLinks = [
    { icon: Twitter, label: "Twitter", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: Facebook, label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { icon: Linkedin, label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { icon: Mail, label: "Email", url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}` },
  ];

  const handleCopyClick = () => {
    if (!user) {
      toast.info("Please log in to copy this trip");
      nav({ to: "/login" });
      return;
    }
    copyTrip.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 inset-x-0 z-20 px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center"><Compass className="w-4 h-4" /></div>
          Traveloop
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" className="glass text-white border-white/20" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}>
            <Copy className="w-3 h-3 mr-1" /> Copy link
          </Button>
          <Button size="sm" className="bg-white text-foreground hover:bg-white/90" onClick={handleCopyClick} disabled={copying}>
            <Download className="w-3 h-3 mr-1" /> {copying ? "Copying…" : "Copy this trip"}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        {trip.cover_image && <img src={trip.cover_image} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="relative container mx-auto px-6 pb-16 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm mb-5">
            <Calendar className="w-4 h-4" /> {trip.start_date} → {trip.end_date}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">{trip.name}</h1>
          {trip.description && <p className="mt-5 text-lg text-white/85 max-w-2xl">{trip.description}</p>}
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {stops.length} stops</span>
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> {acts.length} activities</span>
            {spent > 0 && <span className="flex items-center gap-2"><Wallet className="w-4 h-4" /> ${spent.toLocaleString()} budget</span>}
          </div>
        </div>
      </section>

      {/* Social share + CTA bar */}
      <section className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="rounded-2xl glass shadow-card p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Love this trip?</p>
            <p className="text-sm text-muted-foreground">Share it or copy it to plan your own adventure.</p>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${s.label}`}
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-white transition">
                <s.icon className="w-4 h-4" />
              </a>
            ))}
            <Button className="bg-gradient-hero shadow-glow ml-2" onClick={handleCopyClick} disabled={copying}>
              <Download className="w-4 h-4 mr-1" /> {copying ? "Copying…" : "Copy this trip"}
            </Button>
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">The Journey</h2>
        {stops.length === 0 ? (
          <p className="text-muted-foreground">No stops yet.</p>
        ) : (
          <div className="relative pl-8 space-y-12 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-teal">
            {stops.map((s: any, idx: number) => (
              <div key={s.id} className="relative">
                <div className="absolute -left-8 top-1 w-5 h-5 rounded-full bg-gradient-hero ring-4 ring-background shadow-glow" />
                <div className="rounded-3xl glass shadow-card overflow-hidden">
                  <div className="p-8">
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">Day {idx + 1}</p>
                    <h3 className="text-3xl font-bold mt-1">{s.city}{s.country && <span className="text-muted-foreground font-normal text-2xl">, {s.country}</span>}</h3>
                    {(s.start_date || s.end_date) && <p className="text-sm text-muted-foreground mt-1">{s.start_date} → {s.end_date}</p>}
                    {s.notes && <p className="mt-4 italic text-muted-foreground">"{s.notes}"</p>}
                  </div>
                  {acts.filter((a: any) => a.stop_id === s.id).length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4 p-8 pt-0">
                      {acts.filter((a: any) => a.stop_id === s.id).map((a: any) => (
                        <div key={a.id} className="rounded-2xl overflow-hidden bg-secondary/40">
                          {a.image_url && <img src={a.image_url} alt="" className="w-full h-32 object-cover" />}
                          <div className="p-4">
                            <p className="font-semibold">{a.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.description}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                              {a.category && <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{a.category}</span>}
                              {a.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.duration}</span>}
                              {a.cost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{a.cost}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Budget summary */}
      {budget.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">Budget Snapshot</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              budget.reduce((acc: Record<string, number>, b: any) => {
                acc[b.category] = (acc[b.category] || 0) + Number(b.amount);
                return acc;
              }, {} as Record<string, number>),
            ).map(([cat, amt]) => (
              <div key={cat} className="glass rounded-2xl p-5 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{cat}</p>
                <p className="text-2xl font-bold mt-1">${(amt as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><NotebookPen className="w-7 h-7 text-primary" /> Travel Journal</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {notes.map((n: any, i: number) => (
              <div key={i} className="glass rounded-2xl p-6 shadow-card">
                <h3 className="font-semibold">{n.title}</h3>
                {n.content && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{n.content}</p>}
                <p className="text-xs text-muted-foreground mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="py-12 text-center border-t mt-12">
        <p className="text-muted-foreground text-sm">Plan your own adventure with</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-2 text-gradient font-bold text-xl">
          <Compass className="w-5 h-5 text-primary" /> Traveloop
        </Link>
      </footer>
    </div>
  );
}
