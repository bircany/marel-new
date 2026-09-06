import { getCurrentUser } from "@/app/lib/laravel-auth";
import { CartClient } from "@/app/components/cart-client";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sepetim", robots: { index: false, follow: false } };

export default async function CartPage() {
  const user = await getCurrentUser();
  return <><SiteHeader /><main className="commerce-main shop-container"><CartClient user={user} /></main><SiteFooter /></>;
}
