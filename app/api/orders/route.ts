import { getCurrentUser } from "@/app/lib/laravel-auth";
import { createOrderInDb, listOrdersWithDetails } from "@/db";

export type OrderItemPayload = {
  id: number | string;
  product_id: number | string | null;
  product_name: string | null;
  variant_label: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product_slug?: string | null;
  configuration?: string | Record<string, unknown>;
};

export type OrderAddressPayload = {
  name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string | null;
  full_address: string;
  zip_code: string | null;
};

export type OrderPayload = {
  id: number | string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  formatted_total: string;
  shipping_address: OrderAddressPayload | null;
  items?: OrderItemPayload[];
  notes: string | null;
  cargo_company?: string | null;
  cargo_company_label?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  measurement_confirmed_at?: string | null;
  measurement_notes?: string | null;
  created_at: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    addressId?: number;
    paymentMethod?: string;
    notes?: string;
    couponCode?: string;
    shipping?: {
      name?: string;
      phone?: string;
      email?: string;
      city?: string;
      district?: string;
      neighborhood?: string;
      full_address?: string;
      zip_code?: string;
    };
    items?: Array<{
      product_id?: string | number | null;
      sku?: string;
      name?: string;
      unit_price?: number;
      quantity?: number;
      configuration?: Record<string, unknown> | string;
    }>;
    subtotal?: number;
    shipping_cost?: number;
    total?: number;
  };

  const paymentMethod = String(body.paymentMethod || "bank_transfer").trim();
  const validMethods = ["bank_transfer", "cash_on_delivery", "whatsapp"];
  const finalMethod = validMethods.includes(paymentMethod) ? paymentMethod : "bank_transfer";

  const user = await getCurrentUser().catch(() => null);

  const shipping = body.shipping || {
    name: user?.full_name || "Müşteri",
    phone: "",
    email: user?.email || "musteri@marel.com.tr",
    city: "İstanbul",
    district: "Merkez",
    neighborhood: null,
    full_address: "Adres belirtilmedi",
    zip_code: null,
  };

  if (!shipping.name || !shipping.phone || !shipping.email || !shipping.full_address) {
    if (!user) {
      return Response.json({ error: "Teslimat ve iletişim bilgileri eksiksiz doldurulmalıdır." }, { status: 400 });
    }
  }

  const rawItems = Array.isArray(body.items) && body.items.length > 0 ? body.items : [];
  const itemsToSave = rawItems.map((item) => ({
    productId: item.product_id != null ? String(item.product_id) : null,
    sku: item.sku || "MRL-PLISE",
    name: item.name || "Marel Plise Perde",
    unitPrice: typeof item.unit_price === "number" && item.unit_price > 0 ? item.unit_price : 116600,
    quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
    configuration: item.configuration || {},
  }));

  const subtotalKurus = typeof body.subtotal === "number" && body.subtotal > 0
    ? body.subtotal
    : itemsToSave.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

  const shippingKurus = typeof body.shipping_cost === "number" ? body.shipping_cost : 0;
  const totalKurus = typeof body.total === "number" && body.total > 0 ? body.total : subtotalKurus + shippingKurus;

  try {
    const created = await createOrderInDb({
      userId: user?.id != null ? String(user.id) : null,
      email: shipping.email || user?.email || "musteri@marel.com.tr",
      customerName: shipping.name || user?.full_name || "Müşteri",
      phone: shipping.phone || "",
      paymentMethod: finalMethod,
      paymentStatus: "pending",
      subtotal: subtotalKurus,
      shipping: shippingKurus,
      total: totalKurus,
      currency: "TRY",
      city: shipping.city || "",
      district: shipping.district || "",
      shippingAddress: shipping.full_address || "Teslimat adresi",
      notes: String(body.notes || "").trim(),
      items: itemsToSave,
    });

    const responsePayload: OrderPayload = {
      id: created.id,
      order_number: created.orderNumber,
      status: created.status,
      payment_status: created.paymentStatus || "pending",
      payment_method: created.paymentMethod || finalMethod,
      subtotal: created.subtotal / 100,
      discount_amount: 0,
      shipping_cost: created.shipping / 100,
      total: created.total / 100,
      formatted_total: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(created.total / 100),
      shipping_address: {
        name: created.customerName,
        phone: created.phone,
        city: created.city || "",
        district: created.district || "",
        neighborhood: null,
        full_address: created.shippingAddress,
        zip_code: null,
      },
      items: (created.items || []).map((it) => ({
        id: it.id,
        product_id: it.productId,
        product_name: it.name,
        variant_label: null,
        sku: it.sku,
        unit_price: it.unitPrice / 100,
        quantity: it.quantity,
        subtotal: (it.unitPrice * it.quantity) / 100,
        configuration: it.configuration,
      })),
      notes: created.notes || null,
      cargo_company: created.cargoCompany,
      cargo_company_label: null,
      tracking_number: created.trackingNumber,
      tracking_url: created.trackingUrl,
      created_at: created.createdAt,
    };

    return Response.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error("Order creation failed in D1:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Sipariş kaydedilirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser().catch(() => null);
    const allOrders = await listOrdersWithDetails();

    const filtered = user && user.role !== "admin"
      ? allOrders.filter((o) => (user.id && String(o.userId) === String(user.id)) || o.email.toLowerCase() === user.email.toLowerCase())
      : allOrders;

    const payloads: OrderPayload[] = filtered.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      status: o.status,
      payment_status: o.paymentStatus || "pending",
      payment_method: o.paymentMethod || "bank_transfer",
      subtotal: o.subtotal / 100,
      discount_amount: 0,
      shipping_cost: o.shipping / 100,
      total: o.total / 100,
      formatted_total: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(o.total / 100),
      shipping_address: {
        name: o.customerName,
        phone: o.phone,
        city: o.city || "",
        district: o.district || "",
        neighborhood: null,
        full_address: o.shippingAddress,
        zip_code: null,
      },
      items: (o.items || []).map((it) => ({
        id: it.id,
        product_id: it.productId,
        product_name: it.name,
        variant_label: null,
        sku: it.sku,
        unit_price: it.unitPrice / 100,
        quantity: it.quantity,
        subtotal: (it.unitPrice * it.quantity) / 100,
        configuration: it.configuration,
      })),
      notes: o.notes || null,
      cargo_company: o.cargoCompany,
      cargo_company_label: null,
      tracking_number: o.trackingNumber,
      tracking_url: o.trackingUrl,
      created_at: o.createdAt,
    }));

    return Response.json(payloads);
  } catch (error) {
    console.error("Failed to list orders from D1:", error);
    return Response.json([], { status: 200 });
  }
}

