import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, HeadContent, Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { Chatbot } from "@/components/Chatbot";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Traveloop — Plan smarter. Travel better." },
      { name: "description", content: "Personalized travel planning. Build multi-city itineraries, track budgets, manage packing lists, and share your trips." },
      { property: "og:title", content: "Traveloop — Plan smarter. Travel better." },
      { property: "og:description", content: "Personalized travel planning. Build multi-city itineraries, track budgets, manage packing lists, and share your trips." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Traveloop — Plan smarter. Travel better." },
      { name: "twitter:description", content: "Personalized travel planning. Build multi-city itineraries, track budgets, manage packing lists, and share your trips." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e6e8ce9d-123c-4753-b848-e3bf6b4a4115" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e6e8ce9d-123c-4753-b848-e3bf6b4a4115" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">This destination doesn't exist on our map.</p>
        <a href="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-hero text-white font-medium">Go Home</a>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <a href="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-hero text-white font-medium">Go Home</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Chatbot />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
