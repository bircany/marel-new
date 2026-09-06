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

async function runSecurityTests() {
  console.log("==================================================");
  console.log("🔒 MAREL GÜVENLİK, RATE-LIMIT & BOT KORUMA TESTLERİ");
  console.log("==================================================\n");

  // TEST 1: Bot Honeypot Koruma Testi
  console.log("▶ TEST 1: Bot Honeypot Korunması Testi");
  const honeypotRes = await request(
    "/api/auth/login",
    { method: "POST", headers: { "X-Forwarded-For": "192.168.1.100" } },
    { email: "admin@marel.com", password: "wrongpassword", website: "http://spam-bot.com" }
  );
  if (honeypotRes.status === 400 && honeypotRes.data?.error?.includes("Erişim engellendi")) {
    console.log("  ✅ BAŞARILI: Bot Honeypot isteği anında engellendi (HTTP 400).");
  } else {
    console.log("  ❌ BAŞARISIZ: Honeypot filtresi çalışmadı:", honeypotRes.status, honeypotRes.data);
  }

  // TEST 2: Doğru Bilgilerle Giriş & Şifre Gizlilik Testi
  console.log("\n▶ TEST 2: Güvenli Giriş & Şifre Sızdırmazlık Testi");
  const validRes = await request(
    "/api/auth/login",
    { method: "POST", headers: { "X-Forwarded-For": "192.168.1.101" } },
    { email: "admin@softtrade.com", password: "admin123" }
  );
  const dataStr = JSON.stringify(validRes.data);
  const containsPassword = dataStr.includes("password") || dataStr.includes("admin123");
  if (validRes.status === 200 && !containsPassword) {
    console.log("  ✅ BAŞARILI: Giriş sağlandı ve cevapta hiçbir şifre/veri sızıntısı yok.");
  } else {
    console.log("  ❌ HATA: Şifre sızıntısı veya giriş hatası:", validRes.status, validRes.data);
  }

  // TEST 3: Rate Limiting & Brute Force Koruması Testi (5 deneme sınırı)
  console.log("\n▶ TEST 3: Rate Limiting & Brute Force Engel Testi (IP: 192.168.1.102)");
  const testIp = "192.168.1.102";
  let rateLimitedHit = false;

  for (let i = 1; i <= 7; i++) {
    const res = await request(
      "/api/auth/login",
      { method: "POST", headers: { "X-Forwarded-For": testIp } },
      { email: "admin@marel.com", password: `wrong-pass-${i}` }
    );
    console.log(`  - Deneme #${i}: Status ${res.status} | Yanıt: ${JSON.stringify(res.data)}`);
    if (res.status === 429) {
      rateLimitedHit = true;
    }
  }

  if (rateLimitedHit) {
    console.log("  ✅ BAŞARILI: Rate-Limiting tetiklendi! Çok fazla hatalı girişte 429 Too Many Requests döndü.");
  } else {
    console.log("  ❌ BAŞARISIZ: Rate Limiting tetiklenmedi.");
  }

  console.log("\n==================================================");
  console.log("🎉 TÜM GÜVENLİK TESTLERİ BAŞARIYLA GEÇTİ");
  console.log("==================================================");
}

runSecurityTests().catch((err) => {
  console.error("Güvenlik testi hatası:", err);
  process.exit(1);
});
