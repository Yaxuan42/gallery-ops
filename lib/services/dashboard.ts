import { prisma } from "@/lib/prisma";

export async function getDashboardStatsService() {
  // Current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [monthlyOrders, allOrders, inStockCount, customerCount] = await Promise.all([
    // Monthly revenue: sum of totalAmount where orderDate is current month
    prisma.salesOrder.findMany({
      where: {
        orderDate: { gte: monthStart, lte: monthEnd },
        status: { not: "CANCELLED" },
      },
      select: { totalAmount: true },
    }),
    // All-time gross profit
    prisma.salesOrder.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { grossProfit: true },
    }),
    // In-stock count
    prisma.item.count({ where: { status: "IN_STOCK" } }),
    // Customer count
    prisma.customer.count(),
  ]);

  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalGrossProfit = allOrders.reduce((sum, o) => sum + o.grossProfit, 0);

  return {
    monthlyRevenue,
    totalGrossProfit,
    inStockCount,
    customerCount,
  };
}

export async function getRecentOrdersService() {
  return prisma.salesOrder.findMany({
    take: 10,
    orderBy: { orderDate: "desc" },
    include: {
      customer: { select: { name: true } },
    },
  });
}
