# Tableau dashboard design specification

A recommended build for reproducing the app's dashboard in Tableau Desktop or Tableau
Public, using the six exported datasets.

> No workbook has been created from this specification. It is a design brief for a
> manual build.

## Datasets used

| Alias | File |
| --- | --- |
| TX | `cleaned_transactions.csv` |
| RFM | `customer_rfm_analysis.csv` |
| SEG | `customer_segments.csv` |
| SUM | `segment_summary.csv` |
| MON | `monthly_revenue.csv` |
| DQ | `data_quality_report.csv` |

Relationships: `RFM.CustomerID = SEG.CustomerID`, `SEG.Segment = SUM.SegmentKey`.

## Recommended sheets

### 1. Executive KPI Overview
**Source:** `SUM` + `RFM`
Eight KPI tiles matching the app:
total customers (`COUNTD(RFM.CustomerID)`), qualifying transactions
(`SUM(SUM.Customers)` is *not* valid here — use `RFM` grouped, or a separate `MON` sum
for orders), net revenue, average customer value, average recency, average frequency,
Champion count and At-Risk count.
Each tile is a single-value text mark with a descriptive subtitle.

### 2. Customer Segment Distribution
**Source:** `SUM`
Bar chart or packed bubbles: `SUM.Customers` by `SUM.Segment`, coloured by `SUM.Segment`.

### 3. Revenue by Segment
**Source:** `SUM`
Bar chart of `SUM.NetRevenueINR` by `SUM.Segment`, with a secondary donut of
`SUM.ShareOfRevenuePct`.

### 4. Monthly Revenue Trends
**Source:** `MON`
Dual-axis line: `SUM(NetRevenueINR)` as a line on the primary axis and
`SUM(ActiveCustomers)` on the secondary axis, over `MON.Month`.

### 5. RFM Score Analysis
**Source:** `RFM`
Three histograms (count of customers by `RScore`, `FScore`, `MScore`) plus a heat map of
customer counts with `RScore` on rows and `FScore` on columns.

### 6. Customer Value Analysis
**Source:** `RFM` (+ `SEG` for colour)
Scatter plot: `Frequency` on Columns, `MonetaryINR` on Rows, `CustomerID` on Detail,
`Segment` on Colour.

### 7. At-Risk Customer Analysis
**Source:** `SEG`
Table filtered to `Segment IN ('at_risk','lost','hibernating')`, sorted by
`MonetaryINR` descending, showing recency, frequency and the recommended action.

### 8. Customer-Level Detail
**Source:** `SEG` + `RFM`
Detail table: CustomerID, RecencyDays, Frequency, MonetaryINR, RFMScore, Segment,
SegmentReason, RecommendedAction. Show at most 500 rows and add a "top N by value"
parameter for performance.

## Recommended filters

| Filter | Field | Type |
| --- | --- | --- |
| Analysis period | `MON.Month` | Continuous date range |
| Customer segment | `SEG.Segment` / `SUM.Segment` | Multi-value list |
| Recency | `RFM.RecencyDays` | Range slider (e.g. 0–90 days) |
| Frequency | `RFM.Frequency` | Range slider or bins 1 / 2–3 / 4–6 / 7+ |
| Monetary value | `RFM.MonetaryINR` | Range slider in rupees |
| RFM scores | `RFM.RScore`, `FScore`, `MScore` | Individual discrete filters, or a calculated `RFMScore` filter |

Apply "All" to the relevant sheets so segment selection drives the whole dashboard.

## Dashboard actions

1. **Highlight action** — source: *Customer Segment Distribution*; target:
   *Customer-Level Detail*; field: `Segment`.
2. **Filter action** — source: *Customer Segment Distribution*; target:
   *Customer-Level Detail* (and *Customer Value Analysis*); select **Selected fields →
   Segment**. Clicking a segment bar then filters the customer table, mirroring the app.
3. **Drill-to-detail URL action** — source: *Customer-Level Detail*; URL:
   `/customers/<CustomerID>` when the app is published beside the workbook, so a click
   opens the full profile in this application.
4. **Reset action** — a "All segments" button that clears the segment filter, so the
   dashboard always has a route back to the full population.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ KPI tiles × 8 (total customers · transactions · net revenue │
│ · avg value · avg recency · avg frequency · champions ·     │
│ at-risk)                                                    │
├──────────────────────────┬──────────────────────────────────┤
│ Segment distribution     │ Revenue by segment               │
├──────────────────────────┼──────────────────────────────────┤
│ Monthly revenue trends (full width)                         │
├──────────────────────────┬──────────────────────────────────┤
│ RFM score analysis       │ Customer value vs frequency      │
├──────────────────────────┴──────────────────────────────────┤
│ Customer-level detail (filtered by the segment action)      │
└─────────────────────────────────────────────────────────────┘
```

## Currency and number formatting

Create a custom number format on every rupee measure so the workbook uses Indian digit
grouping consistently with the app:

`₹#,##,##0;[Red]-₹#,##,##0`

Never aggregate `RFMScore` — it is a string pattern. Use `RFMScoreSum` for numeric work.

## Limitations of the Tableau layer

- CSVs are static snapshots; refresh the extract after every re-run of the pipeline.
- Tableau cannot reproduce the app's exclusion-reason drill-down without
  `cleaned_transactions.csv`, which is why that file is exported.
- Colouring by segment requires a custom palette to match the app exactly.