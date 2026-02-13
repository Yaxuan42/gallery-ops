import { getDashboardStats, getRecentOrders } from "@/lib/actions/dashboard";
import { StatsCards } from "@/components/admin/dashboard/stats-cards";
import { RecentOrders } from "@/components/admin/dashboard/recent-orders";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()]);

  return (
    <AdminPageLayout
      hint={{
        title: "操作指南",
        items: [
          "顶部统计卡片展示本月营收、毛利、库存和客户数",
          "近期订单表格显示最新10笔销售记录",
          "点击订单号可跳转到订单详情页编辑",
          "数据会在每次页面加载时自动刷新",
        ],
      }}
    >
      <div className="space-y-6">
        <h1 className="text-[28px] font-semibold text-[#202124]">仪表盘</h1>
        <StatsCards
          monthlyRevenue={stats.monthlyRevenue}
          totalGrossProfit={stats.totalGrossProfit}
          inStockCount={stats.inStockCount}
          customerCount={stats.customerCount}
        />
        <RecentOrders orders={recentOrders} />
      </div>
    </AdminPageLayout>
  );
}
