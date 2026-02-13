import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getNextOrderNumber } from "@/lib/services/sales-orders";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const orderNumber = await getNextOrderNumber();
    return NextResponse.json({ data: orderNumber });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
