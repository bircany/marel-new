import { stListProducts } from "@/app/lib/softtrade";
import type { CatalogProduct } from "@/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  try {
    const allProducts = await stListProducts(false, "Marel");

    const keywords = q.split(/\s+/).filter(Boolean);

    const scored: Array<{ product: CatalogProduct; score: number }> = [];

    for (const product of allProducts) {
      const nameL = product.name.toLowerCase();
      const skuL = product.sku.toLowerCase();
      const catL = product.category.toLowerCase();
      const descL = product.description.toLowerCase();
      const slugL = product.slug.toLowerCase();

      let score = 0;

      for (const kw of keywords) {
        // Exact name match is highest priority
        if (nameL === kw) score += 100;
        else if (nameL.startsWith(kw)) score += 50;
        else if (nameL.includes(kw)) score += 30;

        // SKU match
        if (skuL === kw) score += 80;
        else if (skuL.includes(kw)) score += 25;

        // Category match
        if (catL.includes(kw)) score += 20;

        // Slug match
        if (slugL.includes(kw)) score += 15;

        // Description match
        if (descL.includes(kw)) score += 10;
      }

      if (score > 0) {
        // Boost featured products
        if (product.featured) score += 5;
        // Boost in-stock products
        if (product.stock > 0) score += 3;

        scored.push({ product, score });
      }
    }

    // Sort by score descending, then by name
    scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "tr"));

    const limit = Number(searchParams.get("limit")) || 8;
    const results = scored.slice(0, limit).map((s) => s.product);

    return Response.json({ results });
  } catch {
    return Response.json({ results: [] }, { status: 500 });
  }
}
