import React, { useMemo, useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import RequireDataset from "@/components/RequireDataset";
import InsightCard from "@/components/insights/InsightCard";
import EmptyState from "@/components/EmptyState";
import { useDataset } from "@/lib/datasetStore";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All insights" },
  { key: "positive", label: "Opportunities" },
  { key: "warning", label: "Watch out" },
  { key: "critical", label: "Critical" },
  { key: "info", label: "Context" }
];

function InsightsView({ dataset }) {
  const insights = dataset.insights || [];
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => insights.reduce((acc, i) => ({ ...acc, [i.severity]: (acc[i.severity] || 0) + 1 }), {}),
    [insights]
  );

  const visible = filter === "all" ? insights : insights.filter((i) => i.severity === filter);

  return (
    <div>
      <PageHeader
        title="Business insights"
        description="Findings generated automatically from the computed results. Every insight carries the metric behind it, a business interpretation and a recommended action. Statistics are never invented."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            {insights.length} insights
          </span>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
              filter === f.key
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-[11px] opacity-70">{f.key === "all" ? insights.length : counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {visible.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="No insights in this category"
          description="Nothing met the threshold for this category in the current dataset. Insights are only produced when the computed values actually justify them."
        />
      )}

      <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3.5 text-[12px] leading-relaxed text-muted-foreground">
        Insights describe patterns in this uploaded dataset only. They are descriptive, not causal, and the recommended
        actions are suggested strategies based on the assigned segment.
      </div>
    </div>
  );
}

export default function Insights() {
  const { active } = useDataset();
  return (
    <RequireDataset>
      <InsightsView dataset={active} />
    </RequireDataset>
  );
}