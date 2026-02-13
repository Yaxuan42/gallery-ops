import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getDashboardStatsService, getRecentOrdersService } from "@/lib/services/dashboard";

export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { searchParams } = request.nextUrl;
  const section = searchParams.get("section");

  try {
    if (section === "stats") {
      const stats = await getDashboardStatsService();
      return NextResponse.json({ data: stats });
    }
    if (section === "recent-orders") {
      const orders = await getRecentOrdersService();
      return NextResponse.json({ data: orders });
    }
    // Default: return both
    const [stats, recentOrders] = await Promise.all([
      getDashboardStatsService(),
      getRecentOrdersService(),
    ]);
    return NextResponse.json({ data: { stats, recentOrders } });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
