import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { JourneyMap } from "@/components/trip/JourneyMap";

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
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});
  const [completedActs, setCompletedActs] = useState<Record<string, boolean>>({});

  const toggleCompleted = (id: string) => setCompletedStops(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleActCompleted = (id: string) => setCompletedActs(prev => ({ ...prev, [id]: !prev[id] }));

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

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <Skeleton className="h-10 w-32 rounded" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }
  const { stops, acts } = q.data!;

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="group flex items-center gap-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 bg-gradient-hero hover:opacity-90 px-5 py-2.5 rounded-full shadow-md self-start w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Trip
      </button>

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
          <p className="text-muted-foreground text-sm">Add your first city to start building your roadmap.</p>
        </div>
      ) : (
        <JourneyMap 
          stops={stops} 
          acts={acts} 
          completedStops={completedStops} 
          completedActs={completedActs} 
          toggleCompleted={toggleCompleted} 
          toggleActCompleted={toggleActCompleted}
          delStop={delStop}
          delAct={delAct}
          tripId={tripId}
          qc={qc}
        />
      )}
    </div>
  );
}


