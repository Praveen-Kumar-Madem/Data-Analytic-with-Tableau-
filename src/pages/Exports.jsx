import React, { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, History, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import RequireDataset from "@/components/RequireDataset";
import { useDataset } from "@/lib/datasetStore";
import { EXPORT_FILES, downloadDatasetCsv, fetchCustomers, fetchTransactions, generatePdfReport } from "@/lib/exporters";
import { formatDate, formatNumber } from "@/lib/format";

function ExportCard({ file, busy, onDownload }) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <p className="font-mono text-[12.5px] font-medium">{file.title}</p>
        </div>
        <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">{file.description}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => onDownload(file.key)} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          {busy ? "Preparing…" : "Download CSV"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ExportsView({ dataset }) {
  const [busyKey, setBusyKey] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const loadReports = async () => {
    const page = await base44.entities.Report.filter({ dataset_id: dataset.id }, { sort: "-created_date", limit: 10 }).catch(() => null);
    setReports(Array.isArray(page) ? page : page?.items || []);
  };

  useEffect(() => {
    loadReports();
  }, [dataset.id]);

  const log = (payload) =>
    base44.entities.Report.create({ dataset_id: dataset.id, dataset_name: dataset.name, ...payload }).then(loadReports).catch(() => {});

  const handleDownload = async (key) => {
    setBusyKey(key);
    setError("");
    try {
      let rowCount = 0;
      if (key === "cleaned_transactions") {
        const rows = await fetchTransactions(dataset.id);
        rowCount = downloadDatasetCsv(dataset, key, rows);
      } else if (key === "customer_rfm_analysis" || key === "customer_segments") {
        const rows = await fetchCustomers(dataset.id);
        rowCount = downloadDatasetCsv(dataset, key, rows);
      } else {
        rowCount = downloadDatasetCsv(dataset, key, null);
      }
      await log({ report_type: key, format: "csv", title: EXPORT_FILES.find((f) => f.key === key).title, row_count: rowCount });
    } catch (e) {
      setError(e?.message || "The export could not be generated.");
    } finally {
      setBusyKey("");
    }
  };

  const handlePdf = async () => {
    setPdfBusy(true);
    setError("");
    try {
      generatePdfReport(dataset);
      await log({ report_type: "business_report", format: "pdf", title: "RFM business report (PDF)", row_count: dataset.customer_count });
    } catch (e) {
      setError(e?.message || "The PDF report could not be generated.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Export & reports"
        description="Download the analysed datasets for Tableau, Excel or any other BI tool, and generate a complete PDF business report. Every figure matches the dashboard exactly because they come from the same stored results."
        actions={
          <Button onClick={handlePdf} disabled={pdfBusy}>
            {pdfBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Download PDF business report
          </Button>
        }
      />

      {error ? (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">{error}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {EXPORT_FILES.map((file) => (
          <ExportCard key={file.key} file={file} busy={busyKey === file.key} onDownload={handleDownload} />
        ))}
      </div>

      <Card className="mt-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">PDF business report contents</p>
          </div>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-[12.5px] leading-relaxed text-muted-foreground sm:grid-cols-2">
            <li>• Project title and dataset overview</li>
            <li>• Analysis reference date and period</li>
            <li>• Currency and conversion assumptions</li>
            <li>• Data-cleaning summary</li>
            <li>• RFM methodology and scoring rules</li>
            <li>• Customer segment definitions and distribution</li>
            <li>• Revenue distribution by segment</li>
            <li>• Key business insights</li>
            <li>• At-risk customer summary</li>
            <li>• Recommended business actions</li>
            <li>• Limitations and assumptions</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Recent generated exports</p>
          </div>
          {reports.length ? (
            <ul className="divide-y divide-border">
              {reports.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[12.5px]">
                  <span className="font-mono">{r.title}</span>
                  <span className="text-muted-foreground">
                    {r.format?.toUpperCase()} · {formatNumber(r.row_count)} rows · {formatDate((r.created_date || "").slice(0, 10))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">
              No exports generated yet for this dataset.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Exports() {
  const { active } = useDataset();
  return (
    <RequireDataset>
      <ExportsView dataset={active} />
    </RequireDataset>
  );
}