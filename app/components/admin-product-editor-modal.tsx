"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CatalogProduct } from "@/db";

const DEFAULT_COLOR_MAP: Record<string, string> = {
  beyaz: "#ffffff",
  krem: "#fbf8ee",
  antrasit: "#334155",
  gri: "#94a3b8",
  "metalik gri": "#64748b",
  siyah: "#0f172a",
  kahverengi: "#78350f",
  kahve: "#78350f",
  altınmeşe: "#d97706",
  altinmese: "#d97706",
  meşe: "#b45309",
  mese: "#b45309",
  eloksal: "#cbd5e1",
  bronz: "#854d0e",
  fındık: "#92400e",
  ceviz: "#451a03",
};

function getHexForColorName(name: string): string {
  const clean = name.toLowerCase().trim();
  for (const [key, hex] of Object.entries(DEFAULT_COLOR_MAP)) {
    if (clean.includes(key)) return hex;
  }
  return "#e2e8f0";
}

interface ColorOption {
  name: string;
  code: string;
}

function parseColors(raw?: string): ColorOption[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        if (typeof item === "string") {
          return { name: item, code: getHexForColorName(item) };
        }
        if (item && typeof item === "object") {
          return {
            name: item.name || item.title || "Renk",
            code: item.code || item.hex || getHexForColorName(item.name || ""),
          };
        }
        return { name: String(item), code: "#e2e8f0" };
      });
    }
  } catch {
    // Comma separated fallback
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ name: s, code: getHexForColorName(s) }));
  }
  return [];
}

interface AdminProductEditorModalProps {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  existingCategories: string[];
  existingBrands: string[];
  existingRootCategories: string[];
}

type ModalTab = "general" | "pricing" | "colors_dims" | "gallery" | "description";

export function AdminProductEditorModal({
  product,
  isOpen,
  onClose,
  onSave,
  existingCategories,
  existingBrands,
  existingRootCategories,
}: AdminProductEditorModalProps) {
  const isCreate = !product;
  const [activeTab, setActiveTab] = useState<ModalTab>("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [rootCategory, setRootCategory] = useState("Perdeler");
  const [category, setCategory] = useState("Plise Perde");
  const [brand, setBrand] = useState("Marel");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("15");
  const [availability, setAvailability] = useState("in_stock");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [installments, setInstallments] = useState(3);
  const [installmentText, setInstallmentText] = useState("Peşin Fiyatına 3 Taksit");
  const [dimensions, setDimensions] = useState("Özel Ölçüye Göre Üretim");
  const [description, setDescription] = useState("");
  
  // Colors state
  const [colorList, setColorList] = useState<ColorOption[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#334155");

  // Gallery state
  const [coverImage, setCoverImage] = useState("/images/catalog/diamond.webp");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Custom Category & Brand toggles
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setName(product.name || "");
      setSku(product.sku || "");
      setSlug(product.slug || "");
      setRootCategory(product.rootCategory || "Perdeler");
      setCategory(product.category || "");
      setBrand(product.brand || "Marel");
      setPrice(product.price ? (product.price / 100).toFixed(2) : "0.00");
      setSalePrice(product.salePrice ? (product.salePrice / 100).toFixed(2) : "");
      setStock(String(product.stock ?? 10));
      setAvailability(product.availability || (product.stock > 0 ? "in_stock" : "out_of_stock"));
      setActive(product.active !== 0);
      setFeatured(Boolean(product.featured));
      setInstallments(product.installments ?? 3);
      setInstallmentText(product.installmentText || `Peşin Fiyatına ${product.installments ?? 3} Taksit`);
      setDimensions(product.dimensions || "Özel Ölçüye Göre Üretim");
      setDescription(product.description || "");

      const parsedColors = parseColors(product.colors);
      setColorList(parsedColors);

      const allImages = product.images && product.images.length > 0 ? [...product.images] : [product.image];
      setCoverImage(product.image || allImages[0] || "/images/catalog/diamond.webp");
      setGalleryImages(allImages);
    } else {
      // Defaults for Create mode
      setName("");
      setSku("");
      setSlug("");
      setRootCategory("Perdeler");
      setCategory("Plise Perde");
      setBrand("Marel");
      setPrice("1250.00");
      setSalePrice("");
      setStock("25");
      setAvailability("in_stock");
      setActive(true);
      setFeatured(false);
      setInstallments(3);
      setInstallmentText("Peşin Fiyatına 3 Taksit");
      setDimensions("Özel Ölçüye Göre Üretim");
      setDescription("Marel özel üretim plise perde sistemleri, yüksek kaliteli kumaş ve dayanıklı alüminyum profil yapısıyla uzun ömürlü kullanım sunar.");
      setColorList([
        { name: "Beyaz", code: "#ffffff" },
        { name: "Antrasit", code: "#334155" },
        { name: "Krem", code: "#fbf8ee" },
      ]);
      setCoverImage("/images/catalog/diamond.webp");
      setGalleryImages(["/images/catalog/diamond.webp"]);
    }
    setError("");
    setActiveTab("general");
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Auto calculate discount percentage
  const numPrice = Number(price) || 0;
  const numSalePrice = Number(salePrice) || 0;
  const hasDiscount = numSalePrice > 0 && numSalePrice < numPrice;
  const discountPercent = hasDiscount ? Math.round(((numPrice - numSalePrice) / numPrice) * 100) : 0;

  // Color actions
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColorList([...colorList, { name: newColorName.trim(), code: newColorCode }]);
    setNewColorName("");
  };

  const handleRemoveColor = (index: number) => {
    setColorList(colorList.filter((_, i) => i !== index));
  };

  // Gallery actions
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!galleryImages.includes(url)) {
      setGalleryImages([...galleryImages, url]);
      if (!coverImage) setCoverImage(url);
    }
    setNewImageUrl("");
  };

  const handleSetCover = (url: string) => {
    setCoverImage(url);
    // Put cover image at index 0
    const filtered = galleryImages.filter((img) => img !== url);
    setGalleryImages([url, ...filtered]);
  };

  const handleRemoveImage = (url: string) => {
    const updated = galleryImages.filter((img) => img !== url);
    setGalleryImages(updated);
    if (coverImage === url && updated.length > 0) {
      setCoverImage(updated[0]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`${files.length} görsel bilgisayardan yükleniyor...`);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { error?: string; url?: string; urls?: string[]; count?: number; success?: boolean };
      if (!res.ok) {
        throw new Error(data.error || "Görseller yüklenemedi.");
      }

      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        const uniqueNew = newUrls.filter((u) => !galleryImages.includes(u));
        const nextGallery = [...uniqueNew, ...galleryImages];
        setGalleryImages(nextGallery);

        if (!coverImage || coverImage.includes("diamond.webp") || coverImage.includes("placeholder")) {
          setCoverImage(newUrls[0]);
        }
        setUploadProgress(`Başarıyla ${newUrls.length} görsel yüklendi!`);
        setTimeout(() => setUploadProgress(""), 4000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ürün adı boş bırakılamaz.");
      setActiveTab("general");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        slug: slug.trim() || undefined,
        rootCategory: rootCategory.trim(),
        category: category.trim(),
        brand: brand.trim(),
        description: description.trim(),
        price: Math.round(numPrice * 100),
        salePrice: hasDiscount ? Math.round(numSalePrice * 100) : null,
        stock: Number(stock) || 0,
        availability,
        active,
        featured,
        installments: Number(installments) || 3,
        installmentText: installmentText.trim() || `Peşin Fiyatına ${installments} Taksit`,
        dimensions: dimensions.trim() || "Özel Ölçüye Göre Üretim",
        colors: JSON.stringify(colorList),
        image: coverImage || galleryImages[0] || "/images/catalog/diamond.webp",
        images: galleryImages.length > 0 ? galleryImages : [coverImage],
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal-container">
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <h2>{isCreate ? "Yeni Ürün Ekle" : `Ürünü Düzenle: ${product?.name}`}</h2>
            <p>
              {isCreate
                ? "Kataloğa yeni bir ürün, ölçü, renk ve galeri bilgisi ekleyin."
                : `SKU: ${product?.sku || "—"} · Kategori: ${product?.category}`}
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose} type="button" aria-label="Kapat">
            &times;
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="admin-modal-tabs">
          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            Genel Bilgiler & Kategori
          </button>
          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === "pricing" ? "active" : ""}`}
            onClick={() => setActiveTab("pricing")}
          >
            Fiyat, İndirim & Taksit
          </button>
          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === "colors_dims" ? "active" : ""}`}
            onClick={() => setActiveTab("colors_dims")}
          >
            Renkler & Ölçü ({colorList.length} Renk)
          </button>
          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            Fotoğraf Galerisi ({galleryImages.length})
          </button>
          <button
            type="button"
            className={`admin-modal-tab-btn ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Açıklama & Detaylar
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div className="admin-modal-body">
            {error && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: "0.85rem", fontWeight: 700 }}>
                {error}
              </div>
            )}

            {/* TAB 1: GENERAL */}
            {activeTab === "general" && (
              <div className="admin-form-section">
                <div className="admin-field-group">
                  <label>Ürün Adı *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Orjin Seperatör Sürme Beyaz Profil Akordiyon Perdeli Kapı"
                    required
                  />
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-field-group">
                    <label>SKU (Stok Kodu)</label>
                    <input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Örn: ORJ-SEP-001 (Boş bırakılırsa otomatik üretilir)"
                    />
                  </div>
                  <div className="admin-field-group">
                    <label>URL Adı (Slug)</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="Örn: orjin-seperator-surme-beyaz (Boş bırakılırsa otomatik)"
                    />
                  </div>
                </div>

                <div className="admin-form-grid-3">
                  {/* Root Category */}
                  <div className="admin-field-group">
                    <label>Ana / Üst Kategori *</label>
                    <select value={rootCategory} onChange={(e) => setRootCategory(e.target.value)}>
                      <option value="Perdeler">Perdeler (Plise & Tül)</option>
                      <option value="Sineklikler">Sineklikler</option>
                      <option value="Seperatör Kapı">Seperatör Kapı</option>
                      <option value="Otomatik Panjurlar">Otomatik Panjurlar</option>
                      <option value="Tutamaklar">Tutamaklar</option>
                      <option value="Aksesuarlar">Aksesuarlar</option>
                      {existingRootCategories
                        .filter(
                          (c) =>
                            ![
                              "Perdeler",
                              "Sineklikler",
                              "Seperatör Kapı",
                              "Otomatik Panjurlar",
                              "Tutamaklar",
                              "Aksesuarlar",
                            ].includes(c)
                        )
                        .map((rc) => (
                          <option key={rc} value={rc}>
                            {rc}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div className="admin-field-group">
                    <label>Alt Kategori / Ürün Grubu *</label>
                    {isCustomCategory ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Yeni alt kategori adı yazın"
                        />
                        <button
                          type="button"
                          className="admin-btn-action"
                          onClick={() => setIsCustomCategory(false)}
                          title="Listeden seç"
                        >
                          Listeden
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 4 }}>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1 }}>
                          {existingCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="admin-btn-action"
                          onClick={() => {
                            setIsCustomCategory(true);
                            setCategory("");
                          }}
                          title="Yeni kategori ekle"
                        >
                          + Yeni
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Brand */}
                  <div className="admin-field-group">
                    <label>Marka *</label>
                    {isCustomBrand ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="Yeni marka adı yazın"
                        />
                        <button
                          type="button"
                          className="admin-btn-action"
                          onClick={() => setIsCustomBrand(false)}
                          title="Listeden seç"
                        >
                          Listeden
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 4 }}>
                        <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ flex: 1 }}>
                          <option value="Marel">Marel</option>
                          <option value="Kamataş">Kamataş</option>
                          <option value="Orjin">Orjin</option>
                          {existingBrands
                            .filter((b) => !["Marel", "Kamataş", "Orjin"].includes(b))
                            .map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          className="admin-btn-action"
                          onClick={() => {
                            setIsCustomBrand(true);
                            setBrand("");
                          }}
                          title="Yeni marka ekle"
                        >
                          + Yeni
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Availability switches */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0", marginTop: 8 }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#0f172a" }}>Satış ve Vitrin Durumu</h4>
                  <div className="admin-form-grid-2">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        className={`admin-switch ${active ? "active" : ""}`}
                        onClick={() => setActive(!active)}
                        role="button"
                        tabIndex={0}
                      />
                      <div>
                        <strong style={{ display: "block", fontSize: "0.82rem", color: active ? "#166534" : "#991b1b" }}>
                          {active ? "Satışta (Aktif)" : "Satışa Kapatıldı (Pasif)"}
                        </strong>
                        <span className="admin-field-hint">
                          {active
                            ? "Ürün mağaza vitrininde listelenir ve sipariş edilebilir."
                            : "Ürün canlı mağazada gizlenir, müşteriler satın alamaz."}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        className={`admin-switch ${featured ? "active" : ""}`}
                        onClick={() => setFeatured(!featured)}
                        role="button"
                        tabIndex={0}
                      />
                      <div>
                        <strong style={{ display: "block", fontSize: "0.82rem", color: featured ? "#854d0e" : "#475569" }}>
                          {featured ? "Öne Çıkan Ürün (Vitrinde)" : "Standart Sıralama"}
                        </strong>
                        <span className="admin-field-hint">Ana sayfa vitrininde ve öne çıkan slider alanlarında öncelikli gösterilir.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & INSTALLMENTS */}
            {activeTab === "pricing" && (
              <div className="admin-form-section">
                <div className="admin-form-grid-2">
                  <div className="admin-field-group">
                    <label>Normal Satış Fiyatı (₺) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1250.00"
                      required
                    />
                    <span className="admin-field-hint">Ürünün orijinal liste satış fiyatıdır.</span>
                  </div>

                  <div className="admin-field-group">
                    <label>İndirimli Satış Fiyatı (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="İndirim yoksa boş bırakın"
                    />
                    {hasDiscount ? (
                      <span className="admin-field-hint" style={{ color: "#dc2626", fontWeight: 700 }}>
                        %{discountPercent} İndirim Uygulandı! (Eski: {Number(price).toLocaleString("tr-TR")} ₺ → Yeni: {Number(salePrice).toLocaleString("tr-TR")} ₺)
                      </span>
                    ) : (
                      <span className="admin-field-hint">Fiyatın üzerine indirim uygulamak için girin.</span>
                    )}
                  </div>
                </div>

                {/* Installments Configuration */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#0f172a" }}>Taksit & Ödeme Seçenekleri</h4>
                  <div className="admin-form-grid-2">
                    <div className="admin-field-group">
                      <label>Peşin Fiyatına Taksit Sayısı</label>
                      <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                        <option value={1}>Taksit Yok (Tek Çekim)</option>
                        <option value={2}>Peşin Fiyatına 2 Taksit</option>
                        <option value={3}>Peşin Fiyatına 3 Taksit</option>
                        <option value={4}>Peşin Fiyatına 4 Taksit</option>
                        <option value={6}>Peşin Fiyatına 6 Taksit</option>
                        <option value={9}>Peşin Fiyatına 9 Taksit</option>
                        <option value={12}>Peşin Fiyatına 12 Taksit</option>
                      </select>
                      <span className="admin-field-hint">Ürün kartında ve sepette taksit rozeti olarak vurgulanır.</span>
                    </div>

                    <div className="admin-field-group">
                      <label>Taksit Kampanya Rozet Metni</label>
                      <input
                        value={installmentText}
                        onChange={(e) => setInstallmentText(e.target.value)}
                        placeholder="Örn: PEŞİN FİYATINA 3 TAKSİT İMKANI"
                      />
                      <span className="admin-field-hint">Ürün detay sayfasında ve kart köşesinde gösterilecek metin.</span>
                    </div>
                  </div>
                </div>

                {/* Stock Configuration */}
                <div className="admin-form-grid-2">
                  <div className="admin-field-group">
                    <label>Stok Adedi</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStock(val);
                        if (Number(val) <= 0) setAvailability("out_of_stock");
                        else setAvailability("in_stock");
                      }}
                      placeholder="15"
                    />
                  </div>

                  <div className="admin-field-group">
                    <label>Stok Durumu Seçimi</label>
                    <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                      <option value="in_stock">Stokta Var (Hemen Teslim)</option>
                      <option value="out_of_stock">Tükendi (Stokta Yok)</option>
                      <option value="preorder">Ön Sipariş (Üretim Sürecinde)</option>
                      <option value="backorder">Tedarik Aşamasında</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COLORS & DIMENSIONS */}
            {activeTab === "colors_dims" && (
              <div className="admin-form-section">
                {/* Color Manager */}
                <div className="admin-color-manager-box">
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#0f172a" }}>Ürün Renk Seçenekleri</h4>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.75rem", color: "#64748b" }}>
                    Müşterilerin ürün sayfasında seçebileceği renk varyantlarıdır. Her rengin adı ve görsel renk paleti mevcuttur.
                  </p>

                  <div className="admin-color-list">
                    {colorList.length === 0 ? (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Henüz renk eklenmemiş.</span>
                    ) : (
                      colorList.map((color, idx) => (
                        <div key={idx} className="admin-color-tag">
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: color.code,
                              border: "1px solid rgba(0,0,0,0.2)",
                              display: "inline-block",
                            }}
                          />
                          <span>{color.name}</span>
                          <button type="button" onClick={() => handleRemoveColor(idx)} title="Rengi Sil">
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="admin-add-color-row">
                    <input
                      type="text"
                      placeholder="Yeni Renk Adı (Örn: Antrasit Gri, Koyu Ceviz, Altınmeşe)"
                      value={newColorName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewColorName(val);
                        setNewColorCode(getHexForColorName(val));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                    />
                    <input
                      type="color"
                      value={newColorCode}
                      onChange={(e) => setNewColorCode(e.target.value)}
                      title="Renk Kodu Seç"
                    />
                    <button type="button" className="admin-btn-action" onClick={handleAddColor}>
                      + Rengi Ekle
                    </button>
                  </div>
                </div>

                {/* Dimensions Configuration */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#0f172a" }}>Ölçü ve Boyut Seçenekleri</h4>
                  <div className="admin-field-group">
                    <label>Ölçü Bilgisi / Seçenekleri</label>
                    <input
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="Örn: Özel Milimetrik Ölçüye Göre Üretim (En: 40-200cm, Boy: 50-260cm)"
                    />
                    <span className="admin-field-hint">
                      Plise perde, sineklik veya seperatör kapı için müşterinin milimetrik ölçü seçimi yapabileceğini belirtir veya hazır standart ölçüleri listeler.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GALLERY */}
            {activeTab === "gallery" && (
              <div className="admin-form-section">
                <div className="admin-gallery-manager">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#0f172a" }}>Ürün Görselleri & Kapak Fotoğrafı</h4>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                        Bilgisayarınızdan fotoğraf yükleyebilir, silebilir veya herhangi bir fotoğrafı tek tıkla &quot;Kapak&quot; yapabilirsiniz.
                      </p>
                    </div>
                  </div>

                  {/* Computer File Upload Area */}
                  <div
                    className={`admin-upload-zone ${isUploading ? "uploading" : ""}`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                    <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>📁</div>
                    <strong style={{ color: "#1e3a8a", fontSize: "0.88rem" }}>
                      {isUploading ? "Fotoğraflar Yükleniyor..." : "Bilgisayardan Fotoğraf Seç & Yükle"}
                    </strong>
                    <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
                      JPG, PNG, WEBP formatları desteklenir. Tek seferde birden fazla fotoğraf seçebilirsiniz.
                    </span>
                    <button
                      type="button"
                      className="admin-upload-zone-btn"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      {isUploading ? "⏳ Yükleniyor..." : "📤 Dosya Seç"}
                    </button>
                    {uploadProgress && (
                      <div style={{ marginTop: 6, fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>
                        {uploadProgress}
                      </div>
                    )}
                  </div>

                  {/* Image Grid */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <strong style={{ fontSize: "0.82rem", color: "#334155" }}>
                        Yüklü Görseller ({galleryImages.length})
                      </strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Yeşil &quot;KAPAK&quot; rozetli görsel ürünün mağaza vitrinindeki ana fotoğrafıdır.
                      </span>
                    </div>

                    {galleryImages.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 24, background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                        <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Henüz ürün görseli eklenmemiş. Yukarıdaki alandan yükleme yapabilirsiniz.</span>
                      </div>
                    ) : (
                      <div className="admin-gallery-grid">
                        {galleryImages.map((imgUrl, index) => {
                          const isCover = imgUrl === coverImage;
                          return (
                            <div key={index} className="admin-gallery-card">
                              <div className="admin-gallery-thumb">
                                <Image unoptimized src={imgUrl} alt={`Fotoğraf ${index + 1}`} fill sizes="150px" />
                                {isCover && <span className="admin-cover-badge">KAPAK</span>}
                              </div>
                              <div className="admin-gallery-actions">
                                {!isCover && (
                                  <button
                                    type="button"
                                    className="admin-gallery-btn"
                                    onClick={() => handleSetCover(imgUrl)}
                                    title="Bu fotoğrafı vitrin kapak fotoğrafı yap"
                                  >
                                    Kapak Yap
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="admin-gallery-btn remove-btn"
                                  onClick={() => handleRemoveImage(imgUrl)}
                                  title="Fotoğrafı galeriden sil"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Photo via URL */}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ display: "block", fontSize: "0.76rem", color: "#64748b", marginBottom: 4 }}>
                      Veya doğrudan görsel URL adresi ile ekleyin:
                    </span>
                    <div className="admin-add-photo-box">
                      <input
                        type="text"
                        placeholder="Örn: /images/products/kamatas/... veya https://..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                      />
                      <button type="button" className="admin-btn-action" onClick={handleAddImage}>
                        + URL Ekle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DESCRIPTION */}
            {activeTab === "description" && (
              <div className="admin-form-section">
                <div className="admin-field-group">
                  <label>Detaylı Ürün Açıklaması</label>
                  <textarea
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ürünün teknik kumaş yapısı, yalıtım kabiliyeti, montaj aparatları ve kullanım alanları hakkında detaylı bilgi girin…"
                  />
                  <span className="admin-field-hint">Ürün detay sayfasında açıklama ve özellikler tabında gösterilir.</span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-action" onClick={onClose} disabled={saving}>
              Vazgeç
            </button>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="submit"
                className="admin-btn-action edit-btn"
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                disabled={saving}
              >
                {saving ? "Kaydediliyor…" : isCreate ? "Ürünü Kataloğa Ekle" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
