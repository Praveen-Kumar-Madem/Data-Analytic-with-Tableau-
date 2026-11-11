import React from "react";
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, numberFormatter } from "@/lib/chartTheme";

export default function SegmentDistributionChart({ segments = [], onSegmentClick }) {
  const data = segments.filter((s) => s.customers > 0);

  return (
    <ChartCard
      title="Customer distribution by segment"
      description="How many customers fall into each behavioural segment. Click a bar to open those customers."
      empty={!data.length}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 46 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} angle={-32} textAnchor="end" interval={0} height={60} />
          <YAxis tick={AXIS_TICK} tickFormatter={numberFormatter} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, _name, payload) => [numberFormatter(value), `Customers · ${payload.payload.label}`]}
          />
          <Bar dataKey="customers" radius={[4, 4, 0, 0]} onClick={(d) => onSegmentClick && onSegmentClick(d.segment)} cursor="pointer">
            {data.map((entry) => (
              <Cell key={entry.segment} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}