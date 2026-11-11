import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import DashboardKpis from "@/components/dashboard/DashboardKpis";
import InsightCard from "@/components/insights/InsightCard";
import SegmentDistributionChart from "@/components/charts/SegmentDistributionChart";
import SegmentRevenueChart from "@/components/charts/SegmentRevenueChart";
import RfmScoreChart from "@/components/charts/RfmScoreChart";
import RevenueShareChart from "@/components/charts/RevenueShareChart";
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import ActiveCustomersChart from "@/components/charts/ActiveCustomersChart";
import SegmentComparisonChart from "@/components/charts/SegmentComparisonChart";
import ValueFrequencyScatter from "@/components/charts/ValueFrequencyScatter";
import TopCustomersChart from "@/components/charts/TopCustomersChart";
import DistributionHistogram from "@/components/charts/DistributionHistogram";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

export default function DashboardView({ dataset, onSegment }) {
  const summary = dataset.summary || {};
  const kpis = summary.kpis || {};
  const segments = summary.segments || [];
  const insights = dataset.insights || [];

  return (
    <div>
      <PageHeader
        title="Dashboard overview"
        description={`Interactive business intelligence for "${dataset.name}". Every figure below is calculated from the uploaded transactions and the current cleaning rules.`}
        badge={
          dataset.is_sample ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <FlaskConical className="h-3 w-3" />
              Sample data — not real performance
            </span>
          ) : null
        }
        aside={
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              RFM reference date: <span className="font-medium text-foreground">{formatDate(kpis.reference_date)}</span>
            </span>
            <span>
              Analysis period: <span className="font-medium text-foreground">{formatDate(kpis.analysis_start)} → {formatDate(kpis.analysis_end)}</span>
            </span>
            <span>
              Currency: <span className="font-medium text-foreground">{dataset.source_currency || "INR"} → INR (₹)</span>
            </span>
          </div>
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/data-quality">Data quality</Link>
            </Button>
            <Button asChild>
              <Link to="/exports">Export datasets</Link>
            </Button>
          </>
        }
      />

      {dataset.is_sample ? (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
          <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            You are viewing synthetic sample data generated for demonstration. It contains realistic patterns but is not real
            business performance. Upload your own transaction export to replace these figures.
          </span>
        </div>
      ) : null}

      <DashboardKpis kpis={kpis} />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SegmentDistributionChart segments={segments} onSegmentClick={onSegment} />
        <SegmentRevenueChart segments={segments} onSegmentClick={onSegment} />
        <RfmScoreChart r={summary.r_distribution} f={summary.f_distribution} m={summary.m_distribution} />
        <RevenueShareChart segments={segments} />
        <div className="lg:col-span-2">
          <MonthlyRevenueChart monthly={summary.monthly} />
        </div>
        <ActiveCustomersChart monthly={summary.monthly} />
        <SegmentComparisonChart segments={segments} scale={dataset.segment_config?.scoreScale || 5} />
        <div className="lg:col-span-2">
          <ValueFrequencyScatter points={summary.scatter} capped={summary.scatter_is_capped} />
        </div>
        <div className="lg:col-span-2">
          <TopCustomersChart customers={summary.top_customers} />
        </div>
        <DistributionHistogram
          title="Recency distribution"
          description="Customers grouped by days since their last qualifying purchase."
          data={summary.recency_buckets}
          color="#2563eb"
        />
        <DistributionHistogram
          title="Frequency distribution"
          description="Customers grouped by number of qualifying orders."
          data={summary.frequency_buckets}
          color="#0f766e"
        />
        <DistributionHistogram
          title="Monetary value distribution"
          description="Customers grouped by net monetary value in rupees."
          data={summary.monetary_buckets}
          color="#7c3aed"
        />
        <div className="flex flex-col justify-center rounded-lg border border-border bg-muted/40 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Data quality at a glance</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {formatNumber(dataset.raw_row_count)} rows uploaded · {formatNumber(dataset.valid_row_count)} valid ·{" "}
            {formatNumber(dataset.excluded_row_count)} excluded from RFM (kept and inspectable).
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Net revenue {formatINR(dataset.net_revenue)} from {formatNumber(dataset.invoice_count)} qualifying invoices.
          </p>
          <Link to="/data-quality" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
            Open the cleaning report
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {insights.length ? (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Business insights</h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Generated automatically from the computed results — no invented statistics.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/insights">
                View all {insights.length}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {insights.slice(0, 3).map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}