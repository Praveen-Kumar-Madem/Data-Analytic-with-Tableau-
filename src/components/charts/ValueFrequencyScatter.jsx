import React from "react";
import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, SEGMENT_COLORS, TOOLTIP_STYLE, inrAxisFormatter, inrFormatter, numberFormatter } from "@/lib/chartTheme";

export default function ValueFrequencyScatter({ points = [], capped = false }) {
  const grouped = {};
  for (const p of points) {
    if (!grouped[p.segment]) grouped[p.segment] = [];
    grouped[p.segment].push(p);
  }
  const keys = Object.keys(grouped);

  return (
    <ChartCard
      title="Customer value vs purchase frequency"
      description={`Each dot is a customer: orders on the x-axis, net monetary value (₹) on the y-axis.${capped ? " Showing the 300 highest-value customers." : ""}`}
      empty={!points.length}
    >
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 12, right: 20, left: 0, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            type="number"
            dataKey="frequency"
            name="Orders"
            tick={AXIS_TICK}
            label={{ value: "Purchase frequency (orders)", position: "insideBottom", offset: -18, fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            type="number"
            dataKey="monetary"
            name="Net monetary value"
            tick={AXIS_TICK}
            tickFormatter={inrAxisFormatter}
            width={72}
            label={{ value: "Net value (₹)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
          />
          <ZAxis range={[38, 38]} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => (name === "Net monetary value" ? inrFormatter(value) : numberFormatter(value))}
            labelFormatter={() => ""}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="bottom" height={40} />
          {keys.map((key) => (
            <Scatter
              key={key}
              name={grouped[key][0].segment_label}
              data={grouped[key]}
              fill={SEGMENT_COLORS[key] || "#475569"}
              fillOpacity={0.72}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}