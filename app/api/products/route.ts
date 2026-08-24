import { stListProducts } from "@/app/lib/softtrade";

export async function GET() {
  return Response.json({ products: await stListProducts(false, "Marel") });
}
