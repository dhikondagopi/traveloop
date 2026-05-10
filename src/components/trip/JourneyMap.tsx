import { useMemo, useState } from "react";
import { Check, MapPin, Sparkles, Trash2, Plus, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = ["Sightseeing", "Food", "Culture", "Outdoors", "Entertainment", "Wellness", "Shopping", "Other"];

export function JourneyMap({ stops, acts, completedStops, completedActs, toggleCompleted, toggleActCompleted, delStop, delAct, tripId, qc }: any) {
  const MAP_WIDTH = 1000;
  const ROW_HEIGHT = 200;
  const AMPLITUDE = 300;

  // Flatten the journey into a single array
  const journey = useMemo(() => {
    const arr: any[] = [];
    stops.forEach((s: any) => {
      arr.push({ type: 'stop', data: s, id: s.id });
      const stopActs = acts.filter((a: any) => a.stop_id === s.id);
      stopActs.forEach((a: any) => arr.push({ type: 'act', data: a, id: a.id }));
      arr.push({ type: 'add_act', stopId: s.id, id: `add_${s.id}` });
    });
    return arr;
  }, [stops, acts]);

  const totalHeight = journey.length * ROW_HEIGHT;
  
  const { pathLines, activePathLines, lastCompletedIndex } = useMemo(() => {
    const lines: string[] = [];
    const activeLines: string[] = [];
    let lastCompleted = -1;

    journey.forEach((item, i) => {
      let isComp = false;
      if (item.type === 'stop') isComp = completedStops[item.id];
      else if (item.type === 'act') isComp = completedActs[item.id];
      if (isComp) lastCompleted = i;
    });

    for (let i = 0; i < journey.length; i++) {
      const targetY = i * ROW_HEIGHT + (ROW_HEIGHT / 2);
      const targetX = (MAP_WIDTH / 2) + Math.sin(i * Math.PI / 2) * AMPLITUDE; 
      
      if (i === 0) {
        lines.push(`M ${targetX} ${targetY}`);
        if (lastCompleted >= 0) activeLines.push(`M ${targetX} ${targetY}`);
      } else {
        const prevY = (i - 1) * ROW_HEIGHT + (ROW_HEIGHT / 2);
        const prevX = (MAP_WIDTH / 2) + Math.sin((i - 1) * Math.PI / 2) * AMPLITUDE;
        const curve = `C ${prevX} ${prevY + ROW_HEIGHT/2}, ${targetX} ${targetY - ROW_HEIGHT/2}, ${targetX} ${targetY}`;
        
        lines.push(curve);
        if (i <= lastCompleted) activeLines.push(curve);
      }
    }

    return { pathLines: lines, activePathLines: activeLines, lastCompletedIndex: lastCompleted };
  }, [journey, completedStops, completedActs]);

  const getImageUrl = (item: any) => {
    if (item.type === 'act' && item.data.image_url) return item.data.image_url;
    if (item.type === 'stop' && item.data.city) return `https://loremflickr.com/200/200/${encodeURIComponent(item.data.city)},view/all`;
    if (item.type === 'act' && item.data.title) return `https://loremflickr.com/200/200/${encodeURIComponent(item.data.title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0,2).join(','))}/all`;
    return null;
  };

  return (
    <div className="relative mx-auto mt-12 mb-24 animate-fade-up w-full max-w-5xl" style={{ height: `${journey.length * 160}px` }}>
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

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none" viewBox={`0 0 ${MAP_WIDTH} ${totalHeight}`}>
        <path d={pathLines.join(' ')} vectorEffect="non-scaling-stroke" stroke="rgba(37,99,235,0.15)" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 24" fill="none" />
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
            <button 
              onClick={() => item.type === 'stop' ? toggleCompleted(item.id) : toggleActCompleted(item.id)}
              aria-label={`Mark ${item.type === 'stop' ? item.data.city : item.data.title} as ${isComp ? 'incomplete' : 'complete'}`}
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

            <div className={`w-32 sm:w-40 md:w-48 p-2 sm:p-3 rounded-2xl shadow-xl transition-all relative group ${isComp ? 'bg-slate-800 text-white border border-slate-700' : 'glass border border-white text-slate-800 hover:bg-white/90'}`}>
              <button 
                aria-label={`Delete ${item.type}`}
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
        <button aria-label="Add activity" className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-dashed transition-all hover:scale-110 shadow-lg ${isCompleted ? 'border-slate-500 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'border-primary/40 bg-white text-primary hover:bg-primary/10'}`}>
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
