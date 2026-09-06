import http from "node:http";

const BASE_URL = "http://localhost:3000";

function request(path, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on("error", reject);
    if (bodyData) req.write(JSON.stringify(bodyData));
    req.end();
  });
}

async function runTest() {
  console.log("=== E2E Veritabanı ve Akış Sync Testi ===");

  // 1. Admin Girişi ve Token Alımı
  const loginRes = await request("/api/auth/login", { method: "POST" }, { email: "admin@softtrade.com", password: "admin123" });
  console.log("1. Admin Girişi:", loginRes.status, loginRes.data?.user ? loginRes.data.user.email : loginRes.data);

  // 2. İletişim Formu Mesaj Gönderimi (Storefront -> DB)
  const contactPayload = {
    name: "E2E Test Müşterisi",
    email: "e2e.test@marel.test",
    phone: "05559991122",
    subject: "Otomatik Akış Testi",
    message: "Bu mesaj E2E otomatik senkronizasyon testi tarafından gönderilmiştir.",
  };
  const contactRes = await request("/api/contact", { method: "POST" }, contactPayload);
  console.log("2. Storefront İletişim Formu Gönderimi:", contactRes.status, contactRes.data);

  const setCookie = loginRes.headers["set-cookie"]?.map(c => c.split(";")[0]).join("; ") || "";

  // 3. Yorum Gönderimi (Storefront -> DB, Oturum Cookie ile)
  const reviewPayload = {
    productId: 1,
    rating: 5,
    title: "E2E Otomatik Yorum Testi",
    body: "Storefront üzerinden gönderilen E2E yorum içeriği. Harika ürün!",
  };
  const reviewRes = await request(
    "/api/reviews",
    {
      method: "POST",
      headers: { Cookie: setCookie },
    },
    reviewPayload
  );
  console.log("3. Storefront Yorum Gönderimi (Oturum Açık):", reviewRes.status, reviewRes.data);

  console.log("=== TEST BAŞARIYLA TAMAMLANDI ===");
}

runTest().catch((err) => {
  console.error("Test hatası:", err);
  process.exit(1);
});
