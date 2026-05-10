import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/Loading";
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, Sparkles, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/trips/$tripId/timeline")({
  head: () => ({ meta: [{ title: "Day-by-day — Traveloop" }] }),
  component: Timeline,
});

function fmtDate(d: string) {
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

  if (q.isLoading) return <Loading />;
  if (!q.data?.trip) return <div className="text-center py-20">Trip not found</div>;
  const { trip, stops, acts } = q.data;

  // Build day buckets
  type Day = { date: string; stops: { stop: any; acts: any[] }[] };
  const dayMap = new Map<string, Day>();
  const ensure = (d: string) => {
    if (!dayMap.has(d)) dayMap.set(d, { date: d, stops: [] });
    return dayMap.get(d)!;
  };

  // Seed days from trip range if available
  if (trip.start_date && trip.end_date) {
    eachDay(trip.start_date, trip.end_date).forEach(ensure);
  }

  for (const s of stops) {
    if (!s.start_date) continue;
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
    if (!stop || !stop.start_date) continue;
    const day = dayMap.get(stop.start_date);
    if (!day) continue;
    const bucket = day.stops.find((x) => x.stop.id === stop.id);
    if (bucket) bucket.acts.push(a);
  }

  const days = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
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
          <h3 className="text-lg font-semibold">No dated stops yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Add trip dates and dated stops to see a day-by-day plan.</p>
          <Link to="/trips/$tripId/itinerary" params={{ tripId }} className="inline-block mt-4">
            <Button className="bg-gradient-hero">Build itinerary</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {days.map((day, idx) => (
            <section key={day.date} className="rounded-2xl sm:rounded-3xl glass shadow-card overflow-hidden">
              <header className="bg-gradient-hero text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider opacity-80">Day {idx + 1}</p>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">{fmtDate(day.date)}</h2>
                </div>
                <span className="text-xs sm:text-sm opacity-90 shrink-0">
                  {day.stops.length} {day.stops.length === 1 ? "stop" : "stops"}
                </span>
              </header>

              <div className="p-4 sm:p-6 space-y-4">
                {day.stops.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Free day — nothing planned.</p>
                ) : (
                  day.stops.map(({ stop, acts }) => (
                    <div key={stop.id} className="rounded-xl sm:rounded-2xl bg-secondary/40 p-3 sm:p-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-ocean flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {stop.city}{stop.country && <span className="text-muted-foreground font-normal">, {stop.country}</span>}
                          </h3>
                          {stop.notes && <p className="text-xs text-muted-foreground line-clamp-1">{stop.notes}</p>}
                        </div>
                      </div>

                      {acts.length > 0 && (
                        <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                          {acts.map((a) => (
                            <li key={a.id} className="flex items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-background/70 p-2.5 sm:p-3">
                              {a.image_url && (
                                <img src={a.image_url} alt="" className="w-12 h-12 sm:w-14 sm:h-14 rounded-md sm:rounded-lg object-cover shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm sm:text-base break-words">{a.title}</p>
                                {a.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.description}</p>}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] sm:text-xs text-muted-foreground font-medium">
                                  {a.start_time && <span className="inline-flex items-center gap-1 text-primary"><Clock className="w-3.5 h-3.5" />{a.start_time}</span>}
                                  {a.duration && <span>{a.duration}</span>}
                                  {a.category && <span className="opacity-70">{a.category}</span>}
                                  {a.cost > 0 && <span className="text-emerald-600 font-bold">${a.cost}</span>}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
