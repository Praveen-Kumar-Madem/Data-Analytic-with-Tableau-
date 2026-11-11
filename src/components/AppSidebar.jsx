import React from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BookOpen,
  Download,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  PieChart,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  X
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  Upload,
  ShieldCheck,
  Activity,
  PieChart,
  Users,
  Lightbulb,
  Download,
  BarChart3,
  FlaskConical,
  Settings,
  BookOpen
};

export default function AppSidebar({ open, onClose, datasetLabel }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">RFM Analytics</p>
              <p className="text-[11px] text-muted-foreground">Customer Segmentation</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon] || LayoutDashboard;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active dataset</p>
          <p className="mt-1 truncate text-[13px] font-medium" title={datasetLabel}>
            {datasetLabel || "None selected"}
          </p>
        </div>
      </aside>
    </>
  );
}