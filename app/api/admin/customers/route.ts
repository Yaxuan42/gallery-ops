import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { listCustomers, createCustomerService } from "@/lib/services/customers";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const customers = await listCustomers();
    return NextResponse.json({ data: customers, total: customers.length });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const customer = await createCustomerService(body);
    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
