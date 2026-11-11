import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import UploadStepSource from "@/components/upload/UploadStepSource";
import MappingStep from "@/components/upload/MappingStep";
import ConfigureStep from "@/components/upload/ConfigureStep";
import RunProgress from "@/components/upload/RunProgress";
import { parseTabularFile } from "@/lib/csv";
import { autoMapColumns, FIELD_DEFS } from "@/lib/constants";
import { buildMappedRows, ingestRows, runPipeline, validateMapping } from "@/lib/ingest";
import { useDataset } from "@/lib/datasetStore";
import { cn } from "@/lib/utils";

const STEPS = ["Source data", "Preview & column mapping", "Currency & rules", "Run analysis"];

const DEFAULT_CONFIG = {
  sourceCurrency: "INR",
  conversionRate: "",
  conversionDate: "",
  conversionNote: "",
  returnsHandling: "net",
  duplicateHandling: "keep_first",
  cancelledInvoicePrefix: "C",
  referenceMode: "auto",
  referenceDate: ""
};

const DEFAULT_SEGMENT_CONFIG = {
  scoreScale: 5,
  lostInactiveDays: 180,
  atRiskInactiveDays: 90,
  bigSpenderMonetaryScore: 4
};

export default function UploadDataset() {
  const navigate = useNavigate();
  const { refresh, select, datasets } = useDataset();
  const [step, setStep] = useState(0);
  const [source, setSource] = useState({ name: "", type: "", isSample: false, headers: [], rows: [] });
  const [mapping, setMapping] = useState({});
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const mappedPreview = useMemo(
    () => FIELD_DEFS.filter((f) => mapping[f.key]).length,
    [mapping]
  );

  const applySource = (next) => {
    setSource(next);
    setMapping(autoMapColumns(next.headers));
    setError("");
    setStep(1);
  };

  const handleCsvLoaded = (text, fileName) => {
    setBusy(true);
    try {
      const { headers, rows } = parseTabularFile(text);
      if (!headers.length || !rows.length) {
        setError("The file appears to be empty or has no detectable header row.");
        return;
      }
      applySource({ name: fileName, type: "csv", isSample: false, headers, rows });
    } catch (e) {
      setError(e.message || "The CSV file could not be parsed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSampleLoaded = (sample) => {
    const headers = sample.columns;
    const rows = sample.rows.map((row) => sample.headerRow(row).map((c) => (c === null || c === undefined ? "" : String(c))));
    applySource({
      name: sample.meta.label,
      type: "sample",
      isSample: true,
      headers,
      rows
    });
  };

  const handleExcelFile = async (file) => {
    setBusy(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 900 });
      const response = await base44.functions.invoke("readSpreadsheet", { file_url: signed_url });
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      const headers = data.headers || [];
      const rawRows = data.rows || [];
      if (!headers.length || !rawRows.length) throw new Error("No tabular data was found in the spreadsheet.");
      const rows = rawRows.map((r) => headers.map((h) => (r[h] === null || r[h] === undefined ? "" : String(r[h]))));
      applySource({ name: file.name, type: "excel", isSample: false, headers, rows });
    } catch (e) {
      setError(
        `${e.message || "The spreadsheet could not be read."} If this keeps happening, open the file in Excel and save it as CSV, then upload the CSV.`
      );
    } finally {
      setBusy(false);
    }
  };

  const setConfigValue = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  const handleRun = async () => {
    const missing = validateMapping(mapping);
    if (missing.length) {
      setError(`Map these required fields before running: ${missing.join(", ")}.`);
      return;
    }
    if (config.sourceCurrency !== "INR" && !(Number(config.conversionRate) > 0)) {
      setError("Enter the explicit conversion rate to INR — the platform will not assume one.");
      return;
    }

    setError("");
    setBusy(true);
    setProgress({ phase: "Creating the dataset record", percent: 3 });
    let datasetId = null;

    try {
      const created = await base44.entities.Dataset.create({
        name: source.isSample ? "Sample dataset — synthetic e-commerce transactions" : source.name || "Uploaded dataset",
        description: source.isSample
          ? "Generated sample data supplied with the platform for demonstration. Not real business performance."
          : `Uploaded from ${source.name}`,
        source_filename: source.name,
        file_type: source.type,
        is_sample: !!source.isSample,
        status: "ingesting",
        source_currency: config.sourceCurrency,
        reporting_currency: "INR",
        conversion_rate: config.sourceCurrency === "INR" ? 1 : Number(config.conversionRate),
        conversion_date: config.conversionDate || "",
        conversion_note:
          config.sourceCurrency === "INR"
            ? "Source and reporting currency are both INR — no conversion applied."
            : config.conversionNote || "User-supplied conversion rate",
        column_mapping: mapping,
        cleaning_config: {
          duplicateHandling: config.duplicateHandling,
          returnsHandling: config.returnsHandling,
          cancelledHandling: "exclude",
          cancelledInvoicePrefix: config.cancelledInvoicePrefix || "C",
          allowZeroPrice: true
        },
        segment_config: DEFAULT_SEGMENT_CONFIG,
        reference_date: config.referenceMode === "manual" ? config.referenceDate : ""
      });
      datasetId = created.id;

      setProgress({ phase: "Storing transaction rows", percent: 6 });
      const mappedRows = buildMappedRows(source.rows, source.headers, mapping);
      await ingestRows({
        datasetId,
        mappedRows,
        onProgress: (percent) => setProgress({ phase: "Storing transaction rows", percent: Math.max(6, percent) })
      });

      setProgress({ phase: "Cleaning and validating transactions", percent: 95 });
      await runPipeline({
        datasetId,
        referenceDate: config.referenceMode === "manual" ? config.referenceDate : ""
      });

      setProgress({ phase: "Calculating RFM scores and segments", percent: 98 });
      await refresh();
      select(datasetId);
      setProgress({ phase: "Generating business insights", percent: 100 });
      navigate("/data-quality");
    } catch (e) {
      if (datasetId) {
        try {
          await base44.entities.Dataset.update(datasetId, {
            status: "failed",
            error_message: e.message || "The analysis pipeline failed."
          });
          await refresh();
          select(datasetId);
        } catch (inner) {
          /* the original failure is the useful message */
        }
      }
      setError(e.message || "The analysis pipeline failed.");
      setProgress(null);
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Upload dataset"
        description="Bring in a transaction export, map its columns, confirm the currency and cleaning rules, then run the full RFM analysis pipeline."
        badge={
          datasets.length ? (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {datasets.length} dataset{datasets.length === 1 ? "" : "s"} in workspace
            </span>
          ) : null
        }
      />

      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((label, idx) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px]",
              idx === step ? "border-primary bg-primary/10 font-medium text-primary" : "border-border text-muted-foreground"
            )}
          >
            <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold", idx === step ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {idx + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {progress ? (
        <RunProgress progress={progress} />
      ) : (
        <div className="space-y-5">
          {step === 0 ? (
            <UploadStepSource
              onCsvLoaded={handleCsvLoaded}
              onSampleLoaded={handleSampleLoaded}
              onExcelFile={handleExcelFile}
              busy={busy}
              error={error}
            />
          ) : null}

          {step === 1 ? (
            <MappingStep headers={source.headers} rows={source.rows} mapping={mapping} onChange={(key, value) => setMapping((m) => ({ ...m, [key]: value }))} />
          ) : null}

          {step === 2 ? <ConfigureStep config={config} onChange={setConfigValue} /> : null}

          {step === 3 ? (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Ready to run</p>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Source</dt>
                    <dd className="mt-1 truncate text-[13px] font-medium">{source.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Rows</dt>
                    <dd className="mt-1 text-[13px] font-medium">{source.rows.length.toLocaleString("en-IN")}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Fields mapped</dt>
                    <dd className="mt-1 text-[13px] font-medium">
                      {mappedPreview} of {FIELD_DEFS.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Currency</dt>
                    <dd className="mt-1 text-[13px] font-medium">
                      {config.sourceCurrency} → INR{config.sourceCurrency !== "INR" ? ` @ ${config.conversionRate}` : ""}
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 rounded-md bg-muted/60 px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
                  Running the pipeline replaces any previous results for this dataset. Earlier datasets are left untouched.
                  Rows are classified individually and nothing is deleted.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {error && step !== 0 ? (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {step > 0 ? (
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={busy}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => {
                    if (step === 1 && validateMapping(mapping).length) {
                      setError(`Map these required fields first: ${validateMapping(mapping).join(", ")}.`);
                      return;
                    }
                    setError("");
                    setStep((s) => s + 1);
                  }}
                  disabled={busy}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleRun} disabled={busy}>
                  <Play className="mr-2 h-4 w-4" />
                  Run cleaning and RFM analysis
                </Button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}