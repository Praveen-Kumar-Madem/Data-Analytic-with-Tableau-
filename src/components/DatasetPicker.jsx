import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataset } from "@/lib/datasetStore";
import { cn } from "@/lib/utils";

export default function DatasetPicker() {
  const { datasets, activeId, select, active } = useDataset();

  if (!datasets.length) {
    return (
      <span className="hidden rounded-md border border-dashed border-border px-3 py-1.5 text-[12px] text-muted-foreground sm:block">
        No datasets yet
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {active?.is_sample ? (
        <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 md:inline-block">
          Sample data
        </span>
      ) : null}
      <Select value={activeId} onValueChange={select}>
        <SelectTrigger className="h-9 w-[200px] text-[13px] sm:w-[240px]">
          <SelectValue placeholder="Select a dataset" />
        </SelectTrigger>
        <SelectContent>
          {datasets.map((d) => (
            <SelectItem key={d.id} value={d.id} className="text-[13px]">
              <span className="flex items-center gap-2">
                <span className="truncate">{d.name}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    d.status === "ready" && "bg-emerald-100 text-emerald-700",
                    d.status === "failed" && "bg-red-100 text-red-700",
                    d.status !== "ready" && d.status !== "failed" && "bg-slate-100 text-slate-600"
                  )}
                >
                  {d.status}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}