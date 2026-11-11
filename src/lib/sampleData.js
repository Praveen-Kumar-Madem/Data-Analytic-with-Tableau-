/**
 * Deterministic synthetic e-commerce dataset generator.
 *
 * The data is entirely fabricated — it exists so the platform can be
 * demonstrated immediately. It is clearly labelled as sample data everywhere
 * it appears and must never be presented as real business performance.
 */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261011);

const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const END_DATE = "2026-09-30";
const START_DATE = "2025-04-01";

const PRODUCTS = [
  ["SKU-1001", "Wireless Headphones", 2499],
  ["SKU-1002", "Bluetooth Speaker", 1899],
  ["SKU-1003", "Smart Watch", 3499],
  ["SKU-1004", "Fitness Band", 1299],
  ["SKU-1005", "Power Bank 20000mAh", 999],
  ["SKU-1006", "USB-C Fast Charger", 749],
  ["SKU-1007", "Laptop Sleeve", 699],
  ["SKU-1008", "Travel Backpack", 1499],
  ["SKU-1009", "Insulated Water Bottle", 399],
  ["SKU-1010", "Coffee Grinder", 2199],
  ["SKU-1011", "Electric Kettle", 1599],
  ["SKU-1012", "Air Fryer 4L", 4999],
  ["SKU-1013", "Mixer Grinder", 3299],
  ["SKU-1014", "Table Lamp", 899],
  ["SKU-1015", "Desk Organiser", 549],
  ["SKU-1016", "Hardcover Notebook", 149],
  ["SKU-1017", "Gel Pen Set", 199],
  ["SKU-1018", "Ergonomic Office Chair", 6999],
  ["SKU-1019", "Standing Desk", 12999],
  ["SKU-1020", "Monitor Stand", 1799],
  ["SKU-1021", "Mechanical Keyboard", 1499],
  ["SKU-1022", "Wireless Mouse", 799],
  ["SKU-1023", "HD Webcam", 2199],
  ["SKU-1024", "Ring Light", 899],
  ["SKU-1025", "Phone Case", 299],
  ["SKU-1026", "Tempered Glass Guard", 199],
  ["SKU-1027", "Polarised Sunglasses", 1299],
  ["SKU-1028", "Wrist Watch", 2999],
  ["SKU-1029", "Running Shoes", 2799],
  ["SKU-1030", "Yoga Mat", 799],
  ["SKU-1031", "Dumbbell Set 10kg", 2499],
  ["SKU-1032", "Vitamin C Face Serum", 699]
];

const COUNTRIES = ["India", "India", "India", "India", "India", "India", "United Arab Emirates", "Singapore", "United Kingdom"];

const ARCHETYPES = [
  { key: "champions", count: 12, orders: [7, 13], last: [2, 22], span: 210, qty: [1, 3], mul: 2.6 },
  { key: "loyal", count: 22, orders: [5, 10], last: [5, 40], span: 260, qty: [1, 3], mul: 1.8 },
  { key: "big_spenders", count: 12, orders: [1, 3], last: [8, 45], span: 190, qty: [1, 2], mul: 5.5 },
  { key: "potential_loyalists", count: 28, orders: [2, 4], last: [3, 35], span: 170, qty: [1, 2], mul: 1.3 },
  { key: "recent", count: 30, orders: [1, 2], last: [2, 30], span: 55, qty: [1, 2], mul: 1.0 },
  { key: "needs_attention", count: 34, orders: [2, 5], last: [62, 118], span: 300, qty: [1, 2], mul: 1.1 },
  { key: "at_risk", count: 28, orders: [5, 11], last: [150, 300], span: 330, qty: [1, 3], mul: 1.9 },
  { key: "hibernating", count: 38, orders: [1, 3], last: [95, 240], span: 280, qty: [1, 2], mul: 0.8 },
  { key: "lost", count: 34, orders: [1, 4], last: [205, 400], span: 330, qty: [1, 2], mul: 0.7 }
];

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDays(isoDate, days) {
  return toIso(new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86400000));
}

function toDisplayDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Build the sample dataset.
 * Returns { rows, columns, meta } where columns are the canonical field keys.
 */
export function generateSampleData() {
  const end = new Date(`${END_DATE}T00:00:00Z`);
  const start = new Date(`${START_DATE}T00:00:00Z`);
  const lines = [];
  let invoiceSeq = 10001;
  let customerSeq = 1;

  for (const arch of ARCHETYPES) {
    for (let n = 0; n < arch.count; n += 1) {
      const customerId = `CUST-${String(customerSeq).padStart(4, "0")}`;
      customerSeq += 1;
      const country = pick(COUNTRIES);
      const orderCount = randInt(arch.orders[0], arch.orders[1]);
      const lastOffset = randInt(arch.last[0], arch.last[1]);
      let anchor = shiftDays(END_DATE, -lastOffset);
      if (Date.parse(`${anchor}T00:00:00Z`) < start.getTime()) anchor = shiftDays(START_DATE, randInt(3, 40));

      const orderDates = [];
      let cursor = anchor;
      for (let o = 0; o < orderCount; o += 1) {
        orderDates.push(cursor);
        const gap = Math.max(3, Math.round((arch.span / Math.max(orderCount, 1)) * (0.55 + rand() * 0.9)));
        const next = shiftDays(cursor, -gap);
        cursor = Date.parse(`${next}T00:00:00Z`) < start.getTime() ? shiftDays(START_DATE, randInt(0, 25)) : next;
      }

      for (const date of orderDates) {
        const invoiceNo = `INV-${invoiceSeq}`;
        invoiceSeq += 1;
        const lineCount = randInt(1, 3);
        for (let l = 0; l < lineCount; l += 1) {
          const [productId, description, basePrice] = pick(PRODUCTS);
          const price = Math.max(49, Math.round(basePrice * arch.mul * (0.85 + rand() * 0.35)));
          lines.push({
            invoiceNo,
            productId,
            description,
            quantity: randInt(arch.qty[0], arch.qty[1]),
            date,
            price,
            customerId,
            country
          });
        }
      }
    }
  }

  /* --- Realistic imperfections so the cleaning pipeline has real work --- */
  const noise = [];

  for (let i = 0; i < 26; i += 1) {
    const src = pick(lines);
    noise.push({ ...src, customerId: "", invoiceNo: `INV-${invoiceSeq++}` });
  }
  for (let i = 0; i < 12; i += 1) noise.push({ ...pick(lines) });

  const badDates = ["31/02/2026", "N/A", "", "2026-13-45", "not recorded"];
  for (let i = 0; i < 9; i += 1) {
    const src = pick(lines);
    noise.push({ ...src, date: pick(badDates), invoiceNo: `INV-${invoiceSeq++}` });
  }

  for (let i = 0; i < 6; i += 1) {
    const src = pick(lines);
    noise.push({ ...src, price: -Math.abs(src.price), invoiceNo: `INV-${invoiceSeq++}` });
  }

  for (let i = 0; i < 18; i += 1) {
    const src = pick(lines);
    noise.push({ ...src, invoiceNo: `C${invoiceSeq++}`, date: src.date });
  }

  for (let i = 0; i < 34; i += 1) {
    const src = pick(lines);
    noise.push({ ...src, quantity: -Math.max(1, Math.abs(src.quantity)) });
  }

  const all = lines.concat(noise);

  // Deterministic Fisher-Yates shuffle so duplicates land in realistic positions.
  for (let i = all.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = all[i];
    all[i] = all[j];
    all[j] = tmp;
  }

  const rows = all.map((l) => ({
    InvoiceNo: l.invoiceNo,
    StockCode: l.productId,
    Description: l.description,
    Quantity: l.quantity,
    InvoiceDate: l.date,
    UnitPrice: l.price,
    CustomerID: l.customerId,
    Country: l.country
  }));

  return {
    rows,
    columns: ["InvoiceNo", "StockCode", "Description", "Quantity", "InvoiceDate", "UnitPrice", "CustomerID", "Country"],
    headerRow: (row) => [
      row.InvoiceNo,
      row.StockCode,
      row.Description,
      row.Quantity,
      /^\d{4}-\d{2}-\d{2}$/.test(row.InvoiceDate) ? toDisplayDate(row.InvoiceDate) : row.InvoiceDate,
      row.UnitPrice,
      row.CustomerID,
      row.Country
    ],
    meta: {
      label: "Sample e-commerce transactions (synthetic)",
      rowCount: rows.length,
      customers: customerSeq - 1,
      period: `${START_DATE} to ${END_DATE}`,
      note: "Generated sample data for demonstration only. It is not real business performance."
    }
  };
}

/** Serialise the sample dataset to CSV text for download or direct ingestion. */
export function sampleDataToCsv(sample) {
  const header = sample.columns.join(",");
  const body = sample.rows
    .map((row) => sample.headerRow(row).map((cell) => (String(cell).includes(",") ? `"${cell}"` : cell)).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}