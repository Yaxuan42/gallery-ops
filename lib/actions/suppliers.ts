"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as supplierService from "@/lib/services/suppliers";
import type { SupplierFormData } from "@/lib/validations";

export async function getSuppliers() {
  return supplierService.listSuppliers();
}

export async function getSupplier(id: string) {
  return supplierService.getSupplierById(id);
}

export async function createSupplier(data: SupplierFormData) {
  try {
    await supplierService.createSupplierService(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "创建供应商失败";
    return { error: message };
  }
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  try {
    await supplierService.updateSupplierService(id, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "更新供应商失败";
    return { error: message };
  }
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function deleteSupplier(id: string) {
  try {
    await supplierService.deleteSupplierService(id);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "删除供应商失败";
    return { error: message };
  }
  revalidatePath("/admin/suppliers");
  return { success: true };
}
