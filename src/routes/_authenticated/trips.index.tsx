import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Map, Calendar, Wallet, Trash2, Eye, Edit3, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trips/")({
  head: () => ({ meta: [{ title: "My Trips — Traveloop" }] }),
  component: TripsList,
});

function TripsList() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*, stops(id)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trips"] }); toast.success("Trip deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <Loading />;
  const trips = data ?? [];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Trips</h1>
          <p className="text-muted-foreground mt-1">All your travel plans in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/trips/generate"><Button variant="outline" className="border-primary/40"><Wand2 className="w-4 h-4 mr-1 text-primary" /> AI Plan</Button></Link>
          <Link to="/trips/new"><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> New Trip</Button></Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <EmptyState icon={Map} title="No trips yet" description="Start by creating your first trip — adventures await."
          action={<Link to="/trips/new"><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Plan New Trip</Button></Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((t: any) => (
            <div key={t.id} className="group rounded-2xl overflow-hidden glass shadow-card hover:shadow-glow transition-all">
              <Link to="/trips/$tripId" params={{ tripId: t.id }} className="block">
                <div className="h-44 relative overflow-hidden bg-gradient-ocean">
                  {t.cover_image && <img src={t.cover_image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass text-xs font-medium">{t.stops?.length || 0} stops</div>
                </div>
              </Link>
              <div className="p-5">
                <h3 className="font-semibold text-lg truncate">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description || "No description"}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  {t.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.start_date}</span>}
                  <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> ${Number(t.planned_budget || 0).toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to="/trips/$tripId" params={{ tripId: t.id }} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Eye className="w-3 h-3 mr-1" /> View</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => nav({ to: "/trips/$tripId/edit", params: { tripId: t.id } })}>
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { if (confirm("Delete this trip?")) del.mutate(t.id); }}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
