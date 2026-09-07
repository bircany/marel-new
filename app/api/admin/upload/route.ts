import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_FILES_PER_REQUEST = 20;

const MAGIC_BYTES: Array<{ bytes: number[]; type: string }> = [
  { bytes: [0xff, 0xd8, 0xff], type: "jpeg" },
  { bytes: [0x89, 0x50, 0x4e, 0x47], type: "png" },
  { bytes: [0x52, 0x49, 0x46, 0x46], type: "webp" },
  { bytes: [0x47, 0x49, 0x46], type: "gif" },
];

function isValidImageBytes(buffer: Buffer): boolean {
  for (const sig of MAGIC_BYTES) {
    if (sig.bytes.every((b, i) => buffer[i] === b)) return true;
  }
  // AVIF/HEIF: ftyp box at offset 4
  if (buffer.length > 11 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return true;
  return false;
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  try {
    const formData = await request.formData();
    const files: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === "file" || key === "files" || key.startsWith("file"))) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Lütfen yüklenecek en az bir görsel dosyası seçin." }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json({ error: `Tek seferde maksimum ${MAX_FILES_PER_REQUEST} dosya yüklenebilir.` }, { status: 400 });
    }

    const uploadDir = path.resolve(process.cwd(), "public", "images", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `"${file.name}" çok büyük. Max 15 MB.` }, { status: 400 });
      }

      const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      if (!ALLOWED_EXTENSIONS.has(rawExt)) {
        return NextResponse.json({ error: `"${file.name}" desteklenmeyen format. JPG/PNG/WEBP/GIF/AVIF.` }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!isValidImageBytes(buffer)) {
        return NextResponse.json({ error: `"${file.name}" geçerli bir görsel değil.` }, { status: 400 });
      }

      const safeBasename = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
      const uniqueFilename = `${Date.now()}_${safeBasename}.${rawExt}`;
      const filePath = path.resolve(uploadDir, uniqueFilename);

      // Path traversal koruması
      if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
        return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 });
      }

      await fs.writeFile(filePath, buffer);
      uploadedUrls.push(`/images/uploads/${uniqueFilename}`);
    }

    return NextResponse.json({ success: true, url: uploadedUrls[0], urls: uploadedUrls, count: uploadedUrls.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dosya yüklenirken hata." }, { status: 500 });
  }
}
