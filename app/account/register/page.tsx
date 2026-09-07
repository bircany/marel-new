import Image from "next/image";
import { AuthPanel } from "@/app/components/auth-panel";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";

export const metadata = { title: "Kayıt Ol | Marel", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="simple-account-page">
        <div className="simple-account-container">
          <div className="simple-account-brand">
            <Image unoptimized src="/images/marel-logo.png" alt="Marel" width={160} height={36} />
            <p>Hesap oluşturun, ölçüye özel siparişlerinizi tek yerden takip edin.</p>
          </div>
          <AuthPanel initialMode="register" successRoute="/hesabim" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
