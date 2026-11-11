import React, { useState } from "react";
import { AlertCircle, CheckCircle2, FlaskConical, Loader2, Play, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Tests() {
  const [state, setState] = useState({ status: "idle", data: null, error: "" });
  const [ranAt, setRanAt] = useState(null);

  const run = async () => {
    setState({ status: "running", data: null, error: "" });
    try {
      const response = await base44.functions.invoke("runSelfTests", {});
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      setState({ status: "done", data, error: "" });
      setRanAt(new Date());
    } catch (e) {
      setState({ status: "error", data: null, error: e?.message || "The test suite could not run." });
    }
  };

  const grouped = (state.data?.results || []).reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  const failures = (state.data?.results || []).filter((r) => !r.passed);

  return (
    <div>
      <PageHeader
        title="Test suite"
        description="A deterministic reference dataset with hand-verified expected values is run through the real cleaning, RFM, scoring, segmentation, aggregation and INR-formatting logic. The integration tests also exercise the live pipeline end to end."
        badge={
          ranAt ? (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              Last run {ranAt.toLocaleTimeString("en-IN")}
            </span>
          ) : null
        }
        actions={
          <Button onClick={run} disabled={state.status === "running"}>
            {state.status === "running" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {state.status === "running" ? "Running tests…" : "Run the test suite"}
          </Button>
        }
      />

      {state.status === "idle" ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FlaskConical className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold tracking-tight">Tests have not been run in this session</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              The suite covers data upload, column mapping, cleaning, duplicate detection, cancelled orders, returns, INR
              calculations, RFM calculation, quantile scoring, segmentation, dashboard aggregation, customer filtering,
              export generation, invalid dataset handling and API error handling.
            </p>
            <Button className="mt-5" onClick={run}>
              <Play className="mr-2 h-4 w-4" />
              Run the test suite
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "error" ? (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {state.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className={cn(
                "rounded-lg border p-5",
                state.data.failed === 0 ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Overall result</p>
              <p className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
                {state.data.failed === 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    All checks passed
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    {state.data.failed} failing
                  </>
                )}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Assertions run</p>
              <p className="mt-1.5 text-lg font-semibold tabular-nums">{state.data.total}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Passed</p>
              <p className="mt-1.5 text-lg font-semibold tabular-nums text-emerald-700">{state.data.passed}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Failed</p>
              <p className="mt-1.5 text-lg font-semibold tabular-nums text-red-700">{state.data.failed}</p>
            </div>
          </div>

          {failures.length ? (
            <Card className="mt-5 border-red-200">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-red-800">Failing assertions</p>
                <ul className="mt-3 space-y-2 text-[12.5px]">
                  {failures.map((f) => (
                    <li key={f.name} className="rounded-md bg-red-50 px-3 py-2">
                      <p className="font-medium">{f.name}</p>
                      <p className="mt-0.5 font-mono text-[11.5px] text-red-900">
                        expected {JSON.stringify(f.expected)} · received {JSON.stringify(f.actual)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <div className="mt-5 space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <Card key={category}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                    <p className="text-sm font-semibold">{category}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {items.filter((i) => i.passed).length}/{items.length} passed
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {items.map((r) => (
                      <li key={r.name} className="flex items-start gap-3 px-5 py-2.5">
                        {r.passed ? (
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px]">{r.name}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                            expected {JSON.stringify(r.expected)} · received {JSON.stringify(r.actual)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3.5 text-[12px] leading-relaxed text-muted-foreground">
            The integration tests create a temporary dataset, run the real ingestion and pipeline functions against it, assert
            the persisted results, then delete everything they created — including on failure. Nothing from the test run
            remains in your workspace.
          </p>
        </>
      ) : null}
    </div>
  );
}