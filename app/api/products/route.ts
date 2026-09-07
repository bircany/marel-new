import { listProducts } from "@/db";

export async function GET() {
  return Response.json({ products: await listProducts(false) });
}
