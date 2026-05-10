import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Plane, Wand2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { generateChecklist, type TripType } from "@/lib/trip-generator";

export const Route = createFileRoute("/_authenticated/trips/new")({
  head: () => ({ meta: [{ title: "Create Trip — Traveloop" }] }),
  component: NewTrip,
});

const COVERS = [
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
  "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
];

function NewTrip() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", description: "", start_date: "", end_date: "",
    planned_budget: "", cover_image: COVERS[0], trip_type: "city" as TripType,
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("trips").insert({
      user_id: user.id,
      name: form.name,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      planned_budget: Number(form.planned_budget) || 0,
      cover_image: form.cover_image,
    }).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    // Smart Checklist Generator — seed checklist based on trip type
    const checklist = generateChecklist(form.trip_type);
    await supabase.from("checklist_items").insert(checklist.map((c) => ({ trip_id: data.id, ...c, is_packed: false })));
    toast.success("Trip created with smart checklist!");
    nav({ to: "/trips/$tripId", params: { tripId: data.id } });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <button onClick={() => nav({ to: "/trips" })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to trips</button>
      <div className="rounded-3xl glass shadow-card p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow"><Plane className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold">Plan a new trip</h1>
            <p className="text-sm text-muted-foreground">Set the basics — you can add stops next.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label>Trip name *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer in Italy" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A 10-day adventure across Rome, Florence and Venice." rows={3} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>End date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <div className="space-y-2">
            <Label>Planned budget ($)</Label>
            <Input type="number" min="0" value={form.planned_budget} onChange={(e) => setForm({ ...form, planned_budget: e.target.value })} placeholder="2500" />
          </div>
          <div className="space-y-2">
            <Label>Trip type (auto-generates a smart packing checklist)</Label>
            <Select value={form.trip_type} onValueChange={(v: TripType) => setForm({ ...form, trip_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="beach">Beach</SelectItem>
                <SelectItem value="mountain">Mountain</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
            <Wand2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Want a complete itinerary?</p>
              <p className="text-muted-foreground">Try the AI Smart Trip Planner — it generates stops, activities, budget, and notes in one click.</p>
            </div>
            <Link to="/trips/generate"><Button type="button" size="sm" variant="outline" className="border-primary/40">Try AI</Button></Link>
          </div>
          <div className="space-y-2">
            <Label>Cover image</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COVERS.map((c) => (
                <button type="button" key={c} onClick={() => setForm({ ...form, cover_image: c })}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${form.cover_image === c ? "border-primary ring-2 ring-primary/30" : "border-transparent"}`}>
                  <img src={c} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="Or paste an image URL" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero shadow-glow">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Trip"}
          </Button>
        </form>
      </div>
    </div>
  );
}
