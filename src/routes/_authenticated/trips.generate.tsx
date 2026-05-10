import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles, Wand2, Check } from "lucide-react";
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

function GenerateTrip() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
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
    <div className="max-w-4xl mx-auto animate-fade-up">
      <button onClick={() => nav({ to: "/trips" })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to trips
      </button>

      <div className="rounded-3xl glass shadow-card p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              AI Smart Trip Planner <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">Tell us your vibe — we'll generate a complete trip in seconds.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5 mt-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Destination or region</Label>
              <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Italy, Japan, Bali, Europe…" />
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

          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERESTS.map((i) => {
                const active = form.interests.includes(i.id);
                return (
                  <button
                    type="button"
                    key={i.id}
                    onClick={() => toggleInterest(i.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition text-sm font-medium ${
                      active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="text-lg">{i.emoji}</span> {i.label}
                    {active && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero shadow-glow text-base">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {step || "Generating…"}</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate Plan</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
