import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { Search, Plus, Clock, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({ meta: [{ title: "Discover Activities — Traveloop" }] }),
  component: ActivitiesPage,
});

const CATS = ["All", "Sightseeing", "Food", "Culture", "Outdoors", "Entertainment", "Wellness"];

function ActivitiesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [maxCost, setMaxCost] = useState(500);

  const acts = useQuery({
    queryKey: ["act-templates"],
    queryFn: async () => (await supabase.from("activity_templates").select("*")).data ?? [],
  });
  const stops = useQuery({
    queryKey: ["all-stops"],
    queryFn: async () => (await supabase.from("stops").select("id, city, trip_id, trips(name)")).data ?? [],
  });

  if (acts.isLoading) return <Loading />;

  const filtered = (acts.data ?? []).filter((a: any) =>
    (cat === "All" || a.category === cat) &&
    Number(a.cost) <= maxCost &&
    (a.title.toLowerCase().includes(query.toLowerCase()) || (a.city ?? "").toLowerCase().includes(query.toLowerCase()))
  );

  const addToStop = async (a: any, stopId: string) => {
    const { error } = await supabase.from("activities").insert({
      stop_id: stopId, title: a.title, description: a.description, category: a.category,
      cost: a.cost, duration: a.duration, image_url: a.image_url,
    });
    if (error) toast.error(error.message);
    else toast.success("Activity added to stop");
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Discover Activities</h1>
        <p className="text-muted-foreground mt-1">Curated experiences for your itinerary.</p>
      </div>

      <div className="glass rounded-2xl p-4 shadow-card grid sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search activities..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 px-3 rounded-md border bg-background">
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Max ${maxCost}</span>
          <input type="range" min="0" max="500" step="25" value={maxCost} onChange={(e) => setMaxCost(+e.target.value)} className="flex-1" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((a: any) => (
          <div key={a.id} className="rounded-2xl overflow-hidden glass shadow-card hover:shadow-glow transition group">
            <div className="h-44 relative overflow-hidden">
              <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass text-xs font-medium flex items-center gap-1"><Sparkles className="w-3 h-3" /> {a.category}</div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span>{a.city}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.duration}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {a.cost}</span>
              </div>
              <AddActivityToStop activity={a} stops={stops.data ?? []} onAdd={addToStop} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddActivityToStop({ activity, stops, onAdd }: { activity: any; stops: any[]; onAdd: (a: any, s: string) => void }) {
  const [open, setOpen] = useState(false);
  if (stops.length === 0) return <Button size="sm" variant="outline" disabled className="w-full mt-3">Add a stop first</Button>;
  return (
    <div className="relative mt-3">
      <Button onClick={() => setOpen(!open)} size="sm" className="w-full bg-gradient-hero"><Plus className="w-3 h-3 mr-1" /> Add to stop</Button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-xl glass shadow-card border max-h-60 overflow-auto">
          {stops.map((s: any) => (
            <button key={s.id} onClick={() => { onAdd(activity, s.id); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent">{s.city} <span className="text-muted-foreground">— {s.trips?.name}</span></button>
          ))}
        </div>
      )}
    </div>
  );
}
