import { getChatGPTUser } from "@/app/chatgpt-auth";
import { CartClient } from "@/app/components/cart-client";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sepetim" };

export default async function CartPage() {
  const user = await getChatGPTUser();
  return <><SiteHeader /><main className="commerce-main shop-container"><CartClient defaultName={user?.fullName ?? ""} defaultEmail={user?.email ?? ""} /></main><SiteFooter /></>;
}
