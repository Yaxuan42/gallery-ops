"use server";

import * as dashboardService from "@/lib/services/dashboard";

export async function getDashboardStats() {
  return dashboardService.getDashboardStatsService();
}

export async function getRecentOrders() {
  return dashboardService.getRecentOrdersService();
}
