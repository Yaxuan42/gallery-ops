import { prisma } from "@/lib/prisma";
import { productSchema, type ProductFormData } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageInput {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { items: true } },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createProductService(data: ProductFormData, images?: ImageInput[]) {
  const parsed = productSchema.parse(data);

  // Generate unique slug
  const existingSlugs = (await prisma.product.findMany({ select: { slug: true } })).map(
    (p) => p.slug,
  );
  const slug = generateSlug(parsed.nameEn, existingSlugs);

  const product = await prisma.product.create({
    data: {
      ...parsed,
      slug,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { items: true } },
    },
  });

  // Save images
  if (images && images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((img, i) => ({
        productId: product.id,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder ?? i,
      })),
    });
  }

  return product;
}

export async function updateProductService(
  id: string,
  data: ProductFormData,
  images?: ImageInput[],
) {
  const parsed = productSchema.parse(data);

  // Generate unique slug (excluding current product)
  const existingSlugs = (
    await prisma.product.findMany({
      where: { id: { not: id } },
      select: { slug: true },
    })
  ).map((p) => p.slug);
  const slug = generateSlug(parsed.nameEn, existingSlugs);

  const product = await prisma.product.update({
    where: { id },
    data: { ...parsed, slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { items: true } },
    },
  });

  // Replace images
  if (images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img, i) => ({
          productId: id,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder ?? i,
        })),
      });
    }
  }

  return product;
}

export async function deleteProductService(id: string) {
  const product = await prisma.product.delete({
    where: { id },
    select: { id: true, nameZh: true, nameEn: true },
  });
  return product;
}
