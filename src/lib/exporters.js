import { jsPDF } from "jspdf";
import { base44 } from "@/api/base44Client";
import { downloadBlob, downloadCsv, fetchAllPages } from "@/lib/csv";
import { formatINR, formatDate, formatMonthLabel, formatNumber, formatPercent, formatDecimal } from "@/lib/format";

export const EXPORT_FILES = [
  { key: "cleaned_transactions", filename: "cleaned_transactions.csv", title: "cleaned_transactions.csv", description: "One row per transaction line with its cleaning classification, exclusion reason and net revenue." },
  { key: "customer_rfm_analysis", filename: "customer_rfm_analysis.csv", title: "customer_rfm_analysis.csv", description: "One row per customer with Recency, Frequency, Monetary values and their 1–5 scores." },
  { key: "customer_segments", filename: "customer_segments.csv", title: "customer_segments.csv", description: "One row per customer with the assigned segment, the reason and the recommended action." },
  { key: "segment_summary", filename: "segment_summary.csv", title: "segment_summary.csv", description: "Segment-level totals: customers, net revenue, average recency, frequency and scores." },
  { key: "monthly_revenue", filename: "monthly_revenue.csv", title: "monthly_revenue.csv", description: "Monthly gross sales, returns, net revenue, orders and active customers." },
  { key: "data_quality_report", filename: "data_quality_report.csv", title: "data_quality_report.csv", description: "Every data-quality metric produced by the cleaning pipeline." }
];

function slug(text) {
  return String(text || "dataset")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function fetchTransactions(datasetId) {
  return fetchAllPages((opts) => base44.entities.Transaction.filter({ dataset_id: datasetId }, { ...opts, sort: "row_index" }));
}

export async function fetchCustomers(datasetId) {
  return fetchAllPages((opts) => base44.entities.CustomerRfm.filter({ dataset_id: datasetId }, { ...opts, sort: "-monetary" }));
}

export function buildCleanedTransactions(rows) {
  const columns = [
    { key: "row_index", label: "RowIndex" },
    { key: "invoice_no", label: "InvoiceNo" },
    { key: "product_id", label: "ProductCode" },
    { key: "description", label: "ProductName" },
    { key: "quantity", label: "Quantity" },
    { key: "transaction_date", label: "InvoiceDate" },
    { key: "unit_price", label: "UnitPrice" },
    { key: "customer_id", label: "CustomerID" },
    { key: "country", label: "Country" },
    { key: "classification", label: "Classification" },
    { key: "included_in_rfm", label: "IncludedInRFM", value: (r) => (r.included_in_rfm ? "TRUE" : "FALSE") },
    { key: "is_cancelled", label: "IsCancelled", value: (r) => (r.is_cancelled ? "TRUE" : "FALSE") },
    { key: "is_return", label: "IsReturn", value: (r) => (r.is_return ? "TRUE" : "FALSE") },
    { key: "line_revenue", label: "LineRevenueINR" },
    { key: "exclusion_reason", label: "ExclusionReason" }
  ];
  return { columns, rows };
}

export function buildCustomerRfm(rows) {
  const columns = [
    { key: "customer_id", label: "CustomerID" },
    { key: "country", label: "Country" },
    { key: "first_purchase_date", label: "FirstPurchaseDate" },
    { key: "last_purchase_date", label: "LastPurchaseDate" },
    { key: "recency_days", label: "RecencyDays" },
    { key: "frequency", label: "Frequency" },
    { key: "monetary", label: "MonetaryINR" },
    { key: "gross_monetary", label: "GrossMonetaryINR" },
    { key: "returned_value", label: "ReturnedValueINR" },
    { key: "avg_order_value", label: "AvgOrderValueINR" },
    { key: "r_score", label: "RScore" },
    { key: "f_score", label: "FScore" },
    { key: "m_score", label: "MScore" },
    { key: "rfm_score", label: "RFMScore" },
    { key: "rfm_sum", label: "RFMScoreSum" }
  ];
  return { columns, rows };
}

export function buildCustomerSegments(rows) {
  const columns = [
    { key: "customer_id", label: "CustomerID" },
    { key: "segment", label: "Segment" },
    { key: "segment_label", label: "SegmentLabel" },
    { key: "segment_reason", label: "SegmentReason" },
    { key: "recommended_action", label: "RecommendedAction" },
    { key: "recency_days", label: "RecencyDays" },
    { key: "frequency", label: "Frequency" },
    { key: "monetary", label: "MonetaryINR" },
    { key: "rfm_score", label: "RFMScore" }
  ];
  return { columns, rows };
}

export function buildSegmentSummary(summary) {
  const columns = [
    { key: "label", label: "Segment" },
    { key: "segment", label: "SegmentKey" },
    { key: "rule", label: "Rule" },
    { key: "customers", label: "Customers" },
    { key: "share_of_customers", label: "ShareOfCustomersPct" },
    { key: "revenue", label: "NetRevenueINR" },
    { key: "share_of_revenue", label: "ShareOfRevenuePct" },
    { key: "avg_monetary", label: "AvgMonetaryINR" },
    { key: "avg_recency_days", label: "AvgRecencyDays" },
    { key: "avg_frequency", label: "AvgFrequency" },
    { key: "avg_r_score", label: "AvgRScore" },
    { key: "avg_f_score", label: "AvgFScore" },
    { key: "avg_m_score", label: "AvgMScore" }
  ];
  return { columns, rows: (summary?.segments || []).filter((s) => s.customers > 0) };
}

export function buildMonthlyRevenue(summary) {
  const columns = [
    { key: "month", label: "Month" },
    { key: "gross", label: "GrossSalesINR" },
    { key: "returns", label: "ReturnsINR" },
    { key: "revenue", label: "NetRevenueINR" },
    { key: "orders", label: "Orders" },
    { key: "active_customers", label: "ActiveCustomers" },
    { key: "avg_order_value", label: "AvgOrderValueINR" }
  ];
  return { columns, rows: summary?.monthly || [] };
}

export function buildQualityReport(dataset) {
  const q = dataset.quality || {};
  const rows = [
    ["TotalRowsUploaded", q.totalRows],
    ["ValidRows", q.validRows],
    ["DuplicateRows", q.duplicateRows],
    ["MissingCustomerIDRows", q.missingCustomerRows],
    ["InvalidDateRows", q.invalidDateRows],
    ["InvalidQuantityRows", q.invalidQuantityRows],
    ["InvalidPriceRows", q.invalidPriceRows],
    ["CancelledTransactions", q.cancelledRows],
    ["ReturnedTransactions", q.returnRows],
    ["RowsExcludedFromRFM", q.excludedRows],
    ["RowsIncludedInRFM", q.includedInRfmRows],
    ["CustomersExcludedNoQualifyingPurchase", q.excludedCustomersNoPurchase],
    ["UniqueCustomers", q.uniqueCustomers],
    ["UniqueInvoices", q.uniqueInvoices],
    ["GrossSalesINR", q.grossRevenue],
    ["ReturnsValueINR", q.returnsValue],
    ["NetRevenueINR", q.netRevenue],
    ["AnalysisStart", q.dateStart],
    ["AnalysisEnd", q.dateEnd],
    ["RFMReferenceDate", q.referenceDate],
    ["SourceCurrency", dataset.source_currency],
    ["ReportingCurrency", dataset.reporting_currency || "INR"],
    ["ConversionRate", dataset.conversion_rate],
    ["ConversionDate", dataset.conversion_date],
    ["ConversionNote", dataset.conversion_note]
  ].filter(([, v]) => v !== undefined);
  return {
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" }
    ],
    rows: rows.map(([metric, value]) => ({ metric, value }))
  };
}

export function exportFileName(dataset, filename) {
  return `${slug(dataset?.name)}_${filename}`;
}

export function downloadDatasetCsv(dataset, key, data) {
  const map = {
    cleaned_transactions: () => buildCleanedTransactions(data),
    customer_rfm_analysis: () => buildCustomerRfm(data),
    customer_segments: () => buildCustomerSegments(data),
    segment_summary: () => buildSegmentSummary(data),
    monthly_revenue: () => buildMonthlyRevenue(data),
    data_quality_report: () => buildQualityReport(dataset)
  };
  const builder = map[key];
  if (!builder) throw new Error(`Unknown export "${key}"`);
  const meta = EXPORT_FILES.find((f) => f.key === key);
  const { columns, rows } = builder();
  downloadCsv(exportFileName(dataset, meta.filename), columns, rows);
  return rows.length;
}

/* --------------------------- PDF business report --------------------------- */

export function generatePdfReport(dataset) {
  const summary = dataset.summary || {};
  const kpis = summary.kpis || {};
  const segments = (summary.segments || []).filter((s) => s.customers > 0);
  const insights = dataset.insights || [];
  const q = dataset.quality || {};

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 46;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  const space = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (value, { size = 10, style = "normal", color = [30, 41, 59], gap = 5, width = usableWidth } = {}) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(String(value ?? "—"), width);
    space(lines.length * (size * 1.32));
    doc.text(lines, margin, y);
    y += lines.length * (size * 1.32) + gap;
  };

  const heading = (value) => {
    space(26);
    y += 6;
    text(value, { size: 12.5, style: "bold", color: [15, 23, 42], gap: 7 });
  };

  const keyValue = (label, value) => {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    space(14);
    doc.text(String(label), margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value ?? "—"), margin + 190, y);
    y += 14;
  };

  const table = (headers, rows) => {
    const colWidth = usableWidth / headers.length;
    space(20);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    headers.forEach((h, i) => doc.text(String(h), margin + i * colWidth, y));
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 11;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    rows.forEach((row) => {
      space(14);
      row.forEach((cell, i) => {
        const lines = doc.splitTextToSize(String(cell ?? "—"), colWidth - 6);
        doc.text(lines[0] || "", margin + i * colWidth, y);
      });
      y += 14;
    });
    y += 4;
  };

  // Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 96, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.setFont("helvetica", "bold");
  doc.text("E-Commerce Customer Segmentation", margin, 44);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("RFM Analysis — Business Report", margin, 66);
  y = 124;

  text(`Dataset: ${dataset.name}`, { size: 11, style: "bold", gap: 8 });
  if (dataset.is_sample) {
    text("This report uses synthetic sample data supplied with the platform and must not be read as real business performance.", {
      size: 9.5,
      color: [161, 98, 7],
      gap: 8
    });
  }

  heading("1. Dataset overview");
  keyValue("Rows uploaded", formatNumber(q.totalRows));
  keyValue("Valid transaction lines", formatNumber(q.validRows));
  keyValue("Rows excluded from RFM", formatNumber(q.excludedRows));
  keyValue("Analysis period", `${formatDate(q.dateStart)} → ${formatDate(q.dateEnd)}`);
  keyValue("RFM reference date", formatDate(kpis.reference_date));
  keyValue("Customers scored", formatNumber(kpis.total_customers));
  keyValue("Qualifying transactions", formatNumber(kpis.total_transactions));

  heading("2. Currency and conversion");
  text(
    `Source currency: ${dataset.source_currency || "INR"}. Reporting currency: ${dataset.reporting_currency || "INR"}. ${
      dataset.conversion_note || "No conversion applied."
    }`,
    { size: 9.5 }
  );
  if (dataset.conversion_rate && dataset.conversion_rate !== 1) {
    keyValue("Conversion rate to INR", dataset.conversion_rate);
    keyValue("Conversion date", dataset.conversion_date || "not recorded");
  }

  heading("3. Data cleaning summary");
  keyValue("Duplicate rows quarantined", formatNumber(q.duplicateRows));
  keyValue("Rows with missing Customer ID", formatNumber(q.missingCustomerRows));
  keyValue("Invalid transaction dates", formatNumber(q.invalidDateRows));
  keyValue("Invalid quantities", formatNumber(q.invalidQuantityRows));
  keyValue("Invalid unit prices", formatNumber(q.invalidPriceRows));
  keyValue("Cancelled transactions", formatNumber(q.cancelledRows));
  keyValue("Returned lines", formatNumber(q.returnRows));
  text(
    "No row is deleted. Every questionable row is classified, given a reason and retained for inspection in the data cleaning report.",
    { size: 9.5, color: [100, 116, 139] }
  );

  heading("4. RFM methodology");
  text(
    "Recency = analysis reference date − the customer's most recent qualifying purchase date (lower is better). Frequency = the number of distinct qualifying invoices (a multi-product invoice counts once). Monetary = total qualifying net purchase value, quantity × unit price, with returns netted according to the configured rule.",
    { size: 9.5 }
  );
  text(
    "Each dimension is scored 1–5 using quantile scoring on averaged ranks. Recency is reversed so the most recent customers score 5. Tied values share a score, and if every customer shares the same value for a dimension the neutral middle score is applied instead of an arbitrary one. The concatenated RFM score (for example 555) is shown separately from the sum of the three scores (for example 15).",
    { size: 9.5 }
  );

  heading("5. Customer segments and distribution");
  table(
    ["Segment", "Customers", "Share", "Net revenue", "Share"],
    segments.map((s) => [s.label, formatNumber(s.customers), formatPercent(s.share_of_customers), formatINR(s.revenue), formatPercent(s.share_of_revenue)])
  );
  segments.forEach((s) => {
    text(`${s.label} — ${s.rule}. ${s.description}`, { size: 9, color: [71, 85, 105] });
  });

  heading("6. Key business insights");
  insights.forEach((insight, idx) => {
    text(`${idx + 1}. ${insight.title}`, { size: 10, style: "bold", gap: 3 });
    text(insight.finding, { size: 9.3, gap: 3 });
    text(`Metric: ${insight.metric}`, { size: 8.8, color: [100, 116, 139], gap: 3 });
    text(`Interpretation: ${insight.interpretation}`, { size: 9, gap: 3 });
    text(`Recommended action: ${insight.action}`, { size: 9, gap: 9, color: [15, 118, 110] });
  });

  heading("7. At-risk customer summary");
  const risky = segments.filter((s) => ["at_risk", "lost", "hibernating", "needs_attention"].includes(s.segment));
  if (risky.length) {
    table(
      ["Segment", "Customers", "Avg days since purchase", "Avg orders", "Net revenue at stake"],
      risky.map((s) => [s.label, formatNumber(s.customers), formatNumber(s.avg_recency_days), formatDecimal(s.avg_frequency, 2), formatINR(s.revenue)])
    );
  } else {
    text("No at-risk segments were identified in this dataset.", { size: 9.5 });
  }

  heading("8. Recommended business actions");
  segments.forEach((s) => {
    text(`${s.label}: ${s.action}`, { size: 9.3, gap: 6 });
  });
  text("These are suggested strategies based on the computed segments, not guaranteed outcomes.", {
    size: 8.8,
    color: [100, 116, 139]
  });

  heading("9. Limitations and assumptions");
  const limitations = [
    `Results cover only the uploaded dataset (${formatNumber(q.totalRows)} source rows). They are not a whole-company view.`,
    "Segment boundaries are configurable business rules; different thresholds produce different segment sizes.",
    "RFM ranks customers relative to each other inside this dataset, so a customer's score can change when the dataset changes.",
    "Scoring uses quantile ranks. Dimensions with fewer distinct values than the score scale assign identical scores to tied customers.",
    "Rule-based RFM segmentation is not machine-learning clustering, and no predictive or causal claim is made.",
    "Where returns are netted, monetary value reflects net revenue; gross sales and returned value are reported separately.",
    dataset.conversion_rate && dataset.conversion_rate !== 1
      ? `Monetary figures were converted to INR at ${dataset.conversion_rate}${dataset.conversion_date ? ` (${dataset.conversion_date})` : ""}, supplied by the analyst.`
      : "All monetary figures are reported in Indian Rupees (INR)."
  ];
  limitations.forEach((l) => text(`• ${l}`, { size: 9, gap: 6 }));

  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated ${new Date().toISOString().slice(0, 10)} · Page ${p} of ${pageCount}`, margin, pageHeight - 22);
  }

  downloadBlob(`${slug(dataset.name)}_rfm_business_report.pdf`, doc.output("blob"), "application/pdf");
}

export function segmentRuleTable(segments) {
  return (segments || []).map((s) => ({
    label: s.label,
    rule: s.rule,
    description: s.description,
    customers: s.customers,
    revenue: s.revenue,
    avg_monetary: s.avg_monetary,
    avg_recency_days: s.avg_recency_days,
    avg_frequency: s.avg_frequency,
    share_of_customers: s.share_of_customers,
    share_of_revenue: s.share_of_revenue
  }));
}

export const MONTH_LABEL = formatMonthLabel;