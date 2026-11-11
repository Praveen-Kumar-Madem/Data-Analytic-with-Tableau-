import React from "react";
import { Activity, CalendarClock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader, { InfoCard } from "@/components/PageHeader";
import RequireDataset from "@/components/RequireDataset";
import RfmScoreChart from "@/components/charts/RfmScoreChart";
import DistributionHistogram from "@/components/charts/DistributionHistogram";
import { useDataset } from "@/lib/datasetStore";
import { formatDate, formatDecimal, formatINR, formatNumber } from "@/lib/format";

const FORMULAS = [
  {
    letter: "R",
    title: "Recency",
    formula: "Reference date − last qualifying purchase date",
    detail:
      "A lower number of days means a more recent purchase, so the most recent customers receive the highest score. Returns and cancelled orders never set a last-purchase date."
  },
  {
    letter: "F",
    title: "Frequency",
    formula: "Count of distinct qualifying invoices",
    detail:
      "An invoice containing several products still counts once. Only invoices with at least one positive purchase line count, so a credit note never adds an order."
  },
  {
    letter: "M",
    title: "Monetary",
    formula: "Σ (Quantity × Unit Price) over qualifying lines",
    detail:
      "Monetary value is net of returns when returns are netted, and always uses quantity × unit price — never a sum of unit prices. Gross sales and returned value are also reported separately."
  }
];

function RfmView({ dataset }) {
  const summary = dataset.summary || {};
  const kpis = summary.kpis || {};
  const scale = dataset.segment_config?.scoreScale || 5;

  return (
    <div>
      <PageHeader
        title="RFM analysis"
        description="Recency, Frequency and Monetary values calculated per customer, then ranked into 1–5 scores using quantile scoring."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Activity className="h-3 w-3" />
            {scale}-point scale
          </span>
        }
        aside={
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[12px]">
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">RFM reference date</span>
            <span className="font-semibold">{formatDate(kpis.reference_date)}</span>
            <span className="text-muted-foreground">
              · {formatNumber(kpis.total_customers)} customers · {formatNumber(kpis.total_transactions)} qualifying invoices
            </span>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {FORMULAS.map((f) => (
          <Card key={f.letter}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                  {f.letter}
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">RFM dimension</p>
                </div>
              </div>
              <p className="mt-3 rounded-md bg-muted/60 px-3 py-2 font-mono text-[11.5px] leading-relaxed">{f.formula}</p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">{f.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Average recency">
          <p className="text-xl font-semibold tabular-nums">{formatNumber(kpis.avg_recency_days)} days</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Lower is better</p>
        </InfoCard>
        <InfoCard title="Average frequency">
          <p className="text-xl font-semibold tabular-nums">{formatDecimal(kpis.avg_frequency, 2)}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Qualifying orders per customer</p>
        </InfoCard>
        <InfoCard title="Average monetary value">
          <p className="text-xl font-semibold tabular-nums">{formatINR(kpis.avg_customer_value)}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Net revenue per customer</p>
        </InfoCard>
        <InfoCard title="Combined score vs sum">
          <p className="text-[12.5px] leading-relaxed">
            <span className="font-semibold">555</span> is the concatenated RFM score (a pattern label).{" "}
            <span className="font-semibold">15</span> would be its sum. The two are reported separately and never used
            interchangeably.
          </p>
        </InfoCard>
      </div>

      {dataset.warnings?.length ? (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <ul className="space-y-1">
            {dataset.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <RfmScoreChart r={summary.r_distribution} f={summary.f_distribution} m={summary.m_distribution} />
        <DistributionHistogram
          title="Recency distribution"
          description="How customer recency is spread across the analysis period."
          data={summary.recency_buckets}
          color="#2563eb"
        />
        <DistributionHistogram
          title="Frequency distribution"
          description="How many qualifying orders customers place."
          data={summary.frequency_buckets}
          color="#0f766e"
        />
        <DistributionHistogram
          title="Monetary value distribution"
          description="Customer net value grouped into rupee bands."
          data={summary.monetary_buckets}
          color="#7c3aed"
        />
      </div>

      <Card className="mt-5">
        <CardContent className="p-0">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold">Top customers by net monetary value</p>
            <p className="mt-1 text-[13px] text-muted-foreground">The highest-value customers in this dataset.</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Customer ID</TableHead>
                  <TableHead className="text-[11px]">Segment</TableHead>
                  <TableHead className="text-right text-[11px]">Recency (days)</TableHead>
                  <TableHead className="text-right text-[11px]">Frequency</TableHead>
                  <TableHead className="text-right text-[11px]">Monetary value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary.top_customers || []).map((c) => (
                  <TableRow key={c.customer_id}>
                    <TableCell className="text-[12px] font-medium">{c.customer_id}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{c.segment_label}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(c.recency_days)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(c.frequency)}</TableCell>
                    <TableCell className="text-right text-[12px] font-medium tabular-nums">{formatINR(c.monetary)}</TableCell>
                  </TableRow>
                ))}
                {!(summary.top_customers || []).length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-[13px] text-muted-foreground">
                      No customers were scored in this dataset.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RfmAnalysis() {
  const { active } = useDataset();
  return (
    <RequireDataset>
      <RfmView dataset={active} />
    </RequireDataset>
  );
}