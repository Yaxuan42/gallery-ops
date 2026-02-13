"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as orderService from "@/lib/services/sales-orders";
import type { SalesOrderFormData } from "@/lib/validations";

export async function getSalesOrders() {
  return orderService.listOrders();
}

export async function getSalesOrder(id: string) {
  return orderService.getOrderById(id);
}

export async function getAvailableItems() {
  return orderService.getAvailableItems();
}

export async function getNewOrderNumber() {
  return orderService.getNextOrderNumber();
}

export async function createSalesOrder(data: SalesOrderFormData) {
  try {
    await orderService.createOrderService(data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "创建订单失败" };
  }
  revalidatePath("/admin/sales-orders");
  revalidatePath("/admin/inventory");
  redirect("/admin/sales-orders");
}

export async function updateSalesOrder(id: string, data: SalesOrderFormData) {
  try {
    await orderService.updateOrderService(id, data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "更新订单失败" };
  }
  revalidatePath("/admin/sales-orders");
  revalidatePath("/admin/inventory");
  redirect("/admin/sales-orders");
}

export async function deleteSalesOrder(id: string) {
  try {
    await orderService.deleteOrderService(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "删除订单失败" };
  }
  revalidatePath("/admin/sales-orders");
  revalidatePath("/admin/inventory");
  return { success: true };
}
