import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("Marel ana sayfasını sunucu tarafında üretir", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /En Çok Satanlar/);
  assert.match(html, /Sepete Ekle/);
  assert.match(html, /Sipariş Takip/);
  assert.match(html, /Plise Perde/);
  assert.match(html, /Diamond/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/i);
});

test("ürün vitrini ve Diamond sayfası erişilebilir", async () => {
  const products = await render("/urunler");
  assert.equal(products.status, 200);
  assert.match(await products.text(), /Jaluzi Perde/);

  const diamond = await render("/urunler/plise-perde/diamond-serisi");
  assert.equal(diamond.status, 200);
  const html = await diamond.text();
  assert.match(html, /Diamond Series/);
  assert.match(html, /WhatsApp(?:&#x27;|')tan teklif al/);
});
