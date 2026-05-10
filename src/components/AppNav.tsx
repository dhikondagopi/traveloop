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
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-50 glass border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient">Traveloop</span>
          </Link>
          <button className="p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {open && (
          <div className="glass border-t border-border/40 px-4 py-3 space-y-1">
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

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border/40 glass">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl">
            <div className="w-10 h-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-gradient text-2xl tracking-tight">Traveloop</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
              activeProps={{ className: "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-primary bg-primary/10 shadow-sm" }}
            >
              <l.icon className="w-5 h-5" /> {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/40 space-y-2">
           <Link to="/profile">
             <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-primary font-semibold">
               <User className="w-5 h-5" />
               <span className="truncate">{user?.email}</span>
             </Button>
           </Link>
           <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 font-semibold" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
             <LogOut className="w-5 h-5" /> Sign Out
           </Button>
        </div>
      </aside>
    </>
  );
}
