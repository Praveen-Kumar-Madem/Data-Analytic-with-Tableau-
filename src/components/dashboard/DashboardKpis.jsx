import React from "react";
import { AlertTriangle, Clock, Crown, IndianRupee, Repeat, ShoppingCart, Users, Wallet } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { formatINR, formatDecimal, formatNumber } from "@/lib/format";

export default function DashboardKpis({ kpis = {} }) {
  const cards = [
    { label: "Total customers", value: formatNumber(kpis.total_customers), hint: "Customers with at least one qualifying purchase", icon: Users },
    { label: "Qualifying transactions", value: formatNumber(kpis.total_transactions), hint: "Distinct invoices included in the analysis", icon: ShoppingCart },
    { label: "Total net revenue", value: formatINR(kpis.net_revenue), hint: `After ${formatINR(kpis.returns_value)} of returns`, icon: IndianRupee, tone: "positive" },
    { label: "Avg customer value", value: formatINR(kpis.avg_customer_value), hint: "Net revenue ÷ customers", icon: Wallet },
    { label: "Avg recency", value: `${formatNumber(kpis.avg_recency_days)} days`, hint: "Average days since the last purchase", icon: Clock },
    { label: "Avg purchase frequency", value: formatDecimal(kpis.avg_frequency, 2), hint: "Average qualifying orders per customer", icon: Repeat },
    { label: "Champion customers", value: formatNumber(kpis.champions), hint: "Recent, frequent and high value", icon: Crown, tone: "positive" },
    { label: "At-risk customers", value: formatNumber(kpis.at_risk), hint: "Previously frequent, now quiet", icon: AlertTriangle, tone: "warning", alert: (kpis.at_risk || 0) > 0 }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}