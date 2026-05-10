import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Traveloop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-gradient-hero overflow-hidden">
        <img src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200" alt="Travel" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Compass className="w-5 h-5" /></div>
            Traveloop
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Welcome back, traveler.</h2>
            <p className="mt-3 text-white/80 max-w-sm">Pick up right where you left off and keep crafting your next adventure.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center"><Compass className="w-5 h-5 text-white" /></div>
            <span className="text-gradient">Traveloop</span>
          </Link>
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="text-muted-foreground mt-2">Continue your journey.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-hero hover:opacity-90 shadow-glow">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            New to Traveloop? <Link to="/signup" className="text-primary font-medium">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
