import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { TripReadiness } from "@/components/TripReadiness";
import { Calendar, MapPin, Wallet, Sparkles, ListChecks, NotebookPen, Share2, Edit3, ArrowLeft, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trips/$tripId/")({
  head: () => ({ meta: [{ title: "Trip — Traveloop" }] }),
  component: TripOverview,
});

function TripOverview() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/" });
  const nav = useNavigate();

  const q = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const [trip, stops, activities, budget, checklist, notes, share] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase.from("stops").select("*").eq("trip_id", tripId),
        supabase.from("activities").select("id, stop_id, cost").in("stop_id", (await supabase.from("stops").select("id").eq("trip_id", tripId)).data?.map((s: { id: string }) => s.id) ?? []),
        supabase.from("budget_items").select("amount").eq("trip_id", tripId),
        supabase.from("checklist_items").select("is_packed").eq("trip_id", tripId),
        supabase.from("notes").select("id").eq("trip_id", tripId),
        supabase.from("shared_trips").select("*").eq("trip_id", tripId).maybeSingle(),
      ]);
      return {
        trip: trip.data, stops: stops.data ?? [], activities: activities.data ?? [],
        budget: budget.data ?? [], checklist: checklist.data ?? [], notes: notes.data ?? [],
        share: share.data,
      };
    },
  });

  if (q.isLoading) return <Loading />;
  if (!q.data?.trip) return <div className="text-center py-20">Trip not found</div>;
  const { trip, stops, activities, budget, checklist, notes, share } = q.data;
  const spent = budget.reduce((s: number, b: any) => s + Number(b.amount), 0);
  const packed = checklist.filter((c: any) => c.is_packed).length;
  const checkProgress = checklist.length ? Math.round((packed / checklist.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <button onClick={() => nav({ to: "/trips" })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to trips</button>

      {/* Hero */}
      <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-card">
        {trip.cover_image && <img src={trip.cover_image} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-8 text-white">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
            <Calendar className="w-4 h-4" />{trip.start_date} → {trip.end_date}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{trip.name}</h1>
          {trip.description && <p className="mt-3 max-w-2xl opacity-90">{trip.description}</p>}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Link to="/trips/$tripId/edit" params={{ tripId }}>
            <Button size="sm" className="bg-gradient-hero text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:shadow-[0_0_30px_rgba(37,99,235,0.9)] hover:scale-105 transition-all font-bold px-5 h-10 rounded-full border-2 border-white/20">
              <Edit3 className="w-4 h-4 mr-1.5 text-white" /> Edit Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Stops", value: stops.length, icon: MapPin },
          { label: "Activities", value: activities.length, icon: Sparkles },
          { label: "Budget", value: `$${spent.toLocaleString()} / $${Number(trip.planned_budget || 0).toLocaleString()}`, icon: Wallet },
          { label: "Packed", value: `${checkProgress}%`, icon: ListChecks },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 shadow-card">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <TripReadiness
        hasDates={!!(trip.start_date && trip.end_date)}
        hasStops={stops.length > 0}
        hasActivities={activities.length > 0}
        hasBudget={budget.length > 0}
        hasChecklist={checklist.length > 0}
        hasNotes={notes.length > 0}
        hasShareLink={!!share?.is_public}
      />

      {/* Sections */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: "/trips/$tripId/itinerary", label: "Itinerary", desc: `${stops.length} stops · ${activities.length} activities`, icon: MapPin, bg: "bg-gradient-ocean" },
          { to: "/trips/$tripId/timeline", label: "Day-by-day View", desc: "Read-only schedule grouped by date", icon: CalendarDays, bg: "bg-gradient-hero" },
          { to: "/trips/$tripId/budget", label: "Budget", desc: `$${spent.toLocaleString()} tracked`, icon: Wallet, bg: "bg-gradient-sunset" },
          { to: "/trips/$tripId/checklist", label: "Packing Checklist", desc: `${packed}/${checklist.length} packed`, icon: ListChecks, bg: "bg-gradient-forest" },
          { to: "/trips/$tripId/notes", label: "Notes", desc: `${notes.length} notes`, icon: NotebookPen, bg: "bg-gradient-hero" },
          { to: "/trips/$tripId/share", label: share?.is_public ? "Public Link Active" : "Share Trip", desc: share?.is_public ? "Anyone with the link can view" : "Generate a public link", icon: Share2, bg: "bg-gradient-ocean" },
        ].map((s) => (
          <Link key={s.label} to={s.to} params={{ tripId }} className="glass rounded-2xl p-6 shadow-card hover:shadow-glow transition-all hover:-translate-y-1">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3 shadow-soft`}><s.icon className="w-5 h-5 text-white" /></div>
            <h3 className="font-semibold">{s.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
