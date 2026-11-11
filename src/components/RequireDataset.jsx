import React from "react";
import { Link } from "react-router-dom";
import { Database, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataset } from "@/lib/datasetStore";

export default function RequireDataset({ children }) {
  const { loading, active, datasets } = useDataset();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!active || active.status !== "ready") {
    const failed = active && active.status === "failed";
    return (
      <EmptyState
        icon={failed ? Database : Upload}
        title={failed ? "The last analysis run failed" : datasets.length ? "This dataset is not ready yet" : "No dataset uploaded yet"}
        description={
          failed && active.error_message
            ? active.error_message
            : datasets.length
              ? "Run the cleaning and RFM pipeline for this dataset before exploring it."
              : "Upload a CSV or Excel transaction export, or load the built-in sample dataset to explore the platform immediately."
        }
      >
        <Button className="mt-5" asChild>
          <Link to="/upload">Go to dataset upload</Link>
        </Button>
      </EmptyState>
    );
  }

  return children;
}