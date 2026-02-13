import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import {
  getSupplierById,
  updateSupplierService,
  deleteSupplierService,
} from "@/lib/services/suppliers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const supplier = await getSupplierById(id);
    if (!supplier) {
      return NextResponse.json({ error: "供应商不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: supplier });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const existing = await getSupplierById(id);
    if (!existing) {
      return NextResponse.json({ error: "供应商不存在" }, { status: 404 });
    }
    const body = await request.json();
    const merged = {
      name: existing.name,
      code: existing.code ?? undefined,
      country: existing.country,
      contactName: existing.contactName ?? undefined,
      email: existing.email ?? undefined,
      phone: existing.phone ?? undefined,
      wechat: existing.wechat ?? undefined,
      address: existing.address ?? undefined,
      status: existing.status ?? undefined,
      tags: existing.tags ?? undefined,
      notes: existing.notes ?? undefined,
      ...body,
    };
    const supplier = await updateSupplierService(id, merged);
    return NextResponse.json({ data: supplier });
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
    const supplier = await deleteSupplierService(id);
    return NextResponse.json({ data: supplier });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
