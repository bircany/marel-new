"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatMoney } from "@/app/lib/commerce";
import { CARGO_PROVIDERS, cargoLabel, cargoTrackingUrl, type CargoCompany } from "@/app/lib/cargo";
import type { AnnouncementRecord, CatalogProduct, ContactMessageRecord, OrderRecord, ReviewRecord } from "@/db";
import type { LaravelUser } from "@/app/lib/laravel-auth";

const orderStatuses = [
  "pending",
  "awaiting_measurement",
  "measure_ok",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const orderStatusNames: Record<string, string> = {
  pending: "Sipariş Alındı",
  awaiting_measurement: "Ölçü Onayı Bekliyor",
  measure_ok: "Ölçü Onaylandı",
  processing: "Üretimde",
  shipped: "Kargoya Verildi",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
};

type Tab = "dashboard" | "products" | "orders" | "cargo" | "reviews" | "announcements" | "contacts";

export function AdminConsole({
  products,
  orders,
  reviews,
  announcements,
  contacts,
  adminUser,
}: {
  products: CatalogProduct[];
  orders: OrderRecord[];
  reviews: ReviewRecord[];
  announcements: AnnouncementRecord[];
  contacts: ContactMessageRecord[];
  adminUser?: LaravelUser | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [message, setMessage] = useState("");

  // Filters & Search states
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStockFilter, setProductStockFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [cargoSearch, setCargoSearch] = useState("");
  const [cargoStatusFilter, setCargoStatusFilter] = useState("all");
  const [cargoProviderFilter, setCargoProviderFilter] = useState("all");

  const [reviewStatusFilter, setReviewStatusFilter] = useState("pending");
  const [announcementFilter, setAnnouncementFilter] = useState("all");
  const [contactStatusFilter, setContactStatusFilter] = useState("all");

  // Helper for requests
  const request = async (url: string, init: RequestInit) => {
    const response = await fetch(url, init);
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(data.error ?? "İşlem tamamlanamadı.");
    setMessage("Başarıyla kaydedildi. Liste güncelleniyor…");
    window.setTimeout(() => {
      router.refresh();
      setMessage("Değişiklikler kaydedildi.");
      window.setTimeout(() => setMessage(""), 3500);
    }, 400);
  };

  const run = async (action: () => Promise<void>, fallback: string) => {
    try {
      setMessage("İşlem yürütülüyor…");
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : fallback);
      window.setTimeout(() => setMessage(""), 5000);
    }
  };

  // Product Actions
  const createProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    return run(() => request("/api/admin/products", { method: "POST", body: new FormData(form) }), "Ürün kaydedilemedi.");
  };

  const updateProduct = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(
      () =>
        request(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            price: Math.round(Number(form.get("price")) * 100),
            salePrice: form.get("salePrice") ? Math.round(Number(form.get("salePrice")) * 100) : null,
            stock: Number(form.get("stock")),
            availability: form.get("availability"),
            active: form.get("active") === "on",
            featured: form.get("featured") === "on",
          }),
        }),
      "Ürün güncellenemedi.",
    );
  };

  const uploadImages = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = event.currentTarget;
    return run(() => request(`/api/admin/products/${id}/images`, { method: "POST", body: new FormData(form) }), "Görseller yüklenemedi.");
  };

  const deleteProduct = (id: string) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    return run(() => request(`/api/admin/products/${id}`, { method: "DELETE" }), "Ürün silinemedi.");
  };

  // Order & Cargo Actions
  const updateOrder = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(
      () =>
        request(`/api/admin/orders/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: form.get("status"),
            note: form.get("note"),
            cargoCompany: form.get("cargoCompany") || undefined,
            trackingNumber: String(form.get("trackingNumber") ?? "").trim() || undefined,
          }),
        }),
      "Sipariş güncellenemedi.",
    );
  };

  // Review Actions
  const updateReview = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(
      () =>
        request(`/api/admin/reviews/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: form.get("status"), adminReply: form.get("adminReply") }),
        }),
      "Yorum güncellenemedi.",
    );
  };

  const quickReviewStatus = (id: string, status: "approved" | "rejected") => {
    return run(
      () =>
        request(`/api/admin/reviews/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      "Yorum durumu değiştirilemedi.",
    );
  };

  // Announcement Actions
  const createAnnouncement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(
      () =>
        request("/api/admin/announcements", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            slug: form.get("slug"),
            summary: form.get("summary"),
            body: form.get("body"),
            imageUrl: form.get("imageUrl"),
            published: form.get("published") === "on",
            featured: form.get("featured") === "on",
          }),
        }),
      "Duyuru kaydedilemedi.",
    );
  };

  const updateAnnouncement = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(
      () =>
        request(`/api/admin/announcements/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            summary: form.get("summary"),
            body: form.get("body"),
            imageUrl: form.get("imageUrl"),
            published: form.get("published") === "on",
            featured: form.get("featured") === "on",
          }),
        }),
      "Duyuru güncellenemedi.",
    );
  };

  const deleteAnnouncement = (id: string) => {
    if (!window.confirm("Bu duyuruyu kalıcı olarak silmek istediğinize emin misiniz?")) return;
    return run(() => request(`/api/admin/announcements/${id}`, { method: "DELETE" }), "Duyuru silinemedi.");
  };

  // Contact Actions
  const updateContact = (event: React.FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(
      () =>
        request(`/api/admin/contacts/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: form.get("status") }),
        }),
      "Mesaj durumu güncellenemedi.",
    );
  };

  const quickContactStatus = (id: string, status: "read" | "resolved") => {
    return run(
      () =>
        request(`/api/admin/contacts/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      "Mesaj güncellenemedi.",
    );
  };

  // Logout Action
  const handleLogout = async () => {
    if (!window.confirm("Yönetim oturumunu sonlandırmak istiyor musunuz?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  // WhatsApp Cargo Notification Generator
  const sendWhatsAppCargoNotice = (order: OrderRecord) => {
    if (!order.phone) {
      alert("Müşterinin telefon numarası kayıtlı değil.");
      return;
    }
    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `9${cleanPhone}` : cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
    const trackingUrl = cargoTrackingUrl(order.cargoCompany, order.trackingNumber);
    const text = `Sayın ${order.customerName}, Marel'den verdiğiniz ${order.orderNumber} numaralı siparişiniz ${cargoLabel(order.cargoCompany)} kargoya teslim edilmiştir. Takip Kodu: ${order.trackingNumber ?? "—"}${trackingUrl ? `\nKargo Takip Linki: ${trackingUrl}` : ""}\nBizi tercih ettiğiniz için teşekkür ederiz.`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Computed Metrics
  const pendingReviewsCount = reviews.filter((r) => r.status === "pending").length;
  const newContactsCount = contacts.filter((c) => c.status === "new").length;
  const missingCargoCount = orders.filter((o) => !o.trackingNumber && o.status !== "delivered" && o.status !== "cancelled").length;
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== "cancelled" ? order.total : 0), 0);

  // Filtered Products
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !productSearch ||
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === "all" || product.category === productCategoryFilter;
      const matchesStock =
        productStockFilter === "all" ||
        (productStockFilter === "in_stock" && product.stock > 0) ||
        (productStockFilter === "out_of_stock" && product.stock <= 0) ||
        (productStockFilter === "featured" && Boolean(product.featured)) ||
        (productStockFilter === "inactive" && !product.active);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !orderSearch ||
        order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.phone.includes(orderSearch);
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Cargo Orders
  const filteredCargoOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !cargoSearch ||
        order.orderNumber.toLowerCase().includes(cargoSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(cargoSearch.toLowerCase()) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(cargoSearch.toLowerCase()));
      const matchesStatus =
        cargoStatusFilter === "all" ||
        (cargoStatusFilter === "missing_code" && !order.trackingNumber && order.status !== "delivered" && order.status !== "cancelled") ||
        (cargoStatusFilter === "shipped" && order.status === "shipped") ||
        (cargoStatusFilter === "delivered" && order.status === "delivered");
      const matchesProvider = cargoProviderFilter === "all" || order.cargoCompany === cargoProviderFilter;
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [orders, cargoSearch, cargoStatusFilter, cargoProviderFilter]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (reviewStatusFilter === "all") return true;
      return review.status === reviewStatusFilter;
    });
  }, [reviews, reviewStatusFilter]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      if (announcementFilter === "all") return true;
      if (announcementFilter === "published") return Boolean(item.published);
      if (announcementFilter === "draft") return !item.published;
      if (announcementFilter === "featured") return Boolean(item.featured);
      return true;
    });
  }, [announcements, announcementFilter]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (contactStatusFilter === "all") return true;
      return contact.status === contactStatusFilter;
    });
  }, [contacts, contactStatusFilter]);

  return (
    <div className="admin-shell">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-brand-card">
          <span className="admin-brand-icon">M</span>
          <div className="admin-brand-meta">
            <strong>MAREL YÖNETİM</strong>
            <small>KURUMSAL KONSOL</small>
          </div>
        </div>

        <div className="admin-nav-section-title">Modüller & Operasyon</div>
        <nav className="admin-nav-menu">
          <button
            className={`admin-nav-btn ${tab === "dashboard" ? "active" : ""}`}
            onClick={() => setTab("dashboard")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Genel Bakış
            </span>
          </button>

          <button
            className={`admin-nav-btn ${tab === "products" ? "active" : ""}`}
            onClick={() => setTab("products")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Ürün Yönetimi
            </span>
            <span className="admin-nav-badge">{products.length}</span>
          </button>

          <button
            className={`admin-nav-btn ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Sipariş Takip
            </span>
            <span className={`admin-nav-badge ${activeOrdersCount > 0 ? "gold" : ""}`}>{orders.length}</span>
          </button>

          <button
            className={`admin-nav-btn ${tab === "cargo" ? "active" : ""}`}
            onClick={() => setTab("cargo")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Kargo Takip
            </span>
            {missingCargoCount > 0 ? (
              <span className="admin-nav-badge alert" title={`${missingCargoCount} siparişin kargo takip numarası eksik`}>
                {missingCargoCount}
              </span>
            ) : (
              <span className="admin-nav-badge">{orders.filter((o) => o.trackingNumber).length}</span>
            )}
          </button>

          <button
            className={`admin-nav-btn ${tab === "reviews" ? "active" : ""}`}
            onClick={() => setTab("reviews")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Yorumlar
            </span>
            {pendingReviewsCount > 0 ? (
              <span className="admin-nav-badge alert">{pendingReviewsCount}</span>
            ) : (
              <span className="admin-nav-badge">{reviews.length}</span>
            )}
          </button>

          <button
            className={`admin-nav-btn ${tab === "announcements" ? "active" : ""}`}
            onClick={() => setTab("announcements")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Duyurular & Blog
            </span>
            <span className="admin-nav-badge">{announcements.length}</span>
          </button>

          <button
            className={`admin-nav-btn ${tab === "contacts" ? "active" : ""}`}
            onClick={() => setTab("contacts")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Gelen Mesajlar
            </span>
            {newContactsCount > 0 ? (
              <span className="admin-nav-badge alert">{newContactsCount}</span>
            ) : (
              <span className="admin-nav-badge">{contacts.length}</span>
            )}
          </button>
        </nav>

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

          <button onClick={handleLogout} className="admin-btn-secondary" style={{ width: "100%", justifyContent: "center" }} type="button">
            Güvenli Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="admin-workspace">
        {message ? (
          <div className="admin-toast-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e5b94c" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{message}</span>
          </div>
        ) : null}

        {/* 1. DASHBOARD TAB */}
        {tab === "dashboard" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>KONTROL MERKEZİ</span>
                <h1>Genel Bakış ve İstatistikler</h1>
                <p>Marel e-ticaret mağazanızın canlı operasyon, sipariş, kargo, ürün ve topluluk durumları.</p>
              </div>
              <div className="admin-header-actions">
                <button className="admin-btn-gold" onClick={() => setTab("orders")} type="button">
                  Siparişleri İncele →
                </button>
              </div>
            </header>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Toplam Sipariş Ciro</small>
                  <div className="admin-stat-icon green">₺</div>
                </div>
                <strong>{formatMoney(totalRevenue)}</strong>
                <small style={{ color: "#22c55e" }}>{orders.length} toplam sipariş kaydı</small>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Aktif Siparişler</small>
                  <div className="admin-stat-icon amber">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                </div>
                <strong>{activeOrdersCount}</strong>
                <small style={{ color: "#f59e0b" }}>Üretim ve onay sürecinde</small>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Kargo Takip Bekleyen</small>
                  <div className="admin-stat-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    </svg>
                  </div>
                </div>
                <strong>{missingCargoCount}</strong>
                <small style={{ color: missingCargoCount > 0 ? "#ef4444" : "#22c55e" }}>
                  {missingCargoCount > 0 ? "Takip kodu girilmesi gerekiyor" : "Tüm kargolar güncel"}
                </small>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Katalog Ürünleri</small>
                  <div className="admin-stat-icon purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    </svg>
                  </div>
                </div>
                <strong>{products.length}</strong>
                <small style={{ color: "#a855f7" }}>{products.filter((p) => p.stock > 0).length} ürün satışta</small>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Onay Bekleyen Yorumlar</small>
                  <div className="admin-stat-icon amber">★</div>
                </div>
                <strong>{pendingReviewsCount}</strong>
                <small style={{ color: pendingReviewsCount > 0 ? "#f59e0b" : "#94a3b8" }}>
                  {pendingReviewsCount > 0 ? "İnceleme ve onay bekliyor" : "Bekleyen yorum yok"}
                </small>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Yeni Müşteri Mesajları</small>
                  <div className="admin-stat-icon blue">✉</div>
                </div>
                <strong>{newContactsCount}</strong>
                <small style={{ color: newContactsCount > 0 ? "#38bdf8" : "#94a3b8" }}>
                  {newContactsCount > 0 ? "Yanıt bekleyen talep var" : "Tüm mesajlar okundu"}
                </small>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="admin-toolbar" style={{ marginTop: 20 }}>
              <div className="admin-filter-group">
                <strong style={{ fontSize: "0.82rem", color: "#fff" }}>Hızlı İşlemler:</strong>
                <button className="admin-filter-pill" onClick={() => setTab("cargo")} type="button">
                  📦 Kargo Takip Modülü
                </button>
                <button className="admin-filter-pill" onClick={() => setTab("orders")} type="button">
                  📋 Siparişleri Yönet
                </button>
                <button className="admin-filter-pill" onClick={() => setTab("products")} type="button">
                  🏷️ Ürün & Stok Güncelle
                </button>
                <button className="admin-filter-pill" onClick={() => setTab("reviews")} type="button">
                  ⭐ Yorumları Onayla ({pendingReviewsCount})
                </button>
                <button className="admin-filter-pill" onClick={() => setTab("contacts")} type="button">
                  💬 Mesajları Yanıtla ({newContactsCount})
                </button>
                <button className="admin-filter-pill" onClick={() => setTab("announcements")} type="button">
                  📝 Yeni Duyuru / Blog Ekle
                </button>
              </div>
            </div>
          </>
        )}

        {/* 2. PRODUCTS MANAGEMENT TAB */}
        {tab === "products" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>KATALOG & STOK YÖNETİMİ</span>
                <h1>Ürün Yönetim Paneli</h1>
                <p>Ürün fiyatları, indirim oranları, stok adetleri, aktiflik durumu ve görsellerini yönetin.</p>
              </div>
            </header>

            {/* Create Product Drawer */}
            <details className="admin-create-box">
              <summary>+ Yeni Ürün Ekle (Katalog Oluştur)</summary>
              <form onSubmit={createProduct} className="admin-grid-form">
                <label>
                  Ürün Adı *
                  <input name="name" placeholder="Örn: Diamond 110 Antrasit Plise Perde" required />
                </label>
                <label>
                  SKU (Stok Kodu) *
                  <input name="sku" placeholder="Örn: DIA-110" required />
                </label>
                <label>
                  Kategori *
                  <input name="category" placeholder="Örn: Diamond, Honeycomb, Blackout" required />
                </label>
                <label>
                  URL Adı (Slug)
                  <input name="slug" placeholder="diamond-110-antrasit (otomatik üretilir)" />
                </label>
                <label>
                  Fiyat (₺) *
                  <input name="price" type="number" min="0" step="0.01" placeholder="1166.00" required />
                </label>
                <label>
                  İndirimli Fiyat (₺)
                  <input name="salePrice" type="number" min="0" step="0.01" placeholder="990.00" />
                </label>
                <label>
                  Stok Adedi *
                  <input name="stock" type="number" min="0" defaultValue="15" required />
                </label>
                <label>
                  Google Ürün Kategorisi
                  <input name="googleProductCategory" defaultValue="Home & Garden > Decor > Window Treatments" />
                </label>
                <label className="span-2">
                  Ürün Açıklaması
                  <textarea name="description" rows={3} placeholder="Ürünün kumaş özellikleri, kullanım alanı ve detayları…" />
                </label>
                <label className="span-2">
                  Ürün Görselleri
                  <input name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple />
                </label>
                <label style={{ flexDirection: "row", alignItems: "center", gap: 8, gridColumn: "span 2", cursor: "pointer" }}>
                  <input name="featured" type="checkbox" style={{ width: 18, height: 18 }} />
                  Öne Çıkan Ürün Olarak İşaretle
                </label>
                <button className="span-4" type="submit">
                  Ürünü Kataloğa Kaydet
                </button>
              </form>
            </details>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Ürün adı, SKU veya kategori ara…"
                />
              </div>

              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${productCategoryFilter === "all" ? "active" : ""}`}
                  onClick={() => setProductCategoryFilter("all")}
                  type="button"
                >
                  Tüm Kategoriler <span>{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`admin-filter-pill ${productCategoryFilter === cat ? "active" : ""}`}
                    onClick={() => setProductCategoryFilter(cat)}
                    type="button"
                  >
                    {cat} <span>{products.filter((p) => p.category === cat).length}</span>
                  </button>
                ))}
              </div>

              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${productStockFilter === "all" ? "active" : ""}`}
                  onClick={() => setProductStockFilter("all")}
                  type="button"
                >
                  Tümü
                </button>
                <button
                  className={`admin-filter-pill ${productStockFilter === "in_stock" ? "active" : ""}`}
                  onClick={() => setProductStockFilter("in_stock")}
                  type="button"
                >
                  Stokta Olanlar
                </button>
                <button
                  className={`admin-filter-pill ${productStockFilter === "out_of_stock" ? "active" : ""}`}
                  onClick={() => setProductStockFilter("out_of_stock")}
                  type="button"
                >
                  Tükenenler
                </button>
                <button
                  className={`admin-filter-pill ${productStockFilter === "featured" ? "active" : ""}`}
                  onClick={() => setProductStockFilter("featured")}
                  type="button"
                >
                  Öne Çıkanlar
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="admin-card-list">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <article key={product.id} className="admin-data-card admin-product-row-card">
                    <div className="admin-product-thumb">
                      <Image unoptimized src={product.image} alt={product.name} fill sizes="100px" />
                    </div>

                    <div className="admin-product-meta">
                      <small>
                        {product.sku} · {product.category}
                      </small>
                      <h3>{product.name}</h3>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                        <span className={`admin-status-badge ${product.stock > 0 ? "status-badge-delivered" : "status-badge-cancelled"}`}>
                          {product.stock > 0 ? `Stok: ${product.stock} Adet` : "Tükendi"}
                        </span>
                        {product.featured ? <span className="admin-status-badge status-badge-new">Öne Çıkan</span> : null}
                        <Link
                          href={`/urunler/${product.slug}`}
                          target="_blank"
                          style={{ color: "#38bdf8", fontSize: "0.72rem", textDecoration: "none" }}
                        >
                          Mağazada Gör ↗
                        </Link>
                      </div>
                    </div>

                    <form onSubmit={(event) => updateProduct(event, product.id)} className="admin-product-quick-edit-form">
                      <label>
                        Fiyat (₺)
                        <input name="price" type="number" step="0.01" defaultValue={(product.price / 100).toFixed(2)} required />
                      </label>
                      <label>
                        İndirimli Fiyat
                        <input
                          name="salePrice"
                          type="number"
                          step="0.01"
                          defaultValue={product.salePrice ? (product.salePrice / 100).toFixed(2) : ""}
                          placeholder="Yok"
                        />
                      </label>
                      <label>
                        Stok
                        <input name="stock" type="number" defaultValue={product.stock} required />
                      </label>
                      <label>
                        Durum
                        <select name="availability" defaultValue={product.availability}>
                          <option value="in_stock">Stokta</option>
                          <option value="out_of_stock">Tükendi</option>
                          <option value="preorder">Ön Sipariş</option>
                          <option value="backorder">Tedarik</option>
                        </select>
                      </label>
                      <label className="admin-checkbox-label">
                        <input name="active" type="checkbox" defaultChecked={Boolean(product.active)} />
                        Yayında
                      </label>
                      <label className="admin-checkbox-label">
                        <input name="featured" type="checkbox" defaultChecked={Boolean(product.featured)} />
                        Öne Çıkar
                      </label>
                      <button type="submit">Değişiklikleri Güncelle</button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="admin-empty-state">
                  <h3>Aramanıza uygun ürün bulunamadı.</h3>
                  <p>Arama terimini veya filtreleri değiştirerek tekrar deneyebilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 3. ORDERS MANAGEMENT TAB */}
        {tab === "orders" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>SİPARİŞ OPERASYONU</span>
                <h1>Sipariş Takip & Yönetim Modülü</h1>
                <p>Onay, ölçü teyidi, atölye üretimi, kargo ve teslimat aşamalarını tek ekrandan yönetin.</p>
              </div>
            </header>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Sipariş no, müşteri adı, e-posta veya tel..."
                />
              </div>

              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${orderStatusFilter === "all" ? "active" : ""}`}
                  onClick={() => setOrderStatusFilter("all")}
                  type="button"
                >
                  Tüm Siparişler <span>{orders.length}</span>
                </button>
                {orderStatuses.map((st) => (
                  <button
                    key={st}
                    className={`admin-filter-pill ${orderStatusFilter === st ? "active" : ""}`}
                    onClick={() => setOrderStatusFilter(st)}
                    type="button"
                  >
                    {orderStatusNames[st] ?? st} <span>{orders.filter((o) => o.status === st).length}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="admin-card-list">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <article key={order.id} className="admin-data-card admin-order-item-card">
                    <div className="admin-order-summary-box">
                      <div className="admin-order-top-bar">
                        <div>
                          <span className="admin-order-date">{new Date(order.createdAt).toLocaleString("tr-TR")}</span>
                          <h3 style={{ margin: "4px 0", fontSize: "1.2rem", fontWeight: 850 }}>{order.orderNumber}</h3>
                        </div>
                        <span className={`admin-status-badge status-badge-${order.status}`}>
                          {orderStatusNames[order.status] ?? order.status}
                        </span>
                      </div>

                      <div className="admin-order-details-box">
                        <p>
                          <strong>Müşteri:</strong> {order.customerName} · {order.email} · {order.phone || "Telefon yok"}
                        </p>
                        {order.shippingAddress ? (
                          <p>
                            <strong>Adres:</strong> {order.shippingAddress}
                          </p>
                        ) : null}
                        {order.notes ? (
                          <p>
                            <strong>Not:</strong> {order.notes}
                          </p>
                        ) : null}
                        {order.trackingNumber ? (
                          <p style={{ color: "#38bdf8" }}>
                            <strong>Kargo:</strong> {cargoLabel(order.cargoCompany)} ({order.trackingNumber})
                          </p>
                        ) : (
                          <p style={{ color: "#f59e0b" }}>
                            <strong>Kargo Durumu:</strong> Henüz takip kodu girilmemiş
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong className="admin-order-total">{formatMoney(order.total, order.currency)}</strong>
                        {order.phone ? (
                          <button
                            type="button"
                            className="admin-cargo-wa-btn"
                            onClick={() => sendWhatsAppCargoNotice(order)}
                          >
                            💬 Müşteriye WhatsApp Aç
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <form onSubmit={(event) => updateOrder(event, order.id)} className="admin-cargo-form">
                      <strong style={{ fontSize: "0.8rem", color: "#fff" }}>Sipariş & Kargo Bilgilerini Güncelle</strong>
                      <div className="admin-cargo-form-row">
                        <select name="status" defaultValue={order.status}>
                          {orderStatuses.map((st) => (
                            <option key={st} value={st}>
                              {orderStatusNames[st] ?? st}
                            </option>
                          ))}
                        </select>
                        <select name="cargoCompany" defaultValue={order.cargoCompany ?? "mng"}>
                          {CARGO_PROVIDERS.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="Kargo Takip No (Barkod)" />
                      <input name="note" defaultValue={order.notes ?? ""} placeholder="Operasyon veya müşteri notu" />
                      <button className="admin-btn-gold" style={{ height: 38, justifyContent: "center" }} type="submit">
                        Durumu Kaydet
                      </button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="admin-empty-state">
                  <h3>Sipariş bulunamadı.</h3>
                  <p>Arama kriterlerinizi değiştirerek tekrar arayabilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 4. CARGO TRACKING MODULE */}
        {tab === "cargo" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>LOJİSTİK & TESLİMAT</span>
                <h1>Kargo Takip Modülü</h1>
                <p>
                  Kargo firmaları (MNG, Yurtiçi, Aras, Sürat, PTT, HepsiJet, Sendeo) ile gönderi takip kodlarını yönetin, canlı bağlantıları test edin ve müşteriye tek tıkla kargo bildirimi gönderin.
                </p>
              </div>
            </header>

            {/* Cargo Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: 20 }}>
              <div className="admin-stat-card">
                <small>Kargo Takip Bekleyen</small>
                <strong style={{ color: missingCargoCount > 0 ? "#ef4444" : "#22c55e" }}>{missingCargoCount}</strong>
                <small>Takip kodu girilmesi gereken siparişler</small>
              </div>
              <div className="admin-stat-card">
                <small>Kargodaki Siparişler</small>
                <strong style={{ color: "#38bdf8" }}>{orders.filter((o) => o.status === "shipped").length}</strong>
                <small>Müşteriye doğru yolda</small>
              </div>
              <div className="admin-stat-card">
                <small>Teslim Edilenler</small>
                <strong style={{ color: "#22c55e" }}>{orders.filter((o) => o.status === "delivered").length}</strong>
                <small>Başarıyla tamamlanan teslimatlar</small>
              </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={cargoSearch}
                  onChange={(e) => setCargoSearch(e.target.value)}
                  placeholder="Sipariş no, müşteri adı veya takip kodu ara..."
                />
              </div>

              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${cargoStatusFilter === "all" ? "active" : ""}`}
                  onClick={() => setCargoStatusFilter("all")}
                  type="button"
                >
                  Tüm Gönderiler <span>{orders.length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${cargoStatusFilter === "missing_code" ? "active" : ""}`}
                  onClick={() => setCargoStatusFilter("missing_code")}
                  type="button"
                >
                  ⚠️ Takip No Eksik <span>{missingCargoCount}</span>
                </button>
                <button
                  className={`admin-filter-pill ${cargoStatusFilter === "shipped" ? "active" : ""}`}
                  onClick={() => setCargoStatusFilter("shipped")}
                  type="button"
                >
                  Kargoda <span>{orders.filter((o) => o.status === "shipped").length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${cargoStatusFilter === "delivered" ? "active" : ""}`}
                  onClick={() => setCargoStatusFilter("delivered")}
                  type="button"
                >
                  Teslim Edildi <span>{orders.filter((o) => o.status === "delivered").length}</span>
                </button>
              </div>

              <div className="admin-filter-group">
                <select
                  value={cargoProviderFilter}
                  onChange={(e) => setCargoProviderFilter(e.target.value)}
                  style={{
                    background: "#0b0f17",
                    border: "1px solid var(--admin-border)",
                    borderRadius: 10,
                    padding: "6px 12px",
                    color: "#fff",
                    fontSize: "0.76rem",
                  }}
                >
                  <option value="all">Tüm Kargo Firmaları</option>
                  {CARGO_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo Orders List */}
            <div className="admin-card-list">
              {filteredCargoOrders.length ? (
                filteredCargoOrders.map((order) => {
                  const trackUrl = cargoTrackingUrl(order.cargoCompany, order.trackingNumber);
                  return (
                    <article
                      key={order.id}
                      className={`admin-data-card admin-cargo-card ${
                        !order.trackingNumber && order.status !== "delivered" ? "highlight-amber" : "highlight-green"
                      }`}
                    >
                      <div className="admin-cargo-left">
                        <div className="admin-cargo-header">
                          <div>
                            <small style={{ color: "var(--admin-text-dim)", fontSize: "0.7rem" }}>
                              {new Date(order.createdAt).toLocaleString("tr-TR")}
                            </small>
                            <h3>{order.orderNumber}</h3>
                          </div>
                          <span className={`admin-status-badge status-badge-${order.status}`}>
                            {orderStatusNames[order.status] ?? order.status}
                          </span>
                        </div>

                        <div className="admin-cargo-customer">
                          <strong>{order.customerName}</strong>
                          <span>·</span>
                          <span>{order.phone || "Telefon belirtilmemiş"}</span>
                          <span>·</span>
                          <span>{order.email}</span>
                        </div>

                        {order.trackingNumber ? (
                          <div className="admin-cargo-tracking-badge">
                            <span>Kargo Firması:</span>
                            <strong>{cargoLabel(order.cargoCompany)}</strong>
                            <span>| Takip No:</span>
                            <strong>{order.trackingNumber}</strong>
                          </div>
                        ) : (
                          <div
                            className="admin-cargo-tracking-badge"
                            style={{ borderColor: "#ef4444", color: "#fca5a5" }}
                          >
                            ⚠️ Henüz kargo takip numarası kaydedilmemiş
                          </div>
                        )}

                        <div className="admin-cargo-actions-row">
                          {trackUrl ? (
                            <a className="admin-cargo-test-link" href={trackUrl} target="_blank" rel="noreferrer">
                              🔗 Kargo Takip Linkini Test Et ↗
                            </a>
                          ) : null}

                          {order.phone ? (
                            <button
                              type="button"
                              className="admin-cargo-wa-btn"
                              onClick={() => sendWhatsAppCargoNotice(order)}
                            >
                              💬 Müşteriye WhatsApp Kargo Bildirimi Gönder
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <form onSubmit={(event) => updateOrder(event, order.id)} className="admin-cargo-form">
                        <strong style={{ fontSize: "0.8rem", color: "#fff" }}>Kargo Bilgilerini Güncelle</strong>
                        <div className="admin-cargo-form-row">
                          <select name="cargoCompany" defaultValue={order.cargoCompany ?? "mng"}>
                            {CARGO_PROVIDERS.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          <select name="status" defaultValue={order.status}>
                            <option value="processing">Üretimde</option>
                            <option value="shipped">Kargoya Verildi</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="pending">Sipariş Alındı</option>
                          </select>
                        </div>
                        <input
                          name="trackingNumber"
                          defaultValue={order.trackingNumber ?? ""}
                          placeholder="Kargo Takip Barkod No (örn: 12345678901)"
                          required={order.status === "shipped"}
                        />
                        <button className="admin-btn-gold" style={{ height: 38, justifyContent: "center" }} type="submit">
                          Kargo Takip Bilgisini Kaydet
                        </button>
                      </form>
                    </article>
                  );
                })
              ) : (
                <div className="admin-empty-state">
                  <h3>Kargo kaydı bulunamadı.</h3>
                  <p>Filtreleri değiştirerek diğer siparişleri görüntüleyebilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 5. REVIEWS MANAGEMENT TAB */}
        {tab === "reviews" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>MÜŞTERİ DEĞERLENDİRMELERİ</span>
                <h1>Yorumlar Paneli</h1>
                <p>
                  Müşterilerinizin ürün ve alışveriş deneyimi yorumlarını inceleyin, onaylayarak mağazada yayınlayın veya Marel resmi yanıtı ekleyin.
                </p>
              </div>
            </header>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${reviewStatusFilter === "pending" ? "active" : ""}`}
                  onClick={() => setReviewStatusFilter("pending")}
                  type="button"
                >
                  ⏳ Onay Bekleyenler <span>{pendingReviewsCount}</span>
                </button>
                <button
                  className={`admin-filter-pill ${reviewStatusFilter === "approved" ? "active" : ""}`}
                  onClick={() => setReviewStatusFilter("approved")}
                  type="button"
                >
                  ✅ Yayında Olanlar <span>{reviews.filter((r) => r.status === "approved").length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${reviewStatusFilter === "rejected" ? "active" : ""}`}
                  onClick={() => setReviewStatusFilter("rejected")}
                  type="button"
                >
                  ❌ Reddedilenler <span>{reviews.filter((r) => r.status === "rejected").length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${reviewStatusFilter === "all" ? "active" : ""}`}
                  onClick={() => setReviewStatusFilter("all")}
                  type="button"
                >
                  Tüm Yorumlar <span>{reviews.length}</span>
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="admin-card-list">
              {filteredReviews.length ? (
                filteredReviews.map((review) => (
                  <article key={review.id} className="admin-data-card admin-review-card">
                    <div className="admin-review-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="admin-review-rating">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                        <span
                          className={`admin-status-badge ${
                            review.status === "pending"
                              ? "status-badge-pending"
                              : review.status === "approved"
                              ? "status-badge-delivered"
                              : "status-badge-cancelled"
                          }`}
                        >
                          {review.status === "pending" ? "Onay Bekliyor" : review.status === "approved" ? "Yayında" : "Reddedildi"}
                        </span>
                      </div>

                      <h3 style={{ margin: "4px 0", fontSize: "1.05rem", fontWeight: 850 }}>{review.title}</h3>
                      <span className="admin-review-author">
                        <strong>{review.authorName}</strong> · {review.productName ?? "Genel Mağaza Deneyimi"} ·{" "}
                        {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                      </span>

                      <p className="admin-review-body">{review.body}</p>

                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        {review.status !== "approved" ? (
                          <button
                            type="button"
                            className="admin-btn-gold"
                            style={{ height: 32, fontSize: "0.72rem" }}
                            onClick={() => quickReviewStatus(review.id, "approved")}
                          >
                            ✓ Tek Tıkla Onayla & Yayınla
                          </button>
                        ) : null}
                        {review.status !== "rejected" ? (
                          <button
                            type="button"
                            className="admin-btn-secondary"
                            style={{ height: 32, fontSize: "0.72rem", color: "#f87171" }}
                            onClick={() => quickReviewStatus(review.id, "rejected")}
                          >
                            ✕ Reddet
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <form onSubmit={(event) => updateReview(event, review.id)} className="admin-review-form">
                      <strong style={{ fontSize: "0.8rem", color: "#fff" }}>Yorum Durumu & Marel Yanıtı</strong>
                      <select name="status" defaultValue={review.status}>
                        <option value="pending">Onay Bekliyor</option>
                        <option value="approved">Yayında (Onaylandı)</option>
                        <option value="rejected">Reddedildi</option>
                      </select>
                      <textarea
                        name="adminReply"
                        defaultValue={review.adminReply}
                        rows={3}
                        placeholder="Marel adına müşteriye resmi yanıt yazın..."
                      />
                      <button type="submit">Yorum ve Yanıtı Kaydet</button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="admin-empty-state">
                  <h3>Seçilen kriterde yorum bulunamadı.</h3>
                  <p>Diğer sekmeleri inceleyerek yorumları kontrol edebilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 6. ANNOUNCEMENTS & BLOG TAB */}
        {tab === "announcements" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>İÇERİK & BLOG YÖNETİMİ</span>
                <h1>Duyurular ve Rehberler</h1>
                <p>
                  Rehberleri, kampanya duyurularını ve blog yazılarını oluşturun. Yayınlanan içerikler `/duyurular` sayfasında anında canlıya alınır.
                </p>
              </div>
            </header>

            {/* Create Announcement Drawer */}
            <details className="admin-create-box">
              <summary>+ Yeni Blog Yazısı / Duyuru Oluştur</summary>
              <form onSubmit={createAnnouncement} className="admin-grid-form">
                <label className="span-2">
                  Başlık *
                  <input name="title" placeholder="Örn: Ölçüye Özel Plise Perde Seçim Rehberi" required />
                </label>
                <label className="span-2">
                  URL Adı (Slug)
                  <input name="slug" placeholder="olcu-rehberi (otomatik üretilir)" />
                </label>
                <label className="span-4">
                  Kısa Özet *
                  <textarea name="summary" rows={2} placeholder="Ana sayfa ve kartlarda görünecek kısa özet..." required />
                </label>
                <label className="span-4">
                  Blog / Duyuru Metni *
                  <textarea name="body" rows={6} placeholder="Rehber içeriğinin tam metni..." required />
                </label>
                <label className="span-4">
                  Görsel Yolu
                  <input name="imageUrl" defaultValue="/images/real/diamond-beyaz-siyah-ip.jpeg" />
                </label>
                <label style={{ flexDirection: "row", alignItems: "center", gap: 8, gridColumn: "span 2", cursor: "pointer" }}>
                  <input name="published" type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                  Hemen Yayına Al (Published)
                </label>
                <label style={{ flexDirection: "row", alignItems: "center", gap: 8, gridColumn: "span 2", cursor: "pointer" }}>
                  <input name="featured" type="checkbox" style={{ width: 18, height: 18 }} />
                  Öne Çıkan İçerik
                </label>
                <button className="span-4" type="submit">
                  Duyuruyu Kaydet ve Yayınla
                </button>
              </form>
            </details>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${announcementFilter === "all" ? "active" : ""}`}
                  onClick={() => setAnnouncementFilter("all")}
                  type="button"
                >
                  Tüm İçerikler <span>{announcements.length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${announcementFilter === "published" ? "active" : ""}`}
                  onClick={() => setAnnouncementFilter("published")}
                  type="button"
                >
                  Yayında <span>{announcements.filter((a) => a.published).length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${announcementFilter === "draft" ? "active" : ""}`}
                  onClick={() => setAnnouncementFilter("draft")}
                  type="button"
                >
                  Taslak <span>{announcements.filter((a) => !a.published).length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${announcementFilter === "featured" ? "active" : ""}`}
                  onClick={() => setAnnouncementFilter("featured")}
                  type="button"
                >
                  Öne Çıkan <span>{announcements.filter((a) => a.featured).length}</span>
                </button>
              </div>

              <Link href="/duyurular" target="_blank" className="admin-btn-secondary" style={{ height: 36, textDecoration: "none" }}>
                Canlı Duyurular Sayfasını Aç ↗
              </Link>
            </div>

            {/* Announcements List */}
            <div className="admin-card-list">
              {filteredAnnouncements.length ? (
                filteredAnnouncements.map((item) => (
                  <article key={item.id} className="admin-data-card admin-announcement-card">
                    <div className="admin-announcement-thumb">
                      <Image unoptimized src={item.imageUrl} alt="" fill sizes="200px" />
                    </div>

                    <form onSubmit={(event) => updateAnnouncement(event, item.id)} className="admin-announcement-edit-form">
                      <label className="span-2">
                        Başlık
                        <input name="title" defaultValue={item.title} required />
                      </label>
                      <label className="span-2">
                        Özet
                        <textarea name="summary" rows={2} defaultValue={item.summary} required />
                      </label>
                      <label className="span-2">
                        İçerik Metni
                        <textarea name="body" rows={4} defaultValue={item.body} required />
                      </label>
                      <label className="span-2">
                        Kapak Görseli
                        <input name="imageUrl" defaultValue={item.imageUrl} />
                      </label>

                      <div className="admin-announcement-actions-bar">
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <label style={{ flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input name="published" type="checkbox" defaultChecked={Boolean(item.published)} />
                            Yayında
                          </label>
                          <label style={{ flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input name="featured" type="checkbox" defaultChecked={Boolean(item.featured)} />
                            Öne Çıkan
                          </label>
                          <Link href={`/duyurular#${item.slug}`} target="_blank" style={{ color: "#38bdf8", fontSize: "0.72rem" }}>
                            Canlı Gör ↗
                          </Link>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                          <button type="submit" className="admin-btn-gold" style={{ height: 36 }}>
                            Güncelle
                          </button>
                          <button
                            type="button"
                            className="admin-btn-delete"
                            onClick={() => deleteAnnouncement(item.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </form>
                  </article>
                ))
              ) : (
                <div className="admin-empty-state">
                  <h3>Duyuru bulunamadı.</h3>
                  <p>Yukarıdaki formu kullanarak yeni blog yazısı veya duyuru ekleyebilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 7. CONTACT MESSAGES TAB */}
        {tab === "contacts" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>MÜŞTERİ İLETİŞİMİ & TALEPLER</span>
                <h1>Gelen Mesajlar Paneli</h1>
                <p>İletişim formundan iletilen soru, teklif ve destek taleplerini görüntüleyin ve hızlıca yanıtlayın.</p>
              </div>
            </header>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-filter-group">
                <button
                  className={`admin-filter-pill ${contactStatusFilter === "all" ? "active" : ""}`}
                  onClick={() => setContactStatusFilter("all")}
                  type="button"
                >
                  Tüm Mesajlar <span>{contacts.length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${contactStatusFilter === "new" ? "active" : ""}`}
                  onClick={() => setContactStatusFilter("new")}
                  type="button"
                >
                  🔔 Yeni Mesajlar <span>{newContactsCount}</span>
                </button>
                <button
                  className={`admin-filter-pill ${contactStatusFilter === "read" ? "active" : ""}`}
                  onClick={() => setContactStatusFilter("read")}
                  type="button"
                >
                  Okundu <span>{contacts.filter((c) => c.status === "read").length}</span>
                </button>
                <button
                  className={`admin-filter-pill ${contactStatusFilter === "resolved" ? "active" : ""}`}
                  onClick={() => setContactStatusFilter("resolved")}
                  type="button"
                >
                  Sonuçlandı <span>{contacts.filter((c) => c.status === "resolved").length}</span>
                </button>
              </div>
            </div>

            {/* Contacts List */}
            <div className="admin-card-list">
              {filteredContacts.length ? (
                filteredContacts.map((item) => {
                  const cleanPhone = item.phone ? item.phone.replace(/[^0-9]/g, "") : "";
                  const formattedPhone = cleanPhone.startsWith("0") ? `9${cleanPhone}` : cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
                  return (
                    <article
                      key={item.id}
                      className={`admin-data-card admin-contact-card ${item.status === "new" ? "highlight-amber" : ""}`}
                    >
                      <div className="admin-contact-info-block">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="admin-contact-subject">{item.subject || "Genel İletişim Talebi"}</span>
                          <span
                            className={`admin-status-badge ${
                              item.status === "new" ? "status-badge-new" : item.status === "read" ? "status-badge-read" : "status-badge-delivered"
                            }`}
                          >
                            {item.status === "new" ? "Yeni Mesaj" : item.status === "read" ? "Okundu" : "Sonuçlandı"}
                          </span>
                        </div>

                        <h3 style={{ margin: "4px 0", fontSize: "1.15rem", fontWeight: 850 }}>{item.name}</h3>
                        <small style={{ color: "var(--admin-text-dim)" }}>
                          {item.email} · {item.phone || "Telefon belirtilmemiş"} · {new Date(item.createdAt).toLocaleString("tr-TR")}
                        </small>

                        <div className="admin-contact-message-body">{item.message}</div>
                      </div>

                      <div className="admin-contact-action-box">
                        <strong style={{ fontSize: "0.8rem", color: "#fff" }}>Hızlı İletişim & Yanıt</strong>
                        <div className="admin-quick-reply-row">
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Merhaba Sayın ${item.name}, Marel İletişim talebiniz hakkında ulaşıyoruz.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-wa-reply-link"
                            >
                              💬 WhatsApp ile Yaz
                            </a>
                          ) : null}

                          <a
                            href={`mailto:${item.email}?subject=${encodeURIComponent(`Marel Destek: ${item.subject}`)}`}
                            className="admin-email-reply-link"
                          >
                            ✉️ E-posta Gönder
                          </a>
                        </div>

                        <form onSubmit={(event) => updateContact(event, item.id)} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <select name="status" defaultValue={item.status} style={{ flex: 1 }}>
                            <option value="new">Yeni</option>
                            <option value="read">Okundu</option>
                            <option value="resolved">Sonuçlandı</option>
                          </select>
                          <button type="submit" className="admin-btn-secondary" style={{ height: 38 }}>
                            Durumu Kaydet
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="admin-empty-state">
                  <h3>Mesaj bulunamadı.</h3>
                  <p>Müşterilerden gelen tüm mesajlar burada listelenir.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
