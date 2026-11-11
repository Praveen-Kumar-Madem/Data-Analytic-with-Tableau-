export const CURRENCY_CODE = "INR";
export const CURRENCY_SYMBOL = "\u20B9";

/** Format a value in Indian Rupees using the Indian digit grouping convention. */
export function formatINR(value, decimals = 0) {
  const n = Number(value);
  if (!isFinite(n)) return `${CURRENCY_SYMBOL}0`;
  const sign = n < 0 ? "-" : "";
  const fixed = Math.abs(n).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  let last3 = intPart.slice(-3);
  let rest = intPart.slice(0, -3);
  if (rest) last3 = `,${last3}`;
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${CURRENCY_SYMBOL}${sign}${rest}${last3}${decPart ? `.${decPart}` : ""}`;
}

export function formatINRCompact(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 10000000) return `${CURRENCY_SYMBOL}${sign}${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${CURRENCY_SYMBOL}${sign}${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `${CURRENCY_SYMBOL}${sign}${(abs / 1000).toFixed(1)} K`;
  return `${CURRENCY_SYMBOL}${sign}${abs.toFixed(0)}`;
}

export function formatNumber(value, decimals = 0) {
  const n = Number(value);
  if (!isFinite(n)) return "0";
  return n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatDecimal(value, decimals = 2) {
  const n = Number(value);
  if (!isFinite(n)) return "0";
  return n.toFixed(decimals);
}

export function formatPercent(value, decimals = 1) {
  const n = Number(value);
  if (!isFinite(n)) return "0.0%";
  return `${n.toFixed(decimals)}%`;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso) {
  if (!iso || typeof iso !== "string") return "—";
  const parts = iso.slice(0, 10).split("-");
  if (parts.length !== 3) return iso;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthLabel(ym) {
  if (!ym || typeof ym !== "string") return "";
  const [y, m] = ym.split("-");
  const idx = Number(m) - 1;
  if (idx < 0 || idx > 11) return ym;
  return `${MONTH_NAMES[idx]} ${y.slice(2)}`;
}

export function relativeDays(days) {
  const n = Number(days);
  if (!isFinite(n)) return "—";
  if (n <= 1) return "today";
  if (n < 30) return `${n} days ago`;
  if (n < 365) return `${Math.round(n / 30)} months ago`;
  return `${(n / 365).toFixed(1)} years ago`;
}