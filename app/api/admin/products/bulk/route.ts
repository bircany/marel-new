import { NextResponse } from "next/server";
import { getProductBySlug, createProductRecord, updateProductRecord, invalidateProductCache } from "@/db";

export async function POST(request: Request) {
  try {
    const { products } = (await request.json()) as { products: any[] };

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid payload format. Expected an array of products." }, { status: 400 });
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const item of products) {
      try {
        const sku = item["SKU"] || item.sku;
        const name = item["Ürün Adı (name)"] || item.name;
        
        if (!name) {
          errors.push(`Atlanan satır: Ürün adı (name) zorunludur.`);
          continue;
        }

        // Kategori ayarları
        const category = item["Kategori (category)"] || item.category || "Genel";
        const rootCategory = item["Kök Kategori (rootCategory)"] || item.rootCategory || category;

        // Fiyat, Stok ve Diğerleri
        const price = parseFloat(item["Fiyat (price)"] || item.price || "0");
        const salePrice = item["İndirimli Fiyat (salePrice)"] || item.salePrice ? parseFloat(item["İndirimli Fiyat (salePrice)"] || item.salePrice) : null;
        const stock = parseInt(item["Stok (stock)"] || item.stock || "10", 10);
        
        const availability = item["Durum (availability)"] || item.availability || (stock > 0 ? "in_stock" : "out_of_stock");
        const activeStr = String(item["Aktif (active)"] || item.active || "1");
        const active = activeStr === "1" || activeStr.toLowerCase() === "true" || activeStr === "true";
        
        const featuredStr = String(item["Öne Çıkan (featured)"] || item.featured || "0");
        const featured = featuredStr === "1" || featuredStr.toLowerCase() === "true" || featuredStr === "true";

        const description = item["Açıklama (description)"] || item.description || "";
        const currency = item["Para Birimi (currency)"] || item.currency || "TRY";
        const brand = item["Marka (brand)"] || item.brand || "Marel";
        const colors = item["Renkler (colors)"] || item.colors || "[]";
        const dimensions = item["Boyut/Ölçü (dimensions)"] || item.dimensions || "Özel Ölçüye Göre Üretim";
        const installments = parseInt(item["Taksit (installments)"] || item.installments || "3", 10);
        const installmentText = item["Taksit Metni (installmentText)"] || item.installmentText || `Peşin Fiyatına ${installments} Taksit`;
        
        const image = item["Ana Görsel (image)"] || item.image || "";

        // Slug oluştur (sku varsa sku üzerinden arayacağız, yoksa name'den slug bulacağız)
        const slug = name.toLowerCase()
                         .replace(/[^a-z0-9ğüşıöç]+/g, "-")
                         .replace(/^-|-$/g, "");

        const existingProduct = await getProductBySlug(slug);

        if (existingProduct) {
          // Update
          await updateProductRecord(existingProduct.id, {
            name,
            sku,
            category,
            rootCategory,
            description,
            price,
            salePrice,
            stock,
            availability,
            active,
            featured,
            colors,
            dimensions,
            installments,
            installmentText,
            image,
          });
          updatedCount++;
        } else {
          // Create
          await createProductRecord({
            name,
            sku,
            slug,
            category,
            rootCategory,
            description,
            price,
            salePrice,
            stock,
            availability,
            active,
            featured,
            colors,
            dimensions,
            installments,
            installmentText,
            brand,
            image,
          });
          createdCount++;
        }
      } catch (err: any) {
        errors.push(`'${item.name || "Bilinmeyen Ürün"}' için hata: ${err.message}`);
      }
    }

    invalidateProductCache();
    return NextResponse.json({
      success: true,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Bulk upsert error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk upload" }, { status: 500 });
  }
}
