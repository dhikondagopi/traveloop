import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loading } from "@/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trips/$tripId/checklist")({
  head: () => ({ meta: [{ title: "Packing — Traveloop" }] }),
  component: ChecklistPage,
});

const CATS = ["Clothes", "Documents", "Electronics", "Medicine", "Toiletries", "Others"];

function ChecklistPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/checklist" });
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["checklist", tripId],
    queryFn: async () => {
      const { data } = await supabase.from("checklist_items").select("*").eq("trip_id", tripId).order("created_at");
      return data ?? [];
    },
  });

  const [form, setForm] = useState({ title: "", category: "Clothes" });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("checklist_items").insert({ trip_id: tripId, ...form });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["checklist", tripId] }); setForm({ title: "", category: form.category }); },
  });
  const toggle = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from("checklist_items").update({ is_packed: val }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist", tripId] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("checklist_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist", tripId] }),
  });

  if (q.isLoading) return <Loading />;
  const items = q.data!;
  const packed = items.filter((i: any) => i.is_packed).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to trip</button>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Packing Checklist</h1>
        <p className="text-muted-foreground mt-1">Stay organized so you don't forget a thing.</p>
      </div>

      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">{packed} / {items.length} packed</span>
          <span className="text-2xl font-bold text-gradient">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-hero transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <div className="space-y-1.5"><Label>Item</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Passport" onKeyDown={(e) => e.key === "Enter" && form.title && add.mutate()} /></div>
          <div className="space-y-1.5"><Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={() => form.title && add.mutate()} className="bg-gradient-hero"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center shadow-card">
          <ListChecks className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No items yet — start adding what you need to pack.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {CATS.map(cat => {
            const filtered = items.filter((i: any) => i.category === cat);
            if (!filtered.length) return null;
            return (
              <div key={cat} className="glass rounded-2xl shadow-card overflow-hidden">
                <div className="px-5 py-3 bg-secondary/50 font-semibold text-sm uppercase tracking-wider">{cat}</div>
                <div className="divide-y divide-border">
                  {filtered.map((i: any) => (
                    <div key={i.id} className="flex items-center gap-3 p-4">
                      <Checkbox checked={i.is_packed} onCheckedChange={(v) => toggle.mutate({ id: i.id, val: !!v })} />
                      <span className={`flex-1 ${i.is_packed ? "line-through text-muted-foreground" : ""}`}>{i.title}</span>
                      <button onClick={() => del.mutate(i.id)}><Trash2 className="w-4 h-4 text-destructive/70" /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
