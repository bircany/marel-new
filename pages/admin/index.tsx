import { useEffect, useState } from "react";
import Head from "next/head";
import { AdminConsole } from "@/components/admin-console";
import { AdminLogin } from "@/components/admin-login";

export default function AdminPage() {
  const [data, setData] = useState<any | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => { fetch("/api/admin/dashboard").then((r) => r.ok ? r.json() : null).then(setData).finally(() => setChecked(true)); }, []);
  if (!checked) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Yönetim paneli yükleniyor…</main>;
  if (!data) return <AdminLogin />;
  return <><Head><title>Marel Yönetim Portalı</title><meta name="robots" content="noindex,nofollow" /></Head><AdminConsole products={data.products} orders={data.orders} reviews={data.reviews} announcements={data.announcements} contacts={data.contacts} initialCoupons={data.coupons} initialSettings={data.settings} initialCustomers={data.customers} adminUser={data.admin} /></>;
}
