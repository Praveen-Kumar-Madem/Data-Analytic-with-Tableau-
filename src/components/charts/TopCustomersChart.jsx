import React from "react";
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, SEGMENT_COLORS, TOOLTIP_STYLE, inrAxisFormatter, inrFormatter } from "@/lib/chartTheme";

export default function TopCustomersChart({ customers = [] }) {
  const data = customers.map((c) => ({ ...c, shortId: c.customer_id.length > 14 ? `${c.customer_id.slice(0, 13)}…` : c.customer_id }));

  return (
    <ChartCard
      title="Top 10 customers by net monetary value"
      description="The highest-value customers by net revenue after returns."
      empty={!data.length}
    >
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" tick={AXIS_TICK} tickFormatter={inrAxisFormatter} />
          <YAxis type="category" dataKey="shortId" tick={AXIS_TICK} width={112} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, _name, payload) => [
              inrFormatter(value),
              `${payload.payload.customer_id} · ${payload.payload.segment_label}`
            ]}
          />
          <Bar dataKey="monetary" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.customer_id} fill={SEGMENT_COLORS[entry.segment] || "#475569"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}