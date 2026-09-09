import { requireAdminApi } from "@/app/lib/admin-auth";
import { createCouponInDb, deleteCouponInDb, listCouponsWithFiltersFromDb, setCouponActiveInDb } from "@/db";

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const coupons = await listCouponsWithFiltersFromDb({
      active: searchParams.has("active") ? searchParams.get("active") === "true" : undefined,
      search: searchParams.get("search") || undefined,
      expired: searchParams.has("expired") ? searchParams.get("expired") === "true" : undefined,
    });
    if (format === "csv") {
      const header = "Kod,Tip,Değer,Minimum Sepet,Kullanım,Kullanım Limiti,Aktif,Bitiş,Tarih";
      const rows = coupons.map((c) => [c.code, c.discountType, c.discountValue, c.minimumSubtotal / 100, c.usageCount, c.usageLimit ?? "", c.active ? "Evet" : "Hayır", c.expiresAt ?? "", c.createdAt]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
      return new Response(`\uFEFF${[header, ...rows].join("\r\n")}`, {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=coupons.csv" },
      });
    }
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

export async function PATCH(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const body = (await request.json().catch(() => ({}))) as { id?: string; active?: boolean };
  if (!body.id || typeof body.active !== "boolean") {
    return Response.json({ error: "Kupon ID'si ve aktiflik durumu zorunludur." }, { status: 400 });
  }
  try {
    const coupon = await setCouponActiveInDb(body.id, body.active);
    if (!coupon) return Response.json({ error: "Kupon bulunamadı." }, { status: 404 });
    return Response.json(coupon);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kupon güncellenemedi." }, { status: 500 });
  }
}
