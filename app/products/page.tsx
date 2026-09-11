import ProductsPage from "@/app/urunler/page";
import { absoluteUrl } from "@/app/lib/site";

// Public alias used by the header and category cards. Keeping this as a
// static route avoids adding another Serverless Function on Vercel Hobby.
export const dynamic = "force-static";

export const metadata = {
  title: "Tüm Ürünler | Marel Plise Perde",
  description:
    "Marel'in tüm plise perde serilerini, renklerini ve özel ölçü ürünlerini inceleyin.",
  alternates: { canonical: absoluteUrl("/products") },
};

export default ProductsPage;
