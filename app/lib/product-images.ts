import { getDb, getProductImagesBucket } from "@/db";

export async function saveProductImage(productId: string, productName: string, image: File): Promise<string> {
  if (!image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) throw new Error("Görsel JPG, PNG veya WebP ve en fazla 8 MB olmalı.");
  const safeName = image.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const key = `products/${productId}/${crypto.randomUUID()}-${safeName}`;
  await getProductImagesBucket().put(key, image.stream(), { httpMetadata: { contentType: image.type }, customMetadata: { productId } });
  const url = `/api/media/${key}`;
  const now = new Date().toISOString();
  await getDb().prepare("INSERT INTO product_images (id, product_id, r2_key, source_url, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)").bind(crypto.randomUUID(), productId, key, url, productName, now).run();
  return url;
}
