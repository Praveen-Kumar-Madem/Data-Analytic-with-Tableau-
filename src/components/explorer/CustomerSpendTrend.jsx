import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { AXIS_TICK, GRID_STROKE, TOOLTIP_STYLE, inrAxisFormatter, inrFormatter } from "@/lib/chartTheme";
import { formatMonthLabel } from "@/lib/format";

export default function CustomerSpendTrend({ transactions = [] }) {
  const byMonth = new Map();
  for (const tx of transactions) {
    if (!tx.included_in_rfm || !/^\d{4}-\d{2}/.test(tx.transaction_date || "")) continue;
    const month = tx.transaction_date.slice(0, 7);
    const current = byMonth.get(month) || { revenue: 0, orders: 0 };
    current.revenue += Number(tx.line_revenue) || 0;
    current.orders += 1;
    byMonth.set(month, current);
  }

  const data = Array.from(byMonth.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, value]) => ({ month: formatMonthLabel(month), "Net spend": Math.round(value.revenue * 100) / 100 }));

  return (
    <ChartCard
      title="Spending trend"
      description="Net spend by month across this customer's qualifying purchases, including any returns."
      empty={!data.length}
      emptyMessage="This customer has no qualifying transactions to trend."
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={inrAxisFormatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [inrFormatter(value), "Net spend"]} />
          <Bar dataKey="Net spend" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}