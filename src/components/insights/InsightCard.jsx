import React from "react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STYLES = {
  positive: { icon: CheckCircle2, ring: "border-emerald-200 bg-emerald-50/50", chip: "bg-emerald-100 text-emerald-800" },
  warning: { icon: AlertTriangle, ring: "border-amber-200 bg-amber-50/50", chip: "bg-amber-100 text-amber-800" },
  critical: { icon: TrendingDown, ring: "border-red-200 bg-red-50/50", chip: "bg-red-100 text-red-800" },
  info: { icon: Info, ring: "border-border bg-card", chip: "bg-muted text-muted-foreground" }
};

export default function InsightCard({ insight, compact = false }) {
  const style = STYLES[insight.severity] || STYLES.info;
  const Icon = style.icon;

  return (
    <Card className={cn(style.ring)}>
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start gap-3">
          <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md", style.chip)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("font-semibold tracking-tight", compact ? "text-[13px]" : "text-sm")}>{insight.title}</p>
            <p className={cn("mt-1.5 leading-relaxed text-muted-foreground", compact ? "text-[12px]" : "text-[13px]")}>{insight.finding}</p>

            <p className="mt-2 rounded-md bg-background/70 px-2.5 py-1.5 text-[11px] font-medium tabular-nums text-foreground/80">
              {insight.metric}
            </p>

            {!compact ? (
              <>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Business interpretation</p>
                  <p className="mt-1 text-[13px] leading-relaxed">{insight.interpretation}</p>
                </div>
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Lightbulb className="h-3 w-3" />
                    Recommended action
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed">{insight.action}</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}