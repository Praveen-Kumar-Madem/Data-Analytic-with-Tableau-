# Architecture

## Overview

The platform is a full-stack RFM analytics application. The React single-page app
handles presentation and interaction; a managed backend service owns the analytics
engine, the data store and the pipeline.

```
┌──────────────────────────────────────────────────────────────┐
│  React SPA (Vite)                                            │
│  Dashboard · Upload wizard · Data quality · RFM · Segments    │
│  Customer explorer · Profile · Insights · Exports · Tableau   │
│  Tests · Settings · Docs                                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ SDK queries + function invocations
┌───────────────────────────▼──────────────────────────────────┐
│  Backend functions                                            │
│  ingestRows · runPipeline · runSelfTests · readSpreadsheet    │
└───────────────────────────┬──────────────────────────────────┘
                            │ imports
┌───────────────────────────▼──────────────────────────────────┐
│  base44/shared/analytics.ts — the analytics core              │
│  parse → clean & classify → RFM → score → segment →           │
│  summarise → insights                                          │
└───────────────────────────┬──────────────────────────────────┘
                            │ reads / writes
┌───────────────────────────▼──────────────────────────────────┐
│  Collections (row-level security on every one)                │
│  Dataset · Transaction · CustomerRfm · Report                 │
└──────────────────────────────────────────────────────────────┘
```

## Why one shared analytics module

Cleaning, RFM calculation, scoring, segmentation, the dashboard summary and the
insight generator all live in `base44/shared/analytics.ts`. Every backend function
imports it, and the test suite exercises it directly. The analytical logic exists
exactly once, so a rule change cannot drift between the pipeline and the tests.

## Dataset isolation

Every `Transaction` and `CustomerRfm` record carries a `dataset_id`. Re-running the
pipeline deletes only that dataset's derived customer records and rewrites them.
Two analyses can never mix, and a user can run the same file with different
thresholds and compare the results side by side.

## Request and data flow

1. The browser parses the uploaded CSV (or the sample dataset) and holds the raw
   matrix in memory. Column mapping is applied client-side into canonical field names.
2. `ingestRows` validates and stores the mapped rows in bounded batches of 900,
   returning the insert count so the UI can show real progress.
3. `runPipeline` reads every stored row back, classifies it, writes the
   classification, exclusion reason, inclusion flag and net line revenue, then
   builds one `CustomerRfm` record per customer.
4. The same call writes the dashboard summary (KPIs, segment aggregates, monthly
   series, distributions, top customers and scatter points) and the insights onto
   the `Dataset` record.
5. The dashboard therefore renders from a single record read. The explorer and
   profile query `CustomerRfm` directly with server-side filtering, sorting,
   counting and cursor pagination.
6. Exports stream the stored records into CSV; the PDF report is composed in the
   browser from the same stored values.

## Why the summary is precomputed

Recalculating segment revenue, the monthly series and the score distributions on
every dashboard render would mean either loading the whole collection or issuing
many aggregate queries. Computing them once inside the pipeline makes the dashboard
a single fast read and guarantees that the dashboard, the exports and the PDF all
report identical numbers.

## Storage decisions

- Transaction lines are stored (not the original file), so the customer profile can
  show real purchase history.
- Large binaries are never placed in database fields. Uploads go to file storage and
  only analysed rows are persisted.
- The dashboard summary is bounded: the scatter series is capped at 300 points and
  the top-customer list at 10, keeping the record small.

## Environment mapping

| Requested stack | What this environment provides |
| --- | --- |
| React + Vite frontend | Same — React 18 + Vite + Tailwind + Recharts |
| Python FastAPI service layer | Backend functions on a managed serverless runtime |
| SQLAlchemy models | Typed collections with explicit JSON schemas |
| SQLite / PostgreSQL | Managed document store with row-level security |
| Docker Compose | Not applicable — the platform builds and hosts the app |
| REST endpoints | SDK collection queries (server-side filter/sort/page/count) |