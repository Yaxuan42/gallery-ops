import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getAvailableItems } from "@/lib/services/sales-orders";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const items = await getAvailableItems();
    return NextResponse.json({ data: items, total: items.length });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
