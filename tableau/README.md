# Tableau integration

This folder documents how to reproduce the RFM analysis in **Tableau Desktop** or
**Tableau Public** using the datasets exported from the app.

> **No Tableau workbook has been created or published from this project.** Tableau is not
> installed or authenticated in the development environment. The export pipeline, the
> data dictionary and the dashboard specification are complete, and the workbook is a
> manual step documented here.

## 1. Export the datasets

Open the app → **Export & reports** → download all six files.

| File | Grain | Purpose |
| --- | --- | --- |
| `cleaned_transactions.csv` | One row per transaction line | Fact table for transaction-level analysis |
| `customer_rfm_analysis.csv` | One row per customer | Core RFM values and scores |
| `customer_segments.csv` | One row per customer | Segment, reason and recommended action |
| `segment_summary.csv` | One row per segment | Executive KPI tiles and share-of-revenue charts |
| `monthly_revenue.csv` | One row per month | Revenue and engagement trend lines |
| `data_quality_report.csv` | One row per metric | Audit trail of the cleaning pipeline |

Every file is generated from the same stored analysis as the dashboard, so totals always
agree. Column definitions: [`data_dictionary.md`](data_dictionary.md).

## 2. Connect in Tableau Desktop

1. **Connect → To a File → Text file**, then select `cleaned_transactions.csv` or
   `customer_rfm_analysis.csv`.
2. Confirm the data types in the Data Source pane:
   - `InvoiceDate`, `FirstPurchaseDate`, `LastPurchaseDate` → **Date**
   - `Month` → **Date** (the app exports `YYYY-MM`; set it to Date)
   - `LineRevenueINR`, `MonetaryINR`, `NetRevenueINR`, `AvgOrderValueINR` → **Number (decimal)**
   - Boolean columns (`IncludedInRFM`, `IsCancelled`, `IsReturn`) → **Boolean**
3. Set currency formatting to Indian digit grouping (see limitations below).
4. Drag the additional CSVs onto the canvas to create relationships:
   - `customer_rfm_analysis.csv` and `customer_segments.csv` relate on **CustomerID**.
   - `segment_summary.csv` joins `customer_segments.csv` on **Segment** / **SegmentKey**.
   - `monthly_revenue.csv` and `data_quality_report.csv` stay standalone.

## 3. Connect in Tableau Public

Open the browser authoring canvas and drag the same CSV files in. Column names and data
types are identical; only the connect step differs.

## 4. Build the dashboard

Follow [`dashboard_design.md`](dashboard_design.md) for the eight recommended sheets, the
six recommended filters and the dashboard actions that make selecting a segment filter
the customer-level detail.

## 5. Keeping a workbook current

CSV files are static snapshots. When the pipeline is re-run in the app:

1. Re-export the files (they are overwritten with the same names).
2. In Tableau, **Data → Refresh** on each connection, or right-click the extract and
   choose **Refresh**.

Otherwise the workbook silently shows stale segments and revenue.

## 6. Tableau-specific pitfalls

| Pitfall | What to do |
| --- | --- |
| Rupee formatting | Tableau's default currency format uses Western grouping (`₹125,000`). Set a custom currency format so lakh/crore grouping is used (`₹1,25,000`). |
| `RFMScore` is a **string** | Never aggregate it or sort it numerically. Use `RFMScoreSum` for numeric comparison and keep the pattern as a label. |
| Return lines | `LineRevenueINR` is **negative** on returns. Sum the signed column — do not sum absolute values, or net revenue will be wrong. |
| Excluded rows | Filter `IncludedInRFM = TRUE` before any recency, frequency or monetary aggregate, otherwise cancellations and duplicates are counted. |
| Extracts | Refresh the extract after every re-export, or the dashboard drifts from the app. |
| Segment colours | The app colours segments for continuity. Reproduce with a custom palette mapped on the `Segment` field if you want the boards to match. |

## 7. What Tableau adds beyond the app

- Published, shareable dashboards and scheduled subscriptions.
- Native export to PowerPoint and PDF for stakeholder packs.
- Blending with external sources (ad spend, inventory) for margin and CAC analysis.

The app remains the place where the data is cleaned, scored and segmented — Tableau is a
presentation layer over the same numbers.