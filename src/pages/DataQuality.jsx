import React, { useState } from "react";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader, { InfoCard } from "@/components/PageHeader";
import RequireDataset from "@/components/RequireDataset";
import ExcludedRowsTable from "@/components/quality/ExcludedRowsTable";
import { useDataset } from "@/lib/datasetStore";
import { downloadDatasetCsv, fetchTransactions } from "@/lib/exporters";
import { formatDate, formatINR, formatNumber, formatPercent } from "@/lib/format";

function Metric({ label, value, hint, tone = "default" }) {
  const tones = {
    default: "text-foreground",
    warning: "text-amber-700",
    danger: "text-red-700",
    positive: "text-emerald-700"
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-lg font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function DataQualityView({ dataset }) {
  const q = dataset.quality || {};
  const rules = dataset.cleaning_config || {};
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const rows = await fetchTransactions(dataset.id);
      downloadDatasetCsv(dataset, "cleaned_transactions", rows);
    } finally {
      setBusy(false);
    }
  };

  const excludedShare = q.totalRows ? (q.excludedRows / q.totalRows) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Data cleaning report"
        description="Exactly what the pipeline did to your file: what was accepted, what was quarantined, and why. No row is ever deleted."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck className="h-3 w-3" />
            Pipeline complete
          </span>
        }
        actions={
          <Button onClick={download} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download cleaned transactions
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total rows uploaded" value={formatNumber(q.totalRows)} hint="Every row from your file" />
        <Metric label="Valid rows" value={formatNumber(q.validRows)} hint="Accepted purchase lines" tone="positive" />
        <Metric label="Rows excluded from RFM" value={formatNumber(q.excludedRows)} hint={`${formatPercent(excludedShare)} of uploaded rows`} tone={q.excludedRows ? "warning" : "default"} />
        <Metric label="Duplicate rows" value={formatNumber(q.duplicateRows)} hint="Identical lines quarantined" tone={q.duplicateRows ? "warning" : "default"} />
        <Metric label="Missing customer IDs" value={formatNumber(q.missingCustomerRows)} hint="Cannot be attributed to a customer" tone={q.missingCustomerRows ? "warning" : "default"} />
        <Metric label="Invalid dates" value={formatNumber(q.invalidDateRows)} hint="Unparseable transaction dates" tone={q.invalidDateRows ? "warning" : "default"} />
        <Metric label="Invalid quantities" value={formatNumber(q.invalidQuantityRows)} hint="Missing, non-numeric or zero" tone={q.invalidQuantityRows ? "warning" : "default"} />
        <Metric label="Invalid or negative prices" value={formatNumber(q.invalidPriceRows)} hint="Not a legitimate selling price" tone={q.invalidPriceRows ? "warning" : "default"} />
        <Metric label="Cancelled transactions" value={formatNumber(q.cancelledRows)} hint={`Invoices starting with "${rules.cancelledInvoicePrefix || "C"}"`} tone={q.cancelledRows ? "warning" : "default"} />
        <Metric label="Returned transactions" value={formatNumber(q.returnRows)} hint="Negative quantity lines" tone={q.returnRows ? "warning" : "default"} />
        <Metric label="Gross sales" value={formatINR(q.grossRevenue)} hint="Before returns" />
        <Metric label="Returns value" value={formatINR(q.returnsValue)} hint="Credited back to customers" tone={q.returnsValue ? "warning" : "default"} />
        <Metric label="Net revenue" value={formatINR(q.netRevenue)} hint="Gross sales − returns" tone="positive" />
        <Metric label="Customers scored" value={formatNumber(q.uniqueCustomers)} hint="Customers with a qualifying purchase" />
        <Metric label="Qualifying invoices" value={formatNumber(q.uniqueInvoices)} hint="Distinct invoices counted for frequency" />
        <Metric label="Analysis period" value={`${formatDate(q.dateStart)} →`} hint={formatDate(q.dateEnd)} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <InfoCard title="Rules applied to this dataset" className="lg:col-span-2">
          <ul className="space-y-2.5">
            <li>
              <span className="font-medium">Duplicates:</span>{" "}
              {rules.duplicateHandling === "keep_all"
                ? "every line kept — repeated identical lines treated as separate sales."
                : "the first occurrence is kept and later identical lines are quarantined so revenue is never double counted."}
            </li>
            <li>
              <span className="font-medium">Returns and negative quantities:</span>{" "}
              {rules.returnsHandling === "exclude"
                ? "excluded from RFM entirely and reported separately."
                : "netted against sales, so monetary value reflects net revenue."}
            </li>
            <li>
              <span className="font-medium">Cancellations:</span> invoices starting with “{rules.cancelledInvoicePrefix || "C"}” are
              treated as cancelled and excluded from both sales and RFM.
            </li>
            <li>
              <span className="font-medium">Missing customer ID:</span> classified and excluded from RFM because the row cannot be
              attributed to a customer.
            </li>
            <li>
              <span className="font-medium">Zero-price lines:</span> {rules.allowZeroPrice === false ? "rejected as invalid prices." : "accepted at zero value (common for free or promotional items)."}
            </li>
            <li>
              <span className="font-medium">Nothing is deleted:</span> every excluded row keeps its classification and reason and is
              downloadable in full.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Revenue definition used">
          <p className="leading-relaxed">
            Revenue per line = Quantity × Unit Price. Gross sales sum every positive accepted line; returns are summed
            separately and subtracted to give net revenue. Cancelled and duplicate lines contribute no revenue.
          </p>
          <dl className="mt-3 space-y-1.5 text-[12px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Source currency</dt>
              <dd className="font-medium">{dataset.source_currency || "INR"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Reporting currency</dt>
              <dd className="font-medium">INR (₹)</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Conversion rate</dt>
              <dd className="font-medium">{dataset.conversion_rate || 1}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Conversion date</dt>
              <dd className="font-medium">{dataset.conversion_date || "not applied"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{dataset.conversion_note}</p>
        </InfoCard>
      </div>

      {dataset.warnings?.length ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">Calculation notes</p>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-amber-900">
            {dataset.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        <ExcludedRowsTable datasetId={dataset.id} />
      </div>
    </div>
  );
}

export default function DataQuality() {
  const { active } = useDataset();
  return (
    <RequireDataset>
      <DataQualityView dataset={active} />
    </RequireDataset>
  );
}