import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const DatasetContext = createContext(null);
const STORAGE_KEY = "rfm.activeDatasetId";

export function DatasetProvider({ children }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(STORAGE_KEY) || "");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await base44.entities.Dataset.list({ sort: "-created_date", limit: 100 });
      const items = Array.isArray(page) ? page : page?.items || [];
      setDatasets(items);
      setActiveId((current) => {
        if (current && items.some((d) => d.id === current)) return current;
        const ready = items.find((d) => d.status === "ready") || items[0];
        if (ready) {
          localStorage.setItem(STORAGE_KEY, ready.id);
          return ready.id;
        }
        return "";
      });
    } catch (e) {
      setError(e?.message || "Could not load datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const select = useCallback((id) => {
    setActiveId(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const active = useMemo(() => datasets.find((d) => d.id === activeId) || null, [datasets, activeId]);

  const value = useMemo(
    () => ({
      datasets,
      loading,
      error,
      active,
      activeId,
      select,
      refresh,
      hasReadyDataset: datasets.some((d) => d.status === "ready")
    }),
    [datasets, loading, error, active, activeId, select, refresh]
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used inside DatasetProvider");
  return ctx;
}