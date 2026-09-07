import { forceReseedDatabase, listProducts } from "@/db";

export async function GET() {
  await forceReseedDatabase();
  const products = await listProducts(true);
  
  const categories: Record<string, number> = {};
  for (const p of products) {
    const k = `${(p as any).rootCategory || "Other"} -> ${p.category}`;
    categories[k] = (categories[k] || 0) + 1;
  }

  return Response.json({
    success: true,
    totalProducts: products.length,
    breakdown: categories
  });
}
