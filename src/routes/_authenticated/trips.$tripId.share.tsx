import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { ArrowLeft, Share2, Copy, Globe, Twitter, Facebook, Link2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trips/$tripId/share")({
  head: () => ({ meta: [{ title: "Share Trip — Traveloop" }] }),
  component: SharePage,
});

function slugify() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

function SharePage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/share" });
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["share", tripId],
    queryFn: async () => {
      const { data } = await supabase.from("shared_trips").select("*").eq("trip_id", tripId).maybeSingle();
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("shared_trips").insert({ trip_id: tripId, slug: slugify(), is_public: true });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["share", tripId] }); toast.success("Public link created"); },
  });

  const toggle = useMutation({
    mutationFn: async (val: boolean) => {
      const { error } = await supabase.from("shared_trips").update({ is_public: val }).eq("trip_id", tripId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["share", tripId] }),
  });

  if (q.isLoading) return <Loading />;
  const share = q.data;
  const url = share ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${share.slug}` : "";

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
      <button onClick={() => nav({ to: "/trips/$tripId", params: { tripId } })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to trip</button>

      <div className="rounded-3xl glass shadow-card p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow mb-4"><Share2 className="w-8 h-8 text-white" /></div>
        <h1 className="text-2xl md:text-3xl font-bold">Share your trip</h1>
        <p className="text-muted-foreground mt-2">Generate a beautiful public page for friends and family.</p>

        {!share ? (
          <Button onClick={() => create.mutate()} className="mt-6 bg-gradient-hero shadow-glow h-12 px-8"><Globe className="w-4 h-4 mr-2" /> Create public link</Button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary border">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <input readOnly value={url} className="flex-1 bg-transparent outline-none text-sm" />
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <div className="flex justify-center gap-2">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm"><Twitter className="w-3 h-3 mr-1" /> Twitter</Button>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm"><Facebook className="w-3 h-3 mr-1" /> Facebook</Button>
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              Status: <span className={share.is_public ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>{share.is_public ? "Public" : "Disabled"}</span>
            </div>
            <Button variant="outline" onClick={() => toggle.mutate(!share.is_public)}>
              {share.is_public ? "Make private" : "Make public"}
            </Button>
            <div>
              <a href={url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">Preview public page →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
