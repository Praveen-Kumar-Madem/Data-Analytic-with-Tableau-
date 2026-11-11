import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { NAV_ITEMS } from "@/lib/constants";
import { useDataset } from "@/lib/datasetStore";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { active } = useDataset();
  const location = useLocation();

  const current = NAV_ITEMS.find((item) => item.to === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar open={open} onClose={() => setOpen(false)} datasetLabel={active?.name} />
      <div className="lg:pl-64">
        <TopBar onMenu={() => setOpen(true)} title={current?.label} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}