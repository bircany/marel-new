import { CartClient } from "@/app/components/cart-client";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const metadata = { title: "Sepetim", robots: { index: false, follow: false } };

export default function CartPage() {
  return <><SiteHeader /><main className="commerce-main shop-container"><CartClient user={null} /></main><SiteFooter /></>;
}
