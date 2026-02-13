import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { listSuppliers, createSupplierService } from "@/lib/services/suppliers";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const suppliers = await listSuppliers();
    return NextResponse.json({ data: suppliers, total: suppliers.length });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const supplier = await createSupplierService(body);
    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
