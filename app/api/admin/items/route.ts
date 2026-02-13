import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { listItems, createItemService } from "@/lib/services/items";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { searchParams } = request.nextUrl;
  const filters = {
    status: searchParams.get("status") || undefined,
    designer: searchParams.get("designer") || undefined,
    category: searchParams.get("category") || undefined,
    q: searchParams.get("q") || undefined,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
  };

  try {
    const items = await listItems(filters);
    return NextResponse.json({ data: items, total: items.length });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const item = await createItemService(body, []);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
