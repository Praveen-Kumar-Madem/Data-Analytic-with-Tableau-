import React from "react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatasetPicker from "@/components/DatasetPicker";
import { useAuth } from "@/lib/AuthContext";

export default function TopBar({ onMenu, title }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">{title || "Dashboard"}</h1>
        <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
          Reporting currency: Indian Rupee (₹ INR)
        </p>
      </div>

      <DatasetPicker />

      <div className="hidden items-center gap-3 border-l border-border pl-3 sm:flex">
        <div className="text-right leading-tight">
          <p className="text-[13px] font-medium">{user?.full_name || "Analyst"}</p>
          <p className="text-[11px] text-muted-foreground">{user?.role === "admin" ? "Administrator" : "User"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sign out" title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}