import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, inrAxisFormatter, inrFormatter } from "@/lib/chartTheme";
import { formatMonthLabel } from "@/lib/format";

export default function MonthlyRevenueChart({ monthly = [] }) {
  const data = monthly.map((m) => ({
    month: formatMonthLabel(m.month),
    "Net revenue": m.revenue,
    "Gross sales": m.gross,
    Returns: m.returns
  }));

  return (
    <ChartCard
      title="Monthly revenue trends"
      description="Gross sales, returns and net revenue per month across the analysis period."
      empty={!data.length}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={inrAxisFormatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => inrFormatter(value)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="Net revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Gross sales" stroke="#0f766e" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          <Line type="monotone" dataKey="Returns" stroke="#ea580c" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}