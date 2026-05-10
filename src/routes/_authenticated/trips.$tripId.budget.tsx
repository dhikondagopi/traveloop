import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { BudgetOptimizer } from "@/components/BudgetOptimizer";

export const Route = createFileRoute("/_authenticated/trips/$tripId/budget")({
  head: () => ({ meta: [{ title: "Budget — Traveloop" }] }),
  component: BudgetPage,
});

const CATEGORIES = ["Transport", "Stay", "Activities", "Meals", "Shopping", "Other"];
const COLORS = ["#3b82f6", "#14b8a6", "#f59e0b", "#10b981", "#a855f7", "#94a3b8"];

function BudgetPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/budget" });
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["budget", tripId],
    queryFn: async () => {
      const [trip, items] = await Promise.all([
        supabase.from("trips").select("*").eq("id", tripId).single(),
        supabase.from("budget_items").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
      ]);
      return { trip: trip.data, items: items.data ?? [] };
    },
  });

  const [form, setForm] = useState({ category: "Transport", title: "", amount: "", note: "" });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("budget_items").insert({
        trip_id: tripId, category: form.category, title: form.title,
        amount: Number(form.amount) || 0, note: form.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget", tripId] });
      setForm({ category: "Transport", title: "", amount: "", note: "" });
      toast.success("Item added");
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("budget_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budget", tripId] }),
  });

  if (q.isLoading) return <Loading />;
  const { trip, items } = q.data!;
  if (!trip) return <div className="text-center py-20">Trip not found</div>;
  const spent = items.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const planned = Number(trip.planned_budget || 0);
  const remaining = planned - spent;
  const overBudget = remaining < 0;

  const days = trip.start_date && trip.end_date
    ? Math.max(1, Math.round((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000) + 1)
    : 1;
  const perDay = spent / days;

  const byCat = CATEGORIES.map((c) => ({
    name: c, value: items.filter((i: any) => i.category === c).reduce((s: number, i: any) => s + Number(i.amount), 0),
  })).filter(c => c.value > 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to trip</button>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Budget</h1>
        <p className="text-muted-foreground mt-1">Track every dollar of your adventure.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 shadow-card"><p className="text-xs text-muted-foreground">Planned</p><p className="text-2xl font-bold mt-1">${planned.toLocaleString()}</p></div>
        <div className="glass rounded-2xl p-5 shadow-card"><p className="text-xs text-muted-foreground">Spent / Estimated</p><p className="text-2xl font-bold mt-1 text-primary">${spent.toLocaleString()}</p></div>
        <div className={`rounded-2xl p-5 shadow-card ${overBudget ? "bg-destructive/10 border border-destructive/30" : "glass"}`}>
          <p className="text-xs text-muted-foreground flex items-center gap-1">{overBudget && <AlertTriangle className="w-3 h-3 text-destructive" />} Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${overBudget ? "text-destructive" : "text-emerald-600"}`}>${remaining.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-5 shadow-card"><p className="text-xs text-muted-foreground">Avg / day</p><p className="text-2xl font-bold mt-1">${perDay.toFixed(0)}</p></div>
      </div>
      {/* Smart Budget Optimizer */}
      <BudgetOptimizer planned={planned} items={items as any} days={days} />


      {byCat.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold mb-3">By category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `$${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold mb-3">Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCat}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v: any) => `$${v}`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add */}
      <div className="glass rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Add budget item</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5"><Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 lg:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Flight to Rome" /></div>
          <div className="space-y-1.5"><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="flex items-end"><Button onClick={() => form.title && add.mutate()} className="w-full bg-gradient-hero">Add</Button></div>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center shadow-card">
          <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No budget items yet.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden shadow-card divide-y divide-border">
          {items.map((i: any, idx: number) => (
            <div key={i.id} className="flex items-center gap-4 p-4 hover:bg-accent/40">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-semibold" style={{ background: COLORS[CATEGORIES.indexOf(i.category) % COLORS.length] }}>
                {i.category.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{i.title}</p>
                <p className="text-xs text-muted-foreground">{i.category}</p>
              </div>
              <p className="font-semibold">${Number(i.amount).toLocaleString()}</p>
              <button onClick={() => del.mutate(i.id)}><Trash2 className="w-4 h-4 text-destructive/70" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
