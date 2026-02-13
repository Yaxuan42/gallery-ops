import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getOrderById, updateOrderService, deleteOrderService } from "@/lib/services/sales-orders";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: order });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const order = await updateOrderService(id, body);
    return NextResponse.json({ data: order });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const result = await deleteOrderService(id);
    return NextResponse.json({ data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
