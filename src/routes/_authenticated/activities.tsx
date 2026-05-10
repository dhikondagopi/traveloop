import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { Search, Plus, Clock, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({ meta: [{ title: "Discover Activities — Traveloop" }] }),
  component: ActivitiesPage,
});

const CATS = ["All", "Sightseeing", "Food", "Culture", "Outdoors", "Entertainment", "Wellness"];

function ActivitiesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [maxCost, setMaxCost] = useState(500);

  const acts = useQuery({
    queryKey: ["act-templates"],
    queryFn: async () => (await supabase.from("activity_templates").select("*")).data ?? [],
  });
  const stops = useQuery({
    queryKey: ["all-stops", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return (await supabase.from("stops").select("id, city, trip_id, trips!inner(name, user_id)").eq("trips.user_id", user.id)).data ?? [];
    },
    enabled: !!user,
  });

  const getImageUrl = (a: any) => {
    if (a.title === "Ubud Rice Terraces") return "https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&q=80&w=800";
    if (a.title === "Central Park Bike Tour") return "https://images.unsplash.com/photo-1543348750-466b55f32f16?auto=format&fit=crop&q=80&w=800";
    if (a.image_url) return a.image_url;
    // Fallback based on title and city
    const keywords = `${a.title} ${a.city || ''}`.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 2).join(',');
    return `https://loremflickr.com/600/400/${encodeURIComponent(keywords)},travel/all`;
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((a: any) => (
          <div key={a.id} className="rounded-2xl glass shadow-card hover:shadow-glow transition group flex flex-col">
            <div className="h-48 relative overflow-hidden rounded-t-2xl bg-slate-100">
              <img src={getImageUrl(a)} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass text-xs font-medium flex items-center gap-1 shadow-sm"><Sparkles className="w-3 h-3 text-primary" /> {a.category}</div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{a.city}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> {a.duration}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-green-500" /> {a.cost}</span>
                </div>
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
  if (stops.length === 0) return <Button size="sm" variant="outline" disabled className="w-full mt-4">Add a stop first</Button>;
  return (
    <div className="mt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="w-full bg-gradient-hero"><Plus className="w-3 h-3 mr-1" /> Add to stop</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] glass min-w-[200px] max-h-60 overflow-y-auto" align="start">
          {stops.map((s: any) => (
            <DropdownMenuItem key={s.id} onClick={() => onAdd(activity, s.id)} className="cursor-pointer flex flex-col items-start gap-0.5">
              <span className="font-medium">{s.city}</span>
              <span className="text-xs text-muted-foreground">in {s.trips?.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
