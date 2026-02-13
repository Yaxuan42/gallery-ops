import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { listOrders, createOrderService, getNextOrderNumber } from "@/lib/services/sales-orders";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const orders = await listOrders();
    return NextResponse.json({ data: orders, total: orders.length });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    // Auto-fill orderNumber if not provided
    if (!body.orderNumber) {
      body.orderNumber = await getNextOrderNumber();
    }
    const order = await createOrderService(body);
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
