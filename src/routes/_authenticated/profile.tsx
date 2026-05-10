import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/Loading";
import { User, Heart, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Traveloop" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const q = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => { if (q.data) setForm(q.data); }, [q.data]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: form.name, photo_url: form.photo_url, language: form.language,
    }).eq("id", user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  if (q.isLoading || !form) return <Loading />;

  const initials = (form.name || form.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your Traveloop account.</p>
      </div>

      <div className="rounded-3xl glass shadow-card p-8">
        <div className="flex items-center gap-4 mb-6">
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-glow" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-white text-2xl font-bold shadow-glow">{initials}</div>
          )}
          <div>
            <p className="font-semibold text-lg">{form.name || "Traveler"}</p>
            <p className="text-sm text-muted-foreground">{form.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={form.email ?? ""} disabled /></div>
          <div className="space-y-2"><Label>Photo URL</Label><Input value={form.photo_url ?? ""} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Language</Label>
            <select value={form.language ?? "en"} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full h-10 px-3 rounded-md border bg-background">
              <option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="de">Deutsch</option><option value="ja">日本語</option>
            </select>
          </div>
          <Button onClick={save} disabled={saving} className="bg-gradient-hero shadow-glow">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}</Button>
        </div>
      </div>

      <div className="rounded-3xl glass shadow-card p-8">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-3"><Heart className="w-5 h-5 text-primary" /> Saved Destinations</h2>
        <p className="text-sm text-muted-foreground">Coming soon — bookmark cities for easy access.</p>
      </div>

      <div className="rounded-3xl bg-destructive/5 border border-destructive/30 p-8">
        <h2 className="font-semibold text-destructive flex items-center gap-2 mb-2"><Trash2 className="w-4 h-4" /> Danger zone</h2>
        <p className="text-sm text-muted-foreground mb-4">Permanently sign out or close your account.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => { await signOut(); nav({ to: "/" }); }}>Sign Out</Button>
          <Button variant="destructive" onClick={() => toast.info("Account deletion is coming soon. Contact support.")}>Delete Account</Button>
        </div>
      </div>
    </div>
  );
}
