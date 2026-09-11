"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { LaravelUser } from "@/app/lib/laravel-auth";

interface AdminSidebarProps {
  adminUser?: LaravelUser | null;
  pendingOrdersCount?: number;
}

export function AdminSidebar({ adminUser, pendingOrdersCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm("Yönetim panelinden çıkmak istediğinize emin misiniz?")) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin");
      router.refresh();
    } catch {
      window.location.href = "/admin";
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: "Genel Bakış",
      href: "/admin",
      exact: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Siparişler",
      href: "/admin/siparisler",
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: "#e5b94c",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Ürün Yönetimi",
      href: "/admin/urunler",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Kupon Yönetimi",
      href: "/admin/kuponlar",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      label: "Müşteriler",
      href: "/admin/musteriler",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Kargo Operasyon",
      href: "/admin?tab=cargo",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: "Site Ayarları",
      href: "/admin/ayarlar",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      label: "Bakım Modu",
      href: "/admin/bakim",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: "Güvenlik & Loglar",
      href: "/admin/guvenlik",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="admin-brand-icon">M</div>
        <div className="admin-brand-text">
          <strong>MAREL PERDE</strong>
          <small>Yönetim Portalı</small>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="admin-sidebar-nav">
        {navItems.filter((item) => item.label === "Ürün Yönetimi").map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-btn ${isActive ? "active" : ""}`}
            >
              <span className="admin-nav-btn-left">
                {item.icon}
                {item.label}
              </span>
              {item.badge ? (
                <span
                  className="admin-badge"
                  style={{
                    backgroundColor: item.badgeColor || "#e5b94c",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <Link href="/admin?tab=announcements" className={`admin-nav-btn ${pathname === "/admin" ? "active" : ""}`}>
          <span className="admin-nav-btn-left">Blog Yönetimi</span>
        </Link>
      </nav>

      {/* User & Footer */}
      <div className="admin-sidebar-footer">
        {adminUser ? (
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">
              {adminUser.first_name ? adminUser.first_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-sidebar-user-info">
              <strong>{adminUser.full_name || "Yönetici"}</strong>
              <small>{adminUser.email}</small>
            </div>
          </div>
        ) : null}

        <Link href="/" className="admin-sidebar-ext-link" target="_blank">
          <span>Mağazayı Görüntüle</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="admin-btn-secondary"
          style={{ width: "100%", justifyContent: "center", cursor: "pointer" }}
          type="button"
        >
          {loggingOut ? "Çıkılıyor..." : "Güvenli Çıkış Yap"}
        </button>
      </div>
    </aside>
  );
}
