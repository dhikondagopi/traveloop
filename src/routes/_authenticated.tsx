import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppNav } from "@/components/AppNav";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AppNav />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
