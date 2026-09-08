import { listProducts } from "@/db";

export async function GET() {
  const products = await listProducts(false);
  return Response.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
