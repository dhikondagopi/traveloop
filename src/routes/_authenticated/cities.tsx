import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { Search, Plus, MapPin, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/cities")({
  head: () => ({ meta: [{ title: "Discover Cities — Traveloop" }] }),
  component: CitiesPage,
});

function CitiesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");

  const cities = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await supabase.from("cities").select("*").order("popularity", { ascending: false })).data ?? [],
  });
  const trips = useQuery({
    queryKey: ["trips-min", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return (await supabase.from("trips").select("id, name").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [];
    },
    enabled: !!user,
  });

  if (cities.isLoading) return <Loading />;

  const regions = Array.from(new Set((cities.data ?? []).map((c: any) => c.region).filter(Boolean)));
  const filtered = (cities.data ?? []).filter((c: any) =>
    (region === "All" || c.region === region) &&
    (c.name.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase()))
  );

  const addToTrip = async (city: any, tripId: string) => {
    const { data: existing } = await supabase.from("stops").select("stop_order").eq("trip_id", tripId).order("stop_order", { ascending: false }).limit(1);
    const order = existing && existing[0] ? (existing[0].stop_order ?? 0) + 1 : 0;
    const { error } = await supabase.from("stops").insert({
      trip_id: tripId, city: city.name, country: city.country, stop_order: order,
    });
    if (error) toast.error(error.message);
    else toast.success(`${city.name} added to trip!`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Discover Cities</h1>
        <p className="text-muted-foreground mt-1">Find your next destination.</p>
      </div>

      <div className="glass rounded-2xl p-4 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search city or country..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-10 px-3 rounded-md border bg-background">
          <option>All</option>
          {regions.map((r: any) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((c: any) => (
          <div key={c.id} className="group rounded-2xl glass shadow-card hover:shadow-glow transition-all hover:-translate-y-1 flex flex-col">
            <div className="h-52 relative overflow-hidden rounded-t-2xl">
              <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">{c.country}</p>
                <h3 className="text-2xl font-bold">{c.name}</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-5">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {c.region}</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-blue-500" /> {c.popularity}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-green-500" /> {c.cost_index}</span>
              </div>
              <AddCityButton city={c} trips={trips.data ?? []} onAdd={addToTrip} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddCityButton({ city, trips, onAdd }: { city: any; trips: any[]; onAdd: (c: any, t: string) => void }) {
  if (trips.length === 0) {
    return <Button variant="outline" size="sm" className="w-full" disabled>Create a trip first</Button>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="w-full bg-gradient-hero"><Plus className="w-3 h-3 mr-1" /> Add to trip</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] glass min-w-[200px]" align="start">
        {trips.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => onAdd(city, t.id)} className="cursor-pointer">
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
