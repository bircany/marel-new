import { NextResponse } from "next/server";
import { listProducts } from "@/db";
import { absoluteUrl } from "@/app/lib/site";

export async function GET() {
  try {
    const products = await listProducts(false); // Only active products
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Marel Plise Perde</title>
<link>${absoluteUrl("/")}</link>
<description>Marel Plise Perde Ürün Kataloğu</description>
`;

    for (const product of products) {
      if (product.active === 0) continue;
      
      const link = absoluteUrl(`/urunler/${product.slug}`);
      const image = absoluteUrl(product.image || "/images/catalog/diamond.webp");
      const price = ((product.price ?? 59900) / 100).toFixed(2);
      const salePrice = product.salePrice ? (product.salePrice / 100).toFixed(2) : price;
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const condition = "new";
      
      // XML escaping helper
      const escapeXml = (unsafe: string) => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
          }
        });
      };

      xml += `<item>
<g:id>${escapeXml(product.sku || product.id)}</g:id>
<g:title>${escapeXml(product.name)}</g:title>
<g:description>${escapeXml(product.description || product.name)}</g:description>
<g:link>${escapeXml(link)}</g:link>
<g:image_link>${escapeXml(image)}</g:image_link>
<g:condition>${condition}</g:condition>
<g:availability>${availability}</g:availability>
<g:price>${price} TRY</g:price>
${product.salePrice && product.salePrice < product.price ? `<g:sale_price>${salePrice} TRY</g:sale_price>` : ""}
<g:brand>${escapeXml(product.brand || "Marel")}</g:brand>
<g:google_product_category>${escapeXml(product.googleProductCategory || "Home &amp; Garden &gt; Decor &gt; Window Treatments")}</g:google_product_category>
</item>
`;
    }

    xml += `</channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("XML Feed Error:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
