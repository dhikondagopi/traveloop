import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, MapPin, Trash2, Clock, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trips/$tripId/itinerary")({
  head: () => ({ meta: [{ title: "Itinerary — Traveloop" }] }),
  component: Itinerary,
});

const CATEGORIES = ["Sightseeing", "Food", "Culture", "Outdoors", "Entertainment", "Wellness", "Shopping", "Other"];

function Itinerary() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/itinerary" });
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: async () => {
      const { data: stops } = await supabase.from("stops").select("*").eq("trip_id", tripId).order("stop_order");
      const stopIds = (stops ?? []).map((s: { id: string }) => s.id);
      const { data: acts } = stopIds.length
        ? await supabase.from("activities").select("*").in("stop_id", stopIds).order("created_at")
        : { data: [] };
      return { stops: stops ?? [], acts: acts ?? [] };
    },
  });

  const [stopForm, setStopForm] = useState({ city: "", country: "", start_date: "", end_date: "", notes: "" });
  const [openStop, setOpenStop] = useState(false);

  const addStop = useMutation({
    mutationFn: async () => {
      const order = (q.data?.stops?.length ?? 0);
      const { error } = await supabase.from("stops").insert({ trip_id: tripId, ...stopForm, stop_order: order });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itinerary", tripId] });
      toast.success("Stop added");
      setStopForm({ city: "", country: "", start_date: "", end_date: "", notes: "" });
      setOpenStop(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delStop = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("stops").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["itinerary", tripId] }); toast.success("Stop removed"); },
  });

  const delAct = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("activities").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["itinerary", tripId] }),
  });

  if (q.isLoading) return <Loading />;
  const { stops, acts } = q.data!;

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to trip</button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Itinerary Builder</h1>
          <p className="text-muted-foreground mt-1">Add stops and activities for your journey.</p>
        </div>
        <Dialog open={openStop} onOpenChange={setOpenStop}>
          <DialogTrigger asChild><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Add Stop</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add city stop</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2"><Label>City *</Label><Input value={stopForm.city} onChange={(e) => setStopForm({ ...stopForm, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={stopForm.country} onChange={(e) => setStopForm({ ...stopForm, country: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Start</Label><Input type="date" value={stopForm.start_date} onChange={(e) => setStopForm({ ...stopForm, start_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>End</Label><Input type="date" value={stopForm.end_date} onChange={(e) => setStopForm({ ...stopForm, end_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={stopForm.notes} onChange={(e) => setStopForm({ ...stopForm, notes: e.target.value })} /></div>
              <Button onClick={() => stopForm.city && addStop.mutate()} className="w-full bg-gradient-hero">Add Stop</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stops.length === 0 ? (
        <div className="rounded-3xl glass p-12 text-center shadow-card">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-ocean flex items-center justify-center"><MapPin className="w-8 h-8 text-white" /></div>
          <h3 className="text-lg font-semibold">No stops yet</h3>
          <p className="text-muted-foreground text-sm">Add your first city to start building.</p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-2 md:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-teal">
          {stops.map((s: any, idx: number) => (
            <div key={s.id} className="relative">
              <div className="absolute -left-6 md:-left-10 top-1 w-5 h-5 rounded-full bg-gradient-hero ring-4 ring-background shadow-glow" />
              <div className="rounded-2xl glass shadow-card p-6">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">Stop {idx + 1}</p>
                    <h3 className="text-2xl font-bold mt-1">{s.city}{s.country && <span className="text-muted-foreground font-normal">, {s.country}</span>}</h3>
                    {(s.start_date || s.end_date) && <p className="text-sm text-muted-foreground mt-1">{s.start_date} → {s.end_date}</p>}
                    {s.notes && <p className="mt-2 text-sm">{s.notes}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this stop and all its activities?")) delStop.mutate(s.id); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {/* Activities */}
                <div className="mt-5 space-y-3">
                  {acts.filter((a: any) => a.stop_id === s.id).map((a: any) => (
                    <div key={a.id} className="rounded-xl bg-secondary/40 p-4 flex items-start gap-3">
                      {a.image_url && <img src={a.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{a.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                          </div>
                          <button onClick={() => delAct.mutate(a.id)}><Trash2 className="w-4 h-4 text-destructive/70" /></button>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {a.category && <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground"><Sparkles className="w-3 h-3 inline mr-1" />{a.category}</span>}
                          {a.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.start_time}</span>}
                          {a.duration && <span>{a.duration}</span>}
                          {a.cost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{a.cost}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <AddActivityInline stopId={s.id} onAdded={() => qc.invalidateQueries({ queryKey: ["itinerary", tripId] })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddActivityInline({ stopId, onAdded }: { stopId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Sightseeing", start_time: "", duration: "", cost: "", image_url: "" });
  const save = async () => {
    if (!form.title) return;
    const { error } = await supabase.from("activities").insert({
      stop_id: stopId, ...form, cost: Number(form.cost) || 0,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Activity added");
    setForm({ title: "", description: "", category: "Sightseeing", start_time: "", duration: "", cost: "", image_url: "" });
    setOpen(false);
    onAdded();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full border-dashed"><Plus className="w-4 h-4 mr-1" /> Add Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add activity</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
            <div className="space-y-2"><Label>Start time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
            <div className="space-y-2"><Label>Duration</Label><Input placeholder="2h" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
          <Button onClick={save} className="w-full bg-gradient-hero">Add Activity</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
