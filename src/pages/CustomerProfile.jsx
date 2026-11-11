import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Lightbulb, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/PageHeader";
import CustomerSpendTrend from "@/components/explorer/CustomerSpendTrend";
import { formatDate, formatDecimal, formatINR, formatNumber, relativeDays } from "@/lib/format";

const CLASS_LABELS = {
  valid: "Valid",
  return: "Return / credit",
  cancelled: "Cancelled",
  duplicate: "Duplicate",
  missing_customer: "Missing customer ID",
  invalid_date: "Invalid date",
  invalid_quantity: "Invalid quantity",
  invalid_price: "Invalid price"
};

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function CustomerProfile() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const record = await base44.entities.CustomerRfm.get(id);
        if (cancelled) return;
        setCustomer(record);

        const [datasetRecord, txPage] = await Promise.all([
          base44.entities.Dataset.get(record.dataset_id).catch(() => null),
          base44.entities.Transaction.filter(
            { dataset_id: record.dataset_id, customer_id: record.customer_id },
            { sort: "transaction_date", limit: 200 }
          )
        ]);
        if (cancelled) return;
        setDataset(datasetRecord);
        setTransactions(Array.isArray(txPage) ? txPage : txPage?.items || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "This customer profile could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading customer profile…
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4 text-[13px] text-red-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error || "This customer record was not found."}</span>
        </div>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link to="/customers">Back to the customer explorer</Link>
        </Button>
      </div>
    );
  }

  const scale = dataset?.segment_config?.scoreScale || 5;

  return (
    <div>
      <PageHeader
        title={`Customer ${customer.customer_id}`}
        description={dataset ? `Scored in "${dataset.name}". This profile shows the stored RFM metrics, the exact reason for the segment assignment and the full transaction history.` : "Customer RFM profile."}
        badge={
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {customer.segment_label || customer.segment}
          </span>
        }
        actions={
          <Button variant="outline" asChild>
            <Link to="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to explorer
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Recency" value={`${formatNumber(customer.recency_days)} days`} hint={`Last purchase ${formatDate(customer.last_purchase_date)}`} />
        <Metric label="Frequency" value={formatNumber(customer.frequency)} hint="Distinct qualifying invoices" />
        <Metric label="Monetary value" value={formatINR(customer.monetary)} hint={`Net of ${formatINR(customer.returned_value)} returned`} />
        <Metric label="Average order value" value={formatINR(customer.avg_order_value)} hint={`${formatNumber(customer.transaction_lines)} transaction lines`} />
        <Metric label="First purchase" value={formatDate(customer.first_purchase_date)} hint={`${relativeDays(customer.recency_days)} since last order`} />
        <Metric label="Gross monetary value" value={formatINR(customer.gross_monetary)} hint="Before returns" />
        <Metric label="RFM score pattern" value={customer.rfm_score} hint={`R=${customer.r_score} · F=${customer.f_score} · M=${customer.m_score} on a 1–${scale} scale`} />
        <Metric label="RFM score sum" value={formatNumber(customer.rfm_sum)} hint="Sum of the three scores (never the same as the pattern)" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why this customer is in this segment</p>
            <p className="mt-2 text-[13.5px] leading-relaxed">{customer.segment_reason}</p>
            <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <Lightbulb className="h-3 w-3" />
                Recommended engagement strategy
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed">{customer.recommended_action}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Suggested strategy based on the computed segment — not a guaranteed outcome.
              </p>
            </div>
          </CardContent>
        </Card>

        <CustomerSpendTrend transactions={transactions} />
      </div>

      <Card className="mt-5">
        <CardContent className="p-0">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold">Transaction history</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Every stored line for this customer, including returns and excluded rows, with the pipeline's classification.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Date</TableHead>
                  <TableHead className="text-[11px]">Invoice</TableHead>
                  <TableHead className="text-[11px]">Product</TableHead>
                  <TableHead className="text-right text-[11px]">Qty</TableHead>
                  <TableHead className="text-right text-[11px]">Unit price</TableHead>
                  <TableHead className="text-right text-[11px]">Line revenue</TableHead>
                  <TableHead className="text-[11px]">Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-[12px]">{formatDate(tx.transaction_date)}</TableCell>
                    <TableCell className="text-[12px]">{tx.invoice_no || "—"}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-[12px]">{tx.description || tx.product_id || "—"}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(tx.quantity)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatINR(tx.unit_price, 2)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatINR(tx.line_revenue)}</TableCell>
                    <TableCell className="text-[12px]">
                      <span className={tx.included_in_rfm ? "text-foreground" : "text-muted-foreground"}>
                        {CLASS_LABELS[tx.classification] || tx.classification}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {!transactions.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-[13px] text-muted-foreground">
                      No stored transaction lines for this customer.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
            Showing up to 200 lines. Rows excluded from RFM are still displayed here so the customer's full history is
            auditable. Average order value is {formatDecimal(customer.avg_order_value, 2)} across {formatNumber(customer.frequency)} qualifying invoices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}