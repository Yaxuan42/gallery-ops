/**
 * Import gallery-attic.com data as test data for Gallery-Ops development.
 * Downloads images and creates database records.
 *
 * Usage: npx tsx scripts/import-gallery-data.ts
 */
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/gallery.db",
});
const prisma = new PrismaClient({ adapter });

const CDN = "https://cdn.prod.website-files.com/65ded96743e9f4d78bb749d2";

// ─── Image processing ───────────────────────────────────────────────
const SIZES = {
  thumb: { width: 300, height: 300 },
  medium: { width: 800, height: 800 },
  full: { width: 1600, height: 1600 },
} as const;

async function downloadAndProcess(
  imageUrl: string,
  entity: string,
  entityId: string,
  index: number,
): Promise<{ thumb: string; medium: string; full: string }> {
  const dir = path.join(process.cwd(), "public", "uploads", entity, entityId);
  await mkdir(dir, { recursive: true });

  const res = await fetch(imageUrl);
  if (!res.ok) {
    console.error(`  Failed to download: ${imageUrl} (${res.status})`);
    throw new Error(`Download failed: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const timestamp = Date.now() + index;
  const urls: Record<string, string> = {};

  for (const [sizeName, dims] of Object.entries(SIZES)) {
    const filename = `${timestamp}-${sizeName}.webp`;
    const filepath = path.join(dir, filename);
    await sharp(buffer)
      .resize(dims.width, dims.height, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);
    urls[sizeName] = `/uploads/${entity}/${entityId}/${filename}`;
  }

  return urls as { thumb: string; medium: string; full: string };
}

// ─── Data definitions ───────────────────────────────────────────────

interface ProductDef {
  nameZh: string;
  nameEn: string;
  category: string;
  subcategory?: string;
  designer: string;
  designerSeries: string;
  slug: string;
  featured: boolean;
  descriptionZh?: string;
  descriptionEn?: string;
}

interface ItemDef {
  name: string;
  nameEn: string;
  productSlug: string;
  material: string;
  era: string;
  dimensions?: string;
  conditionGrade: string;
  listPrice: number;
  purchasePriceUsd?: number;
  totalCost?: number;
  status: string;
  showOnWebsite: boolean;
  slug: string;
  imageUrls: string[];
  notes?: string;
}

// ─── Products (SPU) ─────────────────────────────────────────────────

const products: ProductDef[] = [
  {
    nameZh: "Easy Chair 简易椅",
    nameEn: "Easy Chair",
    category: "椅子",
    subcategory: "休闲椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-easy-chair",
    featured: true,
    descriptionZh:
      "Pierre Jeanneret 为昌迪加尔项目设计的经典简易椅，采用实木框架与藤编座面，展现了现代主义与印度传统工艺的完美结合。",
    descriptionEn:
      "An iconic Easy Chair designed by Pierre Jeanneret for the Chandigarh project, featuring a solid wood frame with cane upholstery that merges modernist design with traditional Indian craftsmanship.",
  },
  {
    nameZh: "袋鼠椅",
    nameEn: "Kangaroo Chair",
    category: "椅子",
    subcategory: "休闲椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-kangaroo-chair",
    featured: true,
    descriptionZh:
      "以其独特的前倾姿态命名的袋鼠椅，是昌迪加尔系列中最具辨识度的作品之一。玫瑰木框架搭配竹编藤面。",
    descriptionEn:
      "Named after its distinctive forward-leaning posture, the Kangaroo Chair is one of the most recognizable pieces from the Chandigarh collection. Rosewood frame with bamboo rattan.",
  },
  {
    nameZh: "图书馆椅",
    nameEn: "Library Chair",
    category: "椅子",
    subcategory: "办公椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-library-chair",
    featured: true,
    descriptionZh: "为昌迪加尔公共图书馆设计的扶手椅，柚木框架，背部和座面采用竹编藤面。",
    descriptionEn:
      "Designed for the Chandigarh public libraries, this armchair features a teak frame with bamboo rattan back and seat.",
  },
  {
    nameZh: "绳编椅",
    nameEn: "Rope Chair",
    category: "椅子",
    subcategory: "休闲椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-rope-chair",
    featured: true,
    descriptionZh: "早期昌迪加尔作品，座面和靠背采用棉绳编织，柚木框架，约1953-54年制造。",
    descriptionEn:
      "An early Chandigarh piece with cotton rope upholstery on the back and seat, teak frame, circa 1953-54.",
  },
  {
    nameZh: "X脚办公椅",
    nameEn: "X-leg Office Chair",
    category: "椅子",
    subcategory: "办公椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-x-leg-office-chair",
    featured: false,
    descriptionZh: "独特的X形腿部设计，为昌迪加尔行政办公楼设计，藤编座面与靠背。",
    descriptionEn:
      "Distinctive X-shaped leg design, created for the Chandigarh administrative buildings, with cane seat and back.",
  },
  {
    nameZh: "高等法院三段式办公桌",
    nameEn: "High Court 3-Part Desk",
    category: "桌子",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-high-court-desk",
    featured: true,
    descriptionZh:
      "为昌迪加尔高等法院设计的大型三段式办公桌，全柚木制作，带有HC标记（High Court）。",
    descriptionEn:
      "A large 3-part desk designed for the Chandigarh High Court, made entirely of teak wood, with HC markings.",
  },
  {
    nameZh: "5孔木箱",
    nameEn: "5-Hole Wood Box",
    category: "收纳",
    designer: "Le Corbusier",
    designerSeries: "昌迪加尔",
    slug: "lc-5-hole-wood-box",
    featured: false,
    descriptionZh: "Le Corbusier 为昌迪加尔私人住宅设计的柚木收纳盒，5格设计，约1959年制造。",
    descriptionEn:
      "A teak storage box designed by Le Corbusier for private homes in Chandigarh, 5-compartment design, circa 1959.",
  },
  {
    nameZh: "Bridge 扶手椅",
    nameEn: "Bridge Armchair",
    category: "椅子",
    subcategory: "休闲椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-bridge-armchair",
    featured: false,
  },
  {
    nameZh: "Connect Back 椅",
    nameEn: "Connect Back Chair",
    category: "椅子",
    subcategory: "办公椅",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-connect-back-chair",
    featured: false,
  },
  {
    nameZh: "圆形藤编低凳",
    nameEn: "Round Rattan Low Stool",
    category: "凳子",
    designer: "Pierre Jeanneret",
    designerSeries: "昌迪加尔",
    slug: "pj-round-rattan-stool",
    featured: false,
  },
  {
    nameZh: "S31A 凳",
    nameEn: "S31A Stool",
    category: "凳子",
    designer: "Pierre Chapo",
    designerSeries: "Pierre Chapo",
    slug: "pc-s31a-stool",
    featured: true,
    descriptionZh: "Pierre Chapo 经典的三角形榫卯结构凳子，榆木制作，展现了法国手工艺传统。",
    descriptionEn:
      "Pierre Chapo's iconic triangular mortise-and-tenon stool, crafted in elm wood, showcasing French artisanal tradition.",
  },
  {
    nameZh: "CP1 壁灯",
    nameEn: "CP1 Wall Lamp",
    category: "灯具",
    designer: "Charlotte Perriand",
    designerSeries: "Charlotte Perriand",
    slug: "cp-cp1-wall-lamp",
    featured: true,
    descriptionZh: "Charlotte Perriand 为 Les Arcs 滑雪度假村设计的经典壁灯，铝合金旋转灯罩。",
    descriptionEn:
      "Charlotte Perriand's classic wall lamp designed for the Les Arcs ski resort, featuring a rotating aluminum shade.",
  },
  {
    nameZh: "Meribel 椅",
    nameEn: "Meribel Chair",
    category: "椅子",
    subcategory: "休闲椅",
    designer: "Charlotte Perriand",
    designerSeries: "Charlotte Perriand",
    slug: "cp-meribel-chair",
    featured: false,
  },
  {
    nameZh: "SCAL 日光床",
    nameEn: "SCAL Daybed",
    category: "沙发",
    designer: "Jean Prouve",
    designerSeries: "Jean Prouve",
    slug: "jp-scal-daybed",
    featured: true,
    descriptionZh: "Jean Prouvé 设计的 SCAL 系列日光床，折叠钢管框架，可作为沙发或单人床使用。",
    descriptionEn:
      "Jean Prouvé's SCAL series daybed, with a folding tubular steel frame, usable as both a sofa and a single bed.",
  },
  {
    nameZh: "Demountable 椅 n°300",
    nameEn: "Demountable Chair n°300",
    category: "椅子",
    subcategory: "休闲椅",
    designer: "Jean Prouve",
    designerSeries: "Jean Prouve",
    slug: "jp-demountable-chair-300",
    featured: false,
  },
];

// ─── Items (SKU) ────────────────────────────────────────────────────

const items: ItemDef[] = [
  {
    name: "Easy Chair #001",
    nameEn: "Easy Chair #001",
    productSlug: "pj-easy-chair",
    material: "玫瑰木 + 竹编藤面",
    era: "1955-56",
    dimensions: "520×600×730mm (座高340mm)",
    conditionGrade: "B",
    listPrice: 968000,
    totalCost: 300000,
    status: "SOLD",
    showOnWebsite: true,
    slug: "easy-chair-001",
    notes: "参考编号 PJ-SI-29-A，含真品证书。靠背和座面由印度工匠用竹编藤重新编织。",
    imageUrls: [
      `${CDN}/6720541e55f6ba4491f65685_65e40cdc0eaee4f4819691c2_DSC03659.jpeg`,
      `${CDN}/6720541e55f6ba4491f65692_65e40ceeef2ca02703ec1139_DSC03661.jpeg`,
      `${CDN}/6720541e55f6ba4491f656ac_65e40cee9704da7eb2feb026_DSC03662.jpeg`,
      `${CDN}/6720541e55f6ba4491f65699_65e40cee685d8b7b5cccfe64_DSC03663.jpeg`,
    ],
  },
  {
    name: "Easy Chair #002",
    nameEn: "Easy Chair #002",
    productSlug: "pj-easy-chair",
    material: "玫瑰木 + 竹编藤面",
    era: "1955-56",
    dimensions: "520×600×730mm (座高340mm)",
    conditionGrade: "A",
    listPrice: 1080000,
    totalCost: 350000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "easy-chair-002",
    imageUrls: [
      `${CDN}/687df7690887d295332a78a9_687dc8ddb3514022bbf611d5_DSC03865.jpeg`,
      `${CDN}/6879bcdbec91cbe9a80abf3a_DSC03895.jpeg`,
    ],
  },
  {
    name: "袋鼠椅 #001",
    nameEn: "Kangaroo Chair #001",
    productSlug: "pj-kangaroo-chair",
    material: "玫瑰木 + 竹编藤面",
    era: "1955",
    dimensions: "515×635×620mm",
    conditionGrade: "A",
    listPrice: 1980000,
    totalCost: 600000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "kangaroo-chair-001",
    notes: "标记 CHD.ADMN.（昌迪加尔行政标记），含真品证书。",
    imageUrls: [
      `${CDN}/687df769f2b1d0411f866c21_6879e653d1da31483f3a0149_DSC02973.jpeg`,
      `${CDN}/687df769f2b1d0411f866c1d_6879e659b87361b5290a7ffe_DSC02975.jpeg`,
      `${CDN}/687df769f2b1d0411f866c2c_6879e659650abb9531515e85_DSC02976.jpeg`,
      `${CDN}/687df769f2b1d0411f866c29_6879e659751ae391220dcb10_DSC02977.jpeg`,
    ],
  },
  {
    name: "图书馆椅 #001",
    nameEn: "Library Chair #001",
    productSlug: "pj-library-chair",
    material: "柚木 + 竹编藤面",
    era: "1959-60",
    dimensions: "470×410×770mm",
    conditionGrade: "B",
    listPrice: 418000,
    totalCost: 130000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "library-chair-001",
    notes: "参考编号 PJ-010301，含真品证书。",
    imageUrls: [
      `${CDN}/6879ba164787a9b2107d8b1e_DSC02904.jpeg`,
      `${CDN}/6879ba161b176baeccb94439_DSC02905.jpeg`,
      `${CDN}/6879ba16b18142862f8d7376_DSC02906.jpeg`,
      `${CDN}/6879ba16269258d09e084a3c_DSC02907.jpeg`,
    ],
  },
  {
    name: "绳编椅 #001",
    nameEn: "Rope Chair #001",
    productSlug: "pj-rope-chair",
    material: "柚木 + 棉绳",
    era: "1953-54",
    dimensions: "550×590×730mm",
    conditionGrade: "A",
    listPrice: 1760000,
    totalCost: 550000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "rope-chair-001",
    notes: "参考编号 PJ-010611，早期昌迪加尔作品。",
    imageUrls: [
      `${CDN}/687df76a78879c739cf1f405_687dd01a459acab5f7f1beda_DSC03959.jpeg`,
      `${CDN}/687df76a78879c739cf1f40d_687dd027d5345897750dd9f1_DSC03960.jpeg`,
      `${CDN}/687df76a78879c739cf1f41f_687dd0274448b4471ce5d2b5_DSC03961.jpeg`,
      `${CDN}/687df76a78879c739cf1f426_687dd027de4c7c8561d99c2f_DSC03962.jpeg`,
    ],
  },
  {
    name: "X脚办公椅 #001",
    nameEn: "X-leg Office Chair #001",
    productSlug: "pj-x-leg-office-chair",
    material: "柚木 + 藤编",
    era: "1957-58",
    conditionGrade: "B",
    listPrice: 580000,
    totalCost: 180000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "x-leg-office-chair-001",
    imageUrls: [`${CDN}/687df76c3198dd9848630e55_68737e1496ecd17d2cb882c4_DSC02773.jpeg`],
  },
  {
    name: "高等法院三段式办公桌 #001",
    nameEn: "High Court 3-Part Desk #001",
    productSlug: "pj-high-court-desk",
    material: "柚木",
    era: "1957-58",
    conditionGrade: "B",
    listPrice: 7480000,
    totalCost: 2500000,
    status: "SOLD",
    showOnWebsite: true,
    slug: "high-court-desk-001",
    notes: "标记 HC/C/018，含真品证书。",
    imageUrls: [`${CDN}/687df76fa43298adc4f9e98a_687ddccedb37be1d76e21c26_DSC04136.jpeg`],
  },
  {
    name: "5孔木箱 #001",
    nameEn: "5-Hole Wood Box #001",
    productSlug: "lc-5-hole-wood-box",
    material: "柚木",
    era: "1959",
    dimensions: "430×430×270mm",
    conditionGrade: "A",
    listPrice: 1628000,
    totalCost: 500000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "5-hole-wood-box-001",
    notes: "参考编号 LC-011035，来自昌迪加尔私人住宅。",
    imageUrls: [
      `${CDN}/687df76e23af7ada94993986_687daa51b0d03ca1cbb5de33_DSC03395.jpeg`,
      `${CDN}/687df76e23af7ada9499398d_687daa70b33c815e0d5c454e_DSC03396.jpeg`,
      `${CDN}/687df76e23af7ada94993979_687daa7084283bfc8c8b3cb5_DSC03397.jpeg`,
      `${CDN}/687df76e23af7ada94993980_687daa7084283bfc8c8b3cd2_DSC03398.jpeg`,
    ],
  },
  {
    name: "Bridge 扶手椅 #001",
    nameEn: "Bridge Armchair #001",
    productSlug: "pj-bridge-armchair",
    material: "柚木 + 藤编",
    era: "1956-57",
    conditionGrade: "B",
    listPrice: 850000,
    totalCost: 260000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "bridge-armchair-001",
    imageUrls: [`${CDN}/687df76ab090cd177031b1c9_6879e73a499c42301fc54fe2_DSC02980.jpeg`],
  },
  {
    name: "Connect Back 椅 #001",
    nameEn: "Connect Back Chair #001",
    productSlug: "pj-connect-back-chair",
    material: "柚木 + 藤编",
    era: "1955-56",
    conditionGrade: "B",
    listPrice: 380000,
    totalCost: 120000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "connect-back-chair-001",
    imageUrls: [`${CDN}/687df76bc764ad07fc52f107_687dcb8f02df43d97805d3a7_DSC03910.jpeg`],
  },
  {
    name: "圆形藤编低凳 #001",
    nameEn: "Round Rattan Low Stool #001",
    productSlug: "pj-round-rattan-stool",
    material: "柚木 + 藤编",
    era: "1955-56",
    conditionGrade: "A",
    listPrice: 280000,
    totalCost: 85000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "round-rattan-stool-001",
    imageUrls: [`${CDN}/687df76ddcd9dfe907569818_6879c42bb18142862f90075b_DSC02958.jpeg`],
  },
  {
    name: "S31A 凳 #001",
    nameEn: "S31A Stool #001",
    productSlug: "pc-s31a-stool",
    material: "榆木",
    era: "1960s",
    conditionGrade: "A",
    listPrice: 480000,
    totalCost: 150000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "s31a-stool-001",
    imageUrls: [
      `${CDN}/68c399d811041df9029d8728_6880773b49235b29ef188e7b_DSC03441.jpeg`,
      `${CDN}/687df7716e9601058d4a2ed8_68736055edcec21fab84d676_DSC03365.jpeg`,
    ],
  },
  {
    name: "CP1 壁灯 #001",
    nameEn: "CP1 Wall Lamp #001",
    productSlug: "cp-cp1-wall-lamp",
    material: "铝合金",
    era: "1960s",
    conditionGrade: "A",
    listPrice: 680000,
    totalCost: 200000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "cp1-wall-lamp-001",
    imageUrls: [`${CDN}/68c399d75195bcd568d8a161_687f0e9ce86bc14afecc1f3f_DSC03018.jpeg`],
  },
  {
    name: "SCAL 日光床 #001",
    nameEn: "SCAL Daybed #001",
    productSlug: "jp-scal-daybed",
    material: "钢管 + 木板",
    era: "1950s",
    conditionGrade: "B",
    listPrice: 3200000,
    totalCost: 1000000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "scal-daybed-001",
    imageUrls: [
      `${CDN}/68c399d45bfabcebf2a92a40_688b36433eb6be20d45d11b8_ISIMG-976428.jpeg`,
      `${CDN}/68c399d5d239e332541c8357_688ad571a6c3b49a7debd509_DSC04518.jpeg`,
    ],
  },
  {
    name: "Demountable 椅 n°300 #001",
    nameEn: "Demountable Chair n°300 #001",
    productSlug: "jp-demountable-chair-300",
    material: "钢板 + 木材",
    era: "1950s",
    conditionGrade: "B",
    listPrice: 2800000,
    totalCost: 900000,
    status: "IN_STOCK",
    showOnWebsite: true,
    slug: "demountable-chair-300-001",
    imageUrls: [`${CDN}/68c399d4773d155690309055_6880789a0a2edc73893592a1_DSC03453.jpeg`],
  },
];

// ─── Hero slides ────────────────────────────────────────────────────

const heroImages = [
  `${CDN}/67ea57d918fedea670099192_attic_tophero_20250331_01.jpeg`,
  `${CDN}/6720541e55f6ba4491f65685_65e40cdc0eaee4f4819691c2_DSC03659.jpeg`,
  `${CDN}/687df769f2b1d0411f866c21_6879e653d1da31483f3a0149_DSC02973.jpeg`,
];

// ─── Main import ────────────────────────────────────────────────────

async function main() {
  console.log("=== Gallery-Ops Test Data Import ===\n");

  // Clean existing data (except users)
  console.log("Cleaning existing data...");
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.heroSlide.deleteMany();
  // Keep suppliers and users
  console.log("Done.\n");

  // 1. Ensure suppliers exist
  console.log("Creating suppliers...");
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
  const supplierGA = await prisma.supplier.upsert({
    where: { code: "GA" },
    update: {},
    create: {
      name: "Gallery Attic",
      code: "GA",
      country: "其他",
      contactName: "Gallery Attic",
      status: "ACTIVE",
      notes: "东京画廊，主营昌迪加尔系列",
    },
  });
  console.log(`  Suppliers: ${supplierAarge.name}, ${supplierGA.name}\n`);

  // 2. Create products
  console.log("Creating products...");
  const productMap = new Map<string, string>(); // slug -> id
  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        nameZh: p.nameZh,
        nameEn: p.nameEn,
        category: p.category,
        subcategory: p.subcategory,
        designer: p.designer,
        designerSeries: p.designerSeries,
        slug: p.slug,
        featured: p.featured,
        descriptionZh: p.descriptionZh,
        descriptionEn: p.descriptionEn,
      },
    });
    productMap.set(p.slug, product.id);
    console.log(`  + ${p.nameEn} (${p.slug})`);
  }
  console.log(`  Total: ${products.length} products\n`);

  // 3. Create items with images
  console.log("Creating items and downloading images...");
  const skuCounters: Record<string, number> = {};
  const SKU_PREFIX: Record<string, string> = {
    昌迪加尔: "PJ",
    "Le Corbusier": "LC",
    "Charlotte Perriand": "CP",
    "Jean Prouve": "JP",
    "Pierre Chapo": "PC",
    Eames: "EM",
    "Poul Henningsen": "PH",
    "Bernard-Albin Gras": "BG",
  };

  for (const item of items) {
    const productId = productMap.get(item.productSlug);
    if (!productId) {
      console.error(`  Product not found: ${item.productSlug}`);
      continue;
    }

    const designerSeries = products.find((p) => p.slug === item.productSlug)?.designerSeries;
    const prefix = (designerSeries && SKU_PREFIX[designerSeries]) || "GD";
    skuCounters[prefix] = (skuCounters[prefix] || 0) + 1;
    const skuCode = `${prefix}-${String(skuCounters[prefix]).padStart(3, "0")}`;

    const dbItem = await prisma.item.create({
      data: {
        skuCode,
        name: item.name,
        nameEn: item.nameEn,
        productId,
        supplierId: supplierGA.id,
        material: item.material,
        era: item.era,
        dimensions: item.dimensions,
        conditionGrade: item.conditionGrade,
        designerSeries,
        listPrice: item.listPrice,
        totalCost: item.totalCost,
        status: item.status,
        showOnWebsite: item.showOnWebsite,
        slug: item.slug,
        notes: item.notes,
      },
    });

    // Download and process images
    for (let i = 0; i < item.imageUrls.length; i++) {
      try {
        console.log(`  Downloading image ${i + 1}/${item.imageUrls.length} for ${item.slug}...`);
        const urls = await downloadAndProcess(item.imageUrls[i], "items", dbItem.id, i);
        await prisma.itemImage.create({
          data: {
            itemId: dbItem.id,
            url: urls.full,
            isPrimary: i === 0,
            sortOrder: i,
          },
        });
      } catch (err) {
        console.error(`  Failed to process image for ${item.slug}: ${err}`);
      }
    }

    console.log(`  + ${item.nameEn} [${item.status}] ¥${item.listPrice.toLocaleString()}`);
  }
  console.log(`  Total: ${items.length} items\n`);

  // 4. Create hero slides
  console.log("Creating hero slides...");
  for (let i = 0; i < heroImages.length; i++) {
    try {
      console.log(`  Downloading hero image ${i + 1}/${heroImages.length}...`);
      const urls = await downloadAndProcess(heroImages[i], "hero", `slide-${i}`, 0);
      await prisma.heroSlide.create({
        data: {
          imageUrl: urls.full,
          titleZh: ["探索中古家具之美", "昌迪加尔经典系列", "每一件都是独一无二"][i],
          titleEn: [
            "Discover Vintage Furniture",
            "Chandigarh Classic Collection",
            "Each Piece Is Unique",
          ][i],
          sortOrder: i,
          active: true,
        },
      });
    } catch (err) {
      console.error(`  Failed hero image ${i}: ${err}`);
    }
  }
  console.log("  Done.\n");

  // 5. Create sample customers
  console.log("Creating sample customers...");
  await prisma.customer.createMany({
    data: [
      {
        name: "王磊",
        type: "INDIVIDUAL",
        source: "小红书",
        phone: "13912345678",
        wechat: "wanglei_vintage",
      },
      {
        name: "李设计事务所",
        type: "COMMERCIAL_SPACE",
        source: "朋友介绍",
        phone: "021-62881234",
        email: "info@lidesign.cn",
      },
      { name: "张雅", type: "INDIVIDUAL", source: "闲鱼", wechat: "zhangya_art" },
    ],
  });
  console.log("  3 customers created.\n");

  // Summary
  const counts = {
    products: await prisma.product.count(),
    items: await prisma.item.count(),
    itemImages: await prisma.itemImage.count(),
    heroSlides: await prisma.heroSlide.count(),
    customers: await prisma.customer.count(),
    suppliers: await prisma.supplier.count(),
  };
  console.log("=== Import Complete ===");
  console.log(`Products: ${counts.products}`);
  console.log(`Items: ${counts.items}`);
  console.log(`Item Images: ${counts.itemImages}`);
  console.log(`Hero Slides: ${counts.heroSlides}`);
  console.log(`Customers: ${counts.customers}`);
  console.log(`Suppliers: ${counts.suppliers}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
