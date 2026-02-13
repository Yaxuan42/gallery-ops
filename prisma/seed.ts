import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/gallery.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create admin user
  const passwordHash = await bcrypt.hash("Gallery2025!", 12);
  await prisma.user.upsert({
    where: { email: "admin@gallery.local" },
    update: {},
    create: {
      email: "admin@gallery.local",
      name: "Admin",
      passwordHash,
      role: "admin",
    },
  });
  console.log("Admin user created: admin@gallery.local / Gallery2025!");

  // 2. Create sample suppliers
  const supplierAarge = await prisma.supplier.upsert({
    where: { code: "AARGE" },
    update: {},
    create: {
      name: "Aarge Overseas",
      code: "AARGE",
      country: "印度",
      contactName: "Aarge",
      email: "aargeoverseas@gmail.com",
      phone: "+91-9465122668",
      status: "ACTIVE",
    },
  });
  console.log("Supplier created: Aarge Overseas");

  const supplierSK = await prisma.supplier.upsert({
    where: { code: "SK" },
    update: {},
    create: {
      name: "沈康",
      code: "SK",
      country: "美国",
      contactName: "沈康",
      status: "ACTIVE",
    },
  });
  console.log("Supplier created: 沈康");

  // 3. Create sample products (SPU)
  const productPJChair = await prisma.product.upsert({
    where: { slug: "pj-office-chair" },
    update: {},
    create: {
      nameZh: "PJ办公椅",
      nameEn: "PJ Office Chair",
      category: "椅子",
      subcategory: "办公椅",
      designer: "Pierre Jeanneret",
      designerSeries: "昌迪加尔",
      slug: "pj-office-chair",
      featured: true,
    },
  });

  const productKangaroo = await prisma.product.upsert({
    where: { slug: "kangaroo-chair" },
    update: {},
    create: {
      nameZh: "袋鼠椅",
      nameEn: "Kangaroo Chair",
      category: "椅子",
      subcategory: "休闲椅",
      designer: "Pierre Jeanneret",
      designerSeries: "昌迪加尔",
      slug: "kangaroo-chair",
      featured: true,
    },
  });

  const productLibTable = await prisma.product.upsert({
    where: { slug: "pj-library-table" },
    update: {},
    create: {
      nameZh: "PJ图书馆桌",
      nameEn: "PJ Library Table",
      category: "桌子",
      designer: "Pierre Jeanneret",
      designerSeries: "昌迪加尔",
      slug: "pj-library-table",
      featured: true,
    },
  });
  console.log("Sample products created");

  // 4. Create sample items (SKU)
  await prisma.item.upsert({
    where: { slug: "pj-office-chair-001" },
    update: {},
    create: {
      skuCode: "PJ-001",
      name: "PJ办公椅 #001",
      nameEn: "PJ Office Chair #001",
      productId: productPJChair.id,
      supplierId: supplierAarge.id,
      designerSeries: "昌迪加尔",
      material: "柚木 + 藤编",
      era: "1955-1960",
      conditionGrade: "B",
      listPrice: 38000,
      purchasePriceUsd: 5600,
      totalCost: 15000,
      status: "IN_STOCK",
      showOnWebsite: true,
      slug: "pj-office-chair-001",
    },
  });

  await prisma.item.upsert({
    where: { slug: "kangaroo-chair-001" },
    update: {},
    create: {
      skuCode: "PJ-002",
      name: "袋鼠椅 #001",
      nameEn: "Kangaroo Chair #001",
      productId: productKangaroo.id,
      supplierId: supplierAarge.id,
      designerSeries: "昌迪加尔",
      material: "柚木 + 藤编",
      era: "1955-1960",
      conditionGrade: "A",
      listPrice: 65000,
      purchasePriceUsd: 8000,
      totalCost: 25000,
      status: "IN_STOCK",
      showOnWebsite: true,
      slug: "kangaroo-chair-001",
    },
  });

  await prisma.item.upsert({
    where: { slug: "pj-library-table-001" },
    update: {},
    create: {
      skuCode: "PJ-003",
      name: "PJ图书馆桌 #001",
      nameEn: "PJ Library Table #001",
      productId: productLibTable.id,
      supplierId: supplierAarge.id,
      designerSeries: "昌迪加尔",
      material: "柚木",
      dimensions: "245x138.5x75cm",
      conditionGrade: "B",
      listPrice: 120000,
      purchasePriceUsd: 17000,
      totalCost: 55000,
      status: "IN_STOCK",
      showOnWebsite: true,
      slug: "pj-library-table-001",
    },
  });
  console.log("Sample items created");

  // 5. Create sample customer
  await prisma.customer.upsert({
    where: { id: "sample-customer-1" },
    update: {},
    create: {
      id: "sample-customer-1",
      name: "张三",
      type: "INDIVIDUAL",
      source: "小红书",
      phone: "13800138000",
      wechat: "zhangsan_wx",
    },
  });
  console.log("Sample customer created");

  // 6. Create hero slide (placeholder)
  await prisma.heroSlide.upsert({
    where: { id: "hero-1" },
    update: {},
    create: {
      id: "hero-1",
      imageUrl: "/uploads/hero/placeholder-1.webp",
      titleZh: "探索中古家具之美",
      titleEn: "Discover Vintage Furniture",
      sortOrder: 0,
      active: true,
    },
  });
  console.log("Hero slides created");

  console.log("\nSeed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
