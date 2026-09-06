import { buildLlmIndex } from "@/app/lib/llm";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await buildLlmIndex(), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" } });
}
