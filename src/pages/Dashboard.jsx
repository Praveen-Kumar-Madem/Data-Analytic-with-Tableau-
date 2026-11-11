import React from "react";
import { useNavigate } from "react-router-dom";
import RequireDataset from "@/components/RequireDataset";
import DashboardView from "@/components/dashboard/DashboardView";
import { useDataset } from "@/lib/datasetStore";

export default function Dashboard() {
  const { active } = useDataset();
  const navigate = useNavigate();

  return (
    <RequireDataset>
      <DashboardView dataset={active} onSegment={(segment) => navigate(`/customers?segment=${segment}`)} />
    </RequireDataset>
  );
}