import { prisma } from "@/lib/prisma";
import { itemSchema, type ItemFormData } from "@/lib/validations";
import { generateSlug, calcTotalCost } from "@/lib/utils";
import { SKU_PREFIX_MAP } from "@/lib/constants";
import { CATEGORIES, DESIGNER_SERIES, CONDITION_GRADES, ITEM_STATUS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageInput {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ItemFilters {
  status?: string;
  designer?: string;
  category?: string;
  q?: string;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate next SKU code based on designer series.
 * Format: {PREFIX}-{NNN}, e.g. PJ-001, EM-012, GD-001
 * GD = 旧地 (default prefix when no designer series)
 */
async function generateSkuCode(designerSeries?: string): Promise<string> {
  const prefix = (designerSeries && SKU_PREFIX_MAP[designerSeries]) || "GD";

  const existing = await prisma.item.findMany({
    where: { skuCode: { startsWith: `${prefix}-` } },
    select: { skuCode: true },
    orderBy: { skuCode: "desc" },
  });

  let maxNum = 0;
  for (const item of existing) {
    const num = parseInt(item.skuCode.slice(prefix.length + 1), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }

  return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listItems(filters?: ItemFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.designer) {
    where.designerSeries = filters.designer;
  }
  if (filters?.category) {
    where.product = { category: filters.category };
  }
  if (filters?.q) {
    const q = filters.q;
    where.OR = [
      { skuCode: { contains: q } },
      { name: { contains: q } },
      { nameEn: { contains: q } },
    ];
  }

  const limit = filters?.limit ?? 100;

  return prisma.item.findMany({
    where,
    orderBy: { skuCode: "asc" },
    take: limit,
    include: {
      product: { select: { nameZh: true } },
      supplier: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
}

export async function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, nameZh: true } },
      supplier: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getProductOptions() {
  return prisma.product.findMany({
    select: { id: true, nameZh: true, nameEn: true },
    orderBy: { nameZh: "asc" },
  });
}

export async function getSupplierOptions() {
  return prisma.supplier.findMany({
    select: { id: true, name: true },
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function createItemService(data: ItemFormData, images?: ImageInput[]) {
  const parsed = itemSchema.parse(data);

  // Auto-calc total cost
  const totalCost = calcTotalCost(parsed);

  // Generate unique slug
  const nameForSlug = parsed.nameEn || parsed.name;
  const existingSlugs = (await prisma.item.findMany({ select: { slug: true } })).map((i) => i.slug);
  const slug = generateSlug(nameForSlug, existingSlugs);

  // Generate SKU code
  const skuCode = await generateSkuCode(parsed.designerSeries);

  const item = await prisma.item.create({
    data: {
      ...parsed,
      totalCost,
      slug,
      skuCode,
    },
    include: {
      product: { select: { id: true, nameZh: true } },
      supplier: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Save images
  if (images && images.length > 0) {
    await prisma.itemImage.createMany({
      data: images.map((img, i) => ({
        itemId: item.id,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder ?? i,
      })),
    });
  }

  return item;
}

export async function updateItemService(id: string, data: ItemFormData, images?: ImageInput[]) {
  const parsed = itemSchema.parse(data);

  // Auto-calc total cost
  const totalCost = calcTotalCost(parsed);

  // Generate unique slug
  const nameForSlug = parsed.nameEn || parsed.name;
  const existingSlugs = (
    await prisma.item.findMany({
      where: { id: { not: id } },
      select: { slug: true },
    })
  ).map((i) => i.slug);
  const slug = generateSlug(nameForSlug, existingSlugs);

  const item = await prisma.item.update({
    where: { id },
    data: { ...parsed, totalCost, slug },
    include: {
      product: { select: { id: true, nameZh: true } },
      supplier: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Replace images
  if (images) {
    await prisma.itemImage.deleteMany({ where: { itemId: id } });
    if (images.length > 0) {
      await prisma.itemImage.createMany({
        data: images.map((img, i) => ({
          itemId: id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder ?? i,
        })),
      });
    }
  }

  return item;
}

export async function deleteItemService(id: string) {
  const item = await prisma.item.delete({
    where: { id },
    select: { id: true, skuCode: true, name: true },
  });
  return item;
}

export async function getItemOptions() {
  const [products, suppliers] = await Promise.all([getProductOptions(), getSupplierOptions()]);

  return {
    products,
    suppliers,
    categories: CATEGORIES,
    designerSeries: DESIGNER_SERIES,
    conditionGrades: CONDITION_GRADES,
    statuses: ITEM_STATUS,
  };
}
