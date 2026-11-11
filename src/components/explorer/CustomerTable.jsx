import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDecimal, formatINR, formatNumber } from "@/lib/format";

export default function CustomerTable({ customers }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">Customer ID</TableHead>
            <TableHead className="text-[11px]">Last purchase</TableHead>
            <TableHead className="text-right text-[11px]">Recency</TableHead>
            <TableHead className="text-right text-[11px]">Frequency</TableHead>
            <TableHead className="text-right text-[11px]">Monetary (₹)</TableHead>
            <TableHead className="text-center text-[11px]">R</TableHead>
            <TableHead className="text-center text-[11px]">F</TableHead>
            <TableHead className="text-center text-[11px]">M</TableHead>
            <TableHead className="text-center text-[11px]">RFM</TableHead>
            <TableHead className="text-[11px]">Segment</TableHead>
            <TableHead className="min-w-[240px] text-[11px]">Recommended action</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="text-[12px] font-medium">
                <Link to={`/customers/${c.id}`} className="hover:text-primary">
                  {c.customer_id}
                </Link>
              </TableCell>
              <TableCell className="whitespace-nowrap text-[12px]">{formatDate(c.last_purchase_date)}</TableCell>
              <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(c.recency_days)}d</TableCell>
              <TableCell className="text-right text-[12px] tabular-nums">{formatNumber(c.frequency)}</TableCell>
              <TableCell className="text-right text-[12px] font-medium tabular-nums">{formatINR(c.monetary)}</TableCell>
              <TableCell className="text-center text-[12px] tabular-nums">{c.r_score}</TableCell>
              <TableCell className="text-center text-[12px] tabular-nums">{c.f_score}</TableCell>
              <TableCell className="text-center text-[12px] tabular-nums">{c.m_score}</TableCell>
              <TableCell className="text-center font-mono text-[12px]">{c.rfm_score}</TableCell>
              <TableCell className="whitespace-nowrap text-[12px]">{c.segment_label}</TableCell>
              <TableCell className="text-[11.5px] leading-relaxed text-muted-foreground" title={c.recommended_action}>
                <span className="line-clamp-2">{c.recommended_action}</span>
              </TableCell>
              <TableCell>
                <Link to={`/customers/${c.id}`} className="flex items-center justify-end text-muted-foreground hover:text-primary">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="px-1 pt-3 text-[11px] text-muted-foreground">
        Monetary values in Indian Rupees. Average order value is net monetary value ÷ qualifying orders. Showing{" "}
        {formatDecimal(customers.length, 0)} rows on this page.
      </p>
    </div>
  );
}