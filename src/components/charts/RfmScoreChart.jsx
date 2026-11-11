import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, SERIES_COLORS, TOOLTIP_STYLE, numberFormatter } from "@/lib/chartTheme";

export default function RfmScoreChart({ r = [], f = [], m = [] }) {
  const scale = Math.max(r.length, f.length, m.length);
  const data = Array.from({ length: scale }, (_, i) => ({
    score: `Score ${i + 1}`,
    Recency: r[i]?.customers || 0,
    Frequency: f[i]?.customers || 0,
    Monetary: m[i]?.customers || 0
  }));
  const empty = !data.some((d) => d.Recency + d.Frequency + d.Monetary > 0);

  return (
    <ChartCard
      title="Customer count by RFM score"
      description="Distribution of the 1–5 scores. Score 5 is the best relative performance in each dimension."
      empty={empty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="score" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={numberFormatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => numberFormatter(value)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Recency" fill={SERIES_COLORS[0]} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Frequency" fill={SERIES_COLORS[1]} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Monetary" fill={SERIES_COLORS[2]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}