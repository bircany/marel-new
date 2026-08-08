import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureDatabase, getDb, upsertUser } from "@/db";

type OrderInput = {
  customerName?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
  notes?: string;
  items?: Array<{ productId?: string; quantity?: number }>;
};

export async function POST(request: Request) {
  await ensureDatabase();
  const input = await request.json() as OrderInput;
  const customerName = input.customerName?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const phone = input.phone?.trim() ?? "";
  const shippingAddress = input.shippingAddress?.trim() ?? "";
  const requested = (input.items ?? []).filter((item) => item.productId && Number(item.quantity) > 0).slice(0, 30);
  if (!customerName || !email.includes("@") || phone.length < 10 || !shippingAddress || requested.length === 0) {
    return Response.json({ error: "İletişim, adres ve sepet bilgilerini eksiksiz girin." }, { status: 400 });
  }

  const ids = [...new Set(requested.map((item) => item.productId as string))];
  const placeholders = ids.map(() => "?").join(",");
  const { results: products } = await getDb().prepare(`SELECT id, sku, name, price, sale_price AS salePrice, currency, stock, active FROM products WHERE id IN (${placeholders})`).bind(...ids).all<{ id: string; sku: string; name: string; price: number; salePrice: number | null; currency: string; stock: number; active: number }>();
  const byId = new Map(products.map((product) => [product.id, product]));
  let lines: Array<{ product: { id: string; sku: string; name: string; price: number; salePrice: number | null; currency: string; stock: number; active: number }; quantity: number; unitPrice: number }>;
  try {
    lines = requested.map((item) => {
      const product = byId.get(item.productId as string);
      const quantity = Math.min(20, Math.max(1, Math.floor(Number(item.quantity))));
      if (!product || !product.active || product.stock < quantity) throw new Error("stock");
      return { product, quantity, unitPrice: product.salePrice ?? product.price };
    });
  } catch {
    return Response.json({ error: "Sepetteki bir ürün artık satışta değil veya stok yetersiz." }, { status: 409 });
  }
  if (lines.some((line) => line.unitPrice <= 0)) return Response.json({ error: "Sepette teklif gerektiren bir ürün var." }, { status: 400 });

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shipping = subtotal >= 100000 ? 0 : 9900;
  const total = subtotal + shipping;
  const now = new Date().toISOString();
  const orderId = crypto.randomUUID();
  const orderNumber = `MRL-${now.slice(2, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const signedInUser = await getChatGPTUser();
  if (signedInUser) await upsertUser(signedInUser);

  const statements: D1PreparedStatement[] = [
    getDb().prepare("INSERT INTO orders (id, order_number, user_id, email, customer_name, phone, status, subtotal, shipping, total, currency, shipping_address, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 'TRY', ?, ?, ?, ?)").bind(orderId, orderNumber, signedInUser?.userId ?? null, email, customerName, phone, subtotal, shipping, total, shippingAddress, input.notes?.trim() ?? "", now, now),
    getDb().prepare("INSERT INTO order_events (id, order_id, status, note, actor_user_id, created_at) VALUES (?, ?, 'pending', 'Sipariş alındı', ?, ?)").bind(crypto.randomUUID(), orderId, signedInUser?.userId ?? null, now),
  ];
  for (const line of lines) {
    statements.push(getDb().prepare("INSERT INTO order_items (id, order_id, product_id, sku, name, unit_price, quantity, configuration) VALUES (?, ?, ?, ?, ?, ?, ?, '{}')").bind(crypto.randomUUID(), orderId, line.product.id, line.product.sku, line.product.name, line.unitPrice, line.quantity));
    statements.push(getDb().prepare("UPDATE products SET stock = stock - ?, availability = CASE WHEN stock - ? <= 0 THEN 'out_of_stock' ELSE availability END, updated_at = ? WHERE id = ?").bind(line.quantity, line.quantity, now, line.product.id));
  }
  await getDb().batch(statements);
  return Response.json({ orderNumber, total, currency: "TRY" }, { status: 201 });
}
