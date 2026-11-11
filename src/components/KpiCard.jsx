import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function KpiCard({ label, value, hint, icon: Icon, tone = "default", alert = false }) {
  const tones = {
    default: "text-primary bg-primary/10",
    positive: "text-emerald-700 bg-emerald-100",
    warning: "text-amber-700 bg-amber-100",
    danger: "text-red-700 bg-red-100"
  };

  return (
    <Card className={cn(alert && "border-amber-300 bg-amber-50/40")}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          {Icon ? (
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-md", tones[tone])}>
              <Icon className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-[22px] font-semibold leading-tight tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}