import type { NextApiRequest, NextApiResponse } from "next";
import { GET, POST, PUT, PATCH, DELETE } from "@/server/api";

export const config = { api: { bodyParser: false } };

async function readBody(req: NextApiRequest): Promise<Buffer | undefined> {
  if (["GET", "HEAD"].includes(req.method ?? "GET")) return undefined;
  if (req.body && typeof req.body === "object") return Buffer.from(JSON.stringify(req.body));
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function headersFrom(req: NextApiRequest) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
}

export default async function apiProxy(req: NextApiRequest, res: NextApiResponse) {
  const segments = Array.isArray(req.query.path) ? req.query.path : req.query.path ? [req.query.path] : [];
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || `http://${req.headers.host || "localhost"}`}${req.url || "/api"}`;
  const rawBody = await readBody(req);
  const request = new Request(url, { method: req.method || "GET", headers: headersFrom(req), body: rawBody ? new Uint8Array(rawBody) : undefined });
  const context = { params: Promise.resolve({ path: segments }) };
  const handler = req.method === "GET" ? GET : req.method === "POST" ? POST : req.method === "PUT" ? PUT : req.method === "PATCH" ? PATCH : req.method === "DELETE" ? DELETE : undefined;
  if (!handler) return res.status(405).json({ error: "Method Not Allowed" });
  const response = await handler(request, context);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status);
  const data = await response.arrayBuffer();
  return res.send(Buffer.from(data));
}
