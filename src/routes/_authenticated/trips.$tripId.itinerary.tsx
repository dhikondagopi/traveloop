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
import { ArrowLeft, Plus, MapPin, Trash2, Clock, DollarSign, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
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

function JourneyMap({ stops, acts, completedStops, completedActs, toggleCompleted, toggleActCompleted, delStop, delAct, tripId, qc }: any) {
  const MAP_WIDTH = 1000;
  const ROW_HEIGHT = 200;
  const AMPLITUDE = 300;

  // Flatten the journey into a single array
  const journey: any[] = [];
  stops.forEach((s: any) => {
    journey.push({ type: 'stop', data: s, id: s.id });
    const stopActs = acts.filter((a: any) => a.stop_id === s.id);
    stopActs.forEach((a: any) => journey.push({ type: 'act', data: a, id: a.id }));
    journey.push({ type: 'add_act', stopId: s.id, id: `add_${s.id}` });
  });

  const totalHeight = journey.length * ROW_HEIGHT;
  const pathLines: string[] = [];
  const activePathLines: string[] = [];
  let lastCompletedIndex = -1;

  journey.forEach((item, i) => {
    let isComp = false;
    if (item.type === 'stop') isComp = completedStops[item.id];
    else if (item.type === 'act') isComp = completedActs[item.id];
    if (isComp) lastCompletedIndex = i;
  });

  for (let i = 0; i < journey.length; i++) {
    const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
    const targetX = (MAP_WIDTH / 2) + Math.sin(i * Math.PI / 2) * AMPLITUDE; 
    
    if (i === 0) {
      pathLines.push(`M ${targetX} ${targetY}`);
      if (lastCompletedIndex >= 0) activePathLines.push(`M ${targetX} ${targetY}`);
    } else {
      const prevY = (i - 1) * ROW_HEIGHT + (ROW_HEIGHT / 2);
      const prevX = (MAP_WIDTH / 2) + Math.sin((i - 1) * Math.PI / 2) * AMPLITUDE;
      const curve = `C ${prevX} ${prevY + ROW_HEIGHT/2}, ${targetX} ${targetY - ROW_HEIGHT/2}, ${targetX} ${targetY}`;
      
      pathLines.push(curve);
      if (i <= lastCompletedIndex) activePathLines.push(curve);
    }
  }

  const getImageUrl = (item: any) => {
    if (item.type === 'act' && item.data.image_url) return item.data.image_url;
    if (item.type === 'stop' && item.data.city) return `https://loremflickr.com/200/200/${encodeURIComponent(item.data.city)},view/all`;
    if (item.type === 'act' && item.data.title) return `https://loremflickr.com/200/200/${encodeURIComponent(item.data.title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0,2).join(','))}/all`;
    return null;
  };

  return (
    <div className="relative mx-auto mt-12 mb-24 animate-fade-up w-full max-w-5xl" style={{ height: `${journey.length * 160}px` }}>
      {/* Decorative Game Map Elements */}
      {journey.map((_, i) => {
        if (i % 2 !== 0) return null;
        const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
        const topPct = (targetY / totalHeight) * 100;
        const isLeft = (i % 4 === 0);
        return (
          <div key={`deco-${i}`} className="absolute text-5xl md:text-7xl opacity-30 z-0 animate-float pointer-events-none" style={{ top: `calc(${topPct}% - 40px)`, left: isLeft ? '5%' : '85%', animationDelay: `${i * 0.5}s` }}>
            {['🌲', '☁️', '⛰️', '🌴', '🏕️', '🎈', '☁️'][i % 7]}
          </div>
        )
      })}

      {/* SVG Winding Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none" viewBox={`0 0 ${MAP_WIDTH} ${totalHeight}`}>
        {/* Remaining transparent blue path */}
        <path d={pathLines.join(' ')} vectorEffect="non-scaling-stroke" stroke="rgba(37,99,235,0.15)" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 24" fill="none" />
        
        {/* Completed solid blue path */}
        {activePathLines.length > 0 && (
          <path d={activePathLines.join(' ')} vectorEffect="non-scaling-stroke" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" fill="none" className="drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
        )}
      </svg>

      {journey.map((item, i) => {
        const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
        const targetX = (MAP_WIDTH / 2) + Math.sin(i * Math.PI / 2) * AMPLITUDE;
        
        const topPct = (targetY / totalHeight) * 100;
        const leftPct = (targetX / MAP_WIDTH) * 100;
        
        let isComp = false;
        if (item.type === 'stop') isComp = completedStops[item.id];
        else if (item.type === 'act') isComp = completedActs[item.id];

        // Determine if the detail card should render to the left or right of the node
        const isLeft = targetX > (MAP_WIDTH / 2) || (targetX === (MAP_WIDTH / 2) && i % 4 === 2);

        if (item.type === 'add_act') {
          return (
            <div key={item.id} className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: `${topPct}%`, left: `${leftPct}%` }}>
               <AddActivityInline stopId={item.stopId} onAdded={() => qc.invalidateQueries({ queryKey: ["itinerary", tripId] })} isCompleted={lastCompletedIndex >= i} />
            </div>
          );
        }

        return (
          <div 
            key={item.id} 
            className="absolute flex items-center gap-4 md:gap-8 -translate-y-1/2 z-20"
            style={{ 
              top: `${topPct}%`, 
              left: isLeft ? 'auto' : `${leftPct}%`, 
              right: isLeft ? `${100 - leftPct}%` : 'auto',
              flexDirection: isLeft ? 'row-reverse' : 'row'
            }}
          >
            {/* The Game Map Node */}
            <button 
              onClick={() => item.type === 'stop' ? toggleCompleted(item.id) : toggleActCompleted(item.id)}
              className={`shrink-0 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 ${item.type === 'stop' ? 'w-14 h-14 md:w-16 md:h-16 border-[3px]' : 'w-10 h-10 md:w-12 md:h-12 border-[2px]'} ${isComp ? 'border-primary shadow-[0_0_15px_rgba(37,99,235,0.8)]' : 'bg-white border-white shadow-md hover:border-primary/50'} relative overflow-hidden group z-20`}
            >
              {getImageUrl(item) ? (
                <>
                  <img src={getImageUrl(item)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                  {isComp ? (
                    <div className="absolute inset-0 bg-blue-600/50 mix-blend-multiply flex items-center justify-center backdrop-blur-[1px]">
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      {item.type === 'stop' ? <MapPin className="w-5 h-5 text-white drop-shadow-md" /> : <Sparkles className="w-4 h-4 text-white drop-shadow-md" />}
                    </div>
                  )}
                </>
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isComp ? 'bg-gradient-hero text-white' : 'text-primary'}`}>
                  {isComp ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : (item.type === 'stop' ? <MapPin className="w-5 h-5 md:w-6 md:h-6" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />)}
                </div>
              )}
            </button>

            {/* Details Card */}
            <div className={`w-32 sm:w-40 md:w-48 p-2 sm:p-3 rounded-2xl shadow-xl transition-all relative group ${isComp ? 'bg-slate-800 text-white border border-slate-700' : 'glass border border-white text-slate-800 hover:bg-white/90'}`}>
              <button 
                onClick={() => {
                   if (confirm(`Delete this ${item.type}?`)) {
                     if (item.type === 'stop') delStop.mutate(item.id);
                     else delAct.mutate(item.id);
                   }
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {item.type === 'act' && getImageUrl(item) && (
                <img src={getImageUrl(item)} className={`w-full h-12 sm:h-16 md:h-20 object-cover rounded-lg mb-2 shadow-sm ${isComp ? 'opacity-70 saturate-50' : ''}`} alt="" />
              )}
              
              <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 ${isComp ? 'text-blue-400' : 'text-primary'}`}>
                {item.type === 'stop' ? 'City Stop' : item.data.category || 'Activity'}
              </p>
              <p className="text-xs sm:text-sm font-bold leading-tight line-clamp-2">
                {item.type === 'stop' ? item.data.city : item.data.title}
              </p>
              
              {(item.data.start_date || item.data.start_time) && (
                <p className={`text-[10px] sm:text-[11px] mt-1 sm:mt-2 flex items-center gap-1 font-semibold ${isComp ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 
                  {item.type === 'stop' ? `${item.data.start_date}` : item.data.start_time}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddActivityInline({ stopId, onAdded, isCompleted }: { stopId: string; onAdded: () => void; isCompleted?: boolean }) {
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
        <button className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-dashed transition-all hover:scale-110 shadow-lg ${isCompleted ? 'border-slate-500 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'border-primary/40 bg-white text-primary hover:bg-primary/10'}`}>
          <Plus className="w-6 h-6" />
        </button>
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
