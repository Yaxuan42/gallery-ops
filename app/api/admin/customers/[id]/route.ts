import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import {
  getCustomerById,
  updateCustomerService,
  deleteCustomerService,
} from "@/lib/services/customers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const customer = await getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: "客户不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: customer });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const existing = await getCustomerById(id);
    if (!existing) {
      return NextResponse.json({ error: "客户不存在" }, { status: 404 });
    }
    const body = await request.json();
    const merged = {
      name: existing.name,
      type: existing.type ?? undefined,
      source: existing.source ?? undefined,
      phone: existing.phone ?? undefined,
      email: existing.email ?? undefined,
      wechat: existing.wechat ?? undefined,
      address: existing.address ?? undefined,
      notes: existing.notes ?? undefined,
      ...body,
    };
    const customer = await updateCustomerService(id, merged);
    return NextResponse.json({ data: customer });
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
  try {
    const { id } = await params;
    const customer = await deleteCustomerService(id);
    return NextResponse.json({ data: customer });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
