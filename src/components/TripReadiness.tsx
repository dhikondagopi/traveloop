import { calcReadiness, type ReadinessInput } from "@/lib/trip-generator";
import { Check, Circle, Trophy } from "lucide-react";

export function TripReadiness(props: ReadinessInput) {
  const { score, completed, missing } = calcReadiness(props);
  const tone = score >= 85 ? "emerald" : score >= 60 ? "primary" : "amber";
  const ring =
    score >= 85
      ? "from-emerald-400 to-teal-500"
      : score >= 60
        ? "from-primary to-teal"
        : "from-amber-400 to-orange-500";

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${ring} p-1 shadow-glow shrink-0`}>
          <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none">{score}%</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">ready</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-semibold flex items-center gap-2"><Trophy className={`w-4 h-4 text-${tone}-500`} /> Trip Readiness</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {score === 100
              ? "You're 100% ready — bon voyage!"
              : `${completed.length} of ${completed.length + missing.length} setup items complete.`}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-5">
        {completed.map((c) => (
          <div key={c.key} className="flex items-center gap-2 text-sm rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-2">
            <Check className="w-4 h-4" /> {c.label}
          </div>
        ))}
        {missing.map((m) => (
          <div key={m.key} className="flex items-center gap-2 text-sm rounded-lg bg-secondary/60 text-muted-foreground px-3 py-2">
            <Circle className="w-4 h-4" /> {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}
