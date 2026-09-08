import { NextResponse } from "next/server";
import { listProducts } from "@/db";

export async function GET() {
  try {
    const products = await listProducts(true);

    if (!products || products.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // CSV Headers
    const headers = [
      "SKU",
      "Ürün Adı (name)",
      "Kategori (category)",
      "Kök Kategori (rootCategory)",
      "Açıklama (description)",
      "Fiyat (price)",
      "İndirimli Fiyat (salePrice)",
      "Para Birimi (currency)",
      "Stok (stock)",
      "Durum (availability)",
      "Marka (brand)",
      "Google Kategori (googleProductCategory)",
      "Aktif (active)",
      "Öne Çıkan (featured)",
      "Renkler (colors)",
      "Boyut/Ölçü (dimensions)",
      "Taksit (installments)",
      "Taksit Metni (installmentText)",
      "Ana Görsel (image)",
    ];

    // CSV Rows
    const rows = products.map((p) => {
      return [
        `"${p.sku}"`,
        `"${p.name?.replace(/"/g, '""') || ""}"`,
        `"${p.category || ""}"`,
        `"${p.rootCategory || ""}"`,
        `"${p.description?.replace(/"/g, '""') || ""}"`,
        p.price,
        p.salePrice || "",
        `"${p.currency || "TRY"}"`,
        p.stock,
        `"${p.availability || "in_stock"}"`,
        `"${p.brand || "Marel"}"`,
        `"${p.googleProductCategory || "Home & Garden > Decor > Window Treatments"}"`,
        p.active,
        p.featured,
        `"${p.colors?.replace(/"/g, '""') || "[]"}"`,
        `"${p.dimensions?.replace(/"/g, '""') || ""}"`,
        p.installments || 3,
        `"${p.installmentText || ""}"`,
        `"${p.image || ""}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // \uFEFF is for UTF-8 BOM so Excel opens it correctly

    const headersList = new Headers();
    headersList.set("Content-Type", "text/csv; charset=utf-8");
    headersList.set("Content-Disposition", `attachment; filename="marel_urunler_${new Date().toISOString().split("T")[0]}.csv"`);

    return new NextResponse(csvContent, { headers: headersList });
  } catch (error) {
    console.error("Bulk export error:", error);
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}
