import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/Loading";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trips/$tripId/edit")({
  head: () => ({ meta: [{ title: "Edit Trip — Traveloop" }] }),
  component: EditTrip,
});

function EditTrip() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/edit" });
  const nav = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const q = useQuery({
    queryKey: ["trip-edit", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => { if (q.data) setForm(q.data); }, [q.data]);

  if (q.isLoading || !form) return <Loading />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("trips").update({
      name: form.name, description: form.description, start_date: form.start_date,
      end_date: form.end_date, planned_budget: Number(form.planned_budget) || 0,
      cover_image: form.cover_image, updated_at: new Date().toISOString(),
    }).eq("id", tripId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Trip updated");
    nav({ to: "/trips/$tripId", params: { tripId } });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="rounded-3xl glass shadow-card p-8">
        <h1 className="text-2xl font-bold mb-6">Edit trip</h1>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Start</Label><Input type="date" value={form.start_date ?? ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>End</Label><Input type="date" value={form.end_date ?? ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Budget ($)</Label><Input type="number" value={form.planned_budget ?? 0} onChange={(e) => setForm({ ...form, planned_budget: e.target.value })} /></div>
          <div className="space-y-2"><Label>Cover image URL</Label><Input value={form.cover_image ?? ""} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
          <Button type="submit" disabled={saving} className="bg-gradient-hero shadow-glow">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}</Button>
        </form>
      </div>
    </div>
  );
}
