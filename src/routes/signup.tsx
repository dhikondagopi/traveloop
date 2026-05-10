import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — Traveloop" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Account created — welcome!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center"><Compass className="w-5 h-5 text-white" /></div>
            <span className="text-gradient">Traveloop</span>
          </Link>
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-muted-foreground mt-2">Start planning trips you'll never forget.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Traveler" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-hero hover:opacity-90 shadow-glow">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative bg-gradient-hero overflow-hidden order-1 lg:order-2">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200" alt="Travel" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Compass className="w-5 h-5" /></div>
            Traveloop
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Your journey<br />starts here.</h2>
            <p className="mt-3 text-white/80 max-w-sm">Join thousands of travelers planning smarter trips with Traveloop.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
