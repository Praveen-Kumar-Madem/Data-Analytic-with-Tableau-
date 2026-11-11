import React from "react";
import { Download, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all__";

export default function CustomerFilters({ filters, onChange, onReset, onExport, segments, exporting }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-[12px]">Search customer ID</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => onChange("search", e.target.value)}
              placeholder="e.g. CUST-0042"
              className="h-9 pl-8 text-[13px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[12px]">Customer segment</Label>
          <Select value={filters.segment || ALL} onValueChange={(v) => onChange("segment", v === ALL ? "" : v)}>
            <SelectTrigger className="h-9 text-[13px]">
              <SelectValue placeholder="All segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL} className="text-[13px]">
                All segments
              </SelectItem>
              {segments.map((s) => (
                <SelectItem key={s.segment} value={s.segment} className="text-[13px]">
                  {s.label} ({s.customers})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">Min value (₹)</Label>
            <Input
              type="number"
              min="0"
              value={filters.minMonetary}
              onChange={(e) => onChange("minMonetary", e.target.value)}
              placeholder="0"
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Max recency</Label>
            <Input
              type="number"
              min="0"
              value={filters.maxRecency}
              onChange={(e) => onChange("maxRecency", e.target.value)}
              placeholder="days"
              className="h-9 text-[13px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">Exact RFM score</Label>
            <Input
              value={filters.rfmScore}
              onChange={(e) => onChange("rfmScore", e.target.value.replace(/[^1-5]/g, "").slice(0, 3))}
              placeholder="e.g. 555"
              className="h-9 font-mono text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Sort by</Label>
            <Select value={filters.sort} onValueChange={(v) => onChange("sort", v)}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-monetary" className="text-[13px]">
                  Value (high → low)
                </SelectItem>
                <SelectItem value="monetary" className="text-[13px]">
                  Value (low → high)
                </SelectItem>
                <SelectItem value="-frequency" className="text-[13px]">
                  Frequency (high → low)
                </SelectItem>
                <SelectItem value="recency_days" className="text-[13px]">
                  Recency (most recent)
                </SelectItem>
                <SelectItem value="-recency_days" className="text-[13px]">
                  Recency (least recent)
                </SelectItem>
                <SelectItem value="customer_id" className="text-[13px]">
                  Customer ID (A → Z)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset filters
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
          <Download className="mr-2 h-3.5 w-3.5" />
          {exporting ? "Preparing export…" : "Export filtered results (CSV)"}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Score filters accept the concatenated RFM pattern such as 555. Leave a filter blank to ignore it.
        </p>
      </div>
    </div>
  );
}