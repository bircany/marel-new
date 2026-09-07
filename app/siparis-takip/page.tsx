import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { KamatasOrderTracker } from "@/app/components/kamatas-order-tracker";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sipariş Takip | Marel Plise Perde",
  description: "Marel siparişinizi ve Yurtiçi Kargo gönderinizi canlı takip edin.",
  robots: { index: false, follow: false },
};

export default function TrackingPage() {
  return (
    <>
      <SiteHeader />
      <main className="tracking-page-wrap">
        <KamatasOrderTracker />
      </main>
      <SiteFooter />
    </>
  );
}
