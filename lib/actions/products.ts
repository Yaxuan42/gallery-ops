"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as productService from "@/lib/services/products";
import type { ProductFormData } from "@/lib/validations";
import type { ImageInput } from "@/lib/services/products";

export async function getProducts() {
  return productService.listProducts();
}

export async function getProduct(id: string) {
  return productService.getProductById(id);
}

export async function createProduct(data: ProductFormData, images: ImageInput[]) {
  try {
    await productService.createProductService(data, images);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "创建商品失败";
    return { error: message };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, data: ProductFormData, images: ImageInput[]) {
  try {
    await productService.updateProductService(id, data, images);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "更新商品失败";
    return { error: message };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  try {
    await productService.deleteProductService(id);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "删除商品失败";
    return { error: message };
  }
  revalidatePath("/admin/products");
  return { success: true };
}
