"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as customerService from "@/lib/services/customers";
import type { CustomerFormData } from "@/lib/validations";

export async function getCustomers() {
  return customerService.listCustomers();
}

export async function getCustomer(id: string) {
  return customerService.getCustomerById(id);
}

export async function getCustomerOptions() {
  return customerService.getCustomerOptions();
}

export async function createCustomer(data: CustomerFormData) {
  try {
    await customerService.createCustomerService(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "创建客户失败";
    return { error: message };
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(id: string, data: CustomerFormData) {
  try {
    await customerService.updateCustomerService(id, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "更新客户失败";
    return { error: message };
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string) {
  try {
    await customerService.deleteCustomerService(id);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "删除客户失败";
    return { error: message };
  }
  revalidatePath("/admin/customers");
  return { success: true };
}
