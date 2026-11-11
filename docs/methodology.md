# Methodology

Everything below is implemented in `base44/shared/analytics.ts` and verified by the
test suite (`/tests` in the app).

## 1. Cleaning and validation

Rows are never deleted. Each row receives a `classification` and, when excluded, a
plain-language `exclusion_reason`.

| Classification | Trigger | Included in RFM |
| --- | --- | --- |
| `valid` | Passes every check | Yes |
| `duplicate` | Identical invoice, product, quantity, price, date and customer as an earlier line (when duplicates are set to *keep first*) | No |
| `missing_customer` | Blank Customer ID | No |
| `invalid_date` | Date cannot be parsed into a real calendar date | No |
| `invalid_quantity` | Quantity missing, non-numeric or zero | No |
| `invalid_price` | Price missing, non-numeric or negative (zero only if zero prices are rejected) | No |
| `cancelled` | Invoice number starts with the configured cancellation prefix (default `C`) | No |
| `return` | Negative quantity | Yes when returns are netted, otherwise No |

Accepted date formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `DDMMYYYY`, ISO timestamps and
Excel serial numbers. Prices may contain `₹`, `$`, thousands separators, and
parentheses for negatives.

## 2. Money

```
Line revenue    = Quantity × Unit Price × Conversion rate
Gross sales     = Σ line revenue where line revenue > 0
Returned value  = Σ |line revenue| where line revenue < 0
Net revenue     = Gross sales − Returned value
```

Gross sales, returned value and net revenue are reported separately, so cancelled
orders and returns are never double counted. All reporting is Indian Rupees with
Indian digit grouping (`₹1,25,000`).

## 3. RFM

```
Recency   = Reference date − most recent qualifying purchase date   (days)
Frequency = count of distinct qualifying invoices
Monetary  = Σ line revenue over qualifying lines                     (net of returns)
```

- One reference date is used for every customer. Default: the day after the latest
  qualifying transaction.
- Only lines with a positive quantity set the last-purchase date or add to frequency,
  so a credit note never creates an order.
- A multi-product invoice counts once for frequency.

## 4. Scoring

Quantile scoring on averaged ranks, 1–5 per dimension.

- Recency is reversed: the most recent customers score 5.
- Frequency and Monetary score higher for larger values.
- **Tied values** share an averaged rank and therefore an identical score — duplicate
  quantile boundaries cannot split equal customers.
- **Uniform dimension** (every customer identical on one dimension): that dimension
  carries no signal, so every customer receives the documented neutral middle score
  (3 on a 5-point scale).
- Datasets under 20 customers raise a warning that segment shares are indicative only.

Two distinct numbers are produced and always labelled separately:

- **RFM pattern** — the concatenation, e.g. `555`
- **RFM score sum** — the addition, e.g. `15`

## 5. Segmentation

Rules are evaluated in priority order and the first match wins, so every customer
belongs to exactly one segment and the counts always sum to the classified customer
count.

| # | Segment | Rule |
| --- | --- | --- |
| 1 | Champions | R ≥ 4 AND F ≥ 4 AND M ≥ 4 |
| 2 | Loyal Customers | R ≥ 3 AND F ≥ 4 |
| 3 | Big Spenders | M ≥ 4 AND R ≥ 3 |
| 4 | Potential Loyalists | R ≥ 4 AND F ≥ 2 |
| 5 | Recent Customers | R ≥ 4 |
| 6 | Customers Needing Attention | R = 3 |
| 7 | At-Risk Customers | R ≤ 2 AND F ≥ 3 |
| 8 | Lost Customers | R ≤ 2 AND inactivity ≥ lost threshold (default 180 days) |
| 9 | Hibernating Customers | all remaining low-activity customers |

Each customer stores a `segment_reason` written with its own score values, so no
customer is explained by a label alone.

This is deterministic rule-based segmentation, **not** machine-learning clustering,
and makes no predictive or causal claim.

## 6. Insights

Insights are generated only from computed values — segment shares, revenue
contribution, average recency/frequency, month-on-month movement, return rates and
data-quality counts. Each carries a finding, the supporting metric, a business
interpretation and a recommended action. When a threshold is not met, the insight is
not produced rather than padded with a vague statement.

## 7. Known analytical caveats

- RFM ranks customers relative to each other inside one dataset.
- Quantile scoring on a small dataset can produce few distinct scores.
- Segment boundaries are business rules; different thresholds change segment sizes.
- Results describe the uploaded dataset only.