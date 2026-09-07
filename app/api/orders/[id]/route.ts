import { getCurrentUser } from "@/app/lib/laravel-auth";
import { getOrderDetailsById } from "@/db";
import type { OrderPayload } from "@/app/api/orders/route";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  if (!rawId) return Response.json({ error: "Geçersiz sipariş." }, { status: 400 });

  try {
    const order = await getOrderDetailsById(rawId);
    if (!order) {
      return Response.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const user = await getCurrentUser().catch(() => null);
    if (user && user.role !== "admin") {
      const isOwner =
        (user.id && String(order.userId) === String(user.id)) ||
        order.email.toLowerCase() === user.email.toLowerCase();
      if (!isOwner) {
        return Response.json({ error: "Bu siparişi görüntüleme yetkiniz yok." }, { status: 403 });
      }
    }

    const payload: OrderPayload = {
      id: order.id,
      order_number: order.orderNumber,
      status: order.status,
      payment_status: order.paymentStatus || "pending",
      payment_method: order.paymentMethod || "bank_transfer",
      subtotal: order.subtotal / 100,
      discount_amount: 0,
      shipping_cost: order.shipping / 100,
      total: order.total / 100,
      formatted_total: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.total / 100),
      shipping_address: {
        name: order.customerName,
        phone: order.phone,
        city: order.city || "",
        district: order.district || "",
        neighborhood: null,
        full_address: order.shippingAddress,
        zip_code: null,
      },
      items: (order.items || []).map((it) => ({
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
      notes: order.notes || null,
      cargo_company: order.cargoCompany,
      cargo_company_label: null,
      tracking_number: order.trackingNumber,
      tracking_url: order.trackingUrl,
      created_at: order.createdAt,
    };

    return Response.json(payload);
  } catch (error) {
    console.error("Order fetch error:", error);
    return Response.json({ error: "Sipariş bilgisi alınamadı." }, { status: 500 });
  }
}
