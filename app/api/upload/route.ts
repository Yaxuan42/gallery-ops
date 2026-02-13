import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const SIZES = {
  thumb: { width: 300, height: 300 },
  medium: { width: 800, height: 800 },
  full: { width: 1600, height: 1600 },
} as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const entity = formData.get("entity") as string; // "products" | "items"
  const entityId = formData.get("entityId") as string;

  if (!file || !entity || !entityId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const dir = path.join(process.cwd(), "public", "uploads", entity, entityId);
  await mkdir(dir, { recursive: true });

  const urls: Record<string, string> = {};

  for (const [sizeName, dims] of Object.entries(SIZES)) {
    const filename = `${timestamp}-${sizeName}.webp`;
    const filepath = path.join(dir, filename);

    await sharp(buffer)
      .resize(dims.width, dims.height, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    urls[sizeName] = `/uploads/${entity}/${entityId}/${filename}`;
  }

  return NextResponse.json({
    url: urls.full,
    thumb: urls.thumb,
    medium: urls.medium,
    full: urls.full,
  });
}
