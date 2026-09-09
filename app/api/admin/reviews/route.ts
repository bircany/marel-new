import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAdminApi } from "@/app/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const admin = await requireAdminApi();
    if (admin instanceof Response) return admin;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const db = getDb();
    
    let query = "SELECT r.id, r.user_id AS userId, r.product_id AS productId, COALESCE(p.name, 'Ürün') AS productName, COALESCE(u.full_name, 'Müşteri') AS authorName, r.rating, r.title, r.body, r.status, r.admin_reply AS adminReply, r.created_at AS createdAt, r.updated_at AS updatedAt FROM reviews r LEFT JOIN products p ON r.product_id = p.id LEFT JOIN users u ON r.user_id = u.id";
    const params: any[] = [];
    
    if (status !== "all") {
      query += " WHERE r.status = ?";
      params.push(status);
    }
    query += " ORDER BY r.created_at DESC";

    const { results } = await db.prepare(query).bind(...params).all();
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
