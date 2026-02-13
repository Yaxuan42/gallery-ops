import { prisma } from "@/lib/prisma";
export {
  DESIGNER_SLUG_MAP,
  DESIGNER_SERIES_TO_SLUG,
  DESIGNER_DISPLAY_NAMES,
} from "@/lib/designers";

export async function getHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFeaturedItems(limit = 8) {
  return prisma.item.findMany({
    where: {
      showOnWebsite: true,
      product: { featured: true },
    },
    include: {
      product: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    take: limit,
  });
}

export async function getCollectionItems({
  category,
  designer,
  status,
  page = 1,
  pageSize = 24,
}: {
  category?: string;
  designer?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const where: Record<string, unknown> = {
    showOnWebsite: true,
  };

  if (category) {
    where.product = { category };
  }

  if (designer) {
    // Designer filter can be a designerSeries value
    if (where.product) {
      (where.product as Record<string, unknown>).designerSeries = designer;
    } else {
      where.product = { designerSeries: designer };
    }
  }

  if (status === "available") {
    where.status = { in: ["IN_STOCK", "IN_TRANSIT"] };
  } else if (status === "sold") {
    where.status = "SOLD";
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: {
        product: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.item.count({ where }),
  ]);

  return { items, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getItemBySlug(slug: string) {
  return prisma.item.findUnique({
    where: { slug },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" } } },
      },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedItems(
  itemId: string,
  designerSeries?: string | null,
  category?: string,
  limit = 4,
) {
  const where: Record<string, unknown> = {
    showOnWebsite: true,
    id: { not: itemId },
  };

  if (designerSeries) {
    where.product = { designerSeries };
  } else if (category) {
    where.product = { category };
  }

  return prisma.item.findMany({
    where,
    include: {
      product: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    take: limit,
  });
}

export async function getDesignerItems(designerSeries: string) {
  return prisma.item.findMany({
    where: {
      showOnWebsite: true,
      product: { designerSeries },
    },
    include: {
      product: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFilterOptions() {
  const [categories, designers] = await Promise.all([
    prisma.product.findMany({
      where: { items: { some: { showOnWebsite: true } } },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.product.findMany({
      where: {
        designerSeries: { not: null },
        items: { some: { showOnWebsite: true } },
      },
      select: { designerSeries: true },
      distinct: ["designerSeries"],
    }),
  ]);

  return {
    categories: categories.map((c) => c.category),
    designers: designers.map((d) => d.designerSeries).filter((d): d is string => d !== null),
  };
}

export async function getAllWebsiteItemSlugs() {
  return prisma.item.findMany({
    where: { showOnWebsite: true },
    select: { slug: true, updatedAt: true },
  });
}
