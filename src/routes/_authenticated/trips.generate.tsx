import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles, Wand2, Check, PlaneTakeoff, PlaneLanding, MapPin } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { toast } from "sonner";
import { generatePlan, type Interest, type TravelStyle } from "@/lib/trip-generator";

export const Route = createFileRoute("/_authenticated/trips/generate")({
  head: () => ({ meta: [{ title: "AI Trip Planner — Traveloop" }] }),
  component: GenerateTrip,
});

const INTERESTS: { id: Interest; label: string; emoji: string }[] = [
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "culture", label: "Culture", emoji: "🏛️" },
  { id: "relaxation", label: "Relaxation", emoji: "🧘" },
];

const ALL_PLACES = [
  { id: "Rome, Italy", label: "Rome", coordinates: [12.4964, 41.9028] },
  { id: "Tokyo, Japan", label: "Tokyo", coordinates: [139.6917, 35.6895] },
  { id: "Bali, Indonesia", label: "Bali", coordinates: [115.1889, -8.4095] },
  { id: "Paris, France", label: "Paris", coordinates: [2.3522, 48.8566] },
  { id: "New York, USA", label: "New York", coordinates: [-74.0060, 40.7128] },
  { id: "Rio de Janeiro, Brazil", label: "Rio", coordinates: [-43.1729, -22.9068] },
  { id: "Sydney, Australia", label: "Sydney", coordinates: [151.2093, -33.8688] },
  { id: "Cairo, Egypt", label: "Cairo", coordinates: [31.2357, 30.0444] },
  { id: "London, UK", label: "London", coordinates: [-0.1276, 51.5074] },
  { id: "Madrid, Spain", label: "Madrid", coordinates: [-3.7038, 40.4168] },
  { id: "Toronto, Canada", label: "Toronto", coordinates: [-79.3832, 43.6532] },
  { id: "Mumbai, India", label: "Mumbai", coordinates: [72.8777, 19.0760] },
  { id: "Beijing, China", label: "Beijing", coordinates: [116.4074, 39.9042] },
  { id: "Cape Town, South Africa", label: "Cape Town", coordinates: [18.4232, -33.9249] },
];

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap({ origin, destination, mapMode, setMapMode, onSelect }: any) {
  const originPlace = ALL_PLACES.find(p => origin.toLowerCase().includes(p.label.toLowerCase()) || origin.toLowerCase() === p.id.toLowerCase());
  const destPlace = ALL_PLACES.find(p => destination.toLowerCase().includes(p.label.toLowerCase()) || destination.toLowerCase() === p.id.toLowerCase());

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-square bg-blue-50/40 dark:bg-slate-900/40 rounded-3xl border border-blue-100/50 dark:border-border/50 overflow-hidden glass shadow-[inset_0_0_20px_rgba(37,99,235,0.05)] flex flex-col justify-between items-center">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Map Mode Selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex p-1.5 bg-background/90 backdrop-blur-md border border-primary/10 rounded-2xl shadow-soft">
        <button 
          type="button"
          onClick={() => setMapMode("origin")}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-300 ${mapMode === "origin" ? "bg-gradient-hero text-white shadow-md scale-105" : "hover:bg-primary/5 text-muted-foreground"}`}
        >
          <PlaneTakeoff className="w-3.5 h-3.5" /> Boarding
        </button>
        <button 
          type="button"
          onClick={() => setMapMode("destination")}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-300 ${mapMode === "destination" ? "bg-gradient-hero text-white shadow-md scale-105" : "hover:bg-primary/5 text-muted-foreground"}`}
        >
          <PlaneLanding className="w-3.5 h-3.5" /> Destination
        </button>
      </div>

      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }} className="w-full h-full p-2 mt-4 drop-shadow-sm">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#dbeafe" // blue-100 for a clean theme look
                stroke="#ffffff"
                strokeWidth={1}
                style={{
                  default: { outline: "none", transition: "all 0.3s ease" },
                  hover: { fill: "#93c5fd", outline: "none", cursor: "pointer" }, // blue-300 on hover
                  pressed: { fill: "#3b82f6", outline: "none" }, // blue-500
                }}
              />
            ))
          }
        </Geographies>
        
        {/* Flight Path Line */}
        {originPlace && destPlace && (
          <Line
            from={originPlace.coordinates as [number, number]}
            to={destPlace.coordinates as [number, number]}
            stroke="#2563eb" // primary blue
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ strokeDasharray: "6 6", animation: "dash 1.5s linear infinite" }}
          />
        )}
        
        {/* Markers */}
        {ALL_PLACES.map(({ id, label, coordinates }) => {
          const isOrigin = origin.toLowerCase().includes(label.toLowerCase()) || origin.toLowerCase() === id.toLowerCase();
          const isDest = destination.toLowerCase().includes(label.toLowerCase()) || destination.toLowerCase() === id.toLowerCase();
          const isSelected = isOrigin || isDest;
          
          let markerColor = "#94a3b8"; // default slate-400
          if (isOrigin) markerColor = "#f59e0b"; // amber for origin
          else if (isDest) markerColor = "#2563eb"; // blue for destination

          return (
            <Marker key={id} coordinates={coordinates as [number, number]} onClick={() => onSelect(id)}>
              <circle 
                r={isSelected ? 8 : 4.5} 
                fill={markerColor} 
                stroke="#ffffff"
                strokeWidth={isSelected ? 2 : 1.5}
                className={`transition-all duration-300 cursor-pointer ${isSelected ? 'animate-pulse shadow-[0_0_15px_rgba(0,0,0,0.3)]' : 'hover:scale-150 hover:fill-primary'}`}
              />
              <text
                textAnchor="middle"
                y={isSelected ? -14 : -10}
                style={{ fontFamily: "inherit", fill: "currentColor" }}
                className={`text-[11px] md:text-xs cursor-pointer transition-all ${isSelected ? 'font-black text-slate-800 drop-shadow-[0_2px_2px_rgba(255,255,255,1)]' : 'font-semibold text-slate-500 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] opacity-70 hover:opacity-100'}`}
                fill={isSelected ? markerColor : "currentColor"}
                onClick={() => onSelect(id)}
              >
                {label}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>

      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
        <p className="text-xs text-muted-foreground font-medium bg-background/80 backdrop-blur inline-block px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
          Click a pin to set your {mapMode === "origin" ? "Boarding location" : "Destination"}
        </p>
      </div>
    </div>
  );
}

import { useRef, useEffect } from "react";

function AutocompleteInput({ value, onChange, placeholder, icon, label }: any) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = ALL_PLACES.filter(p => p.id.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-2 relative" ref={ref}>
      <Label className="flex items-center gap-2">{icon} {label}</Label>
      <Input 
        value={query} 
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }} 
        onFocus={() => setOpen(true)}
        placeholder={placeholder} 
        className="bg-background/80 border-primary/20 focus-visible:ring-primary"
      />
      {open && filtered.length > 0 && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-xl overflow-hidden z-20 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {filtered.map(p => (
            <button
              key={p.id}
              type="button"
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-primary/10 focus:bg-primary/10 transition-colors text-left border-b border-border/50 last:border-0"
              onClick={() => {
                setQuery(p.id);
                onChange(p.id);
                setOpen(false);
              }}
            >
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">{p.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GenerateTrip() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [mapMode, setMapMode] = useState<"origin" | "destination">("destination");
  const [form, setForm] = useState({
    origin: "",
    destination: "Italy",
    days: 7,
    budget: 2500,
    style: "comfort" as TravelStyle,
    travelers: 2,
    startDate: "",
    interests: ["food", "culture"] as Interest[],
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>("");

  const toggleInterest = (i: Interest) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.destination.trim()) return toast.error("Add a destination");
    setLoading(true);
    try {
      setStep("Crafting your itinerary…");
      const plan = generatePlan({
        destination: form.destination,
        days: Number(form.days),
        budget: Number(form.budget),
        style: form.style,
        travelers: Number(form.travelers),
        interests: form.interests,
        startDate: form.startDate || undefined,
        // The generator doesn't use origin yet, but we've added it to the form
      });

      setStep("Saving your trip…");
      const { data: trip, error: tripErr } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          name: plan.trip.name,
          description: plan.trip.description,
          cover_image: plan.trip.cover_image,
          start_date: plan.trip.start_date,
          end_date: plan.trip.end_date,
          planned_budget: plan.trip.planned_budget,
        })
        .select()
        .single();
      if (tripErr || !trip) throw tripErr || new Error("Trip insert failed");

      setStep("Adding city stops…");
      for (let i = 0; i < plan.stops.length; i++) {
        const s = plan.stops[i];
        const { data: stop, error: stopErr } = await supabase
          .from("stops")
          .insert({
            trip_id: trip.id,
            city: s.city,
            country: s.country,
            start_date: s.start_date,
            end_date: s.end_date,
            stop_order: i,
            notes: s.notes,
          })
          .select()
          .single();
        if (stopErr || !stop) throw stopErr || new Error("Stop insert failed");
        if (s.activities.length) {
          const { error: actErr } = await supabase.from("activities").insert(
            s.activities.map((a) => ({
              stop_id: stop.id,
              title: a.title,
              description: a.description,
              category: a.category,
              cost: a.cost,
              duration: a.duration,
              start_time: a.start_time,
            })),
          );
          if (actErr) throw actErr;
        }
      }

      setStep("Estimating budget…");
      await supabase.from("budget_items").insert(plan.budget.map((b) => ({ trip_id: trip.id, ...b })));

      setStep("Building packing checklist…");
      await supabase.from("checklist_items").insert(plan.checklist.map((c) => ({ trip_id: trip.id, ...c, is_packed: false })));

      setStep("Writing trip notes…");
      await supabase.from("notes").insert(plan.notes.map((n) => ({ trip_id: trip.id, ...n })));

      toast.success("Trip generated! 🎉");
      nav({ to: "/trips/$tripId", params: { tripId: trip.id } });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to generate plan");
      setLoading(false);
      setStep("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-up">
      <button onClick={() => nav({ to: "/trips" })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to trips
      </button>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        {/* Left Column: Interactive Map */}
        <div className="space-y-6 sticky top-24">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              AI Trip Planner <Sparkles className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-2">Map your journey. Select your origin and destination.</p>
          </div>
          <WorldMap 
            origin={form.origin} 
            destination={form.destination} 
            mapMode={mapMode}
            setMapMode={setMapMode}
            onSelect={(d: string) => {
              if (mapMode === "origin") {
                setForm({ ...form, origin: d });
                setMapMode("destination"); // Auto-switch to destination after picking origin
              } else {
                setForm({ ...form, destination: d });
              }
            }} 
          />
        </div>

        {/* Right Column: Form */}
        <div className="rounded-3xl glass shadow-card p-6 md:p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              
              <div onClick={() => setMapMode("origin")}>
                <AutocompleteInput 
                  value={form.origin} 
                  onChange={(val: string) => setForm({ ...form, origin: val })} 
                  placeholder="Type your city..." 
                  icon={<PlaneTakeoff className={`w-4 h-4 ${mapMode === "origin" ? "text-primary" : "text-muted-foreground"}`} />}
                  label="Boarding from"
                />
              </div>

              <div onClick={() => setMapMode("destination")}>
                <AutocompleteInput 
                  value={form.destination} 
                  onChange={(val: string) => setForm({ ...form, destination: val })} 
                  placeholder="Search destination..." 
                  icon={<PlaneLanding className={`w-4 h-4 ${mapMode === "destination" ? "text-primary" : "text-muted-foreground"}`} />}
                  label="Destination or region"
                />
              </div>

              <div className="space-y-2">
                <Label>Number of days</Label>
                <Input type="number" min={1} max={30} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Total budget ($)</Label>
                <Input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
              </div>
              
              <div className="space-y-2">
                <Label>Travel style</Label>
                <Select value={form.style} onValueChange={(v: TravelStyle) => setForm({ ...form, style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="comfort">Comfort</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Travelers</Label>
                <Input type="number" min={1} max={20} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })} />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label>Start date (optional)</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label>What are your interests?</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTERESTS.map((i) => {
                  const active = form.interests.includes(i.id);
                  return (
                    <button
                      type="button"
                      key={i.id}
                      onClick={() => toggleInterest(i.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium hover:scale-[1.02] active:scale-95 ${
                        active ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background/50 hover:bg-accent hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="text-lg">{i.emoji}</span> {i.label}
                      {active && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-gradient-hero shadow-[0_0_20px_rgba(37,99,235,0.3)] text-lg mt-4 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> {step || "Generating…"}</span>
              ) : (
                <span className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> Generate My Dream Trip</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
