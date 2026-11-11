import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import RequireDataset from "@/components/RequireDataset";
import CustomerFilters from "@/components/explorer/CustomerFilters";
import CustomerTable from "@/components/explorer/CustomerTable";
import { useDataset } from "@/lib/datasetStore";
import { downloadCsv, fetchAllPages } from "@/lib/csv";
import { buildCustomerRfm } from "@/lib/exporters";

const PAGE_SIZE = 25;

const DEFAULT_FILTERS = {
  search: "",
  segment: "",
  minMonetary: "",
  maxRecency: "",
  rfmScore: "",
  sort: "-monetary"
};

function ExplorerView({ dataset }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, segment: searchParams.get("segment") || "" });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [cursors, setCursors] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim()), 350);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Keep the segment filter in step with the URL, so dashboard and segment
  // links always apply even when the explorer is already mounted.
  const segmentParam = searchParams.get("segment") || "";
  useEffect(() => {
    setFilters((f) => (f.segment === segmentParam ? f : { ...f, segment: segmentParam }));
  }, [segmentParam]);

  const query = useMemo(() => {
    const q = { dataset_id: dataset.id };
    if (filters.segment) q.segment = filters.segment;
    if (debouncedSearch) q.customer_id = { $regex: debouncedSearch, $options: "i" };
    if (filters.minMonetary !== "" && Number(filters.minMonetary) >= 0) q.monetary = { $gte: Number(filters.minMonetary) };
    if (filters.maxRecency !== "" && Number(filters.maxRecency) >= 0) q.recency_days = { $lte: Number(filters.maxRecency) };
    if (filters.rfmScore.length === 3) q.rfm_score = filters.rfmScore;
    return q;
  }, [dataset.id, filters.segment, filters.minMonetary, filters.maxRecency, filters.rfmScore, debouncedSearch]);

  const loadPage = useCallback(
    async (index, cursorList) => {
      setLoading(true);
      setError("");
      try {
        const cursor = cursorList[index];
        const page = await base44.entities.CustomerRfm.filter(query, {
          sort: filters.sort,
          limit: PAGE_SIZE,
          ...(cursor ? { cursor } : {})
        });
        const items = Array.isArray(page) ? page : page?.items || [];
        setRows(items);
        if (!Array.isArray(page) && page?.next_cursor) {
          setCursors((prev) => {
            const next = prev.slice(0, index + 1);
            next[index + 1] = page.next_cursor;
            return next;
          });
        }
      } catch (e) {
        setError(e?.message || "Could not load customers for this filter.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [query, filters.sort]
  );

  useEffect(() => {
    setCursors([null]);
    setPageIndex(0);
    loadPage(0, [null]);
  }, [loadPage]);

  useEffect(() => {
    let cancelled = false;
    base44.entities.CustomerRfm.count(query)
      .then((n) => {
        if (!cancelled) setTotal(n);
      })
      .catch(() => {
        if (!cancelled) setTotal(null);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === "segment") {
      const next = new URLSearchParams(searchParams);
      if (value) next.set("segment", value);
      else next.delete("segment");
      setSearchParams(next, { replace: true });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const all = await fetchAllPages((opts) => base44.entities.CustomerRfm.filter(query, { ...opts, sort: filters.sort }));
      const { columns, rows: exportRows } = buildCustomerRfm(all);
      downloadCsv(`${dataset.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_filtered_customers.csv`, columns, exportRows);
    } finally {
      setExporting(false);
    }
  };

  const hasNext = !!cursors[pageIndex + 1];

  return (
    <div>
      <PageHeader
        title="Customer explorer"
        description="Search, filter and sort every scored customer. Filters and sorting run on the server, so they work across the whole dataset rather than just the visible page."
        badge={
          total !== null ? (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {total.toLocaleString("en-IN")} customer{total === 1 ? "" : "s"} match
            </span>
          ) : null
        }
      />

      <CustomerFilters
        filters={filters}
        onChange={handleChange}
        onReset={() => setFilters({ ...DEFAULT_FILTERS })}
        onExport={handleExport}
        exporting={exporting}
        segments={dataset.summary?.segments || []}
      />

      <Card className="mt-5">
        <CardContent className="p-0">
          {error ? (
            <div className="flex items-start gap-2 px-5 py-4 text-[13px] text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-16 text-[13px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading customers…
            </div>
          ) : rows.length ? (
            <div className="p-1.5">
              <CustomerTable customers={rows} />
            </div>
          ) : !error ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Users className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No customers match these filters</p>
              <p className="mt-1 max-w-md text-[13px] text-muted-foreground">
                Relax or reset the filters. If the dataset is small, some segments may legitimately be empty — that is shown
                rather than filled with fabricated customers.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          Page {pageIndex + 1}
          {total !== null ? ` · up to ${Math.ceil(total / PAGE_SIZE) || 1} page(s)` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0 || loading}
            onClick={() => {
              const next = pageIndex - 1;
              setPageIndex(next);
              loadPage(next, cursors);
            }}
          >
            <ChevronLeft className="mr-1.5 h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext || loading}
            onClick={() => {
              const next = pageIndex + 1;
              setPageIndex(next);
              loadPage(next, cursors);
            }}
          >
            Next
            <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerExplorer() {
  const { active } = useDataset();
  return (
    <RequireDataset>
      <ExplorerView dataset={active} />
    </RequireDataset>
  );
}