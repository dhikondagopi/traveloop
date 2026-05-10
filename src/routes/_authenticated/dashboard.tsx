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
      const { data, error } = await supabase
        .from("trips")
        .select("id, name, start_date, end_date, cover_image, planned_budget, stops(id), activities(id, category)")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
  });
  const citiesQ = useQuery({
    queryKey: ["cities-rec"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("*").order("popularity", { ascending: false }).limit(4);
      return data ?? [];
    },
  });

  // Remove blocking loading state
  const isLoading = tripsQ.isLoading && !tripsQ.data;
  const trips = tripsQ.data ?? [];
  const name = user?.user_metadata?.name || user?.email?.split("@")[0];

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = trips.filter((t: any) => !t.start_date || t.start_date >= today);

  const totalBudget = trips.reduce((s: number, t: any) => s + Number(t.planned_budget || 0), 0);
  const totalStops = trips.reduce((s: number, t: any) => s + (t.stops?.length ?? 0), 0);
  const totalActs = trips.reduce((s: number, t: any) => s + (t.activities?.length ?? 0), 0);

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
            <p className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider">Welcome back</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-1 md:mt-2 capitalize leading-tight">
              {name} 👋
            </h1>
            <p className="text-white/90 mt-3 md:mt-4 max-w-md text-sm md:text-base leading-relaxed">
              Where to next? Your perfect itinerary is just a few clicks away.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Link to="/trips/generate">
              <Button size="lg" className="bg-white text-primary hover:bg-slate-50 h-12 md:h-14 px-8 shadow-xl w-full sm:w-auto rounded-2xl font-bold">
                <Wand2 className="w-5 h-5 mr-2" /> AI Generate
              </Button>
            </Link>
            <Link to="/trips/new">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 h-12 md:h-14 px-8 w-full sm:w-auto rounded-2xl font-bold backdrop-blur-sm">
                <Plus className="w-5 h-5 mr-2" /> New Trip
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

      {/* Upcoming Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Upcoming Trips</h2>
          <Link to="/trips" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-3xl glass p-10 text-center shadow-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-sunset flex items-center justify-center"><Calendar className="w-8 h-8 text-white" /></div>
            <h3 className="text-lg font-semibold">No upcoming trips</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-5">Create your next big adventure today.</p>
            <Link to="/trips/new"><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Plan New Trip</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.slice(0, 3).map((t: any) => {
              const categories = t.activities?.map((a: any) => a.category).filter(Boolean) || [];
              const uniqueCategories = Array.from(new Set(categories)).slice(0, 3);

              return (
                <Link key={t.id} to="/trips/$tripId" params={{ tripId: t.id }} className="group rounded-3xl overflow-hidden glass shadow-card hover:shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1 border border-white">
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    {t.cover_image ? (
                      <img src={t.cover_image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-ocean opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white/90 text-xs font-semibold mb-1">{t.start_date} → {t.end_date}</p>
                      <h3 className="text-white font-bold text-xl truncate">{t.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{t.stops?.length || 0} Cities</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-sm font-bold">${Number(t.planned_budget || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {uniqueCategories.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Trip Highlights</p>
                        <div className="flex flex-wrap gap-2">
                          {uniqueCategories.map((c: any) => (
                            <span key={c} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/trips/new", label: "New Trip", icon: Plus, bg: "bg-gradient-hero" },
            { to: "/cities", label: "Find Cities", icon: Globe2, bg: "bg-gradient-ocean" },
            { to: "/activities", label: "Activities", icon: Sparkles, bg: "bg-gradient-sunset" },
            { to: "/trips", label: "My Trips", icon: ListChecks, bg: "bg-gradient-forest" },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="glass rounded-2xl p-4 md:p-6 shadow-card hover:shadow-glow transition-all hover:-translate-y-1 flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${a.bg} flex items-center justify-center shrink-0 shadow-soft`}><a.icon className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
              <span className="font-bold text-sm md:text-base">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section className="pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Trip Suggestions</h2>
          <Link to="/cities" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">Explore More <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
