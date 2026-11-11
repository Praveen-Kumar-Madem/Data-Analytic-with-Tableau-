import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PHASES = [
  "Creating the dataset record",
  "Storing transaction rows",
  "Cleaning and validating transactions",
  "Calculating RFM scores and segments",
  "Generating business insights"
];

function phaseIndex(label) {
  const idx = PHASES.findIndex((p) => label && p.toLowerCase().includes(label.toLowerCase().split(" ")[0]));
  return idx < 0 ? 0 : idx;
}

export default function RunProgress({ progress }) {
  const percent = progress?.percent ?? 0;
  const current = phaseIndex(progress?.phase);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm font-semibold">Running the analysis pipeline</p>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">{progress?.phase || "Starting…"}</p>
        <Progress value={percent} className="mt-4 h-2" />
        <p className="mt-2 text-[11px] text-muted-foreground">{percent}% complete</p>

        <ul className="mt-5 space-y-2">
          {PHASES.map((phase, idx) => (
            <li key={phase} className="flex items-center gap-2 text-[13px]">
              {idx < current || percent >= 100 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : idx === current ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <span className="h-4 w-4 rounded-full border border-border" />
              )}
              <span className={idx <= current ? "text-foreground" : "text-muted-foreground"}>{phase}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Keep this tab open. Large files can take a little while — every row is being classified individually so the data
          quality report is accurate.
        </p>
      </CardContent>
    </Card>
  );
}