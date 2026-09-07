import { requireAdminApi } from "@/app/lib/admin-auth";
import { deleteProductRecord, updateProductRecord } from "@/db";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  try {
    const { action, ids, data } = (await request.json()) as {
      action: "activate" | "deactivate" | "feature" | "unfeature" | "delete" | "discount";
      ids: string[];
      data?: any;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "Lütfen en az bir ürün seçin." }, { status: 400 });
    }

    for (const id of ids) {
      if (action === "activate") {
        await updateProductRecord(id, { active: true });
      } else if (action === "deactivate") {
        await updateProductRecord(id, { active: false });
      } else if (action === "feature") {
        await updateProductRecord(id, { featured: true });
      } else if (action === "unfeature") {
        await updateProductRecord(id, { featured: false });
      } else if (action === "delete") {
        await deleteProductRecord(id);
      }
    }

    return Response.json({ ok: true, count: ids.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Toplu işlem yürütülemedi." }, { status: 400 });
  }
}
