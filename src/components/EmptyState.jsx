import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction, children }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        {Icon ? (
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        {actionLabel ? (
          <Button className="mt-5" asChild={!!actionTo} onClick={onAction}>
            {actionTo ? <a href={actionTo}>{actionLabel}</a> : actionLabel}
          </Button>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}