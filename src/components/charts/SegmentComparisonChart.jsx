import React from "react";
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { TOOLTIP_STYLE } from "@/lib/chartTheme";
import { formatDecimal } from "@/lib/format";

export default function SegmentComparisonChart({ segments = [], scale = 5 }) {
  const data = segments
    .filter((s) => s.customers > 0)
    .map((s) => ({
      label: s.label,
      Recency: s.avg_r_score,
      Frequency: s.avg_f_score,
      Monetary: s.avg_m_score
    }));

  return (
    <ChartCard
      title="RFM segment comparison"
      description="Average R, F and M scores per segment. A wider triangle means stronger relative performance."
      empty={!data.length}
    >
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e5e9f0" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} />
          <PolarRadiusAxis angle={90} domain={[0, scale]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatDecimal(value, 2)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Radar name="Recency" dataKey="Recency" stroke="#2563eb" fill="#2563eb" fillOpacity={0.16} />
          <Radar name="Frequency" dataKey="Frequency" stroke="#0f766e" fill="#0f766e" fillOpacity={0.14} />
          <Radar name="Monetary" dataKey="Monetary" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.14} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}