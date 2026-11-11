import React, { useEffect, useState } from "react";
import { AlertCircle, Database, Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader, { InfoCard } from "@/components/PageHeader";
import { useDataset } from "@/lib/datasetStore";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEFAULT_SEGMENT_CONFIG = {
  scoreScale: 5,
  lostInactiveDays: 180,
  atRiskInactiveDays: 90,
  bigSpenderMonetaryScore: 4
};

const DEFAULT_CLEANING_CONFIG = {
  duplicateHandling: "keep_first",
  returnsHandling: "net",
  cancelledHandling: "exclude",
  cancelledInvoicePrefix: "C",
  allowZeroPrice: true
};

export default function Settings() {
  const { datasets, active, refresh, select } = useDataset();
  const [cleaning, setCleaning] = useState(DEFAULT_CLEANING_CONFIG);
  const [segment, setSegment] = useState(DEFAULT_SEGMENT_CONFIG);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!active) return;
    setCleaning({ ...DEFAULT_CLEANING_CONFIG, ...(active.cleaning_config || {}) });
    setSegment({ ...DEFAULT_SEGMENT_CONFIG, ...(active.segment_config || {}) });
    setMessage("");
    setError("");
  }, [active?.id]);

  const rerun = async () => {
    if (!active) return;
    setBusy("run");
    setError("");
    setMessage("");
    try {
      const response = await base44.functions.invoke("runPipeline", {
        dataset_id: active.id,
        cleaning,
        segment,
        reference_date: active.reference_date
      });
      if (response?.data?.error) throw new Error(response.data.error);
      await refresh();
      setMessage("Analysis recalculated with the new configuration. All results and exports now reflect these rules.");
    } catch (e) {
      setError(e?.message || "The analysis could not be recalculated.");
    } finally {
      setBusy("");
    }
  };

  const deleteDataset = async (dataset) => {
    setBusy(`delete-${dataset.id}`);
    setError("");
    try {
      await base44.entities.CustomerRfm.deleteMany({ dataset_id: dataset.id });
      await base44.entities.Transaction.deleteMany({ dataset_id: dataset.id });
      await base44.entities.Report.deleteMany({ dataset_id: dataset.id });
      await base44.entities.Dataset.delete(dataset.id);
      if (active?.id === dataset.id) select("");
      await refresh();
      setMessage(`"${dataset.name}" and all of its transaction and customer records were deleted.`);
    } catch (e) {
      setError(e?.message || "The dataset could not be deleted.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Tune the segmentation thresholds and cleaning rules, recalculate without re-uploading, and manage the datasets in this workspace."
      />

      {error ? (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      {message ? (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">{message}</div>
      ) : null}

      {!active ? (
        <Card className="border-dashed">
          <CardContent className="px-6 py-14 text-center text-[13px] text-muted-foreground">
            Upload a dataset to configure the analysis.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Segmentation thresholds</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  These control the rule-based segmentation. Recalling the analysis applies them to the stored transactions —
                  no re-upload is needed.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">RFM score scale</Label>
                    <Select value={String(segment.scoreScale)} onValueChange={(v) => setSegment((s) => ({ ...s, scoreScale: Number(v) }))}>
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5].map((v) => (
                          <SelectItem key={v} value={String(v)} className="text-[13px]">
                            {v}-point scale
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Lost after (days inactive)</Label>
                    <Input
                      type="number"
                      min="30"
                      value={segment.lostInactiveDays}
                      onChange={(e) => setSegment((s) => ({ ...s, lostInactiveDays: Number(e.target.value) }))}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">At-risk window (days)</Label>
                    <Input
                      type="number"
                      min="15"
                      value={segment.atRiskInactiveDays}
                      onChange={(e) => setSegment((s) => ({ ...s, atRiskInactiveDays: Number(e.target.value) }))}
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Big Spender monetary score</Label>
                    <Input
                      type="number"
                      min="1"
                      max={segment.scoreScale}
                      value={segment.bigSpenderMonetaryScore}
                      onChange={(e) => setSegment((s) => ({ ...s, bigSpenderMonetaryScore: Number(e.target.value) }))}
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Cleaning rules</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Changing a rule reclassifies every stored row. Excluded rows are always kept with a reason.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Returns and negative quantities</Label>
                    <Select value={cleaning.returnsHandling} onValueChange={(v) => setCleaning((c) => ({ ...c, returnsHandling: v }))}>
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net" className="text-[13px]">
                          Net against sales (affects monetary value)
                        </SelectItem>
                        <SelectItem value="exclude" className="text-[13px]">
                          Exclude from RFM, report separately
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Duplicate transactions</Label>
                    <Select value={cleaning.duplicateHandling} onValueChange={(v) => setCleaning((c) => ({ ...c, duplicateHandling: v }))}>
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep_first" className="text-[13px]">
                          Keep the first occurrence
                        </SelectItem>
                        <SelectItem value="keep_all" className="text-[13px]">
                          Keep every line
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Cancelled invoice prefix</Label>
                    <Input
                      value={cleaning.cancelledInvoicePrefix}
                      onChange={(e) => setCleaning((c) => ({ ...c, cancelledInvoicePrefix: e.target.value }))}
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <Button onClick={rerun} disabled={busy === "run"}>
                    {busy === "run" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Recalculate analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCleaning(DEFAULT_CLEANING_CONFIG);
                      setSegment(DEFAULT_SEGMENT_CONFIG);
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Reset to defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <InfoCard title="Active dataset" className="lg:col-span-2">
              <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="truncate font-medium">{active.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">{active.status}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Source currency</dt>
                  <dd className="font-medium">{active.source_currency || "INR"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Reporting currency</dt>
                  <dd className="font-medium">INR (₹)</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Conversion rate</dt>
                  <dd className="font-medium tabular-nums">{active.conversion_rate || 1}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Conversion date</dt>
                  <dd className="font-medium">{active.conversion_date || "not applied"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Reference date</dt>
                  <dd className="font-medium">{formatDate(active.reference_date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Rows / customers</dt>
                  <dd className="font-medium tabular-nums">
                    {formatNumber(active.raw_row_count)} / {formatNumber(active.customer_count)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{active.conversion_note}</p>
            </InfoCard>

            <InfoCard title="Data retention">
              <p className="leading-relaxed">
                Transaction rows, customer RFM records and export history are stored in this workspace and are only visible to
                you (and workspace administrators). Deleting a dataset removes its transactions, customer records and export
                history immediately. The original uploaded file is stored privately and can be replaced by re-uploading.
              </p>
            </InfoCard>
          </div>

          <Card className="mt-5">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Database className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Datasets in this workspace</p>
              </div>
              <ul className="divide-y divide-border">
                {datasets.map((d) => (
                  <li key={d.id} className={cn("flex flex-wrap items-center justify-between gap-3 px-5 py-3.5", active.id === d.id && "bg-muted/40")}>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">
                        {d.name}
                        {d.is_sample ? <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">Sample</span> : null}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatNumber(d.raw_row_count)} rows · {formatNumber(d.customer_count)} customers · {d.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {active.id !== d.id ? (
                        <Button variant="outline" size="sm" onClick={() => select(d.id)}>
                          Make active
                        </Button>
                      ) : (
                        <span className="text-[11px] font-medium text-primary">Active</span>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={busy === `delete-${d.id}`}>
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{d.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes the dataset together with its {formatNumber(d.raw_row_count)} transaction
                              rows, {formatNumber(d.customer_count)} customer RFM records and export history. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDataset(d)}>Delete dataset</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}