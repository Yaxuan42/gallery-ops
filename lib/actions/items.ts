"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as itemService from "@/lib/services/items";
import type { ItemFormData } from "@/lib/validations";
import type { ImageInput } from "@/lib/services/items";

export async function getItems() {
  return itemService.listItems();
}

export async function getItem(id: string) {
  return itemService.getItemById(id);
}

export async function getProductOptions() {
  return itemService.getProductOptions();
}

export async function getSupplierOptions() {
  return itemService.getSupplierOptions();
}

export async function createItem(data: ItemFormData, images: ImageInput[]) {
  try {
    await itemService.createItemService(data, images);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "创建库存失败";
    return { error: message };
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

export async function updateItem(id: string, data: ItemFormData, images: ImageInput[]) {
  try {
    await itemService.updateItemService(id, data, images);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "更新库存失败";
    return { error: message };
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

export async function deleteItem(id: string) {
  try {
    await itemService.deleteItemService(id);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "删除库存失败";
    return { error: message };
  }
  revalidatePath("/admin/inventory");
  return { success: true };
}
