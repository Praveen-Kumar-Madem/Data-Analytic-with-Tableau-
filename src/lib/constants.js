export const FIELD_DEFS = [
  { key: "invoice_no", label: "Invoice / Transaction ID", required: true, aliases: ["invoiceno", "invoice", "invoicenumber", "invoiceid", "transactionid", "orderid", "ordernumber", "billno"] },
  { key: "customer_id", label: "Customer ID", required: true, aliases: ["customerid", "customer", "custid", "clientid", "buyerid", "userid", "memberid"] },
  { key: "transaction_date", label: "Transaction Date", required: true, aliases: ["invoicedate", "transactiondate", "date", "orderdate", "purchasedate", "createdat", "datetime"] },
  { key: "quantity", label: "Quantity", required: true, aliases: ["quantity", "qty", "units", "itemcount", "pieces"] },
  { key: "unit_price", label: "Unit Price (₹)", required: true, aliases: ["unitprice", "price", "rate", "unitcost", "amountperunit", "sellingprice"] },
  { key: "product_id", label: "Product ID / SKU", required: false, aliases: ["stockcode", "productid", "sku", "itemcode", "productcode", "code"] },
  { key: "description", label: "Product Name", required: false, aliases: ["description", "productname", "itemdescription", "product", "productdescription", "item"] },
  { key: "country", label: "Country / Region", required: false, aliases: ["country", "region", "market", "billcountry", "shipcountry", "state"] }
];

export const REQUIRED_FIELD_KEYS = FIELD_DEFS.filter((f) => f.required).map((f) => f.key);

export function normalizeHeader(header) {
  return String(header || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Suggest a source column for each required field based on header names. */
export function autoMapColumns(headers) {
  const normalized = headers.map((h) => normalizeHeader(h));
  const mapping = {};
  const used = new Set();

  for (const field of FIELD_DEFS) {
    let found = headers.find((h, i) => normalized[i] === normalizeHeader(field.key) && !used.has(h));
    if (!found) {
      found = headers.find((h, i) => field.aliases.includes(normalized[i]) && !used.has(h));
    }
    if (!found) {
      found = headers.find((h, i) => !used.has(h) && field.aliases.some((a) => normalized[i].includes(a)));
    }
    if (found) {
      mapping[field.key] = found;
      used.add(found);
    }
  }
  return mapping;
}

export const SCORE_SCALE_OPTIONS = [3, 4, 5];

export const CLEANING_RULE_HELP = {
  duplicateHandling: {
    label: "Duplicate transactions",
    options: [
      { value: "keep_first", label: "Keep the first occurrence", help: "Later identical lines are quarantined so revenue is never double counted." },
      { value: "keep_all", label: "Keep every line", help: "Use only when repeated identical lines are genuinely separate sales." }
    ]
  },
  returnsHandling: {
    label: "Returns & negative quantities",
    options: [
      { value: "net", label: "Net against sales", help: "Returns reduce the customer's monetary value, so M reflects net revenue." },
      { value: "exclude", label: "Exclude from RFM", help: "Returns are reported separately and do not affect monetary scores." }
    ]
  }
};

export const SEGMENT_FILTER_OPTIONS = [
  "champions",
  "loyal",
  "big_spenders",
  "potential_loyalists",
  "recent",
  "needs_attention",
  "at_risk",
  "lost",
  "hibernating"
];

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/upload", label: "Upload Dataset", icon: "Upload" },
  { to: "/data-quality", label: "Data Cleaning Report", icon: "ShieldCheck" },
  { to: "/rfm", label: "RFM Analysis", icon: "Activity" },
  { to: "/segments", label: "Customer Segmentation", icon: "PieChart" },
  { to: "/customers", label: "Customer Explorer", icon: "Users" },
  { to: "/insights", label: "Business Insights", icon: "Lightbulb" },
  { to: "/exports", label: "Export & Reports", icon: "Download" },
  { to: "/tableau", label: "Tableau Integration", icon: "BarChart3" },
  { to: "/tests", label: "Test Suite", icon: "FlaskConical" },
  { to: "/settings", label: "Settings", icon: "Settings" },
  { to: "/docs", label: "Documentation", icon: "BookOpen" }
];