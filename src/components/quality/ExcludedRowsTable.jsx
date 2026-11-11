import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

const PAGE_SIZE = 25;

const CLASS_LABELS = {
  duplicate: "Duplicate",
  missing_customer: "Missing customer ID",
  invalid_date: "Invalid date",
  invalid_quantity: "Invalid quantity",
  invalid_price: "Invalid price",
  cancelled: "Cancelled order",
  return: "Return / credit"
};

export default function ExcludedRowsTable({ datasetId }) {
  const [rows, setRows] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (nextCursor) => {
    setLoading(true);
    setError("");
    try {
      const page = await base44.entities.Transaction.filter(
        { dataset_id: datasetId, classification: { $ne: "valid" } },
        { sort: "row_index", limit: PAGE_SIZE, ...(nextCursor ? { cursor: nextCursor } : {}) }
      );
      const items = Array.isArray(page) ? page : page?.items || [];
      setRows((prev) => (nextCursor ? [...prev, ...items] : items));
      setCursor(Array.isArray(page) ? null : page?.next_cursor || null);
      setHasMore(Array.isArray(page) ? false : !!page?.next_cursor);
    } catch (e) {
      setError(e?.message || "Could not load the quarantined rows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRows([]);
    setCursor(null);
    load(null);
  }, [datasetId]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-semibold">Rows excluded from the RFM calculation</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Every excluded row is kept and classified with a reason. Nothing is deleted from your uploaded data.
          </p>
        </div>

        {error ? (
          <div className="flex items-start gap-2 px-5 py-4 text-[13px] text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {!loading && !rows.length && !error ? (
          <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">
            No rows were excluded — every uploaded transaction passed validation.
          </div>
        ) : null}

        {rows.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-[11px]">Row</TableHead>
                  <TableHead className="text-[11px]">Invoice</TableHead>
                  <TableHead className="text-[11px]">Date</TableHead>
                  <TableHead className="text-[11px]">Customer</TableHead>
                  <TableHead className="text-[11px]">Product</TableHead>
                  <TableHead className="text-right text-[11px]">Qty</TableHead>
                  <TableHead className="text-right text-[11px]">Unit price</TableHead>
                  <TableHead className="text-right text-[11px]">Line value</TableHead>
                  <TableHead className="text-[11px]">Classification</TableHead>
                  <TableHead className="min-w-[280px] text-[11px]">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-[11px] text-muted-foreground">{(row.row_index || 0) + 1}</TableCell>
                    <TableCell className="text-[12px]">{row.invoice_no || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-[12px]">{formatDate(row.transaction_date)}</TableCell>
                    <TableCell className="text-[12px]">{row.customer_id || <span className="text-muted-foreground">blank</span>}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-[12px]">{row.description || row.product_id || "—"}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(row.quantity)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatINR(row.unit_price, 2)}</TableCell>
                    <TableCell className="text-right text-[12px] tabular-nums">{formatINR(row.line_revenue)}</TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {CLASS_LABELS[row.classification] || row.classification}
                      </span>
                    </TableCell>
                    <TableCell className="text-[11px] leading-relaxed text-muted-foreground">{row.exclusion_reason || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {hasMore ? (
          <div className="border-t border-border px-5 py-4">
            <Button variant="outline" size="sm" onClick={() => load(cursor)} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Load more rows
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}