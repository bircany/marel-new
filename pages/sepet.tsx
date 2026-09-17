import { CartClient } from "@/components/cart-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Sepetim", robots: { index: false, follow: false } };

export default function CartPage() {
  return <><SiteHeader /><main className="commerce-main shop-container"><CartClient user={null} /></main><SiteFooter /></>;
}

