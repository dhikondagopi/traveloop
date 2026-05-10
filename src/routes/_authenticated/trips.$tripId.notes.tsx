import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/Loading";
import { ArrowLeft, Plus, Trash2, NotebookPen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trips/$tripId/notes")({
  head: () => ({ meta: [{ title: "Notes — Traveloop" }] }),
  component: NotesPage,
});

function NotesPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/notes" });
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notes", tripId],
    queryFn: async () => {
      const [notes, stops] = await Promise.all([
        supabase.from("notes").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
        supabase.from("stops").select("id, city").eq("trip_id", tripId),
      ]);
      return { notes: notes.data ?? [], stops: stops.data ?? [] };
    },
  });

  const [form, setForm] = useState({ title: "", content: "", stop_id: "" });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").insert({
        trip_id: tripId, title: form.title, content: form.content || null,
        stop_id: form.stop_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes", tripId] }); setForm({ title: "", content: "", stop_id: "" }); toast.success("Note saved"); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("notes").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", tripId] }),
  });

  if (q.isLoading) return <Loading />;
  const { notes, stops } = q.data!;

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to trip</button>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Trip Notes</h1>
        <p className="text-muted-foreground mt-1">Capture ideas, reminders and memories.</p>
      </div>

      <div className="glass rounded-2xl p-6 shadow-card space-y-3">
        <div className="grid sm:grid-cols-[2fr_1fr] gap-3">
          <div className="space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Restaurant idea" /></div>
          <div className="space-y-1.5"><Label>Linked stop (optional)</Label>
            <select value={form.stop_id} onChange={(e) => setForm({ ...form, stop_id: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option value="">— None —</option>
              {stops.map((s: any) => <option key={s.id} value={s.id}>{s.city}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Content</Label><Textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        <Button onClick={() => form.title && add.mutate()} className="bg-gradient-hero"><Plus className="w-4 h-4 mr-1" /> Add Note</Button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center shadow-card">
          <NotebookPen className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No notes yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n: any) => {
            const stop = stops.find((s: any) => s.id === n.stop_id);
            return (
              <div key={n.id} className="glass rounded-2xl p-5 shadow-card hover:shadow-glow transition group">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{n.title}</h3>
                  <button onClick={() => del.mutate(n.id)}><Trash2 className="w-4 h-4 text-destructive/70" /></button>
                </div>
                {stop && <p className="text-xs text-primary mt-1">📍 {stop.city}</p>}
                {n.content && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{n.content}</p>}
                <p className="text-xs text-muted-foreground mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
