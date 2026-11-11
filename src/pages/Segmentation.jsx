import React from "react";
import { useNavigate } from "react-router-dom";
import { Info, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader, { InfoCard } from "@/components/PageHeader";
import RequireDataset from "@/components/RequireDataset";
import SegmentDistributionChart from "@/components/charts/SegmentDistributionChart";
import SegmentComparisonChart from "@/components/charts/SegmentComparisonChart";
import { useDataset } from "@/lib/datasetStore";
import { formatDecimal, formatINR, formatNumber, formatPercent } from "@/lib/format";

function SegmentationView({ dataset }) {
  const navigate = useNavigate();
  const summary = dataset.summary || {};
  const segments = summary.segments || [];
  const config = dataset.segment_config || {};
  const active = segments.filter((s) => s.customers > 0);

  return (
    <div>
      <PageHeader
        title="Customer segmentation"
        description="Every customer is assigned to exactly one segment using explicit, ordered rules. Rules are evaluated top to bottom, so the first match wins and classifications never overlap."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <PieChart className="h-3 w-3" />
            {active.length} active segments
          </span>
        }
        actions={
          <Button variant="outline" asChild>
            <a href="/settings">Configure thresholds</a>
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Lost threshold">
          <p className="text-xl font-semibold tabular-nums">{formatNumber(config.lostInactiveDays || 180)} days</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Inactivity before a customer is considered Lost</p>
        </InfoCard>
        <InfoCard title="At-risk window">
          <p className="text-xl font-semibold tabular-nums">{formatNumber(config.atRiskInactiveDays || 90)} days</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Reference threshold for engagement campaigns</p>
        </InfoCard>
        <InfoCard title="Big Spender trigger">
          <p className="text-xl font-semibold tabular-nums">M ≥ {formatNumber(config.bigSpenderMonetaryScore || 4)}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Monetary score required to be a Big Spender</p>
        </InfoCard>
        <InfoCard title="Rule-based, not ML">
          <p className="text-[12.5px] leading-relaxed">
            These are deterministic business rules over RFM scores. They are not machine-learning clustering, and no
            predictive or causal claim is made.
          </p>
        </InfoCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SegmentDistributionChart segments={segments} onSegmentClick={(s) => navigate(`/customers?segment=${s}`)} />
        <SegmentComparisonChart segments={segments} scale={config.scoreScale || 5} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {segments.map((s, index) => (
          <Card key={s.segment} className={s.customers === 0 ? "opacity-70" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    <p className="truncate text-sm font-semibold tracking-tight">{s.label}</p>
                  </div>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Rule priority #{index + 1}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                  {formatNumber(s.customers)}
                </span>
              </div>

              <p className="mt-3 rounded-md bg-muted/60 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed">{s.rule}</p>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">{s.description}</p>

              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-[12px]">
                <div>
                  <dt className="text-muted-foreground">Net revenue</dt>
                  <dd className="font-medium tabular-nums">{formatINR(s.revenue)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Revenue share</dt>
                  <dd className="font-medium tabular-nums">{formatPercent(s.share_of_revenue)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg value</dt>
                  <dd className="font-medium tabular-nums">{formatINR(s.avg_monetary)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg orders</dt>
                  <dd className="font-medium tabular-nums">{formatDecimal(s.avg_frequency, 2)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg recency</dt>
                  <dd className="font-medium tabular-nums">{formatNumber(s.avg_recency_days)} days</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg score</dt>
                  <dd className="font-medium tabular-nums">
                    {formatDecimal(s.avg_r_score, 1)} / {formatDecimal(s.avg_f_score, 1)} / {formatDecimal(s.avg_m_score, 1)}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[12px] leading-relaxed">
                <span className="font-medium">Suggested strategy: </span>
                {s.action}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => navigate(`/customers?segment=${s.segment}`)}
                disabled={s.customers === 0}
              >
                {s.customers === 0 ? "No customers in this segment" : `View ${formatNumber(s.customers)} customers`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardContent className="p-0">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold">Segment rule reference</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Priority order as evaluated by the engine. R, F and M are the 1–{config.scoreScale || 5} customer scores.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-[11px]">Order</TableHead>
                  <TableHead className="text-[11px]">Segment</TableHead>
                  <TableHead className="text-[11px]">Explicit rule</TableHead>
                  <TableHead className="text-right text-[11px]">Customers</TableHead>
                  <TableHead className="text-right text-[11px]">Share</TableHead>
                  <TableHead className="text-right text-[11px]">Net revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.map((s, index) => (
                  <TableRow key={s.segment}>
                    <TableCell className="text-[11px] text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="whitespace-nowrap text-[12px] font-medium">{s.label}</TableCell>
                    <TableCell className="font-mono text-[11px]">{s.rule}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(s.customers)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatPercent(s.share_of_customers)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatINR(s.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-start gap-2 border-t border-border px-5 py-4 text-[12px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Segment counts always add up to the number of classified customers ({formatNumber(summary.kpis?.total_customers || 0)}),
              because exactly one rule applies per customer. Segment revenue adds up to total net revenue.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Segmentation() {
  const { active } = useDataset();
  return (
    <RequireDataset>
      <SegmentationView dataset={active} />
    </RequireDataset>
  );
}