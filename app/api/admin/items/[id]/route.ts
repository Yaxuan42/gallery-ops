import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getItemById, updateItemService, deleteItemService } from "@/lib/services/items";
import { type ItemFormData } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    const item = await getItemById(id);
    if (!item) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  } catch (e) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    // Fetch existing item to support partial updates
    const existing = await getItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    const body = await request.json();

    // Merge incoming data with existing fields for partial update
    const merged: ItemFormData = {
      name: body.name ?? existing.name,
      nameEn: body.nameEn ?? existing.nameEn ?? undefined,
      recommendation: body.recommendation ?? existing.recommendation ?? undefined,
      notes: body.notes ?? existing.notes ?? undefined,
      productId: body.productId ?? existing.productId ?? undefined,
      designerSeries: body.designerSeries ?? existing.designerSeries ?? undefined,
      manufacturer: body.manufacturer ?? existing.manufacturer ?? undefined,
      era: body.era ?? existing.era ?? undefined,
      material: body.material ?? existing.material ?? undefined,
      dimensions: body.dimensions ?? existing.dimensions ?? undefined,
      conditionGrade: body.conditionGrade ?? existing.conditionGrade ?? undefined,
      supplierId: body.supplierId ?? existing.supplierId ?? undefined,
      listPrice: body.listPrice ?? existing.listPrice ?? undefined,
      sellingPrice: body.sellingPrice ?? existing.sellingPrice ?? undefined,
      shippingCostUsd: body.shippingCostUsd ?? existing.shippingCostUsd ?? undefined,
      shippingCostRmb: body.shippingCostRmb ?? existing.shippingCostRmb ?? undefined,
      customsFees: body.customsFees ?? existing.customsFees ?? undefined,
      importDuties: body.importDuties ?? existing.importDuties ?? undefined,
      purchasePriceUsd: body.purchasePriceUsd ?? existing.purchasePriceUsd ?? undefined,
      purchasePriceRmb: body.purchasePriceRmb ?? existing.purchasePriceRmb ?? undefined,
      status: body.status ?? existing.status ?? undefined,
      showOnWebsite: body.showOnWebsite ?? existing.showOnWebsite ?? undefined,
    };

    const item = await updateItemService(id, merged, []);
    return NextResponse.json({ data: item });
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
    const deleted = await deleteItemService(id);
    return NextResponse.json({ data: deleted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
