import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import {
  getProductById,
  updateProductService,
  deleteProductService,
} from "@/lib/services/products";
import { type ProductFormData } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    // Fetch existing product to support partial updates
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    const body = await request.json();

    // Merge incoming data with existing fields for partial update
    const merged: ProductFormData = {
      nameZh: body.nameZh ?? existing.nameZh,
      nameEn: body.nameEn ?? existing.nameEn,
      category: body.category ?? existing.category,
      subcategory: body.subcategory ?? existing.subcategory ?? undefined,
      model: body.model ?? existing.model ?? undefined,
      descriptionZh: body.descriptionZh ?? existing.descriptionZh ?? undefined,
      descriptionEn: body.descriptionEn ?? existing.descriptionEn ?? undefined,
      designer: body.designer ?? existing.designer ?? undefined,
      designerSeries: body.designerSeries ?? existing.designerSeries ?? undefined,
      priceRangeLow: body.priceRangeLow ?? existing.priceRangeLow ?? undefined,
      priceRangeHigh: body.priceRangeHigh ?? existing.priceRangeHigh ?? undefined,
      collectionValue: body.collectionValue ?? existing.collectionValue ?? undefined,
      featured: body.featured ?? existing.featured ?? undefined,
    };

    const product = await updateProductService(id, merged, []);
    return NextResponse.json({ data: product });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    const deleted = await deleteProductService(id);
    return NextResponse.json({ data: deleted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
