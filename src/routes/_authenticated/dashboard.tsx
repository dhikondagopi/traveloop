import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { Plus, Map, Wallet, Building2, Calendar, ArrowRight, Sparkles, Globe2, ListChecks, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Traveloop" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const tripsQ = useQuery({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*, stops(id)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const citiesQ = useQuery({
    queryKey: ["cities-rec"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("*").order("popularity", { ascending: false }).limit(4);
      return data ?? [];
    },
  });

  if (tripsQ.isLoading) return <Loading />;
  const trips = tripsQ.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = trips.filter((t: any) => t.start_date && t.start_date >= today);
  const totalBudget = trips.reduce((s: number, t: any) => s + Number(t.planned_budget || 0), 0);
  const totalStops = trips.reduce((s: number, t: any) => s + (t.stops?.length ?? 0), 0);
  const name = user?.user_metadata?.name || user?.email?.split("@")[0];

  const stats = [
    { label: "Total Trips", value: trips.length, icon: Map, bg: "bg-gradient-ocean" },
    { label: "Upcoming", value: upcoming.length, icon: Calendar, bg: "bg-gradient-sunset" },
    { label: "Planned Budget", value: `$${totalBudget.toLocaleString()}`, icon: Wallet, bg: "bg-gradient-forest" },
    { label: "Cities", value: totalStops, icon: Building2, bg: "bg-gradient-hero" },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Welcome */}
      <div className="rounded-3xl bg-gradient-hero p-8 md:p-10 text-white shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1 capitalize">{name} 👋</h1>
            <p className="text-white/80 mt-2 max-w-md">Where to next? Plan your perfect trip today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/trips/generate">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-6 shadow-soft w-full sm:w-auto">
                <Wand2 className="w-4 h-4 mr-1" /> AI Generate Plan
              </Button>
            </Link>
            <Link to="/trips/new">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 h-12 px-6 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" /> New Trip
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-5 shadow-card animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3 shadow-soft`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Trips</h2>
          <Link to="/trips" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {trips.length === 0 ? (
          <div className="rounded-3xl glass p-10 text-center shadow-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-ocean flex items-center justify-center"><Map className="w-8 h-8 text-white" /></div>
            <h3 className="text-lg font-semibold">No trips yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-5">Create your first trip to get started.</p>
            <Link to="/trips/new"><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Plan New Trip</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.slice(0, 3).map((t: any) => (
              <Link key={t.id} to="/trips/$tripId" params={{ tripId: t.id }} className="group rounded-2xl overflow-hidden glass shadow-card hover:shadow-glow transition-all hover:-translate-y-1">
                <div className="h-40 relative overflow-hidden bg-gradient-ocean">
                  {t.cover_image && <img src={t.cover_image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold truncate">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t.start_date} → {t.end_date}</p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-muted-foreground">{t.stops?.length || 0} stops</span>
                    <span className="font-semibold text-primary">${Number(t.planned_budget || 0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/trips/new", label: "New Trip", icon: Plus, bg: "bg-gradient-hero" },
            { to: "/cities", label: "Find Cities", icon: Globe2, bg: "bg-gradient-ocean" },
            { to: "/activities", label: "Activities", icon: Sparkles, bg: "bg-gradient-sunset" },
            { to: "/trips", label: "My Trips", icon: ListChecks, bg: "bg-gradient-forest" },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="glass rounded-2xl p-5 shadow-card hover:shadow-glow transition-all hover:-translate-y-1 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}><a.icon className="w-5 h-5 text-white" /></div>
              <span className="font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recommended Destinations</h2>
          <Link to="/cities" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">Explore <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(citiesQ.data ?? []).map((c: any) => (
            <div key={c.id} className="group relative h-48 rounded-2xl overflow-hidden shadow-card">
              <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                <p className="text-xs opacity-80">{c.country}</p>
                <h3 className="font-bold">{c.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
