import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";

const SECTIONS = [
  { id: "overview", label: "Project overview" },
  { id: "objectives", label: "Objectives" },
  { id: "features", label: "Features" },
  { id: "stack", label: "Technology stack" },
  { id: "architecture", label: "System architecture" },
  { id: "dataflow", label: "Data flow" },
  { id: "methodology", label: "RFM methodology" },
  { id: "scoring", label: "Scoring methodology" },
  { id: "segments", label: "Segmentation rules" },
  { id: "currency", label: "Currency handling" },
  { id: "format", label: "Dataset format" },
  { id: "api", label: "Backend API reference" },
  { id: "schema", label: "Database schema" },
  { id: "testing", label: "Testing" },
  { id: "security", label: "Security and reliability" },
  { id: "deployment", label: "Deployment" },
  { id: "limitations", label: "Limitations" },
  { id: "future", label: "Future enhancements" }
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function Mono({ children }) {
  return <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">{children}</span>;
}

function Formula({ children }) {
  return <p className="rounded-md bg-muted/70 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed">{children}</p>;
}

export default function Docs() {
  return (
    <div>
      <PageHeader
        title="Documentation"
        description="How the platform works end to end — the methodology, the calculations, the schema and the honest limitations. Written so it can be explained in a project review or interview."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <BookOpen className="h-3 w-3" />
            Methodology & reference
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-0.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-2.5 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <Card>
          <CardContent className="space-y-6 p-5 sm:p-7">
            <Section id="overview" title="Project overview">
              <p>
                <strong>E-Commerce Customer Segmentation Using RFM Analysis.</strong> The platform analyses an e-commerce
                transaction export, calculates Recency, Frequency and Monetary value for every customer, scores them, assigns
                each customer to exactly one behaviour segment, and presents the result as an interactive business intelligence
                dashboard plus Tableau-ready datasets.
              </p>
              <p>
                <strong>Problem statement.</strong> An e-commerce business accumulates thousands of transaction rows but has no
                reliable way to tell which customers are worth protecting, which are drifting away, and where retention spend
                would actually pay back. RFM answers this with three behaviours every transaction already contains: how recently
                someone bought, how often, and how much.
              </p>
            </Section>

            <Section id="objectives" title="Objectives">
              <ul className="space-y-1.5">
                <li>• Identify the most valuable customers and the segment carrying revenue.</li>
                <li>• Distinguish loyal and frequent buyers from one-off purchasers.</li>
                <li>• Surface customers who have not purchased recently but used to.</li>
                <li>• Detect customers at risk of churning before they are lost.</li>
                <li>• Understand spending patterns and revenue contribution by segment.</li>
                <li>• Produce data-driven retention strategies instead of blanket campaigns.</li>
                <li>• Let a non-technical business user upload a file and get answers immediately.</li>
              </ul>
            </Section>

            <Section id="features" title="Features">
              <ul className="space-y-1.5">
                <li>• CSV and Excel upload with automatic column detection and manual column mapping.</li>
                <li>• A transparent cleaning pipeline: duplicates, blank customer IDs, invalid dates, invalid quantities, negative prices, cancellations and returns — every row classified with a reason and nothing deleted.</li>
                <li>• Configurable business rules for duplicates and returns, with gross sales, returned value and net revenue reported separately.</li>
                <li>• INR reporting throughout, using Indian digit grouping (₹1,25,000).</li>
                <li>• A full RFM engine with quantile scoring, tie handling, deterministic fallbacks and an explicit reference date.</li>
                <li>• Nine-segment rule-based classification with an ordered priority list, a stored reason per customer and a recommended action.</li>
                <li>• A dashboard with eight KPIs and twelve interactive charts, including segment click-through to the customer list.</li>
                <li>• A server-side searchable, filterable, sortable customer explorer and a full customer profile with transaction history.</li>
                <li>• An insights module that derives findings only from computed values.</li>
                <li>• Six Tableau-ready CSV exports, a PDF business report and an export history.</li>
                <li>• A live automated test suite covering the whole analytics core plus an end-to-end pipeline test.</li>
              </ul>
            </Section>

            <Section id="stack" title="Technology stack">
              <p>
                This application runs on Base44, which hosts a React SPA and a managed backend service. The requested Python /
                FastAPI / SQLite / Docker stack cannot execute in this environment, so the analytical engine is implemented in
                the platform's backend runtime instead. The analysis, the maths, the pipeline and the exports are all real and
                running; only the implementation language of the server differs.
              </p>
              <ul className="space-y-1.5">
                <li>• <strong>Frontend:</strong> React 18, Vite, Tailwind CSS, shadcn/ui, Recharts, lucide-react, jsPDF.</li>
                <li>• <strong>Backend:</strong> Base44 backend functions (TypeScript handlers on a serverless runtime) — the equivalent of the service layer.</li>
                <li>• <strong>Analytics core:</strong> a single shared module imported by every function, so cleaning, RFM, scoring, segmentation and insight logic exist exactly once.</li>
                <li>• <strong>Database:</strong> a managed document database with row-level security — the equivalent of the SQL layer, with explicit schemas per collection.</li>
                <li>• <strong>Exports:</strong> CSV generated from stored results, and a PDF report built in the browser.</li>
              </ul>
            </Section>

            <Section id="architecture" title="System architecture">
              <Formula>
                {`React pages (dashboard, explorer, exports)
        │  SDK calls
        ▼
Backend functions ── ingestRows · runPipeline · runSelfTests · readSpreadsheet
        │  imports
        ▼
Shared analytics module ── parse → clean → RFM → score → segment → summarise → insights
        │  reads/writes
        ▼
Dataset · Transaction · CustomerRfm · Report   (per-dataset isolation, row-level security)`}
              </Formula>
              <p>
                Each dataset is a namespace: every transaction and customer record carries a <Mono>dataset_id</Mono>, and
                re-running the pipeline replaces only that dataset's derived records. Analyses can never mix.
              </p>
            </Section>

            <Section id="dataflow" title="Data flow">
              <ol className="space-y-1.5">
                <li>1. The user uploads a CSV or Excel file, or loads the labelled sample dataset.</li>
                <li>2. The file is parsed and previewed; columns are auto-detected and can be remapped by hand.</li>
                <li>3. The user confirms the source currency, cleaning rules and the RFM reference date.</li>
                <li>4. Rows are streamed into the database in bounded batches (<Mono>ingestRows</Mono>).</li>
                <li>5. <Mono>runPipeline</Mono> reads the rows back, classifies each one, writes the classification and net line revenue, then builds customer RFM records, scores, segments, the dashboard summary and the insights.</li>
                <li>6. The dataset record is updated with the quality report, summary and insights — a single read powers the whole dashboard.</li>
                <li>7. The user explores, drills into customers, and exports CSVs or the PDF report.</li>
              </ol>
            </Section>

            <Section id="methodology" title="RFM methodology">
              <Formula>Recency = Analysis reference date − Most recent qualifying purchase date</Formula>
              <Formula>Frequency = Count of distinct qualifying invoices (a multi-product invoice counts once)</Formula>
              <Formula>Monetary = Σ (Quantity × Unit Price) over qualifying lines, net of returns</Formula>
              <p>
                <strong>Reference date.</strong> By default the day after the latest qualifying transaction, or a date the user
                chooses. One reference date is used for every customer, and it is displayed on the dashboard and in every export.
              </p>
              <p>
                <strong>Qualifying lines.</strong> Valid purchase lines, plus return lines when returns are netted. Cancelled
                invoices, duplicates, rows with a blank customer ID, invalid dates, invalid quantities and invalid prices never
                contribute to RFM. Only positive purchase lines set the last-purchase date or count towards frequency, so a
                credit note never adds an order.
              </p>
            </Section>

            <Section id="scoring" title="Scoring methodology">
              <p>
                Each dimension is scored 1–5 using quantile scoring on averaged ranks. Recency is reversed so the most recent
                customers score 5; frequency and monetary are scored so that larger values score higher.
              </p>
              <ul className="space-y-1.5">
                <li>• <strong>Duplicate boundaries:</strong> customers with identical values receive identical averaged ranks and therefore identical scores — no arbitrary splitting.</li>
                <li>• <strong>Insufficient distinct values:</strong> when every customer shares the same value for a dimension, that dimension carries no signal, so every customer receives the documented neutral middle score (3 on a 5-point scale) rather than an arbitrary one.</li>
                <li>• <strong>Small datasets:</strong> the pipeline records a warning that segment shares are indicative below 20 customers.</li>
                <li>• <strong>Two different numbers:</strong> the concatenated RFM score (<Mono>555</Mono>) is a pattern label; the sum (<Mono>15</Mono>) is a different measure. They are displayed separately, always labelled, and never used interchangeably.</li>
              </ul>
            </Section>

            <Section id="segments" title="Segmentation rules">
              <p>
                Rules are evaluated in a fixed priority order and the first match wins, so every customer belongs to exactly one
                segment and the segment counts always add up to the classified customer count.
              </p>
              <Formula>
                {`1  Champions              R ≥ 4 AND F ≥ 4 AND M ≥ 4
2  Loyal Customers        R ≥ 3 AND F ≥ 4
3  Big Spenders           M ≥ 4 AND R ≥ 3
4  Potential Loyalists    R ≥ 4 AND F ≥ 2
5  Recent Customers       R ≥ 4
6  Needing Attention      R = 3
7  At-Risk Customers      R ≤ 2 AND F ≥ 3
8  Lost Customers         R ≤ 2 AND inactive ≥ lost threshold (default 180 days)
9  Hibernating            all remaining low-activity customers`}
              </Formula>
              <p>
                Thresholds are configurable in Settings and the analysis can be recalculated without re-uploading. Each customer
                stores the reason for the assignment, written with the actual score values, so no customer is explained by its
                label alone. This is deterministic rule-based segmentation, not machine-learning clustering, and no predictive or
                causal claim is made.
              </p>
            </Section>

            <Section id="currency" title="Currency handling">
              <p>
                All reporting is in Indian Rupees (₹ INR) using the Indian numbering convention: ₹1,500 · ₹25,000 · ₹1,25,000 ·
                ₹12,50,000 · ₹1,00,00,000.
              </p>
              <ul className="space-y-1.5">
                <li>• The source currency of the file is never assumed. The user confirms it during upload.</li>
                <li>• If the source is not INR, an explicit conversion rate is required before the pipeline will run. The rate, the conversion date and the note are stored on the dataset and reported in every export.</li>
                <li>• No exchange rate is ever invented or fetched implicitly.</li>
                <li>• Revenue per line is quantity × unit price, conversion applied once, with values rounded to two decimals.</li>
                <li>• Gross sales, returned value and net revenue are reported separately so cancellations and returns are never double counted.</li>
              </ul>
            </Section>

            <Section id="format" title="Dataset format">
              <p>Required fields: invoice, customer ID, transaction date, quantity, unit price. Optional: product code, product name, country.</p>
              <p>
                Accepted date formats include <Mono>YYYY-MM-DD</Mono>, <Mono>DD/MM/YYYY</Mono>, <Mono>DDMMYYYY</Mono>, ISO timestamps
                and Excel serial dates. Unit prices may include currency symbols or thousands separators; <Mono>(123)</Mono> is read
                as negative. Column names do not need to match — map them once during upload.
              </p>
              <p>
                A deterministic synthetic sample dataset is built in, with repeat purchases, inactive customers, high-value buyers,
                low spenders, cancelled orders, returns, duplicates, blank customer IDs and invalid rows. It is labelled as sample
                data everywhere it appears and never overwrites an existing analysis without confirmation.
              </p>
            </Section>

            <Section id="api" title="Backend API reference">
              <ul className="space-y-2">
                <li>
                  <Mono>ingestRows</Mono> — validates and stores up to 1,000 mapped rows per call for a dataset, returning the
                  insert count and the next index.
                </li>
                <li>
                  <Mono>runPipeline</Mono> — the analysis entry point. Cleans and classifies every stored row, calculates RFM,
                  scores, segments, builds the dashboard summary and insights, and persists everything. Returns the quality report,
                  KPIs and warnings. Rejects a non-INR dataset with no conversion rate.
                </li>
                <li>
                  <Mono>runSelfTests</Mono> — runs the deterministic unit and integration test suite and returns every assertion
                  with its expected and actual value. Creates and removes its own temporary dataset.
                </li>
                <li>
                  <Mono>readSpreadsheet</Mono> — reads an uploaded XLSX/XLS workbook through the platform's spreadsheet extraction
                  service; the client supplies a signed URL for a file it uploaded.
                </li>
              </ul>
              <p>
                Data access for the dashboard, explorer, profile and exports uses the SDK's typed collection queries with server-side
                filtering, sorting, pagination and counting — the equivalent of REST endpoints such as{" "}
                <Mono>GET /datasets</Mono>, <Mono>GET /datasets/:id/customers</Mono> and{" "}
                <Mono>GET /datasets/:id/exports/:type</Mono>. Inputs are validated, errors return meaningful messages, and no
                endpoint ever returns an entire dataset when a page will do.
              </p>
            </Section>

            <Section id="schema" title="Database schema">
              <ul className="space-y-2">
                <li>
                  <Mono>Dataset</Mono> — one record per analysis run: name, source, status, currency and conversion, column
                  mapping, cleaning and segment configuration, row counts, revenue totals, the quality report, the dashboard
                  summary, insights and warnings.
                </li>
                <li>
                  <Mono>Transaction</Mono> — one record per transaction line: <Mono>dataset_id</Mono>, row index, invoice, product,
                  quantity, unit price, date, customer, country, classification, exclusion reason, inclusion flag and line revenue.
                </li>
                <li>
                  <Mono>CustomerRfm</Mono> — one record per customer: <Mono>dataset_id</Mono>, customer ID, first and last purchase,
                  recency, frequency, monetary, gross, returned value, order count, R/F/M scores, the concatenated score, the sum,
                  segment, the reason and the recommended action.
                </li>
                <li>
                  <Mono>Report</Mono> — an audit row for each generated export: dataset, report type, format, title, row count and
                  timestamp.
                </li>
              </ul>
              <p>
                Every record carries an owner and a creation timestamp from the platform, and all four collections are protected by
                row-level security so a user only ever sees their own datasets. Large files are not stored inside database fields —
                only the analysed rows are.
              </p>
            </Section>

            <Section id="testing" title="Testing">
              <p>
                <Link to="/tests" className="font-medium text-primary">Open the test suite</Link> to run it live. A deterministic
                reference dataset with hand-verified expected values is pushed through the real engine, and the integration tests
                run the actual ingestion and pipeline functions against a temporary dataset before deleting it.
              </p>
              <p>Coverage includes: data upload, column mapping, cleaning, duplicate detection, cancelled transaction handling, return handling, INR calculations, RFM calculation, quantile scoring, customer segmentation, dashboard KPI aggregation, customer filtering, export generation, invalid dataset handling and API error handling.</p>
              <p>The verified invariants include: recency decreases when the latest purchase becomes more recent; frequency counts distinct invoices; monetary uses quantity × unit price; score direction is correct; segment counts add up to the classified customer count; dashboard revenue equals exported revenue; INR formatting is consistent; and empty or single-customer datasets never crash the application.</p>
            </Section>

            <Section id="security" title="Security and reliability">
              <ul className="space-y-1.5">
                <li>• Files are validated on upload for type and size (15 MB limit) before they are read.</li>
                <li>• Stored filenames and text fields are sanitised and length-bounded.</li>
                <li>• All data access goes through parameterised SDK queries — no string-built queries, so no injection surface.</li>
                <li>• Row-level security scopes every dataset, transaction, customer record and report to its owner, with administrators able to see all.</li>
                <li>• Errors return plain, useful messages and never expose internal details.</li>
                <li>• No customer names, phone numbers or email addresses are required or stored — analysis works on customer IDs alone.</li>
                <li>• Deleting a dataset removes its transactions, customer records and export history immediately.</li>
              </ul>
              <p className="text-muted-foreground">
                No compliance certification is claimed — this is an analytics project, not a certified data processor.
              </p>
            </Section>

            <Section id="deployment" title="Deployment">
              <p>
                The application runs entirely on Base44. The frontend and backend deploy together when the app is published — there
                is no separate API URL to configure and no localhost address is ever hardcoded, because the client talks to the
                host through the SDK.
              </p>
              <ul className="space-y-1.5">
                <li>• <strong>Publish:</strong> use the publish control in the editor to get a live URL; the app is not published yet.</li>
                <li>• <strong>Custom domain:</strong> connect one from the app dashboard's Domains page.</li>
                <li>• <strong>Health check:</strong> the dashboard loading without errors after publish confirms the backend is reachable.</li>
                <li>• <strong>Troubleshooting:</strong> if a chart is empty, check the dataset status and the data-quality report; if an upload fails, check the file type and size.</li>
              </ul>
              <p className="text-muted-foreground">
                Docker, a Python virtual environment and a PostgreSQL/SQLite instance are part of the requested stack but are not
                part of this environment, so no container configuration is shipped that could not actually run here.
              </p>
            </Section>

            <Section id="limitations" title="Limitations">
              <ul className="space-y-1.5">
                <li>• Results describe only the uploaded dataset — they are not a whole-company view.</li>
                <li>• Segment boundaries are configurable business rules; different thresholds produce different segment sizes.</li>
                <li>• RFM ranks customers relative to each other inside one dataset, so a score can change when the dataset changes.</li>
                <li>• Quantile scoring assigns identical scores to tied customers, so small datasets can produce few distinct scores.</li>
                <li>• This is rule-based segmentation, not predictive modelling — no churn probability or causal claim is made.</li>
                <li>• Excel import depends on the platform's spreadsheet extraction service; very large workbooks are best exported to CSV first.</li>
                <li>• Tableau workbooks are not created or published automatically — the datasets and the specification are prepared for manual setup.</li>
                <li>• The Python/FastAPI and Docker deliverables from the original brief cannot run in this environment.</li>
              </ul>
            </Section>

            <Section id="future" title="Future enhancements">
              <ul className="space-y-1.5">
                <li>• A scheduled pipeline that refreshes the analysis from a connected data source on a fixed cadence.</li>
                <li>• Customer lifetime value and churn-probability modelling layered on the RFM features.</li>
                <li>• K-means or hierarchical clustering to compare statistical clusters against the rule-based segments.</li>
                <li>• Campaign outcome tracking, so recommended actions can be measured rather than assumed.</li>
                <li>• Cohort retention curves and market-basket analysis on the product dimension.</li>
                <li>• A published Tableau Public workbook built from the exported datasets.</li>
              </ul>
            </Section>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <ExternalLink className="h-3.5 w-3.5" />
        The same content ships as markdown files in the project repository (README, docs/, tableau/) for portfolio use.
      </p>
    </div>
  );
}