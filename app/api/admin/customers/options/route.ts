import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getCustomerOptions } from "@/lib/services/customers";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  try {
    const options = await getCustomerOptions();
    return NextResponse.json({ data: options });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
