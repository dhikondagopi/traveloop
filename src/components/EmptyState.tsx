import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6 rounded-3xl glass shadow-soft animate-fade-up">
      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-ocean flex items-center justify-center shadow-glow">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
}
