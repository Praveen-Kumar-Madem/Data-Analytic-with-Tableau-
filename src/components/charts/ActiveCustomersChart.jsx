import React from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, numberFormatter } from "@/lib/chartTheme";
import { formatMonthLabel } from "@/lib/format";

export default function ActiveCustomersChart({ monthly = [] }) {
  const data = monthly.map((m) => ({
    month: formatMonthLabel(m.month),
    "Active customers": m.active_customers,
    Orders: m.orders
  }));

  return (
    <ChartCard
      title="Monthly active customer trends"
      description="Distinct customers who purchased and the number of qualifying orders each month."
      empty={!data.length}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="activeCustomersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={numberFormatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => numberFormatter(value)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="Active customers" stroke="#2563eb" strokeWidth={2} fill="url(#activeCustomersFill)" />
          <Area type="monotone" dataKey="Orders" stroke="#7c3aed" strokeWidth={1.5} fill="none" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}