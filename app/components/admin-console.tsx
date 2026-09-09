"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/app/lib/commerce";
import { CARGO_PROVIDERS, cargoLabel, cargoTrackingUrl, type CargoCompany } from "@/app/lib/cargo";
import type {
  AnnouncementRecord,
  CatalogProduct,
  ContactMessageRecord,
  CouponRecord,
  CustomerRecord,
  OrderRecord,
  ReviewRecord,
  SiteSettingsRecord,
} from "@/db";
import type { LaravelUser } from "@/app/lib/laravel-auth";
import { AdminProductEditorModal } from "@/app/components/admin-product-editor-modal";
import { AdminCustomerEditorModal } from "@/app/components/admin-customer-editor-modal";

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

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function createCouponCode() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return `MRL-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

type Tab =
  | "dashboard"
  | "products"
  | "orders"
  | "cargo"
  | "coupons"
  | "customers"
  | "settings"
  | "reviews"
  | "announcements"
  | "contacts";

export function AdminConsole({
  products,
  orders,
  reviews,
  announcements,
  contacts,
  initialCoupons,
  initialSettings,
  initialCustomers,
  adminUser,
}: {
  products: CatalogProduct[];
  orders: OrderRecord[];
  reviews: ReviewRecord[];
  announcements: AnnouncementRecord[];
  contacts: ContactMessageRecord[];
  initialCoupons?: CouponRecord[];
  initialSettings?: SiteSettingsRecord;
  initialCustomers?: CustomerRecord[];
  adminUser?: LaravelUser | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(tabParam && ["dashboard", "products", "orders", "cargo", "coupons", "customers", "settings", "reviews", "announcements", "contacts"].includes(tabParam) ? tabParam : "dashboard");

  useEffect(() => {
    if (tabParam && ["dashboard", "products", "orders", "cargo", "coupons", "customers", "settings", "reviews", "announcements", "contacts"].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const [message, setMessage] = useState("");

  // Product modal & bulk states
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Customer modal states
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Product Filters
  const [productSearch, setProductSearch] = useState("");
  const [productRootCategoryFilter, setProductRootCategoryFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productBrandFilter, setProductBrandFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [cargoSearch, setCargoSearch] = useState("");
  const [cargoStatusFilter, setCargoStatusFilter] = useState("all");
  const [cargoProviderFilter, setCargoProviderFilter] = useState("all");

  const [reviewStatusFilter, setReviewStatusFilter] = useState("pending");
  const [announcementFilter, setAnnouncementFilter] = useState("all");
  const [contactStatusFilter, setContactStatusFilter] = useState("all");

  const [coupons, setCoupons] = useState<CouponRecord[]>(initialCoupons || []);
  const [settings, setSettings] = useState<SiteSettingsRecord>(initialSettings || {});
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers || []);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const [couponCode, setCouponCode] = useState(createCouponCode);
  const [couponCopied, setCouponCopied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");

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

  // Product Actions & Handlers
  const openCreateProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: CatalogProduct) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(false);
  };

  const handleSaveProduct = async (productData: any) => {
    if (editingProduct) {
      await request(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(productData),
      });
    } else {
      await request("/api/admin/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(productData),
      });
    }
  };

  const handleDuplicateProduct = (id: string) => {
    return run(
      () =>
        request(`/api/admin/products/${id}/duplicate`, {
          method: "POST",
        }),
      "Ürün çoğaltılamadı."
    );
  };

  const handleQuickToggleActive = (product: CatalogProduct) => {
    const newActive = product.active === 0;
    return run(
      () =>
        request(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ active: newActive }),
        }),
      "Ürün durumu güncellenemedi."
    );
  };

  const handleQuickToggleFeatured = (product: CatalogProduct) => {
    const newFeatured = !product.featured;
    return run(
      () =>
        request(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ featured: newFeatured }),
        }),
      "Öne çıkan durumu güncellenemedi."
    );
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!window.confirm(`"${name}" ürününü kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    return run(() => request(`/api/admin/products/${id}`, { method: "DELETE" }), "Ürün silinemedi.");
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "feature" | "unfeature" | "delete") => {
    if (selectedProductIds.length === 0) return;
    if (action === "delete") {
      if (!window.confirm(`Seçilen ${selectedProductIds.length} ürünü silmek istediğinize emin misiniz?`)) return;
    }
    return run(
      async () => {
        await request("/api/admin/products/bulk", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action, ids: selectedProductIds }),
        });
        setSelectedProductIds([]);
      },
      "Toplu işlem gerçekleştirilemedi."
    );
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const toggleSelectAllProducts = (filteredIds: string[]) => {
    if (selectedProductIds.length === filteredIds.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds([...filteredIds]);
    }
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

  const sendWhatsAppOfficeNotice = (order: OrderRecord) => {
    const siteWa = (settings.site_whatsapp || "+90 546 735 66 02").replace(/[^0-9]/g, "");
    const officePhone = siteWa.startsWith("0") ? `9${siteWa}` : siteWa.startsWith("90") ? siteWa : `90${siteWa}`;
    
    const itemsLines = (order.items || []).map((it, idx) => {
      let cfgText = "";
      try {
        const cfg = typeof it.configuration === "string" ? JSON.parse(it.configuration) : it.configuration || {};
        const w = cfg.width || cfg.en;
        const h = cfg.height || cfg.boy;
        const fabric = cfg.fabric || cfg.kumas || "Standart";
        const profile = cfg.profileColor || cfg.profil || "Standart";
        if (w && h) cfgText = ` [${w}x${h} cm | Kumaş: ${fabric} | Profil: ${profile}]`;
      } catch {}
      return `${idx + 1}. ${it.name}${cfgText} x ${it.quantity} Adet`;
    }).join("\n");

    const text = `*YENİ MAREL SİPARİŞİ*\n` +
      `Sipariş No: ${order.orderNumber}\n` +
      `Müşteri: ${order.customerName}\n` +
      `Telefon: ${order.phone}\n` +
      `E-posta: ${order.email}\n` +
      `Adres: ${order.shippingAddress} ${order.district ? `(${order.district} / ${order.city})` : ""}\n` +
      `Tutar: ${formatMoney(order.total, order.currency)}\n` +
      `Ödeme: ${order.paymentMethod || "Havale/EFT"}\n` +
      `Not: ${order.notes || "Yok"}\n` +
      `--------------------------\n` +
      `Ürünler & Ölçüler:\n${itemsLines || "Standart Kalemler"}`;

    window.open(`https://wa.me/${officePhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyCouponCode = async () => {
    await navigator.clipboard.writeText(couponCode);
    setCouponCopied(true);
    window.setTimeout(() => setCouponCopied(false), 1600);
  };

  const handleCreateCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCouponLoading(true);
    setCouponError("");
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          type: form.get("type"),
          value: form.get("value"),
          minimumSubtotal: form.get("minimumSubtotal"),
          usageLimit: form.get("usageLimit"),
          isActive: form.get("isActive") === "on",
        }),
      });
      const data = (await res.json()) as { error?: string; id?: string };
      if (!res.ok) throw new Error(data.error || "Kupon oluşturulamadı.");
      setCoupons((prev) => [data as unknown as CouponRecord, ...prev]);
      setCouponCode(createCouponCode());
      (event.target as HTMLFormElement).reset();
      setMessage("Kupon başarıyla oluşturuldu.");
      window.setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Kupon oluşturulamadı.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Kupon silinemedi.");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setMessage("Kupon silindi.");
      window.setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errData = (await (err as Response).json()) as { error?: string };
      alert(errData.error || "Bir hata oluştu.");
    }
  };

  const handleSaveCustomer = async (originalEmail: string, data: { fullName: string; phone: string; email: string }) => {
    const res = await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalEmail, ...data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Müşteri kaydedilemedi.");
    }
    window.location.reload();
  };

  const handleSaveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsLoading(true);
    setSettingsSaved(false);
    const form = new FormData(event.currentTarget);
    const newSettings: Record<string, string> = {};
    form.forEach((value, key) => {
      newSettings[key] = String(value);
    });
    newSettings["maintenance_mode"] = form.get("maintenance_mode") === "on" ? "true" : "false";

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });
      const data = (await res.json()) as { error?: string; settings?: SiteSettingsRecord };
      if (!res.ok) throw new Error(data.error || "Ayarlar kaydedilemedi.");
      setSettings(data.settings || newSettings);
      setSettingsSaved(true);
      setMessage("Ayarlar başarıyla güncellendi.");
      window.setTimeout(() => {
        setMessage("");
        setSettingsSaved(false);
      }, 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Computed Metrics
  const pendingReviewsCount = reviews.filter((r) => r.status === "pending").length;
  const newContactsCount = contacts.filter((c) => c.status === "new").length;
  const missingCargoCount = orders.filter((o) => !o.trackingNumber && o.status !== "delivered" && o.status !== "cancelled").length;
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== "cancelled" ? order.total : 0), 0);
  const completedOrdersCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrdersCount = orders.filter((o) => o.status === "cancelled").length;
  const averageOrderValue = orders.length > 0 ? totalRevenue / Math.max(orders.length - cancelledOrdersCount, 1) : 0;
  const fulfillmentRate = orders.length > 0 ? Math.round((completedOrdersCount / orders.length) * 100) : 0;
  const lowStockCount = products.filter((p) => p.active !== 0 && p.stock > 0 && p.stock <= 5).length;
  const activeCouponsCount = coupons.filter((coupon) => Boolean(coupon.active)).length;

  // Filtered Products
  const rootCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.rootCategory || "Perdeler").filter(Boolean))),
    [products]
  );
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand || "Marel").filter(Boolean))), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = productSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.brand && product.brand.toLowerCase().includes(q));

      const matchesRoot =
        productRootCategoryFilter === "all" ||
        (product.rootCategory && product.rootCategory === productRootCategoryFilter) ||
        (!product.rootCategory && productRootCategoryFilter === "Perdeler");

      const matchesCategory = productCategoryFilter === "all" || product.category === productCategoryFilter;
      const matchesBrand = productBrandFilter === "all" || (product.brand || "Marel") === productBrandFilter;

      let matchesStatus = true;
      if (productStatusFilter === "active") matchesStatus = product.active !== 0;
      else if (productStatusFilter === "inactive") matchesStatus = product.active === 0;
      else if (productStatusFilter === "featured") matchesStatus = Boolean(product.featured);
      else if (productStatusFilter === "in_stock") matchesStatus = product.stock > 0;
      else if (productStatusFilter === "out_of_stock") matchesStatus = product.stock <= 0;
      else if (productStatusFilter === "discounted") matchesStatus = Boolean(product.salePrice && product.salePrice < product.price);

      return matchesSearch && matchesRoot && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [products, productSearch, productRootCategoryFilter, productCategoryFilter, productBrandFilter, productStatusFilter]);

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

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [customers, customerSearch]);

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
              Duyurular
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

          <button
            className={`admin-nav-btn ${tab === "coupons" ? "active" : ""}`}
            onClick={() => setTab("coupons")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Kupon Yönetimi
            </span>
            <span className="admin-nav-badge">{coupons.length}</span>
          </button>

          <button
            className={`admin-nav-btn ${tab === "customers" ? "active" : ""}`}
            onClick={() => setTab("customers")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Müşteriler
            </span>
            <span className="admin-nav-badge">{customers.length}</span>
          </button>

          <button
            className={`admin-nav-btn ${tab === "settings" ? "active" : ""}`}
            onClick={() => setTab("settings")}
            type="button"
          >
            <span className="admin-nav-btn-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Site Ayarları
            </span>
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

            <div className="admin-quick-actions">
              <button type="button" className="admin-quick-action peach" onClick={() => setTab("coupons")}>
                <strong>Yeni kupon oluştur</strong>
                <span>İndirim kodu veya sabit tutar tanımla ↗</span>
              </button>
              <button type="button" className="admin-quick-action blue" onClick={() => setTab("announcements")}>
                <strong>Duyuru yayınla</strong>
                <span>Mağazada yeni bilgilendirme paylaş ↗</span>
              </button>
              <button type="button" className="admin-quick-action green" onClick={() => setTab("products")}>
                <strong>Ürün kataloğunu düzenle</strong>
                <span>Stok ve vitrin durumunu güncelle ↗</span>
              </button>
              <button type="button" className="admin-quick-action lilac" onClick={() => setTab("contacts")}>
                <strong>Mesajları kontrol et</strong>
                <span>{newContactsCount} yeni müşteri talebi bulunuyor ↗</span>
              </button>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Toplam Sipariş Ciro</small>
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
                </div>
                <strong>{pendingReviewsCount}</strong>
                <small style={{ color: pendingReviewsCount > 0 ? "#f59e0b" : "#94a3b8" }}>
                  {pendingReviewsCount > 0 ? "İnceleme ve onay bekliyor" : "Bekleyen yorum yok"}
                </small>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-card-top">
                  <small>Yeni Müşteri Mesajları</small>
                </div>
                <strong>{newContactsCount}</strong>
                <small style={{ color: newContactsCount > 0 ? "#38bdf8" : "#94a3b8" }}>
                  {newContactsCount > 0 ? "Yanıt bekleyen talep var" : "Tüm mesajlar okundu"}
                </small>
              </div>
            </div>

            <section className="admin-analytics-panel" aria-label="Operasyon analitikleri">
              <div className="admin-analytics-heading">
                <div>
                  <span>PERFORMANS ÖZETİ</span>
                  <h2>Bugün neye odaklanmalı?</h2>
                </div>
                <small>Mevcut sipariş, katalog ve topluluk verilerinden hesaplanır.</small>
              </div>
              <div className="admin-analytics-grid">
                <div className="admin-analytics-item">
                  <small>Ortalama Sipariş</small>
                  <strong>{formatMoney(averageOrderValue)}</strong>
                  <span>İptal edilenler hariç</span>
                </div>
                <div className="admin-analytics-item">
                  <small>Teslimat Oranı</small>
                  <strong>{fulfillmentRate}%</strong>
                  <span>{completedOrdersCount} teslim edilen sipariş</span>
                </div>
                <div className="admin-analytics-item warning">
                  <small>Düşük Stok Riski</small>
                  <strong>{lowStockCount}</strong>
                  <span>5 ve altı stoklu aktif ürün</span>
                </div>
                <div className="admin-analytics-item">
                  <small>Aktif Kampanyalar</small>
                  <strong>{activeCouponsCount}</strong>
                  <span>{announcements.filter((announcement) => Boolean(announcement.published)).length} yayınlanan duyuru</span>
                </div>
              </div>
            </section>

            <div className="admin-dashboard-lower">
              <section className="admin-chart-card">
                <div className="admin-chart-header">
                  <div>
                    <span>SİPARİŞ ANALİTİĞİ</span>
                    <h2>Operasyon görünümü</h2>
                  </div>
                  <div className="admin-chart-switcher">
                    <button type="button">Günlük</button>
                    <button type="button">Haftalık</button>
                    <button type="button" className="active">Aylık</button>
                  </div>
                </div>
                <div className="admin-bar-chart" aria-label="Sipariş durum dağılımı">
                  {[
                    ["Bekliyor", orders.filter((o) => o.status === "pending").length],
                    ["Onay", orders.filter((o) => o.status === "measure_ok").length],
                    ["Üretim", orders.filter((o) => o.status === "processing").length],
                    ["Kargo", orders.filter((o) => o.status === "shipped").length],
                    ["Teslim", completedOrdersCount],
                    ["İptal", cancelledOrdersCount],
                  ].map(([label, value]) => (
                    <div className="admin-bar-column" key={label}>
                      <div className="admin-bar-value" style={{ height: `${Math.max(Number(value) * 18, 12)}px` }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-chart-footer">
                  <strong>{orders.length} toplam sipariş</strong>
                  <span>Aktif operasyon ve teslimat takibi</span>
                </div>
              </section>

              <aside className="admin-insights-column">
                <section className="admin-insight-card">
                  <div className="admin-insight-title"><h3>Müşteri içgörüleri</h3><span>↗</span></div>
                  <div className="admin-insight-row"><span>Yeni müşteriler</span><strong>{customers.length}</strong></div>
                  <div className="admin-insight-row"><span>Toplam yorum</span><strong>{reviews.length}</strong></div>
                  <div className="admin-insight-row"><span>Teslim edilen sipariş</span><strong>{completedOrdersCount}</strong></div>
                  <div className="admin-progress"><span style={{ width: `${Math.min(fulfillmentRate, 100)}%` }} /></div>
                  <small>Müşteri memnuniyeti için teslimat oranını takip edin.</small>
                </section>
                <section className="admin-insight-card">
                  <div className="admin-insight-title"><h3>Aktif kampanyalar</h3><button type="button" onClick={() => setTab("coupons")}>Tümünü gör</button></div>
                  {coupons.slice(0, 2).map((coupon) => (
                    <div className="admin-promotion-row" key={coupon.id}>
                      <span>{coupon.code}</span>
                      <strong>{coupon.discountType === "PERCENT" ? `%${coupon.discountValue}` : formatMoney(coupon.discountValue)}</strong>
                    </div>
                  ))}
                  {coupons.length === 0 ? <small>Henüz aktif kampanya yok.</small> : null}
                </section>
              </aside>
            </div>
          </>
        )}

        {/* 2. PRODUCTS MANAGEMENT TAB */}
        {tab === "products" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>KATALOG, STOK & VİTRİN YÖNETİMİ</span>
                <h1>Ürün Yönetim Paneli</h1>
                <p>
                  Tüm ürünlerin renk, ölçü, satış fiyatı, indirim oranı, taksit kampanyası, stok durumu, aktif satış kapatma/açma ve çoklu fotoğraflarını yönetin.
                </p>
              </div>
              <div className="admin-header-actions">
                <button className="admin-btn-gold" onClick={openCreateProductModal} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
                  <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Yeni Ürün Ekle
                </button>
              </div>
            </header>

            {/* Product Quick Overview Stats Ribbon */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 20 }}>
              <div className="admin-stat-card" style={{ padding: "12px 16px" }}>
                <small style={{ color: "#64748b" }}>Toplam Ürün</small>
                <strong style={{ fontSize: "1.3rem" }}>{products.length}</strong>
                <small style={{ color: "#0ea5e9" }}>Katalogdaki tüm kayıtlar</small>
              </div>
              <div className="admin-stat-card" style={{ padding: "12px 16px" }}>
                <small style={{ color: "#64748b" }}>Satışta Olan (Aktif)</small>
                <strong style={{ fontSize: "1.3rem", color: "#16a34a" }}>{products.filter((p) => p.active !== 0).length}</strong>
                <small style={{ color: "#16a34a" }}>Canlı mağazada açık</small>
              </div>
              <div className="admin-stat-card" style={{ padding: "12px 16px" }}>
                <small style={{ color: "#64748b" }}>Satışa Kapatılan (Pasif)</small>
                <strong style={{ fontSize: "1.3rem", color: "#dc2626" }}>{products.filter((p) => p.active === 0).length}</strong>
                <small style={{ color: "#dc2626" }}>Canlıda gizli / kapalı</small>
              </div>
              <div className="admin-stat-card" style={{ padding: "12px 16px" }}>
                <small style={{ color: "#64748b" }}>Tükendi / Sıfır Stok</small>
                <strong style={{ fontSize: "1.3rem", color: "#f59e0b" }}>{products.filter((p) => p.stock <= 0).length}</strong>
                <small style={{ color: "#f59e0b" }}>Stok girişi bekleyen</small>
              </div>
              <div className="admin-stat-card" style={{ padding: "12px 16px" }}>
                <small style={{ color: "#64748b" }}>Öne Çıkan Ürünler</small>
                <strong style={{ fontSize: "1.3rem", color: "#854d0e" }}>{products.filter((p) => Boolean(p.featured)).length}</strong>
                <small style={{ color: "#854d0e" }}>Vitrinde vurgulanan</small>
              </div>
              <div className="admin-stat-card" style={{ padding: "12px 16px" }}>
                <small style={{ color: "#64748b" }}>İndirimli Ürünler</small>
                <strong style={{ fontSize: "1.3rem", color: "#9333ea" }}>
                  {products.filter((p) => p.salePrice && p.salePrice < p.price).length}
                </strong>
                <small style={{ color: "#9333ea" }}>Kampanyalı ürünler</small>
              </div>
            </div>

            {/* Bulk Action Bar (Visible when items selected) */}
            {selectedProductIds.length > 0 && (
              <div className="admin-bulk-bar">
                <div className="admin-bulk-left">
                  <span>✓ {selectedProductIds.length} ürün seçildi</span>
                </div>
                <div className="admin-bulk-actions">
                  <button type="button" className="admin-bulk-btn" onClick={() => handleBulkAction("activate")}>
                    Toplu Satışa Aç
                  </button>
                  <button type="button" className="admin-bulk-btn" onClick={() => handleBulkAction("deactivate")}>
                    Toplu Satışa Kapat
                  </button>
                  <button type="button" className="admin-bulk-btn" onClick={() => handleBulkAction("feature")}>
                    Toplu Öne Çıkar
                  </button>
                  <button type="button" className="admin-bulk-btn" onClick={() => handleBulkAction("unfeature")}>
                    Öne Çıkarmayı Kaldır
                  </button>
                  <button
                    type="button"
                    className="admin-bulk-btn"
                    style={{ background: "#dc2626", borderColor: "#ef4444" }}
                    onClick={() => handleBulkAction("delete")}
                  >
                    Toplu Sil
                  </button>
                  <button
                    type="button"
                    className="admin-bulk-btn"
                    style={{ background: "transparent", textDecoration: "underline" }}
                    onClick={() => setSelectedProductIds([])}
                  >
                    Seçimi Temizle
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar Filters */}
            <div className="admin-toolbar" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
              {/* Row 1: Search & Root Categories */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div className="admin-search-input" style={{ flex: "1 1 280px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Ürün adı, SKU, kategori veya marka ara…"
                    style={{ width: "100%" }}
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch("")}
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0 4px" }}
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Root Category Pills */}
                <div className="admin-filter-group" style={{ flex: "2 1 auto" }}>
                  <button
                    className={`admin-filter-pill ${productRootCategoryFilter === "all" ? "active" : ""}`}
                    onClick={() => setProductRootCategoryFilter("all")}
                    type="button"
                  >
                    Tüm Kategoriler <span>{products.length}</span>
                  </button>
                  {["Perdeler", "Sineklikler", "Seperatör Kapı", "Otomatik Panjurlar", "Tutamaklar", "Aksesuarlar"].map((rc) => {
                    const count = products.filter((p) => (p.rootCategory || "Perdeler") === rc).length;
                    return (
                      <button
                        key={rc}
                        className={`admin-filter-pill ${productRootCategoryFilter === rc ? "active" : ""}`}
                        onClick={() => setProductRootCategoryFilter(rc)}
                        type="button"
                      >
                        {rc} <span>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Secondary Dropdowns & Status Pills */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {/* Brand Filter */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <small style={{ fontWeight: 700, color: "#475569" }}>Marka:</small>
                    <select
                      value={productBrandFilter}
                      onChange={(e) => setProductBrandFilter(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    >
                      <option value="all">Tüm Markalar ({brands.length})</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b} ({products.filter((p) => (p.brand || "Marel") === b).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <small style={{ fontWeight: 700, color: "#475569" }}>Alt Kategori:</small>
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 5, border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    >
                      <option value="all">Tüm Alt Kategoriler ({categories.length})</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat} ({products.filter((p) => p.category === cat).length})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div className="admin-filter-group">
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "all" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("all")}
                    type="button"
                  >
                    Tümü
                  </button>
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "active" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("active")}
                    type="button"
                  >
                    Satışta (Aktif)
                  </button>
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "inactive" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("inactive")}
                    type="button"
                  >
                    Satışa Kapalı (Pasif)
                  </button>
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "featured" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("featured")}
                    type="button"
                  >
                    Öne Çıkanlar
                  </button>
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "discounted" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("discounted")}
                    type="button"
                  >
                    İndirimliler
                  </button>
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "in_stock" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("in_stock")}
                    type="button"
                  >
                    Stokta
                  </button>
                  <button
                    className={`admin-filter-pill ${productStatusFilter === "out_of_stock" ? "active" : ""}`}
                    onClick={() => setProductStatusFilter("out_of_stock")}
                    type="button"
                  >
                    Tükenen
                  </button>
                </div>
              </div>
              </div>

            {/* List Header & Select All */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 4px", marginBottom: 8, fontSize: "0.8rem", color: "#64748b" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                  onChange={() => toggleSelectAllProducts(filteredProducts.map((p) => p.id))}
                  style={{ width: 17, height: 17 }}
                />
                <span>Tümünü Seç ({filteredProducts.length} ürün listeleniyor)</span>
              </label>

              <span>
                Toplam: <strong>{products.length}</strong> ürün | Gösterilen: <strong>{filteredProducts.length}</strong>
              </span>
            </div>

            {/* Products List */}
            <div className="admin-card-list">
              {filteredProducts.length ? (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isInactive = product.active === 0;
                  const hasDiscount = product.salePrice && product.salePrice < product.price;
                  const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;
                  const imageList = product.images && product.images.length > 0 ? product.images : [product.image];

                  // Parse color preview dots
                  let colorItems: Array<{ name: string; code: string }> = [];
                  if (product.colors) {
                    try {
                      const parsed = JSON.parse(product.colors);
                      if (Array.isArray(parsed)) {
                        colorItems = parsed.slice(0, 6).map((c) => {
                          if (typeof c === "string") return { name: c, code: "#cbd5e1" };
                          return { name: c.name || "Renk", code: c.code || "#cbd5e1" };
                        });
                      }
                    } catch {}
                  }

                  return (
                    <article
                      key={product.id}
                      className={`admin-data-card admin-product-row-card ${isInactive ? "is-inactive" : ""}`}
                      style={{ borderColor: isSelected ? "#0f172a" : undefined }}
                    >
                      {/* 1. Selection Checkbox */}
                      <div className="admin-checkbox-col">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(product.id)}
                          aria-label={`${product.name} seç`}
                        />
                      </div>

                      {/* 2. Thumbnail with count badge */}
                      <div className="admin-product-thumb">
                        <Image unoptimized src={product.image || "/images/catalog/diamond.webp"} alt={product.name} fill sizes="80px" />
                        {imageList.length > 1 && (
                          <span className="admin-product-image-count" title={`${imageList.length} görsel mevcut`}>
                            📷 {imageList.length}
                          </span>
                        )}
                      </div>

                      {/* 3. Product Meta & Details */}
                      <div className="admin-product-meta" style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                          <span className="admin-badge admin-badge-gray">{product.sku}</span>
                          <span className="admin-badge admin-badge-info">{product.brand || "Marel"}</span>
                          <span className="admin-badge admin-badge-gray">{product.rootCategory || "Perdeler"}</span>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>› {product.category}</span>
                        </div>

                        <h3 style={{ margin: "2px 0 6px 0", fontSize: "0.95rem" }}>{product.name}</h3>

                        {/* Badges & Tags */}
                        <div className="admin-product-badges">
                          {isInactive ? (
                            <span className="admin-badge admin-badge-danger">● SATIŞA KAPATILDI (GİZLİ)</span>
                          ) : (
                            <span className="admin-badge admin-badge-success">● Satışta</span>
                          )}

                          {product.stock > 0 ? (
                            <span className="admin-badge admin-badge-success">Stok: {product.stock} Adet</span>
                          ) : (
                            <span className="admin-badge admin-badge-danger">Stok Tükendi</span>
                          )}

                          {product.featured ? <span className="admin-badge admin-badge-gold">★ Öne Çıkan</span> : null}

                          {hasDiscount ? <span className="admin-discount-tag">%{discountPct} İNDİRİM</span> : null}

                          {product.installmentText && (
                            <span className="admin-badge admin-badge-info" style={{ fontSize: "0.68rem" }}>
                              💳 {product.installmentText}
                            </span>
                          )}
                        </div>

                        {/* Dimensions & Color preview */}
                        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                          {product.dimensions && (
                            <small style={{ color: "#64748b", fontSize: "0.72rem" }}>
                              📏 {product.dimensions}
                            </small>
                          )}

                          {colorItems.length > 0 && (
                            <div className="admin-color-dots" title={colorItems.map((c) => c.name).join(", ")}>
                              <small style={{ fontSize: "0.7rem", color: "#64748b", marginRight: 2 }}>Renkler:</small>
                              {colorItems.map((col, idx) => (
                                <span
                                  key={idx}
                                  className="admin-color-dot"
                                  style={{ background: col.code }}
                                  title={col.name}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. Pricing, Quick Toggles & Action Buttons */}
                      <div className="admin-product-quick-bar">
                        {/* Price Display */}
                        <div className="admin-price-box">
                          {hasDiscount ? (
                            <>
                              <span className="admin-old-price">{formatMoney(product.price)}</span>
                              <span className="admin-current-price" style={{ color: "#dc2626" }}>
                                {formatMoney(product.salePrice!)}
                              </span>
                            </>
                          ) : (
                            <span className="admin-current-price">{formatMoney(product.price)}</span>
                          )}
                          <span className="admin-installment_note" style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 700 }}>
                            {product.installments ? `${product.installments} Taksit İmkanı` : "Peşin Fiyatına 3 Taksit"}
                          </span>
                        </div>

                        {/* Quick Active/Inactive Toggle */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <span
                            className={`admin-switch ${!isInactive ? "active" : ""}`}
                            onClick={() => handleQuickToggleActive(product)}
                            title={!isInactive ? "Satışı Kapatmak İçin Tıkla" : "Satışı Açmak İçin Tıkla"}
                            role="button"
                            tabIndex={0}
                          />
                          <small style={{ fontSize: "0.65rem", fontWeight: 700, color: !isInactive ? "#16a34a" : "#dc2626" }}>
                            {!isInactive ? "Satışta" : "Kapalı"}
                          </small>
                        </div>

                        {/* Quick Featured Toggle */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <span
                            className={`admin-switch ${product.featured ? "active" : ""}`}
                            onClick={() => handleQuickToggleFeatured(product)}
                            title={product.featured ? "Öne Çıkarmayı Kaldır" : "Vitrinde Öne Çıkar"}
                            role="button"
                            tabIndex={0}
                          />
                          <small style={{ fontSize: "0.65rem", fontWeight: 700, color: product.featured ? "#854d0e" : "#64748b" }}>
                            Vitrinde
                          </small>
                        </div>

                        {/* Action Buttons */}
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-btn-action edit-btn"
                            onClick={() => openEditProductModal(product)}
                            title="Ürünün renk, ölçü, fiyat, taksit ve fotoğraflarını detaylı düzenle"
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            className="admin-btn-action"
                            onClick={() => handleDuplicateProduct(product.id)}
                            title="Bu ürünü kopyalayarak yeni bir ürün oluştur"
                          >
                            Kopyala
                          </button>
                          <button
                            type="button"
                            className="admin-btn-action danger-btn"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            title="Ürünü kalıcı olarak sil"
                          >
                            Sil
                          </button>
                          <Link
                            href={`/urunler/${product.slug}`}
                            target="_blank"
                            className="admin-btn-action"
                            style={{ textDecoration: "none", color: "#0284c7" }}
                            title="Mağazada Görüntüle"
                          >
                            ↗
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
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
              <div className="admin-header-actions">
                <Link
                  href="/admin/siparisler"
                  className="admin-btn-gold"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  📋 Gelişmiş Sipariş Tablosu →
                </Link>
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

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                        <strong className="admin-order-total">{formatMoney(order.total, order.currency)}</strong>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <Link
                            href={`/admin/siparisler/${order.id}`}
                            style={{
                              height: 36,
                              padding: "0 14px",
                              fontWeight: 700,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              backgroundColor: "#0f172a",
                              color: "#fff",
                              borderRadius: 6,
                              fontSize: "0.82rem",
                            }}
                          >
                            Tam Sayfada Yönet ↗
                          </Link>
                          <button
                            type="button"
                            className="admin-btn-action edit-btn"
                            onClick={() => setSelectedOrder(order)}
                            style={{ height: 36, padding: "0 14px", fontWeight: 700 }}
                          >
                            🔍 Hızlı Önizleme ({order.items?.length || 0} Ürün)
                          </button>
                          {order.phone ? (
                            <button
                              type="button"
                              className="admin-cargo-wa-btn"
                              onClick={() => sendWhatsAppCargoNotice(order)}
                              title="Müşteriye kargo takip WhatsApp mesajı aç"
                            >
                              💬 Müşteri WhatsApp
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="admin-cargo-wa-btn"
                            style={{ background: "#065f46", color: "#ecfdf5" }}
                            onClick={() => sendWhatsAppOfficeNotice(order)}
                            title="Atölye ve ofise tam sipariş ölçü mesajı aç"
                          >
                            🏢 Atölye / Ofis WhatsApp
                          </button>
                        </div>
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
                <span>İÇERİK YÖNETİMİ</span>
                <h1>Duyurular</h1>
                <p>
                  Kampanya duyurularını ve bilgilendirme içeriklerini oluşturun. Yayınlanan duyurular `/duyurular` sayfasında anında canlıya alınır.
                </p>
              </div>
            </header>

            {/* Create Announcement Drawer */}
            <details className="admin-create-box">
              <summary>+ Yeni Duyuru Oluştur</summary>
              <form onSubmit={createAnnouncement} className="admin-grid-form">
                <label className="span-2">
                  Başlık *
                  <input name="title" placeholder="Örn: Ölçüye Özel Plise Perde Kampanyası" required />
                </label>
                <label className="span-2">
                  URL Adı (Slug)
                  <input name="slug" placeholder="duyuru-basligi (otomatik üretilir)" />
                </label>
                <label className="span-4">
                  Kısa Özet *
                  <textarea name="summary" rows={2} placeholder="Kartlarda ve duyuru listesinde görünecek kısa özet..." required />
                </label>
                <label className="span-4">
                  Duyuru Metni *
                  <textarea name="body" rows={6} placeholder="Duyurunun detaylı metni..." required />
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
                  <p>Yukarıdaki formu kullanarak yeni duyuru ekleyebilirsiniz.</p>
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
                          {item.email} · {item.phone || "Telefon belirtilmemiş"} · {new Date(item.createdAt || (item as any).created_at).toLocaleString("tr-TR")}
                        </small>

                        <div className="admin-contact-message-body">{item.message}</div>
                      </div>

                      <div className="admin-contact-action-box">
                        <strong style={{ fontSize: "0.8rem", color: "#fff", marginBottom: "8px", display: "block" }}>Hızlı İletişim & Yanıt</strong>
                        <div className="admin-quick-reply-row" style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Merhaba Sayın ${item.name}, Marel İletişim talebiniz hakkında ulaşıyoruz.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-wa-reply-link"
                              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#25D366", color: "#fff", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                              </svg>
                              WhatsApp
                            </a>
                          ) : null}

                          <a
                            href={`mailto:${item.email}?subject=${encodeURIComponent(`Marel Destek: ${item.subject}`)}`}
                            className="admin-email-reply-link"
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#3b82f6", color: "#fff", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            E-posta
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

        {/* 7. COUPONS MANAGEMENT TAB */}
        {tab === "coupons" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>PAZARLAMA & KAMPANYALAR</span>
                <h1>Kupon & İndirim Yönetimi</h1>
                <p>Müşterilerin sepette kullanabileceği yüzde veya sabit TL indirim kuponlarını yönetin.</p>
              </div>
            </header>

            {/* Create Coupon Card */}
            <div className="admin-data-card" style={{ marginBottom: 24 }}>
              <div className="admin-order-top-bar" style={{ marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Yeni Kupon Tanımla</h3>
                  <small style={{ color: "var(--admin-text-dim)" }}>
                    Otomatik kod üretilebilir veya özel bir kampanya kodu yazabilirsiniz.
                  </small>
                </div>
              </div>

              <form onSubmit={handleCreateCoupon} className="admin-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <label>
                  Kupon Kodu
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="MRL-XXXXX"
                      style={{ textTransform: "uppercase", fontWeight: 700 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setCouponCode(createCouponCode())}
                      className="admin-btn-secondary"
                      style={{ height: 38, padding: "0 10px" }}
                      title="Yeni kod üret"
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      onClick={copyCouponCode}
                      className="admin-btn-secondary"
                      style={{ height: 38, padding: "0 10px" }}
                      title="Kodu kopyala"
                    >
                      {couponCopied ? "✓" : "📋"}
                    </button>
                  </div>
                </label>

                <label>
                  İndirim Tipi
                  <select name="type" defaultValue="PERCENT">
                    <option value="PERCENT">Yüzde İndirim (%)</option>
                    <option value="FIXED">Sabit Tutar (TL)</option>
                  </select>
                </label>

                <label>
                  İndirim Tutarı / Oranı
                  <input
                    name="value"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Örn: 10 (%10 için) veya 150 (150 TL için)"
                    required
                  />
                </label>

                <label>
                  Minimum Sepet Tutarı (TL)
                  <input
                    name="minimumSubtotal"
                    type="number"
                    min="0"
                    placeholder="Örn: 500 (Boşsa sınırsız)"
                  />
                </label>

                <label>
                  Kullanım Limiti
                  <input
                    name="usageLimit"
                    type="number"
                    min="1"
                    placeholder="Örn: 100 (Boşsa sınırsız)"
                  />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input name="isActive" type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Kupon Canlıda Aktif</span>
                  </label>
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="admin-btn-gold"
                    style={{ height: 42, padding: "0 24px" }}
                  >
                    {couponLoading ? "Oluşturuluyor…" : "Kuponu Kaydet & Yayınla"}
                  </button>
                  {couponError ? <span style={{ color: "#ef4444", fontSize: "0.82rem" }}>{couponError}</span> : null}
                </div>
              </form>
            </div>

            {/* Coupons List Table */}
            <div className="admin-card-list">
              {coupons.length ? (
                <div style={{ overflowX: "auto", background: "var(--admin-card-bg)", borderRadius: 12, border: "1px solid var(--admin-card-border)", padding: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--admin-card-border)", color: "var(--admin-text-dim)" }}>
                        <th style={{ padding: "12px 10px" }}>KOD</th>
                        <th style={{ padding: "12px 10px" }}>İNDİRİM TÜRÜ</th>
                        <th style={{ padding: "12px 10px" }}>DEĞER</th>
                        <th style={{ padding: "12px 10px" }}>MİN. SEPET</th>
                        <th style={{ padding: "12px 10px" }}>KULLANIM</th>
                        <th style={{ padding: "12px 10px" }}>DURUM</th>
                        <th style={{ padding: "12px 10px", textAlign: "right" }}>İŞLEM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "14px 10px", fontWeight: 800, color: "var(--admin-gold)" }}>{c.code}</td>
                          <td style={{ padding: "14px 10px" }}>{c.discountType === "PERCENT" ? "Yüzde (%)" : "Sabit TL"}</td>
                          <td style={{ padding: "14px 10px", fontWeight: 700 }}>
                            {c.discountType === "PERCENT" ? `%${c.discountValue}` : `${(c.discountValue / 100).toFixed(0)} ₺`}
                          </td>
                          <td style={{ padding: "14px 10px" }}>
                            {c.minimumSubtotal ? `${(c.minimumSubtotal / 100).toFixed(0)} ₺` : "Yok"}
                          </td>
                          <td style={{ padding: "14px 10px" }}>
                            {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : "kullanım"}
                          </td>
                          <td style={{ padding: "14px 10px" }}>
                            <span className={`admin-status-badge ${c.active ? "status-badge-delivered" : "status-badge-cancelled"}`}>
                              {c.active ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 10px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="admin-btn-action danger-btn"
                              style={{ padding: "4px 12px" }}
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-state">
                  <h3>Henüz tanımlı kupon yok.</h3>
                  <p>Yukarıdaki formdan ilk indirim kuponunuzu oluşturabilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 8. CUSTOMERS DIRECTORY TAB */}
        {tab === "customers" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>MÜŞTERİ VERİTABANI</span>
                <h1>Müşteri Rehberi & Analizi</h1>
                <p>Mağazadan sipariş vermiş veya hesap oluşturmuş tüm müşterilerin iletişim ve sipariş geçmişi.</p>
              </div>
            </header>

            <div className="admin-toolbar">
              <div className="admin-search-input" style={{ maxWidth: 450 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Müşteri adı, e-posta veya telefon ara..."
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--admin-text-dim)", fontSize: "0.85rem" }}>
                <span>Toplam {customers.length} kayıtlı müşteri</span>
              </div>
            </div>

            <div className="admin-card-list">
              {filteredCustomers.length ? (
                <div style={{ overflowX: "auto", background: "var(--admin-card-bg)", borderRadius: 12, border: "1px solid var(--admin-card-border)", padding: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--admin-card-border)", color: "var(--admin-text-dim)" }}>
                        <th style={{ padding: "12px 10px" }}>MÜŞTERİ</th>
                        <th style={{ padding: "12px 10px" }}>E-POSTA</th>
                        <th style={{ padding: "12px 10px" }}>TELEFON</th>
                        <th style={{ padding: "12px 10px" }}>SİPARİŞ SAYISI</th>
                        <th style={{ padding: "12px 10px" }}>TOPLAM HARCAMA</th>
                        <th style={{ padding: "12px 10px" }}>SON SİPARİŞ</th>
                        <th style={{ padding: "12px 10px", textAlign: "right" }}>İŞLEM / İLETİŞİM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((cust) => {
                        const cleanPhone = cust.phone.replace(/[^0-9]/g, "");
                        const waPhone = cleanPhone.startsWith("0") ? `9${cleanPhone}` : cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
                        return (
                          <tr key={cust.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "var(--admin-text-main)" }}>{cust.fullName}</td>
                            <td style={{ padding: "14px 10px", color: "var(--admin-text-dim)" }}>{cust.email}</td>
                            <td style={{ padding: "14px 10px" }}>{cust.phone || "—"}</td>
                            <td style={{ padding: "14px 10px", fontWeight: 700 }}>
                              <span className="admin-status-badge status-badge-processing">{cust.orderCount} Sipariş</span>
                            </td>
                            <td style={{ padding: "14px 10px", fontWeight: 800, color: "var(--admin-gold)" }}>
                              {formatMoney(cust.totalSpent)}
                            </td>
                            <td style={{ padding: "14px 10px", color: "var(--admin-text-dim)", fontSize: "0.78rem" }}>
                              {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString("tr-TR") : "—"}
                            </td>
                            <td style={{ padding: "14px 10px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => {
                                  setEditingCustomer(cust);
                                  setIsCustomerModalOpen(true);
                                }}
                                className="admin-btn-action"
                                style={{ background: "var(--admin-card-bg-light)" }}
                                title="Müşteriyi Düzenle"
                              >
                                ✏️ Düzenle
                              </button>
                              {cust.phone ? (
                                <a
                                  href={`https://wa.me/${waPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="admin-btn-action"
                                  style={{ textDecoration: "none", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" }}
                                  title="WhatsApp ile mesaj aç"
                                >
                                  💬 WhatsApp
                                </a>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-state">
                  <h3>Müşteri kaydı bulunamadı.</h3>
                  <p>Arama filtrenizi değiştirerek tekrar deneyebilirsiniz.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 9. SITE & OPERATIONAL SETTINGS TAB */}
        {tab === "settings" && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header-left">
                <span>YÖNETİM & YAPILANDIRMA</span>
                <h1>Site & Operasyonel Ayarlar</h1>
                <p>İletişim numaraları, kargo eşikleri, banka IBAN bilgileri ve bakım modunu buradan yönetin.</p>
              </div>
            </header>

            <form onSubmit={handleSaveSettings} style={{ display: "grid", gap: 24, maxWidth: 900 }}>
              {/* Card 1: İletişim & WhatsApp */}
              <div className="admin-data-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>İletişim & Danışma Hatları</h3>
                <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <label>
                    WhatsApp Sipariş Hattı
                    <input name="site_whatsapp" defaultValue={settings.site_whatsapp || "+90 546 735 66 02"} required />
                    <small style={{ color: "var(--admin-text-dim)", fontSize: "0.72rem" }}>Müşteri WhatsApp sipariş butonlarında kullanılan telefon.</small>
                  </label>
                  <label>
                    Ofis / Müşteri Hizmetleri Telefonu
                    <input name="site_phone" defaultValue={settings.site_phone || "+90 546 735 66 02"} required />
                  </label>
                  <label>
                    Resmi E-Posta Adresi
                    <input name="site_email" defaultValue={settings.site_email || "destek@marel.com.tr"} required />
                  </label>
                  <label>
                    Firma / Showroom Adresi
                    <input name="site_address" defaultValue={settings.site_address || "Elbistan / Kahramanmaraş"} />
                  </label>
                </div>
              </div>

              {/* Card 2: Kargo & Teslimat Eşikleri */}
              <div className="admin-data-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>Kargo & Gönderi Ayarları</h3>
                <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <label>
                    Sabit Kargo Ücreti (TL)
                    <input name="shipping_fee" type="number" defaultValue={settings.shipping_fee || "150"} required />
                  </label>
                  <label>
                    Ücretsiz Kargo Limiti (TL)
                    <input name="free_shipping_threshold" type="number" defaultValue={settings.free_shipping_threshold || "2000"} required />
                    <small style={{ color: "var(--admin-text-dim)", fontSize: "0.72rem" }}>Bu tutar ve üzeri sepetlerde kargo bedava olur.</small>
                  </label>
                  <label>
                    Varsayılan Kargo Firması
                    <select name="default_cargo_company" defaultValue={settings.default_cargo_company || "yurtici"}>
                      {CARGO_PROVIDERS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Card 3: Banka Havale / EFT Bilgileri */}
              <div className="admin-data-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>Banka Havale / EFT Bilgileri</h3>
                <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <label>
                    Banka Adı
                    <input name="bank_name" defaultValue={settings.bank_name || "Ziraat Bankası"} required />
                  </label>
                  <label>
                    Hesap Sahibi / Alıcı Ünvanı
                    <input name="bank_holder" defaultValue={settings.bank_holder || "Marel Perde Sistemleri San. Tic."} required />
                  </label>
                  <label className="span-2">
                    IBAN Numarası
                    <input name="bank_iban" defaultValue={settings.bank_iban || "TR33 0001 0001 2345 6789 0050 01"} required />
                    <small style={{ color: "var(--admin-text-dim)", fontSize: "0.72rem" }}>Sipariş tamamlama ekranında müşteriye gösterilen resmi IBAN.</small>
                  </label>
                </div>
              </div>

              {/* Card 4: Bakım Modu */}
              <div className="admin-data-card">
                <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 800 }}>Bakım Modu</h3>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 14 }}>
                  <input name="maintenance_mode" type="checkbox" defaultChecked={settings.maintenance_mode === "true"} style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: settings.maintenance_mode === "true" ? "#ef4444" : "#fff" }}>
                    Bakım Modunu Aktif Et (Site ziyaretçilere geçici bakım uyarısı gösterir)
                  </span>
                </label>
                <label>
                  Bakım Duyuru Mesajı
                  <textarea
                    name="maintenance_message"
                    rows={2}
                    defaultValue={settings.maintenance_message || "Sistemlerimizde planlı bakım çalışması yapılmaktadır. En kısa sürede hizmetinizdeyiz."}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <button type="submit" disabled={settingsLoading} className="admin-btn-gold" style={{ height: 44, padding: "0 28px" }}>
                  {settingsLoading ? "Kaydediliyor…" : "Ayarları Kaydet"}
                </button>
                {settingsSaved ? <span style={{ color: "#22c55e", fontWeight: 700 }}>✓ Ayarlar başarıyla güncellendi.</span> : null}
              </div>
            </form>
          </>
        )}

        {/* MODAL: Sipariş Detayı & İmalat Kalemleri */}
        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOrder(null);
            }}
          >
            <div
              style={{
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-gold)",
                borderRadius: 16,
                maxWidth: 860,
                width: "100%",
                maxHeight: "92vh",
                overflowY: "auto",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                padding: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--admin-card-border)", paddingBottom: 16 }}>
                <div>
                  <span style={{ color: "var(--admin-gold)", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em" }}>SİPARİŞ DETAYI</span>
                  <h2 style={{ margin: "4px 0", fontSize: "1.6rem", fontWeight: 900 }}>{selectedOrder.orderNumber}</h2>
                  <small style={{ color: "var(--admin-text-dim)" }}>
                    Oluşturulma: {new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: 0,
                    color: "#fff",
                    fontSize: "1.2rem",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Two Column Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--admin-gold)" }}>MÜŞTERİ BİLGİLERİ</h4>
                  <p style={{ margin: "4px 0", fontSize: "0.9rem" }}><strong>Ad Soyad:</strong> {selectedOrder.customerName}</p>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem" }}><strong>Telefon:</strong> {selectedOrder.phone || "—"}</p>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem" }}><strong>E-posta:</strong> {selectedOrder.email}</p>
                  <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "var(--admin-text-dim)", lineHeight: 1.5 }}>
                    <strong>Teslimat Adresi:</strong><br />
                    {selectedOrder.shippingAddress} {selectedOrder.district ? `(${selectedOrder.district} / ${selectedOrder.city})` : ""}
                  </p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--admin-gold)" }}>ÖDEME & DURUM</h4>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                    <strong>Ödeme Şekli:</strong> {selectedOrder.paymentMethod === "cash_on_delivery" ? "Kapıda Ödeme" : "Banka Havale / EFT"}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                    <strong>Sipariş Durumu:</strong>{" "}
                    <span className={`admin-status-badge status-badge-${selectedOrder.status}`}>
                      {orderStatusNames[selectedOrder.status] ?? selectedOrder.status}
                    </span>
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                    <strong>Toplam Tutar:</strong>{" "}
                    <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--admin-gold)" }}>
                      {formatMoney(selectedOrder.total, selectedOrder.currency)}
                    </span>
                  </p>
                  {selectedOrder.notes ? (
                    <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "#38bdf8", background: "rgba(56,189,248,0.1)", padding: 6, borderRadius: 6 }}>
                      <strong>Müşteri Notu:</strong> {selectedOrder.notes}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Items / Imalat List */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 800 }}>
                  Sipariş Kalemleri & İmalat Ölçüleri ({selectedOrder.items?.length || 0} Adet Ürün)
                </h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {selectedOrder.items.map((it, idx) => {
                      let cfg: Record<string, any> = {};
                      try {
                        cfg = typeof it.configuration === "string" ? JSON.parse(it.configuration) : it.configuration || {};
                      } catch {}

                      return (
                        <div
                          key={it.id || idx}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10,
                            padding: 14,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.95rem", color: "#fff" }}>{it.name}</strong>
                            <div style={{ fontSize: "0.78rem", color: "var(--admin-text-dim)", marginTop: 4 }}>
                              SKU: {it.sku || "MRL"} · Adet: <strong style={{ color: "#fff" }}>{it.quantity}</strong> · Birim: {formatMoney(it.unitPrice)}
                            </div>
                            {cfg.width || cfg.height || cfg.fabric || cfg.profileColor ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                  marginTop: 8,
                                }}
                              >
                                {cfg.width && cfg.height ? (
                                  <span style={{ background: "rgba(217,183,95,0.15)", color: "var(--admin-gold)", padding: "3px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700 }}>
                                    📐 Ölçü: {cfg.width} x {cfg.height} cm
                                  </span>
                                ) : null}
                                {cfg.fabric ? (
                                  <span style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: "0.75rem" }}>
                                    Kumaş: {cfg.fabric}
                                  </span>
                                ) : null}
                                {cfg.profileColor ? (
                                  <span style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: "0.75rem" }}>
                                    Profil: {cfg.profileColor}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          <strong style={{ fontSize: "1.05rem", color: "var(--admin-gold)" }}>
                            {formatMoney(it.unitPrice * it.quantity)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "var(--admin-text-dim)", fontSize: "0.85rem" }}>Kalem detayları bulunamadı.</p>
                )}
              </div>

              {/* Instant WhatsApp Triggers */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, borderTop: "1px solid var(--admin-card-border)", paddingTop: 18 }}>
                <button
                  type="button"
                  onClick={() => sendWhatsAppOfficeNotice(selectedOrder)}
                  className="admin-btn-secondary"
                  style={{ flex: 1, minHeight: 42, background: "rgba(6,95,70,0.4)", borderColor: "#059669", color: "#a7f3d0" }}
                >
                  🏢 Atölyeye WhatsApp ile İmalat Bilgisi Gönder
                </button>
                {selectedOrder.phone ? (
                  <button
                    type="button"
                    onClick={() => sendWhatsAppCargoNotice(selectedOrder)}
                    className="admin-btn-secondary"
                    style={{ flex: 1, minHeight: 42, background: "rgba(37,99,235,0.2)", borderColor: "#2563eb", color: "#93c5fd" }}
                  >
                    💬 Müşteriye Kargo / Takip Bildirimi Aç
                  </button>
                ) : null}
              </div>

              {/* Order Update Form Inside Modal */}
              <form
                onSubmit={async (e) => {
                  await updateOrder(e, selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="admin-cargo-form"
                style={{ background: "rgba(0,0,0,0.3)", padding: 18, borderRadius: 10 }}
              >
                <strong style={{ color: "#fff", fontSize: "0.85rem" }}>Sipariş & Kargo Bilgilerini Güncelle</strong>
                <div className="admin-cargo-form-row">
                  <select name="status" defaultValue={selectedOrder.status}>
                    {orderStatuses.map((st) => (
                      <option key={st} value={st}>{orderStatusNames[st] ?? st}</option>
                    ))}
                  </select>
                  <select name="cargoCompany" defaultValue={selectedOrder.cargoCompany ?? "yurtici"}>
                    {CARGO_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <input name="trackingNumber" defaultValue={selectedOrder.trackingNumber ?? ""} placeholder="Kargo Takip Barkod No" />
                <input name="note" defaultValue={selectedOrder.notes ?? ""} placeholder="Sipariş / atölye notu" />
                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button type="submit" className="admin-btn-gold" style={{ height: 40, flex: 1 }}>
                    Değişiklikleri Kaydet
                  </button>
                  <button type="button" onClick={() => setSelectedOrder(null)} className="admin-btn-secondary" style={{ height: 40 }}>
                    Kapat
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full-Featured Product Editor / Creator Modal */}
        <AdminProductEditorModal
          isOpen={isProductModalOpen}
          product={editingProduct}
          onClose={closeProductModal}
          onSave={handleSaveProduct}
          existingCategories={categories}
          existingBrands={brands}
          existingRootCategories={rootCategories}
        />

        <AdminCustomerEditorModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          customer={editingCustomer}
          onSave={handleSaveCustomer}
        />
      </main>
    </div>
  );
}
