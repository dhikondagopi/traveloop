import { analyzeBudget } from "@/lib/trip-generator";
import { Sparkles, ShieldCheck, AlertTriangle, TrendingDown } from "lucide-react";

interface Props {
  planned: number;
  items: { category: string; amount: number }[];
  days: number;
}

const HEALTH_COLORS: Record<string, string> = {
  excellent: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  good: "text-primary bg-primary/10 border-primary/30",
  warning: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  over: "text-destructive bg-destructive/10 border-destructive/30",
};

export function BudgetOptimizer(props: Props) {
  const ins = analyzeBudget(props);
  return (
    <div className="glass rounded-2xl p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Smart Budget Optimizer</h3>
            <p className="text-xs text-muted-foreground">AI insights tailored to your trip</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${HEALTH_COLORS[ins.health]}`}>
          {ins.health === "over" ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
          {ins.health === "excellent" && "Healthy budget"}
          {ins.health === "good" && "On track"}
          {ins.health === "warning" && "Watch your spend"}
          {ins.health === "over" && "Over budget"}
        </div>
      </div>

      {/* Health score gauge */}
      <div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-muted-foreground">Budget health score</span>
          <span className="text-3xl font-bold">{ins.healthScore}<span className="text-base text-muted-foreground">/100</span></span>
        </div>
        <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${ins.healthScore}%`,
              background: ins.health === "over"
                ? "linear-gradient(90deg, #ef4444, #f97316)"
                : ins.health === "warning"
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #14b8a6, #10b981)",
            }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-secondary/40 p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Planned</p>
          <p className="text-lg font-bold mt-0.5">${ins.planned.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Estimated</p>
          <p className="text-lg font-bold mt-0.5 text-primary">${ins.spent.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 p-3">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Avg / day</p>
          <p className="text-lg font-bold mt-0.5">${ins.perDay.toFixed(0)}</p>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-primary" /> Smart suggestions</h4>
        <ul className="space-y-2">
          {ins.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm rounded-xl bg-accent/40 px-3 py-2.5">
              <span className="text-primary mt-0.5">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
