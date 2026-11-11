import React from "react";
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, inrAxisFormatter, inrFormatter } from "@/lib/chartTheme";

export default function SegmentRevenueChart({ segments = [], onSegmentClick }) {
  const data = segments.filter((s) => s.customers > 0);

  return (
    <ChartCard
      title="Net revenue by segment"
      description="Total net revenue (after returns) contributed by each customer segment."
      empty={!data.length}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" tick={AXIS_TICK} tickFormatter={inrAxisFormatter} />
          <YAxis type="category" dataKey="label" tick={AXIS_TICK} width={140} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, _name, payload) => [inrFormatter(value), `Net revenue · ${payload.payload.label}`]}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} onClick={(d) => onSegmentClick && onSegmentClick(d.segment)} cursor="pointer">
            {data.map((entry) => (
              <Cell key={entry.segment} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}