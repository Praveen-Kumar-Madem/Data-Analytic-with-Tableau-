# User guide

## The 60-second path

1. Open **Upload Dataset**.
2. Click **Load sample dataset** — a labelled, synthetic e-commerce file with ~2,000
   transactions across ~240 customers loads instantly.
3. Confirm the column mapping (all eight fields are detected automatically).
4. Confirm currency (INR → INR) and the cleaning rules, then click
   **Run cleaning and RFM analysis**.
5. **Data Cleaning Report** opens. Then explore **Dashboard**, **Customer Explorer**
   and **Business Insights**.

## Using your own data

### Supported files

CSV, XLSX and XLS up to 15 MB. The file is stored privately in your workspace.

### Expected columns

| Field | Required | Accepted header examples |
| --- | --- | --- |
| Invoice / Transaction ID | Yes | InvoiceNo, Invoice, TransactionID, OrderID |
| Customer ID | Yes | CustomerID, Customer, CustID |
| Transaction Date | Yes | InvoiceDate, TransactionDate, Date |
| Quantity | Yes | Quantity, Qty, Units |
| Unit Price | Yes | UnitPrice, Price, Rate |
| Product ID / SKU | No | StockCode, ProductID, SKU |
| Product Name | No | Description, ProductName |
| Country / Region | No | Country, Region |

Column names do not need to match — map them once on the mapping step.

### Step by step

1. **Upload** your file, or download the sample CSV to see the expected shape.
2. **Preview & map** — check the first rows and fix any mapping the auto-detector got wrong.
3. **Currency & rules** — confirm the source currency. If it is not INR you must enter
   an explicit conversion rate and its date; the platform never invents a rate. Choose
   how duplicates and returns are treated and how the RFM reference date is chosen.
4. **Run** — progress is shown per phase. Large files take a little longer because every
   row is classified individually.
5. **Data cleaning report** — read the quality metrics and scroll the table of excluded
   rows to see exactly what was quarantined and why.
6. **Dashboard** — eight KPIs and twelve charts. Click a segment bar to jump to those
   customers.
7. **Customer explorer** — search by ID, filter by segment, value, recency or RFM
   pattern, sort, page through and export the filtered result.
8. **Customer profile** — open any customer for the stored metrics, the exact reason for
   the segment, the recommended strategy, the spending trend and the full transaction
   history (including rows excluded from RFM).
9. **Business insights** — findings with the metric behind each one.
10. **Export & reports** — download the six Tableau-ready datasets or the PDF report.

## Reading the numbers

- **Recency** is in days and lower is better.
- **Frequency** counts distinct invoices, not product lines.
- **Monetary** is net revenue: quantity × unit price, minus any returns for that customer.
- **RFM pattern** (e.g. `455`) is a label; **RFM score sum** (e.g. `14`) is a different
  measure. They are never interchangeable.
- Every monetary figure is in Indian Rupees with Indian digit grouping.

## Common questions

**Why are some rows excluded?** Missing customer ID, unparseable dates, invalid
quantities or prices, duplicates and cancellations cannot be used for customer-level
analysis. They are always counted, classified and downloadable — never silently dropped.

**Why is a segment empty?** No customer met that rule in this dataset. The platform shows
the empty segment rather than inventing customers.

**Can I change the thresholds?** Yes — **Settings** → adjust the segmentation thresholds
and cleaning rules → **Recalculate analysis**. No re-upload is needed.

**Does the dashboard change if I change filters?** KPIs are calculated per dataset.
Filters on the explorer are applied server-side across the whole customer base.