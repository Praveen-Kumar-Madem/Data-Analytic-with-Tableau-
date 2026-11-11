import React, { useState } from "react";
import { AlertTriangle, BarChart3, Database, Filter, MousePointerClick, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader, { InfoCard } from "@/components/PageHeader";
import { Link } from "react-router-dom";

const FILES = [
  {
    name: "cleaned_transactions.csv",
    grain: "One row per transaction line",
    purpose: "Every uploaded line after cleaning, with its classification and net revenue — the fact table for transaction-level analysis.",
    columns: [
      ["RowIndex", "Number", "Original row position in the uploaded file"],
      ["InvoiceNo", "String", "Invoice or transaction identifier"],
      ["ProductCode", "String", "Product / SKU identifier"],
      ["ProductName", "String", "Product description"],
      ["Quantity", "Number", "Signed quantity; negative values are returns"],
      ["InvoiceDate", "Date (YYYY-MM-DD)", "Transaction date, normalised during cleaning"],
      ["UnitPrice", "Number", "Price per unit (₹)"],
      ["CustomerID", "String", "Customer identifier; blank for unattributed rows"],
      ["Country", "String", "Country or region"],
      ["Classification", "String", "valid, return, cancelled, duplicate, missing_customer, invalid_date, invalid_quantity, invalid_price"],
      ["IncludedInRFM", "Boolean (TRUE/FALSE)", "Whether the line contributes to RFM"],
      ["IsCancelled", "Boolean (TRUE/FALSE)", "Cancelled invoice flag"],
      ["IsReturn", "Boolean (TRUE/FALSE)", "Return / credit line flag"],
      ["LineRevenueINR", "Number (₹)", "Quantity × UnitPrice after conversion; negative for returns, 0 for excluded rows"],
      ["ExclusionReason", "String", "Plain-language reason when the row was excluded"]
    ]
  },
  {
    name: "customer_rfm_analysis.csv",
    grain: "One row per customer",
    purpose: "The core RFM output: recency, frequency and monetary values with their 1–5 scores.",
    columns: [
      ["CustomerID", "String", "Customer identifier"],
      ["Country", "String", "Country of the customer's transactions"],
      ["FirstPurchaseDate", "Date", "Earliest qualifying purchase"],
      ["LastPurchaseDate", "Date", "Most recent qualifying purchase"],
      ["RecencyDays", "Number", "Reference date − last purchase date"],
      ["Frequency", "Number", "Distinct qualifying invoices"],
      ["MonetaryINR", "Number (₹)", "Net monetary value (quantity × unit price, net of returns)"],
      ["GrossMonetaryINR", "Number (₹)", "Monetary value before returns"],
      ["ReturnedValueINR", "Number (₹)", "Value returned by this customer"],
      ["AvgOrderValueINR", "Number (₹)", "MonetaryINR ÷ Frequency"],
      ["RScore", "Number 1–5", "Recency score; 5 = most recent"],
      ["FScore", "Number 1–5", "Frequency score; 5 = most frequent"],
      ["MScore", "Number 1–5", "Monetary score; 5 = highest value"],
      ["RFMScore", "String", "Concatenated pattern, e.g. 555"],
      ["RFMScoreSum", "Number 3–15", "Sum of the three scores, e.g. 15"]
    ]
  },
  {
    name: "customer_segments.csv",
    grain: "One row per customer",
    purpose: "The customer's assigned segment with the reason and the recommended action — the retention worklist.",
    columns: [
      ["CustomerID", "String", "Customer identifier"],
      ["Segment", "String", "Segment key, e.g. champions, at_risk"],
      ["SegmentLabel", "String", "Segment display name"],
      ["SegmentReason", "String", "Why this customer matched the segment rule, with the actual score values"],
      ["RecommendedAction", "String", "Suggested engagement strategy for the segment"],
      ["RecencyDays", "Number", "Days since last purchase"],
      ["Frequency", "Number", "Qualifying invoices"],
      ["MonetaryINR", "Number (₹)", "Net monetary value"],
      ["RFMScore", "String", "Concatenated RFM pattern"]
    ]
  },
  {
    name: "segment_summary.csv",
    grain: "One row per segment",
    purpose: "Segment-level totals for executive KPI tiles and share-of-revenue charts.",
    columns: [
      ["Segment", "String", "Segment display name"],
      ["SegmentKey", "String", "Segment key used to join to the customer files"],
      ["Rule", "String", "The explicit rule that defines the segment"],
      ["Customers", "Number", "Customers in the segment"],
      ["ShareOfCustomersPct", "Number (%)", "Share of all scored customers"],
      ["NetRevenueINR", "Number (₹)", "Segment net revenue"],
      ["ShareOfRevenuePct", "Number (%)", "Share of total net revenue"],
      ["AvgMonetaryINR", "Number (₹)", "Average customer value"],
      ["AvgRecencyDays", "Number", "Average days since last purchase"],
      ["AvgFrequency", "Number", "Average qualifying invoices"],
      ["AvgRScore / AvgFScore / AvgMScore", "Number", "Average scores, used for radar comparisons"]
    ]
  },
  {
    name: "monthly_revenue.csv",
    grain: "One row per month",
    purpose: "Time series for revenue and engagement trend lines.",
    columns: [
      ["Month", "String (YYYY-MM)", "Calendar month"],
      ["GrossSalesINR", "Number (₹)", "Positive qualifying sales"],
      ["ReturnsINR", "Number (₹)", "Value returned"],
      ["NetRevenueINR", "Number (₹)", "Gross sales − returns"],
      ["Orders", "Number", "Distinct qualifying invoices"],
      ["ActiveCustomers", "Number", "Distinct customers who purchased"],
      ["AvgOrderValueINR", "Number (₹)", "NetRevenueINR ÷ Orders"]
    ]
  },
  {
    name: "data_quality_report.csv",
    grain: "One row per metric",
    purpose: "Audit trail of the cleaning pipeline — required to explain excluded rows during a review.",
    columns: [
      ["Metric", "String", "Metric name"],
      ["Value", "String / Number", "Metric value"]
    ]
  }
];

const SHEETS = [
  ["Executive KPI Overview", "segment_summary.csv + customer_rfm_analysis.csv", "Eight KPI tiles: total customers, qualifying transactions, net revenue, average customer value, average recency, average frequency, Champions and At-Risk counts."],
  ["Customer Segment Distribution", "segment_summary.csv", "Bar or packed-bubble chart of Customers by Segment, coloured by Segment."],
  ["Revenue by Segment", "segment_summary.csv", "Bar chart of NetRevenueINR by Segment with a secondary donut of ShareOfRevenuePct."],
  ["Monthly Revenue Trends", "monthly_revenue.csv", "Dual axis line: NetRevenueINR as a line and ActiveCustomers as a second axis."],
  ["RFM Score Analysis", "customer_rfm_analysis.csv", "Histograms of RScore, FScore and MScore, plus a heat map of customer counts by R and F."],
  ["Customer Value Analysis", "customer_rfm_analysis.csv", "Scatter plot of Frequency on columns against MonetaryINR on rows, coloured by segment via a relationship to customer_segments.csv."],
  ["At-Risk Customer Analysis", "customer_segments.csv", "Table of customers where Segment is at_risk, lost or hibernating, sorted by MonetaryINR descending."],
  ["Customer-Level Detail", "customer_segments.csv + customer_rfm_analysis.csv", "Detail table of CustomerID, metrics, RFMScore, Segment, SegmentReason and RecommendedAction."]
];

const FILTERS = [
  ["Analysis period", "monthly_revenue.csv → Month", "Continuous date filter on Month"],
  ["Customer segment", "segment_summary.csv / customer_segments.csv → Segment", "Single or multi-value list, applied to all sheets using the same relationship"],
  ["Recency", "customer_rfm_analysis.csv → RecencyDays", "Range slider, e.g. 0–90 days"],
  ["Frequency", "customer_rfm_analysis.csv → Frequency", "Range slider or bins of 1, 2–3, 4–6, 7+"],
  ["Monetary value", "customer_rfm_analysis.csv → MonetaryINR", "Range slider in rupees"],
  ["RFM scores", "customer_rfm_analysis.csv → RScore / FScore / MScore", "Individual discrete filters, or a calculated field for the concatenated RFMScore"]
];

function TableauGuideView() {
  const [openFile, setOpenFile] = useState(FILES[0].name);
  const current = FILES.find((f) => f.name === openFile);

  return (
    <div>
      <PageHeader
        title="Tableau integration"
        description="This project prepares Tableau-ready datasets, a data dictionary and a dashboard specification. No Tableau workbook has been created or published from this environment — the artefacts below let you reproduce the analysis in Tableau Desktop or Tableau Public yourself."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            Manual setup required
          </span>
        }
        actions={
          <Button asChild>
            <Link to="/exports">Download the datasets</Link>
          </Button>
        }
      />

      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3.5 text-[12.5px] leading-relaxed text-amber-900">
        Tableau is not installed or authenticated in this environment, so the export pipeline is complete and the setup is
        documented rather than automated. Nothing here claims a workbook exists.
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard title="1. Export the files" className="lg:col-span-1">
          <p className="leading-relaxed">
            Open <Link to="/exports" className="font-medium text-primary">Export &amp; reports</Link> and download all six CSVs. They are
            generated from the same stored analysis as the dashboard, so totals always agree.
          </p>
          <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
            {FILES.map((f) => (
              <li key={f.name} className="font-mono">
                • {f.name}
              </li>
            ))}
          </ul>
        </InfoCard>{" "}
        <InfoCard title="2. Connect in Tableau" className="lg:col-span-2">
          <ol className="space-y-2 leading-relaxed">
            <li>
              <span className="font-medium">Tableau Desktop:</span> Connect → To a File → Text file → select{" "}
              <span className="font-mono text-[12px]">cleaned_transactions.csv</span> or{" "}
              <span className="font-mono text-[12px]">customer_rfm_analysis.csv</span>.
            </li>
            <li>
              <span className="font-medium">Tableau Public:</span> open the browser-based authoring canvas and drag the CSV files in
              — the same column names and data types apply.
            </li>
            <li>
              Confirm that <span className="font-mono text-[12px]">InvoiceDate</span> is typed as a Date and{" "}
              <span className="font-mono text-[12px]">Month</span> as a Date, then set{" "}
              <span className="font-mono text-[12px]">LineRevenueINR</span>, <span className="font-mono text-[12px]">MonetaryINR</span> and{" "}
              <span className="font-mono text-[12px]">NetRevenueINR</span> to Number with currency formatting set to Indian Rupees.
            </li>
            <li>
              Relate <span className="font-mono text-[12px]">customer_segments.csv</span> to{" "}
              <span className="font-mono text-[12px]">customer_rfm_analysis.csv</span> on{" "}
              <span className="font-mono text-[12px]">CustomerID</span> so segment filters flow into customer-level sheets.
            </li>
          </ol>
        </InfoCard>
      </div>

      <Card className="mt-5">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Database className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Data dictionary</p>
          </div>
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {FILES.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setOpenFile(f.name)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11.5px] transition-colors ${
                  openFile === f.name ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="px-5 pb-5 pt-4">
            <p className="text-[12.5px] text-muted-foreground">
              <span className="font-medium text-foreground">Grain:</span> {current.grain} · <span className="font-medium text-foreground">Purpose:</span>{" "}
              {current.purpose}
            </p>
            <div className="mt-3 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">Column</TableHead>
                    <TableHead className="text-[11px]">Type</TableHead>
                    <TableHead className="text-[11px]">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {current.columns.map(([column, type, description]) => (
                    <TableRow key={column}>
                      <TableCell className="whitespace-nowrap font-mono text-[12px]">{column}</TableCell>
                      <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{type}</TableCell>
                      <TableCell className="text-[12px]">{description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Table2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Recommended dashboard sheets</p>
            </div>
            <ul className="divide-y divide-border">
              {SHEETS.map(([name, source, build]) => (
                <li key={name} className="px-5 py-3.5">
                  <p className="text-[13px] font-medium">{name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{source}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{build}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Recommended filters</p>
              </div>
              <ul className="divide-y divide-border">
                {FILTERS.map(([name, field, how]) => (
                  <li key={name} className="px-5 py-3">
                    <p className="text-[13px] font-medium">{name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{field}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{how}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Dashboard actions</p>
              </div>
              <ol className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed">
                <li>
                  <span className="font-medium">1. Highlight:</span> select the segment chart as source and the customer detail
                  table as target, using <span className="font-mono text-[11.5px]">Segment</span> as the field.
                </li>
                <li>
                  <span className="font-medium">2. Filter:</span> on the same pair, choose Filter → Selected fields →{" "}
                  <span className="font-mono text-[11.5px]">Segment</span> so clicking a segment bar filters the customer table on
                  the dashboard.
                </li>
                <li>
                  <span className="font-medium">3. Drill to detail:</span> add the URL action{" "}
                  <span className="font-mono text-[11.5px]">/customers/&lt;CustomerID&gt;</span> if the workbook is published beside
                  this app, or use it to open the app's customer profile page.
                </li>
                <li>
                  <span className="font-medium">4. Reset:</span> add a "All segments" button that clears the filter, so the dashboard
                  always has a way back to the full population.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Tableau-specific limitations to avoid misleading charts</p>
          </div>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
            <li>
              • <span className="font-medium text-foreground">Currency formatting:</span> Tableau's default currency format uses
              Western grouping. Set the custom format to use Indian digit grouping so ₹1,25,000 does not display as ₹125,000.
            </li>
            <li>
              • <span className="font-medium text-foreground">RFMScore is a string</span> (for example "555"). Do not aggregate it
              or sort it numerically — use RFMScoreSum for numeric comparisons and keep the pattern as a label.
            </li>
            <li>
              • <span className="font-medium text-foreground">Extracts vs live:</span> CSV files are static snapshots. Re-export and
              refresh the extract whenever the pipeline is re-run, otherwise the workbook shows stale segments.
            </li>
            <li>
              • <span className="font-medium text-foreground">Returns:</span> LineRevenueINR is negative on return lines, so avoid
              SUM of absolute values; summing the signed column is what makes net revenue correct.
            </li>
            <li>
              • <span className="font-medium text-foreground">Excluded rows:</span> rows with IncludedInRFM = FALSE must be filtered
              out of recency, frequency and monetary aggregates, otherwise cancelled and duplicate lines would be counted.
            </li>
            <li>
              • <span className="font-medium text-foreground">Segment colours:</span> the app colours segments for visual continuity.
              Reproduce them with a colour palette mapped on the Segment field if you want the Tableau boards to match.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default TableauGuideView;