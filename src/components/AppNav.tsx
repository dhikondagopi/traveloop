import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Compass, LayoutDashboard, Map, Building2, Sparkles, User, LogOut, Menu, X, Wand2 } from "lucide-react";
import { useState } from "react";

export function AppNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/trips", label: "My Trips", icon: Map },
    { to: "/trips/generate", label: "AI Plan", icon: Wand2 },
    { to: "/cities", label: "Cities", icon: Building2 },
    { to: "/activities", label: "Activities", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-gradient">Traveloop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition flex items-center gap-2"
              activeProps={{ className: "px-4 py-2 rounded-xl text-sm font-medium text-primary bg-accent flex items-center gap-2" }}
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="max-w-[140px] truncate">{user?.email}</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border/40 px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm">
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm">
            <User className="w-4 h-4" /> Profile
          </Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-destructive">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
