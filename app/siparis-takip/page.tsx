import { OrderTracker } from "@/app/components/order-tracker";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const metadata = { title: "Sipariş Takip" };
export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ email?: string; orderNumber?: string }> }) { const query = await searchParams; return <><SiteHeader /><main className="tracking-page"><div className="shop-container"><OrderTracker initialEmail={query.email} initialOrderNumber={query.orderNumber} /></div></main><SiteFooter /></>; }
