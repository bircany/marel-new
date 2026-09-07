import { requireAdminApi } from "@/app/lib/admin-auth";
import { createCouponInDb, deleteCouponInDb, listCouponsFromDb } from "@/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    const coupons = await listCouponsFromDb();
    return Response.json(coupons);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kuponlar yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    type?: string;
    discountType?: string;
    value?: number | string;
    discountValue?: number | string;
    minimumSubtotal?: number | string;
    usageLimit?: number | string;
    isActive?: boolean;
    active?: boolean;
    expiresAt?: string;
  };

  const code = String(body.code || "").trim();
  if (!code) {
    return Response.json({ error: "Kupon kodu zorunludur." }, { status: 400 });
  }

  const rawType = String(body.discountType || body.type || "PERCENT").toUpperCase();
  const discountType = rawType === "FIXED" ? "FIXED" : "PERCENT";
  const numValue = Number(body.discountValue ?? body.value);
  if (!Number.isFinite(numValue) || numValue <= 0) {
    return Response.json({ error: "Geçerli bir indirim değeri giriniz." }, { status: 400 });
  }

  // If fixed, convert to kuruş if value is in TL (e.g. <= 1000)
  const discountValue = discountType === "FIXED" && numValue < 10000 ? Math.round(numValue * 100) : Math.round(numValue);
  const minSub = body.minimumSubtotal ? Math.round(Number(body.minimumSubtotal) * 100) : 0;
  const usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
  const active = body.isActive !== undefined ? Boolean(body.isActive) : body.active !== undefined ? Boolean(body.active) : true;

  try {
    const coupon = await createCouponInDb({
      code,
      discountType,
      discountValue,
      minimumSubtotal: minSub,
      usageLimit,
      active,
      expiresAt: body.expiresAt || null,
    });
    return Response.json(coupon, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kupon oluşturulamadı." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Kupon ID'si zorunludur." }, { status: 400 });
  }

  try {
    await deleteCouponInDb(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kupon silinemedi." }, { status: 500 });
  }
}
