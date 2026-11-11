# Data dictionary

Every column of every exported dataset, with its type and meaning.
All monetary columns are in Indian Rupees (₹) unless stated otherwise.

---

## cleaned_transactions.csv
*One row per transaction line, subject to the documented cleaning rules.*

| Column | Type | Description |
| --- | --- | --- |
| `RowIndex` | Number | Original row position in the uploaded file (0-based) |
| `InvoiceNo` | String | Invoice / transaction identifier |
| `ProductCode` | String | Product or SKU identifier |
| `ProductName` | String | Product description |
| `Quantity` | Number | Signed quantity; negative values are returns |
| `InvoiceDate` | Date `YYYY-MM-DD` | Normalised transaction date |
| `UnitPrice` | Number | Price per unit in the source currency, converted to ₹ |
| `CustomerID` | String | Customer identifier; blank for unattributed rows |
| `Country` | String | Country or region |
| `Classification` | String | `valid`, `return`, `cancelled`, `duplicate`, `missing_customer`, `invalid_date`, `invalid_quantity`, `invalid_price` |
| `IncludedInRFM` | Boolean `TRUE`/`FALSE` | Whether the line contributes to RFM |
| `IsCancelled` | Boolean `TRUE`/`FALSE` | Cancelled invoice flag |
| `IsReturn` | Boolean `TRUE`/`FALSE` | Return / credit line flag |
| `LineRevenueINR` | Number (₹) | Quantity × unit price after conversion; negative for returns, `0` for excluded rows |
| `ExclusionReason` | String | Plain-language reason when the row was excluded |

> Filter `IncludedInRFM = TRUE` before any recency, frequency or monetary aggregate.

---

## customer_rfm_analysis.csv
*One row per customer.*

| Column | Type | Description |
| --- | --- | --- |
| `CustomerID` | String | Customer identifier |
| `Country` | String | Country of the customer's transactions |
| `FirstPurchaseDate` | Date | Earliest qualifying purchase |
| `LastPurchaseDate` | Date | Most recent qualifying purchase |
| `RecencyDays` | Number | Reference date − last purchase date |
| `Frequency` | Number | Distinct qualifying invoices |
| `MonetaryINR` | Number (₹) | Net monetary value (quantity × unit price, net of returns) |
| `GrossMonetaryINR` | Number (₹) | Monetary value before returns |
| `ReturnedValueINR` | Number (₹) | Value returned by this customer |
| `AvgOrderValueINR` | Number (₹) | `MonetaryINR ÷ Frequency` |
| `RScore` | Number 1–5 | Recency score; 5 = most recent |
| `FScore` | Number 1–5 | Frequency score; 5 = most frequent |
| `MScore` | Number 1–5 | Monetary score; 5 = highest value |
| `RFMScore` | **String** | Concatenated pattern, e.g. `555` — never aggregate or sort numerically |
| `RFMScoreSum` | Number 3–15 | Sum of the three scores, e.g. `15` |

---

## customer_segments.csv
*One row per customer.*

| Column | Type | Description |
| --- | --- | --- |
| `CustomerID` | String | Customer identifier |
| `Segment` | String | Segment key: `champions`, `loyal`, `big_spenders`, `potential_loyalists`, `recent`, `needs_attention`, `at_risk`, `lost`, `hibernating` |
| `SegmentLabel` | String | Segment display name |
| `SegmentReason` | String | Why this customer matched the rule, including its own score values |
| `RecommendedAction` | String | Suggested engagement strategy for the segment |
| `RecencyDays` | Number | Days since last purchase |
| `Frequency` | Number | Qualifying invoices |
| `MonetaryINR` | Number (₹) | Net monetary value |
| `RFMScore` | String | Concatenated RFM pattern |

---

## segment_summary.csv
*One row per segment.*

| Column | Type | Description |
| --- | --- | --- |
| `Segment` | String | Segment display name |
| `SegmentKey` | String | Segment key used to join to the customer files |
| `Rule` | String | The explicit rule that defines the segment |
| `Customers` | Number | Customers in the segment |
| `ShareOfCustomersPct` | Number (%) | Share of all scored customers |
| `NetRevenueINR` | Number (₹) | Segment net revenue |
| `ShareOfRevenuePct` | Number (%) | Share of total net revenue |
| `AvgMonetaryINR` | Number (₹) | Average customer value |
| `AvgRecencyDays` | Number | Average days since last purchase |
| `AvgFrequency` | Number | Average qualifying invoices |
| `AvgRScore` | Number | Average recency score (radar charts) |
| `AvgFScore` | Number | Average frequency score |
| `AvgMScore` | Number | Average monetary score |

---

## monthly_revenue.csv
*One row per month.*

| Column | Type | Description |
| --- | --- | --- |
| `Month` | String `YYYY-MM` | Calendar month |
| `GrossSalesINR` | Number (₹) | Positive qualifying sales |
| `ReturnsINR` | Number (₹) | Value returned |
| `NetRevenueINR` | Number (₹) | Gross sales − returns |
| `Orders` | Number | Distinct qualifying invoices |
| `ActiveCustomers` | Number | Distinct customers who purchased |
| `AvgOrderValueINR` | Number (₹) | `NetRevenueINR ÷ Orders` |

---

## data_quality_report.csv
*One row per metric.*

| `Metric` value | Meaning |
| --- | --- |
| `TotalRowsUploaded` | Every row read from the file |
| `ValidRows` | Rows classified as valid purchase lines |
| `DuplicateRows` | Identical lines quarantined |
| `MissingCustomerIDRows` | Rows with a blank Customer ID |
| `InvalidDateRows` | Dates that could not be parsed |
| `InvalidQuantityRows` | Missing, non-numeric or zero quantities |
| `InvalidPriceRows` | Missing, non-numeric or negative prices |
| `CancelledTransactions` | Rows on invoices with the cancellation prefix |
| `ReturnedTransactions` | Rows with a negative quantity |
| `RowsExcludedFromRFM` | Total rows excluded from RFM |
| `RowsIncludedInRFM` | Total rows included in RFM |
| `CustomersExcludedNoQualifyingPurchase` | Customers with only returns or cancellations |
| `UniqueCustomers` | Distinct customers in the analysis |
| `UniqueInvoices` | Distinct qualifying invoices |
| `GrossSalesINR` | Gross sales before returns |
| `ReturnsValueINR` | Value returned |
| `NetRevenueINR` | Gross sales − returns |
| `AnalysisStart` / `AnalysisEnd` | First and last qualifying transaction dates |
| `RFMReferenceDate` | Reference date used for every recency calculation |
| `SourceCurrency` | Currency the uploaded file was denominated in |
| `ReportingCurrency` | Always `INR` |
| `ConversionRate` | Rate applied when the source was not INR |
| `ConversionDate` | Date of the conversion rate |
| `ConversionNote` | Where the rate came from |