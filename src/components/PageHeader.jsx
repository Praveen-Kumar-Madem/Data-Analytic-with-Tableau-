import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function PageHeader({ title, description, actions, badge, aside }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {badge}
        </div>
        {description ? <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{description}</p> : null}
        {aside}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function InfoCard({ title, children, className = "" }) {
  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <div className="mt-2 text-[13px] leading-relaxed">{children}</div>
      </CardContent>
    </Card>
  );
}