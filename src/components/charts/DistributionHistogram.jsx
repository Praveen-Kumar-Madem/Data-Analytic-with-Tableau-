import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, numberFormatter } from "@/lib/chartTheme";

export default function DistributionHistogram({ title, description, data = [], color = "#2563eb" }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <ChartCard title={title} description={description} empty={!hasData}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} angle={-22} textAnchor="end" interval={0} height={52} />
          <YAxis tick={AXIS_TICK} tickFormatter={numberFormatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [numberFormatter(value), "Customers"]} />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}