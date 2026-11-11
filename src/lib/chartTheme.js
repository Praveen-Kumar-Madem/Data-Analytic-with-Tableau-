import { formatINR, formatINRCompact } from "@/lib/format";

export const SEGMENT_COLORS = {
  champions: "#0f766e",
  loyal: "#2563eb",
  big_spenders: "#7c3aed",
  potential_loyalists: "#0891b2",
  recent: "#16a34a",
  needs_attention: "#ca8a04",
  at_risk: "#ea580c",
  lost: "#991b1b",
  hibernating: "#64748b"
};

export const SERIES_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c", "#0891b2", "#ca8a04", "#991b1b"];

export const GRID_STROKE = "#e5e9f0";
export const AXIS_TICK = { fontSize: 11, fill: "#64748b" };

export const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: "1px solid #e5e9f0",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)"
};

export const inrFormatter = (value) => formatINR(value);
export const inrAxisFormatter = (value) => formatINRCompact(value);
export const numberFormatter = (value) => Number(value).toLocaleString("en-IN");

export function segmentColor(key) {
  return SEGMENT_COLORS[key] || "#475569";
}