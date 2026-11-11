<div align="center">

# E-Commerce Customer Segmentation Using RFM Analysis

**An end-to-end customer analytics platform — transaction cleaning, RFM scoring,
behavioural segmentation, interactive BI dashboards and Tableau-ready datasets.**

All monetary values are reported in Indian Rupees (₹) using Indian digit grouping.

</div>

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Problem statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Features](#4-features)
5. [Technology stack](#5-technology-stack)
6. [System architecture](#6-system-architecture)
7. [Data flow](#7-data-flow)
8. [RFM formulas](#8-rfm-formulas)
9. [Scoring methodology](#9-scoring-methodology)
10. [Customer segmentation rules](#10-customer-segmentation-rules)
11. [Currency handling](#11-currency-handling)
12. [Dataset format](#12-dataset-format)
13. [Installation and local development](#13-installation-and-local-development)
14. [API documentation](#14-api-documentation)
15. [Database schema](#15-database-schema)
16. [Testing](#16-testing)
17. [Tableau integration](#17-tableau-integration)
18. [Deployment](#18-deployment)
19. [Project structure](#19-project-structure)
20. [Screenshots](#20-screenshots)
21. [Limitations and honesty notes](#21-limitations-and-honesty-notes)
22. [Future enhancements](#22-future-enhancements)

---

## 1. Project overview

An e-commerce business accumulates transaction rows but rarely knows **which
customers are worth protecting, which are drifting away, and where retention spend
actually pays back**. This project answers that with RFM analysis — the three
behaviours every transaction already records:

| Dimension | Question it answers |
| --- | --- |
| **Recency** | How recently did this customer buy? |
| **Frequency** | How often do they buy? |
| **Monetary** | How much do they spend? |

A business user uploads a transaction export, maps the columns, confirms the currency
and cleaning rules, and immediately gets a scored customer base, nine behavioural
segments, an interactive dashboard, a customer explorer, generated business insights,
and six Tableau-ready datasets plus a PDF business report.

## 2. Problem statement

An e-commerce business accumulates thousands of transaction rows but has no reliable
way to tell which customers are valuable, which are loyal, which are drifting away and
which have already churned. Marketing budget is spent uniformly instead of being aimed
at the customers where it changes behaviour. RFM turns raw transactions into a
prioritised retention worklist.

## 3. Objectives

- Identify the most valuable customers and the segment carrying revenue.
- Distinguish loyal and frequent buyers from one-off purchasers.
- Surface customers who have not purchased recently but used to.
- Detect customers at risk of churning before they are lost.
- Understand spending patterns and revenue contribution by segment.
- Produce data-driven retention strategies instead of blanket campaigns.
- Let a non-technical user get answers immediately after an upload.

## 4. Features

**Data ingestion**
- CSV, XLSX and XLS upload, plus a built-in labelled sample dataset.
- Automatic column detection with manual remapping for any dataset shape.
- Preview of the raw file before anything is stored.

**Transparent cleaning pipeline**
- Detects duplicates, blank customer IDs, unparseable dates, invalid/zero quantities
  and negative prices.
- Identifies cancelled orders and returns under configurable business rules.
- **Never deletes a row** — every exclusion is classified, given a reason and kept for
  inspection and download.
- Before/after quality summary shown as 16 metrics, with a browsable table of every
  quarantined row.

**RFM engine**
- Reference date selectable, defaulting to the day after the latest transaction.
- Frequency counts distinct invoices, so a multi-product order counts once.
- Monetary uses quantity × unit price, net of returns.
- Quantile scoring 1–5 with averaged ranks so tied customers share a score, plus a
  documented neutral fallback when a dimension has no signal.

**Segmentation**
- Nine segments with explicit, ordered rules; first match wins so segments never overlap.
- Every customer stores the reason for its assignment, written with its own score values.
- Thresholds configurable and the analysis recalculable without re-uploading.

**Dashboard and exploration**
- Eight KPIs and twelve interactive charts, all derived from the stored analysis.
- Click a segment to drill into those customers.
- Server-side search, filtering, sorting and pagination on the customer explorer.
- Full customer profiles with metrics, segment explanation, spending trend and complete
  transaction history.

**Insights, exports and Tableau**
- Automatically generated insights, each with metric, interpretation and action.
- Six Tableau-ready CSV exports and a multi-section PDF business report.
- In-app Tableau setup guide with a full data dictionary and dashboard specification.
- A live test suite covering the analytics core end to end.

## 5. Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Recharts, lucide-react, jsPDF |
| Backend | Base44 backend functions (TypeScript handlers on a serverless runtime) |
| Analytics core | One shared module imported by every function — `base44/shared/analytics.ts` |
| Database | Managed document store with row-level security and explicit per-collection schemas |
| Auth | Platform-managed (email/password and social providers) |
| Exports | CSV generated from stored results; PDF composed in the browser |

> **Environment note.** This project runs on Base44, which hosts a React SPA and a
> managed backend service. The Python/FastAPI/SQLite/Docker stack in the original brief
> cannot execute in this environment, so the service layer and database are provided by
> the platform instead. The analysis, the pipeline, the calculations and the exports are
> fully implemented and running — only the implementation language of the server
> differs. See [§21](#21-limitations-and-honesty-notes).

## 6. System architecture

```
React SPA (dashboard · upload wizard · explorer · profile · insights · exports)
        │  SDK queries + function invocations
        ▼
Backend functions  ingestRows · runPipeline · runSelfTests · readSpreadsheet
        │  imports
        ▼
Shared analytics core  parse → clean & classify → RFM → score → segment → summarise → insights
        │  reads / writes
        ▼
Collections  Dataset · Transaction · CustomerRfm · Report   (per-dataset isolation, RLS)
```

Full detail: [`docs/architecture.md`](docs/architecture.md).

## 7. Data flow

1. The browser parses the uploaded file (or the sample dataset) and maps its columns.
2. Rows are streamed into the database in bounded batches (`ingestRows`).
3. `runPipeline` classifies every stored row, writes the classification, exclusion
   reason, inclusion flag and net line revenue, then builds one customer record per customer.
4. The same run writes the quality report, the dashboard summary and the insights onto
   the dataset record, so the dashboard is a single fast read.
5. The explorer and profile query customer records directly with server-side
   filter/sort/count/pagination.
6. Exports reuse the stored values, so the dashboard, the CSVs and the PDF always agree.

## 8. RFM formulas

```
Recency   = Analysis reference date − Most recent qualifying purchase date      (days)
Frequency = Count of distinct qualifying invoices
Monetary  = Σ (Quantity × Unit Price) over qualifying lines, net of returns     (₹)
```

Revenue definitions:

```
Line revenue   = Quantity × Unit Price × Conversion rate
Gross sales    = Σ line revenue where line revenue > 0
Returned value = Σ |line revenue| where line revenue < 0
Net revenue    = Gross sales − Returned value
```

**Qualifying lines:** valid purchase lines, plus return lines when returns are netted.
Cancelled invoices, duplicates, blank customer IDs, invalid dates, invalid quantities
and invalid prices never contribute. Only positive purchase lines set the last-purchase
date or add to frequency, so a credit note never creates an order.

Full detail: [`docs/methodology.md`](docs/methodology.md).

## 9. Scoring methodology

Each dimension is scored **1–5** by quantile scoring on averaged ranks.

- **Recency** is reversed so the most recent customers score 5.
- **Frequency** and **Monetary** score higher for larger values.
- **Tied values** share an averaged rank, so duplicate quantile boundaries cannot split
  equal customers.
- **Uniform dimension:** if every customer has the same value for a dimension, that
  dimension carries no signal, so every customer receives the documented neutral middle
  score (3 on a 5-point scale) instead of an arbitrary one.
- Datasets under 20 customers raise a warning that segment shares are indicative only.

Two different numbers are always reported separately:

| Value | Example | Meaning |
| --- | --- | --- |
| RFM pattern | `555` | The concatenated score — a behaviour label |
| RFM score sum | `15` | The arithmetic sum of the three scores |

## 10. Customer segmentation rules

Rules are evaluated in priority order; the first match wins, so segments never overlap
and the counts always sum to the classified customer count.

| # | Segment | Explicit rule | Suggested strategy |
| --- | --- | --- | --- |
| 1 | **Champions** | R ≥ 4 AND F ≥ 4 AND M ≥ 4 | Reward loyalty, exclusive offers, referrals |
| 2 | **Loyal Customers** | R ≥ 3 AND F ≥ 4 | Loyalty rewards, personalised recommendations |
| 3 | **Big Spenders** | M ≥ 4 AND R ≥ 3 | Premium products and services, not discounts |
| 4 | **Potential Loyalists** | R ≥ 4 AND F ≥ 2 | Encourage the next purchase |
| 5 | **Recent Customers** | R ≥ 4 | Onboarding offers and recommendations |
| 6 | **Customers Needing Attention** | R = 3 | Targeted promotions before activity drops |
| 7 | **At-Risk Customers** | R ≤ 2 AND F ≥ 3 | Win-back campaigns with incentives |
| 8 | **Lost Customers** | R ≤ 2 AND inactivity ≥ threshold (default 180 days) | Judge whether reactivation is worth the margin |
| 9 | **Hibernating Customers** | all remaining low-activity customers | Low-cost re-engagement test |

Thresholds are configurable in **Settings**; the analysis is recalculated without
re-uploading. This is deterministic rule-based segmentation, **not** machine-learning
clustering.

## 11. Currency handling

- All reporting is in **INR (₹)** with Indian digit grouping:
  `₹1,500` · `₹25,000` · `₹1,25,000` · `₹12,50,000` · `₹1,00,00,000`.
- The source currency is **never assumed**. The user confirms it during upload.
- If the source is not INR, an **explicit conversion rate is required** before the
  pipeline will run. The rate, its date and a note are stored on the dataset and appear
  in every export and the PDF report.
- No exchange rate is ever invented or silently fetched.
- Conversion is applied once per line; values are rounded to two decimals.
- Gross sales, returned value and net revenue are reported separately so cancellations
  and returns are never double counted.

## 12. Dataset format

| Field | Required | Accepted header examples |
| --- | --- | --- |
| Invoice / Transaction ID | Yes | `InvoiceNo`, `Invoice`, `TransactionID`, `OrderID` |
| Customer ID | Yes | `CustomerID`, `Customer`, `CustID` |
| Transaction Date | Yes | `InvoiceDate`, `TransactionDate`, `Date` |
| Quantity | Yes | `Quantity`, `Qty`, `Units` |
| Unit Price | Yes | `UnitPrice`, `Price`, `Rate` |
| Product ID / SKU | No | `StockCode`, `ProductID`, `SKU` |
| Product Name | No | `Description`, `ProductName` |
| Country / Region | No | `Country`, `Region` |

Accepted date formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `DDMMYYYY`, ISO timestamps and Excel
serial numbers. Prices may include currency symbols, thousands separators and
parentheses for negatives. Maximum upload size: 15 MB.

**Sample dataset.** A deterministic synthetic file (~2,000 transactions, ~240 customers,
18 months) ships with the app. It deliberately contains duplicates, blank customer IDs,
invalid dates, negative prices, cancelled orders and returns so the cleaning pipeline has
real work to do. It is labelled as sample data everywhere it appears and must never be
presented as real business performance.

## 13. Installation and local development

### Prerequisites

1. Clone the repository using the project's Git URL.
2. `npm install`
3. `npm install -g base44@latest`
4. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) — the local Base44 backend runs on it.

### Run locally

Three commands, from the project root:

```bash
base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + frontend together
```

Open the frontend URL that `base44 dev` prints (typically `http://localhost:5173`).

Notes:

- **Every fresh clone needs `base44 link`.** It writes `base44/.app.jsonc` (the app-id
  pointer), which is deliberately gitignored. Your app id is in the Builder URL
  (`app.base44.com/apps/<id>/...`).
- **`base44 dev` runs the frontend for you** (via `site.serveCommand` in
  `base44/config.jsonc`) — don't run `npm run dev` alongside it: the second Vite takes
  the next port and you end up looking at the wrong one.
- **The app must be published at least once for the UI to load under `base44 dev`.**
- Entity data under `base44 dev` is **in-memory only** and is wiped on restart.

Frontend-only against the live hosted backend (writes reach production data):

```bash
base44 dev --remote
```

Other scripts:

```bash
npm run build     # production build
npm run lint      # eslint
```

### Loading the sample dataset

Open the app → **Upload Dataset** → **Load sample dataset** → Continue → Continue →
**Run cleaning and RFM analysis**. Nothing needs to be downloaded first. A
**Download sample CSV** button on the same screen produces the file for inspection.

## 14. API documentation

This project uses the platform's typed backend functions and collection queries rather
than a separate REST service. The equivalents of the requested endpoints are:

| Requested endpoint | Implementation |
| --- | --- |
| `POST /api/datasets/upload` | Client parse + `ingestRows` function + `Dataset` create |
| `GET /api/datasets` | `Dataset.list` (sorted, paged) |
| `GET /api/datasets/{id}` | `Dataset.get` |
| `POST /api/datasets/{id}/clean` | `runPipeline` (cleaning + classification + quality report) |
| `GET /api/datasets/{id}/quality-report` | `Dataset.get` → `quality` |
| `POST /api/datasets/{id}/analyze` | `runPipeline` (RFM + scores + segments + insights) |
| `GET /api/datasets/{id}/dashboard` | `Dataset.get` → `summary` |
| `GET /api/datasets/{id}/segments` | `Dataset.get` → `summary.segments` |
| `GET /api/datasets/{id}/customers` | `CustomerRfm.filter` (filter, sort, limit, cursor, count) |
| `GET /api/datasets/{id}/customers/{cid}` | `CustomerRfm.get` + `Transaction.filter` |
| `GET /api/datasets/{id}/insights` | `Dataset.get` → `insights` |
| `GET /api/datasets/{id}/exports/{type}` | Client-side CSV builders from stored records |
| `GET /api/datasets/{id}/reports` | `Report.filter` |
| `GET /api/health` | Dashboard loads without error after publish |

Functions:

| Function | Purpose |
| --- | --- |
| `ingestRows` | Validates and stores up to 1,000 mapped rows per call |
| `runPipeline` | Full clean → classify → RFM → score → segment → summarise → insight run |
| `runSelfTests` | Runs the deterministic unit + integration test suite |
| `readSpreadsheet` | Reads XLSX/XLS through the platform's extraction service |

Every query is validated and bounded: pagination, field selection, server-side
filtering and error messages with meaningful status codes. No endpoint returns an entire
collection when a page will do.

## 15. Database schema

| Collection | Grain | Key fields |
| --- | --- | --- |
| `Dataset` | One per analysis run | name, status, currencies + conversion, column mapping, cleaning & segment config, row counts, revenue totals, `quality`, `summary`, `insights`, `warnings` |
| `Transaction` | One per transaction line | `dataset_id`, row index, invoice, product, quantity, unit price, date, customer, country, classification, exclusion reason, inclusion flag, net line revenue |
| `CustomerRfm` | One per customer | `dataset_id`, customer ID, first/last purchase, recency, frequency, monetary, gross, returned value, R/F/M scores, RFM pattern, RFM sum, segment, reason, recommended action |
| `Report` | One per generated export | `dataset_id`, report type, format, title, row count |

Every collection is protected by row-level security scoped to the owner, with
administrators able to see all. Large files are never stored in database fields.

## 16. Testing

Run the suite live from the app: **Test Suite** → **Run the test suite**.

It runs a deterministic reference dataset with **hand-verified expected values** through
the real engine, plus integration tests that create a temporary dataset, invoke the
actual ingestion and pipeline functions, assert the persisted results and then delete
everything they created — including on failure.

Coverage: data upload, column mapping, cleaning, duplicate detection, cancelled
transaction handling, return handling, INR calculations, RFM calculation, quantile
scoring, customer segmentation, dashboard KPI aggregation, customer filtering, export
generation, invalid dataset handling and API error handling.

Verified invariants include:

- Recency decreases when the latest purchase becomes more recent.
- Frequency counts distinct invoices (two product lines on one invoice = 1 order).
- Monetary uses quantity × unit price, and returns reduce it.
- Score direction is correct in all three dimensions.
- Segment counts add up to the classified customer count.
- Segment revenue adds up to total net revenue.
- Dashboard revenue matches exported revenue totals.
- INR formatting is consistent (`₹1,25,000`, `₹1,00,00,000`).
- Empty, single-customer and all-identical datasets never crash the application.
- Cancelled orders create neither frequency nor revenue.
- Currency conversion applies to every monetary figure.

## 17. Tableau integration

Six Tableau-ready datasets are generated from the stored analysis:

| File | Grain |
| --- | --- |
| `cleaned_transactions.csv` | One row per transaction line |
| `customer_rfm_analysis.csv` | One row per customer (R/F/M values + scores) |
| `customer_segments.csv` | One row per customer (segment, reason, action) |
| `segment_summary.csv` | One row per segment |
| `monthly_revenue.csv` | One row per month |
| `data_quality_report.csv` | One row per quality metric |

- [`tableau/README.md`](tableau/README.md) — how to connect each file to Tableau Desktop
  and Tableau Public.
- [`tableau/dashboard_design.md`](tableau/dashboard_design.md) — the eight recommended
  sheets, six filters and the dashboard actions that make segment selection filter the
  customer detail.
- [`tableau/data_dictionary.md`](tableau/data_dictionary.md) — every column, its type and
  its meaning.

**No Tableau workbook has been created or published.** Tableau is not installed or
authenticated in this environment, so the export pipeline and the setup documentation
are complete while the workbook itself is a manual step.

## 18. Deployment

Publish from the app dashboard. There is no API base URL to configure and no `localhost`
address in the production build — the client reaches the backend through the SDK.

See [`docs/deployment.md`](docs/deployment.md) for publishing, custom domains,
configuration locations, health checks and troubleshooting. **This app is not published
yet, so no live URL exists.**

## 19. Project structure

```
.
├── src/
│   ├── components/          UI building blocks
│   │   ├── charts/          the 12 dashboard visualisations
│   │   ├── dashboard/       KPI grid and dashboard composition
│   │   ├── upload/          upload wizard steps
│   │   ├── explorer/        customer filters, table, spend trend
│   │   ├── insights/        insight card
│   │   └── quality/         quarantined-row table
│   ├── lib/                 formatting, CSV, exporters, sample data, constants, store
│   ├── pages/               the 13 application pages
│   └── index.css            design tokens and typography
├── base44/
│   ├── entities/            Dataset · Transaction · CustomerRfm · Report
│   ├── functions/           ingestRows · runPipeline · runSelfTests · readSpreadsheet
│   └── shared/analytics.ts  the analytics core (single source of truth)
├── docs/                    architecture · methodology · deployment · user guide
├── tableau/                 README · dashboard design · data dictionary
├── .env.example
├── README.md
└── package.json
```

## 20. Screenshots

Add screenshots of your own run to a `docs/screenshots/` folder to complete the
portfolio. The screens worth capturing:

| File to add | What to capture |
| --- | --- |
| `docs/screenshots/dashboard.png` | The dashboard with the eight KPI cards and charts |
| `docs/screenshots/upload-mapping.png` | The column-mapping step with the data preview |
| `docs/screenshots/data-quality.png` | The cleaning report metrics and quarantined rows |
| `docs/screenshots/segments.png` | The nine segment cards |
| `docs/screenshots/explorer.png` | The customer explorer table with filters applied |
| `docs/screenshots/profile.png` | A customer profile with metrics and transaction history |
| `docs/screenshots/tests.png` | The test suite results |

## 21. Limitations and honesty notes

- Results describe **only the uploaded dataset** — they are not a whole-company view.
- Segment boundaries are configurable business rules; different thresholds produce
  different segment sizes.
- RFM ranks customers relative to each other inside one dataset, so a score can change
  when the dataset changes.
- Quantile scoring assigns identical scores to tied customers, so small datasets can
  produce few distinct scores.
- This is rule-based segmentation, not predictive modelling. No churn probability,
  forecast, or causal claim is made.
- Excel import depends on the platform's spreadsheet extraction service; very large
  workbooks are best exported to CSV first.
- **Tableau workbooks are not created or published automatically.**
- **The Python/FastAPI/SQLite/Docker deliverables from the original brief cannot run in
  this environment**, so no container or database configuration is shipped that could
  not actually execute here.
- The sample dataset is synthetic. Its numbers are illustrative and are never presented
  as real business performance.

## 22. Future enhancements

- A scheduled pipeline refreshing the analysis from a connected data source.
- Customer lifetime value and churn-probability modelling on top of the RFM features.
- K-means / hierarchical clustering to compare statistical clusters against the
  rule-based segments.
- Campaign outcome tracking so recommended actions can be measured, not assumed.
- Cohort retention curves and market-basket analysis on the product dimension.
- A published Tableau Public workbook built from the exported datasets.

---

## Git and publishing workflow

Any change pushed to the repository is also reflected in the Base44 Builder.

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
base44 dashboard open
```

This repo syncs to Base44 through git, so publish from the dashboard rather than
`base44 deploy` — a CLI deploy ships your local tree directly, bypassing the sync, and
the deployed state silently diverges from the repo.

**Docs & support**

- GitHub integration: <https://docs.base44.com/developers/app-code/local-development/github>
- Local development: <https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview>
- Support: <https://app.base44.com/support>