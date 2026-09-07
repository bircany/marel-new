"use client";

import React from "react";
import { AdminSidebar } from "./AdminSidebar";
import type { LaravelUser } from "@/app/lib/laravel-auth";

interface AdminShellProps {
  children: React.ReactNode;
  adminUser?: LaravelUser | null;
  pendingOrdersCount?: number;
}

export function AdminShell({ children, adminUser, pendingOrdersCount = 0 }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar adminUser={adminUser} pendingOrdersCount={pendingOrdersCount} />
      <main className="admin-workspace">
        {children}
      </main>
    </div>
  );
}
