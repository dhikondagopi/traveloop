import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, Sparkles, Edit3, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticJourneyMap } from "@/components/trip/StaticJourneyMap";

export const Route = createFileRoute("/_authenticated/trips/$tripId/timeline")({
  head: () => ({ meta: [{ title: "Day-by-day — Traveloop" }] }),
  component: Timeline,
});

function fmtDate(d: string) {
  if (d === "Unscheduled") return "Unscheduled / Anytime";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${year}-${month}-${day}`);
  }
  return out;
}

function Timeline() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/timeline" });
  const nav = useNavigate();

  const q = useQuery({
    queryKey: ["timeline", tripId],
    queryFn: async () => {
      const [{ data: trip }, { data: stops }] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase.from("stops").select("*").eq("trip_id", tripId).order("stop_order"),
      ]);
      const stopIds = (stops ?? []).map((s: { id: string }) => s.id);
      const { data: acts } = stopIds.length
        ? await supabase.from("activities").select("*").in("stop_id", stopIds).order("start_time")
        : { data: [] as any[] };
      return { trip, stops: stops ?? [], acts: acts ?? [] };
    },
  });

  if (q.isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-up pb-20">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-3/4 max-w-lg mx-auto rounded-xl" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-48 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }
  if (!q.data?.trip) return <div className="text-center py-20">Trip not found</div>;
  const { trip, stops, acts } = q.data;

  // Build day buckets
  type Day = { date: string; isUnscheduled?: boolean; stops: { stop: any; acts: any[] }[] };
  const dayMap = new Map<string, Day>();
  const ensure = (d: string, isUnscheduled = false) => {
    if (!dayMap.has(d)) dayMap.set(d, { date: d, isUnscheduled, stops: [] });
    return dayMap.get(d)!;
  };

  // Seed days from trip range if available
  if (trip.start_date && trip.end_date) {
    eachDay(trip.start_date, trip.end_date).forEach(d => ensure(d));
  }

  for (const s of stops) {
    if (!s.start_date) {
      const day = ensure("Unscheduled", true);
      let bucket = day.stops.find((x) => x.stop.id === s.id);
      if (!bucket) {
        bucket = { stop: s, acts: [] };
        day.stops.push(bucket);
      }
      continue;
    }
    const end = s.end_date || s.start_date;
    const days = eachDay(s.start_date, end);
    for (const d of days) {
      const day = ensure(d);
      let bucket = day.stops.find((x) => x.stop.id === s.id);
      if (!bucket) {
        bucket = { stop: s, acts: [] };
        day.stops.push(bucket);
      }
    }
  }

  // Place activities into the stop's first day (best-effort, since activities lack a date column)
  for (const a of acts) {
    const stop = stops.find((s: any) => s.id === a.stop_id);
    if (!stop) continue;
    const dateKey = stop.start_date ? stop.start_date : "Unscheduled";
    const day = dayMap.get(dateKey);
    if (!day) continue;
    const bucket = day.stops.find((x) => x.stop.id === stop.id);
    if (bucket) bucket.acts.push(a);
  }

  const unscheduledDay = dayMap.get("Unscheduled");
  if (unscheduledDay) {
    dayMap.delete("Unscheduled");
  }

  const days = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (unscheduledDay) {
    days.push(unscheduledDay);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="group flex items-center gap-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 bg-gradient-hero hover:opacity-90 px-5 py-2.5 rounded-full shadow-md w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Trip
        </button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
          <ListChecks className="w-3 h-3" /> Read-Only Schedule
        </div>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-none">{trip.name}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-500">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {stops.length} Cities</span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> {acts.length} Activities</span>
          {trip.start_date && (
            <span className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              <Calendar className="w-4 h-4" /> {fmtDate(trip.start_date)} — {fmtDate(trip.end_date)}
            </span>
          )}
        </div>
      </div>

      {days.length === 0 ? (
        <div className="rounded-3xl glass p-8 sm:p-12 text-center shadow-card">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-ocean flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold">No stops yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Add stops and activities to see your day-by-day plan.</p>
          <Link to="/trips/$tripId/itinerary" params={{ tripId }} className="inline-block mt-4">
            <Button className="bg-gradient-hero">Build itinerary</Button>
          </Link>
        </div>
      ) : (
        <StaticJourneyMap days={days} />
      )}
    </div>
  );
}


