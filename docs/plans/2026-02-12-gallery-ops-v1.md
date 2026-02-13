# Gallery-Ops v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single Next.js application that serves both a gallery admin backend (inventory/customer/order/supplier CRUD) and a bilingual (ZH/EN) customer-facing website for a vintage furniture gallery.

**Architecture:** Single Next.js 15 app using Route Groups — `(admin)` for the management backend and `(web)` for the public website. SQLite via Prisma for zero-ops data storage. Simple cookie-based auth (no NextAuth). Admin routes at `/admin/*`, website routes at `/[locale]/*`. Two-layer data model: Product (SPU) → Item (SKU).

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Prisma (SQLite), shadcn/ui, next-intl, sharp, Embla Carousel, zod, react-hook-form, bcrypt

---

## Project Structure (Target)

```
02-gallery-ops/
├── app/
│   ├── (admin)/                    # Admin backend (auth required)
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Sidebar + Topbar
│   │   │   ├── page.tsx            # Dashboard (simple stats)
│   │   │   ├── products/           # Product CRUD
│   │   │   ├── inventory/          # Item CRUD
│   │   │   ├── customers/          # Customer CRUD
│   │   │   ├── sales-orders/       # Sales Order CRUD
│   │   │   └── suppliers/          # Supplier CRUD
│   │   └── login/page.tsx
│   ├── (web)/                      # Public website (i18n)
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       ├── page.tsx            # Homepage
│   │       ├── collection/
│   │       │   ├── page.tsx        # Collection listing
│   │       │   └── [slug]/page.tsx # Item detail
│   │       ├── designer/
│   │       │   └── [slug]/page.tsx # Designer page
│   │       ├── about/page.tsx
│   │       └── contact/page.tsx
│   ├── api/
│   │   ├── upload/route.ts
│   │   ├── contact/route.ts
│   │   └── auth/route.ts
│   ├── layout.tsx                  # Root layout
│   └── globals.css
├── components/
│   ├── admin/                      # Admin-only components
│   │   ├── layout/                 # Sidebar, Topbar, Breadcrumb
│   │   ├── forms/                  # Entity form components
│   │   ├── tables/                 # DataTable + column defs
│   │   └── ui/                     # StatusBadge, ImageUploader
│   ├── web/                        # Website-only components
│   │   ├── layout/                 # Header, Footer, LanguageSwitcher
│   │   ├── home/                   # HeroCarousel, FeaturedItems
│   │   ├── collection/             # ItemGrid, ItemCard, Filters
│   │   └── product/                # ImageGallery, ProductSpecs
│   └── ui/                         # shadcn/ui components (shared)
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── auth.ts                     # Cookie auth helpers
│   ├── actions/                    # Server Actions per entity
│   │   ├── products.ts
│   │   ├── items.ts
│   │   ├── customers.ts
│   │   ├── sales-orders.ts
│   │   └── suppliers.ts
│   ├── queries/                    # Read-only queries for website
│   │   └── web.ts
│   ├── utils.ts                    # Formatting, slug generation
│   └── constants.ts                # Enums, categories, status maps
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── messages/                       # i18n dictionaries
│   ├── zh.json
│   └── en.json
├── public/
│   └── uploads/                    # Image storage
├── data/                           # Source CSV files
├── middleware.ts                    # Auth + i18n routing
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env
├── .env.example
└── .gitignore
```

---

## Stage 1: Foundation (Team Lead)

> All subsequent stages depend on Stage 1 completing. Team Lead executes these tasks sequentially.

---

### Task 1: Project Initialization

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.env`
- Create: `next.config.ts`

**Step 1: Initialize Next.js project**

```bash
cd /Users/yaxuan/.openclaw/workspace/work/active/02-gallery-ops
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias="@/*" --turbopack
```

> If prompted about overwriting existing files, accept. The `docs/` folder will be preserved.

**Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client
npm install sharp
npm install bcryptjs
npm install zod react-hook-form @hookform/resolvers
npm install embla-carousel-react
npm install next-intl
npm install slugify
npm install --save-dev @types/bcryptjs
```

**Step 3: Create `.env.example` and `.env`**

```env
# .env.example
DATABASE_URL="file:./prisma/gallery.db"
AUTH_SECRET="change-me-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Copy to `.env` with real values. `AUTH_SECRET` can be any random string for dev.

**Step 4: Update `.gitignore`**

Append to the generated `.gitignore`:

```
# Database
prisma/gallery.db
prisma/gallery.db-journal

# Uploads
public/uploads/*
!public/uploads/.gitkeep

# Environment
.env
.env.local
```

**Step 5: Create uploads directory placeholder**

```bash
mkdir -p public/uploads
touch public/uploads/.gitkeep
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with core dependencies"
```

---

### Task 2: Prisma Schema + SQLite Setup

**Files:**

- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

**Skill reference:** Use @prisma-orm for schema best practices.

**Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 2: Write complete schema**

Write `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============ Auth ============

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String   @map("password_hash")
  role         String   @default("admin")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@map("users")
}

// ============ Product (SPU) ============

model Product {
  id              String   @id @default(cuid())
  nameZh          String   @map("name_zh")
  nameEn          String   @map("name_en")
  category        String
  subcategory     String?
  model           String?
  descriptionZh   String?  @map("description_zh")
  descriptionEn   String?  @map("description_en")
  designer        String?
  designerSeries  String?  @map("designer_series")
  priceRangeLow   Float?   @map("price_range_low")
  priceRangeHigh  Float?   @map("price_range_high")
  collectionValue String?  @map("collection_value")
  slug            String   @unique
  featured        Boolean  @default(false)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  items           Item[]
  images          ProductImage[]

  @@map("products")
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false) @map("is_primary")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("product_images")
}

// ============ Item (SKU) ============

model Item {
  id               String   @id @default(cuid())
  productId        String?  @map("product_id")
  product          Product? @relation(fields: [productId], references: [id])
  name             String
  nameEn           String?  @map("name_en")
  notes            String?
  manufacturer     String?
  era              String?
  material         String?
  dimensions       String?
  conditionGrade   String?  @map("condition_grade")
  designerSeries   String?  @map("designer_series")

  supplierId       String?  @map("supplier_id")
  supplier         Supplier? @relation(fields: [supplierId], references: [id])

  listPrice        Float?   @map("list_price")
  sellingPrice     Float?   @map("selling_price")

  shippingCostUsd  Float?   @map("shipping_cost_usd")
  shippingCostRmb  Float?   @map("shipping_cost_rmb")
  customsFees      Float?   @map("customs_fees")
  importDuties     Float?   @map("import_duties")
  purchasePriceUsd Float?   @map("purchase_price_usd")
  purchasePriceRmb Float?   @map("purchase_price_rmb")
  totalCost        Float?   @map("total_cost")

  status           String   @default("IN_STOCK")
  showOnWebsite    Boolean  @default(true) @map("show_on_website")
  slug             String   @unique

  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  images           ItemImage[]
  salesOrderItems  SalesOrderItem[]

  @@map("items")
}

model ItemImage {
  id        String   @id @default(cuid())
  itemId    String   @map("item_id")
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false) @map("is_primary")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("item_images")
}

// ============ Customer ============

model Customer {
  id          String   @id @default(cuid())
  name        String
  type        String   @default("INDIVIDUAL")
  source      String?
  phone       String?
  email       String?
  wechat      String?
  address     String?
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  salesOrders SalesOrder[]

  @@map("customers")
}

// ============ Sales Order ============

model SalesOrder {
  id            String   @id @default(cuid())
  orderNumber   String   @unique @map("order_number")
  customerId    String   @map("customer_id")
  customer      Customer @relation(fields: [customerId], references: [id])
  orderDate     DateTime @map("order_date")
  deliveryDate  DateTime? @map("delivery_date")
  totalAmount   Float    @map("total_amount")
  totalCost     Float    @map("total_cost")
  grossProfit   Float    @map("gross_profit")
  status        String   @default("PENDING")
  paymentDate   DateTime? @map("payment_date")
  shippingAddr  String?  @map("shipping_addr")
  notes         String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  items         SalesOrderItem[]

  @@map("sales_orders")
}

model SalesOrderItem {
  id           String     @id @default(cuid())
  salesOrderId String     @map("sales_order_id")
  salesOrder   SalesOrder @relation(fields: [salesOrderId], references: [id], onDelete: Cascade)
  itemId       String     @map("item_id")
  item         Item       @relation(fields: [itemId], references: [id])
  price        Float
  cost         Float

  @@map("sales_order_items")
}

// ============ Supplier ============

model Supplier {
  id          String   @id @default(cuid())
  name        String
  code        String?  @unique
  country     String
  contactName String?  @map("contact_name")
  email       String?
  phone       String?
  wechat      String?
  address     String?
  status      String   @default("ACTIVE")
  tags        String?
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  items       Item[]

  @@map("suppliers")
}

// ============ Website Support ============

model HeroSlide {
  id        String   @id @default(cuid())
  imageUrl  String   @map("image_url")
  titleZh   String?  @map("title_zh")
  titleEn   String?  @map("title_en")
  linkUrl   String?  @map("link_url")
  sortOrder Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("hero_slides")
}

model ContactInquiry {
  id        String   @id @default(cuid())
  name      String?
  email     String
  phone     String?
  subject   String?
  message   String
  itemRef   String?  @map("item_ref")
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("contact_inquiries")
}
```

> **Note:** SQLite doesn't support native enums. Status fields use `String` with application-level validation via zod. `Decimal` is replaced by `Float` for SQLite compatibility — acceptable for this scale (~100 items, single-user).

**Step 3: Create Prisma singleton**

Write `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 4: Run initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: SQLite file created at `prisma/gallery.db`, all tables created.

**Step 5: Verify**

```bash
npx prisma studio
```

Expected: Browser opens, all tables visible with correct columns.

**Step 6: Commit**

```bash
git add prisma/ lib/prisma.ts
git commit -m "feat: add Prisma schema with SQLite for all entities"
```

---

### Task 3: Constants + Utilities

**Files:**

- Create: `lib/constants.ts`
- Create: `lib/utils.ts`

**Step 1: Write constants**

Write `lib/constants.ts`:

```typescript
// Item status values (replaces enum)
export const ITEM_STATUS = {
  IN_STOCK: "IN_STOCK",
  IN_TRANSIT: "IN_TRANSIT",
  SOLD: "SOLD",
  RESERVED: "RESERVED",
} as const;

export const ITEM_STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  IN_STOCK: { zh: "现货", en: "Available" },
  IN_TRANSIT: { zh: "在途", en: "In Transit" },
  SOLD: { zh: "已售", en: "Sold" },
  RESERVED: { zh: "预留", en: "Reserved" },
};

export const ITEM_STATUS_COLORS: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-gray-100 text-gray-500",
  RESERVED: "bg-blue-100 text-blue-700",
};

// Sales order status
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ORDER_STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  PENDING: { zh: "待处理", en: "Pending" },
  CONFIRMED: { zh: "已确认", en: "Confirmed" },
  PAID: { zh: "已全款", en: "Paid" },
  SHIPPED: { zh: "已发货", en: "Shipped" },
  COMPLETED: { zh: "已完成", en: "Completed" },
  CANCELLED: { zh: "已取消", en: "Cancelled" },
};

// Supplier status
export const SUPPLIER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PAUSED: "PAUSED",
} as const;

// Customer types
export const CUSTOMER_TYPE = {
  INDIVIDUAL: "INDIVIDUAL",
  COMMERCIAL_SPACE: "COMMERCIAL_SPACE",
  GALLERY: "GALLERY",
} as const;

export const CUSTOMER_TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  INDIVIDUAL: { zh: "散客", en: "Individual" },
  COMMERCIAL_SPACE: { zh: "商业空间", en: "Commercial" },
  GALLERY: { zh: "画廊", en: "Gallery" },
};

// Product categories
export const CATEGORIES = [
  { value: "椅子", labelZh: "椅子", labelEn: "Chairs" },
  { value: "桌子", labelZh: "桌子", labelEn: "Tables" },
  { value: "沙发", labelZh: "沙发", labelEn: "Sofas" },
  { value: "收纳", labelZh: "收纳", labelEn: "Storage" },
  { value: "灯具", labelZh: "灯具", labelEn: "Lighting" },
  { value: "屏风", labelZh: "屏风", labelEn: "Screens" },
  { value: "凳子", labelZh: "凳子", labelEn: "Stools" },
  { value: "其他", labelZh: "其他", labelEn: "Other" },
] as const;

// Designer series
export const DESIGNER_SERIES = [
  { value: "Eames", label: "Eames" },
  { value: "昌迪加尔", label: "Chandigarh / Pierre Jeanneret" },
  { value: "Le Corbusier", label: "Le Corbusier" },
  { value: "Charlotte Perriand", label: "Charlotte Perriand" },
  { value: "Jean Prouve", label: "Jean Prouvé" },
  { value: "Pierre Chapo", label: "Pierre Chapo" },
  { value: "Poul Henningsen", label: "Poul Henningsen" },
  { value: "Bernard-Albin Gras", label: "Bernard-Albin Gras" },
  { value: "其他", label: "Other" },
] as const;

// Customer sources
export const CUSTOMER_SOURCES = [
  "小红书",
  "闲鱼",
  "朋友介绍",
  "老客户",
  "客户介绍",
  "其他",
] as const;

// Condition grades
export const CONDITION_GRADES = ["A", "B", "C", "D"] as const;

// Supplier countries
export const SUPPLIER_COUNTRIES = [
  { value: "美国", labelEn: "USA", flag: "🇺🇸" },
  { value: "印度", labelEn: "India", flag: "🇮🇳" },
  { value: "法国", labelEn: "France", flag: "🇫🇷" },
  { value: "丹麦", labelEn: "Denmark", flag: "🇩🇰" },
  { value: "摩洛哥", labelEn: "Morocco", flag: "🇲🇦" },
  { value: "其他", labelEn: "Other", flag: "🌍" },
] as const;
```

**Step 2: Write utilities**

Write `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

// Tailwind class merge (for shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatRMB(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Calculate total cost
export function calcTotalCost(item: {
  shippingCostRmb?: number | null;
  customsFees?: number | null;
  importDuties?: number | null;
  purchasePriceRmb?: number | null;
}): number {
  return (
    (item.shippingCostRmb || 0) +
    (item.customsFees || 0) +
    (item.importDuties || 0) +
    (item.purchasePriceRmb || 0)
  );
}

// Generate slug
export function generateSlug(text: string, existingSlugs?: string[]): string {
  let slug = slugifyLib(text, { lower: true, strict: true });
  if (!slug) {
    // Fallback for pure Chinese — generate a timestamp-based slug
    slug = `item-${Date.now()}`;
  }
  if (existingSlugs) {
    let candidate = slug;
    let counter = 2;
    while (existingSlugs.includes(candidate)) {
      candidate = `${slug}-${counter}`;
      counter++;
    }
    return candidate;
  }
  return slug;
}

// Generate order number: SO-2026-001
export function generateOrderNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(3, "0")}`;
}

// Format date for display
export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}
```

**Step 3: Install clsx + tailwind-merge (needed by shadcn/ui)**

```bash
npm install clsx tailwind-merge
```

**Step 4: Commit**

```bash
git add lib/constants.ts lib/utils.ts
git commit -m "feat: add constants (status/categories/enums) and utility functions"
```

---

### Task 4: Authentication System

**Files:**

- Create: `lib/auth.ts`
- Create: `app/(admin)/login/page.tsx`
- Create: `middleware.ts`

**Step 1: Write auth helpers**

Write `lib/auth.ts`:

```typescript
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "gallery_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

// Create a simple session token (hash of email + secret + timestamp)
function createToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  return Buffer.from(payload).toString("base64url");
}

function parseToken(token: string): { email: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return false;

  const token = createToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseToken(token);
}

export async function requireAuth(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
```

**Step 2: Write login page**

Write `app/(admin)/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("邮箱或密码错误");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-[#e8eaed] bg-white p-8"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-[#202124]">Gallery Admin</h1>
        {error && <p className="mb-4 text-center text-sm text-red-600">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-[#e8eaed] px-3 py-2 text-sm focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 focus:outline-none"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-[#e8eaed] px-3 py-2 text-sm focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#1a73e8] py-2 text-sm font-medium text-white hover:bg-[#1557b0] disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 3: Write auth API route**

Write `app/api/auth/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { login, logout } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const success = await login(email, password);
  if (!success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}
```

**Step 4: Write middleware**

Write `middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: check auth cookie (except login page)
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("gallery_session")?.value;
    if (!session && pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Login page: no middleware processing needed
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // API routes: pass through
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Website routes: handle i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except static files and _next
    "/((?!_next/static|_next/image|uploads|favicon.ico).*)",
  ],
};
```

> **Note:** The i18n routing config will be created in Task 5.

**Step 5: Commit**

```bash
git add lib/auth.ts app/ middleware.ts
git commit -m "feat: add cookie-based auth with login page and middleware"
```

---

### Task 5: i18n Setup (next-intl)

**Files:**

- Create: `lib/i18n/routing.ts`
- Create: `lib/i18n/request.ts`
- Create: `messages/zh.json`
- Create: `messages/en.json`

**Skill reference:** Use @i18n-date-patterns for next-intl patterns.

**Step 1: Write routing config**

Write `lib/i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
});
```

**Step 2: Write request config**

Write `lib/i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "zh" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 3: Write translation dictionaries**

Write `messages/zh.json`:

```json
{
  "nav": {
    "collection": "藏品",
    "designers": "设计师",
    "about": "关于",
    "contact": "联系"
  },
  "home": {
    "heroButton": "浏览藏品",
    "featuredTitle": "精选藏品",
    "viewAll": "查看全部",
    "aboutTitle": "关于画廊",
    "aboutCta": "了解更多",
    "contactTitle": "对藏品感兴趣？",
    "contactSubtitle": "欢迎联系我们",
    "contactCta": "联系我们"
  },
  "collection": {
    "title": "藏品",
    "filterCategory": "分类",
    "filterDesigner": "设计师",
    "filterStatus": "状态",
    "statusAll": "全部",
    "statusAvailable": "在售",
    "statusSold": "已售",
    "noResults": "暂无符合条件的藏品"
  },
  "detail": {
    "backToCollection": "返回藏品",
    "era": "年代",
    "manufacturer": "厂家",
    "material": "材质",
    "dimensions": "尺寸",
    "condition": "品相",
    "status": "状态",
    "inquire": "咨询此藏品",
    "description": "详细介绍",
    "relatedItems": "相关推荐"
  },
  "contact": {
    "title": "联系我们",
    "name": "姓名",
    "email": "邮箱",
    "phone": "电话",
    "subject": "主题",
    "subjectGeneral": "一般咨询",
    "subjectItem": "商品咨询",
    "subjectVisit": "预约参观",
    "itemRef": "商品参考",
    "message": "留言",
    "submit": "发送",
    "success": "感谢您的留言，我们会尽快回复。"
  },
  "about": {
    "title": "关于我们"
  },
  "footer": {
    "rights": "版权所有"
  }
}
```

Write `messages/en.json`:

```json
{
  "nav": {
    "collection": "Collection",
    "designers": "Designers",
    "about": "About",
    "contact": "Contact"
  },
  "home": {
    "heroButton": "View Collection",
    "featuredTitle": "Featured Collection",
    "viewAll": "View All",
    "aboutTitle": "About the Gallery",
    "aboutCta": "Learn More",
    "contactTitle": "Interested in a piece?",
    "contactSubtitle": "Get in touch with us",
    "contactCta": "Contact Us"
  },
  "collection": {
    "title": "Collection",
    "filterCategory": "Category",
    "filterDesigner": "Designer",
    "filterStatus": "Status",
    "statusAll": "All",
    "statusAvailable": "Available",
    "statusSold": "Sold",
    "noResults": "No items match your filters"
  },
  "detail": {
    "backToCollection": "Back to Collection",
    "era": "Era",
    "manufacturer": "Manufacturer",
    "material": "Material",
    "dimensions": "Dimensions",
    "condition": "Condition",
    "status": "Status",
    "inquire": "Inquire About This Piece",
    "description": "Description",
    "relatedItems": "Related Items"
  },
  "contact": {
    "title": "Contact Us",
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "subject": "Subject",
    "subjectGeneral": "General Inquiry",
    "subjectItem": "Item Inquiry",
    "subjectVisit": "Schedule Visit",
    "itemRef": "Item Reference",
    "message": "Message",
    "submit": "Send",
    "success": "Thank you for your message. We will get back to you soon."
  },
  "about": {
    "title": "About Us"
  },
  "footer": {
    "rights": "All rights reserved"
  }
}
```

**Step 4: Update `next.config.ts`**

Add next-intl plugin:

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig = {};

export default withNextIntl(nextConfig);
```

**Step 5: Commit**

```bash
git add lib/i18n/ messages/ next.config.ts
git commit -m "feat: configure next-intl with ZH/EN dictionaries"
```

---

### Task 6: shadcn/ui Setup

**Skill reference:** Use @nextjs-shadcn-builder for setup patterns.

**Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables for colors.

**Step 2: Install commonly needed components**

```bash
npx shadcn@latest add button input label select textarea table dialog toast badge dropdown-menu separator sheet tabs card switch popover command
```

**Step 3: Verify component files exist**

```bash
ls components/ui/
```

Expected: `button.tsx`, `input.tsx`, `table.tsx`, etc.

**Step 4: Commit**

```bash
git add components/ui/ lib/utils.ts components.json tailwind.config.ts app/globals.css
git commit -m "feat: initialize shadcn/ui with core components"
```

---

### Task 7: Admin Layout

**Files:**

- Create: `app/(admin)/admin/layout.tsx`
- Create: `components/admin/layout/sidebar.tsx`
- Create: `components/admin/layout/topbar.tsx`
- Create: `components/admin/layout/breadcrumb.tsx`

**Skill reference:** Use @nextjs-shadcn-builder and `docs/admin-ui-design-system.md` for design tokens.

**Step 1: Write Sidebar**

Write `components/admin/layout/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Archive, Users, ShoppingCart, Truck } from "lucide-react";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/products", label: "商品", icon: Package },
  { href: "/admin/inventory", label: "库存", icon: Archive },
  { href: "/admin/customers", label: "客户", icon: Users },
  { href: "/admin/sales-orders", label: "销售单", icon: ShoppingCart },
  { href: "/admin/suppliers", label: "供应商", icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-[#e8eaed] bg-white">
      <div className="flex h-14 items-center border-b border-[#e8eaed] px-4">
        <span className="text-base font-semibold text-[#202124]">Gallery Admin</span>
      </div>
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mx-2 flex items-center gap-3 rounded-md px-4 py-2 text-[13px] transition-colors ${
                isActive
                  ? "border-l-[3px] border-[#1a73e8] bg-[#e8f0fe] font-medium text-[#1a73e8]"
                  : "text-[#5f6368] hover:bg-[#f1f3f4]"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 2: Write Topbar**

Write `components/admin/layout/topbar.tsx`:

```tsx
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#e8eaed] bg-white px-6">
      <div />
      <form action="/api/auth" method="DELETE">
        <Button variant="ghost" size="sm" className="text-[13px] text-[#5f6368]">
          退出登录
        </Button>
      </form>
    </header>
  );
}
```

**Step 3: Write Admin Layout**

Write `app/(admin)/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/admin/layout/sidebar";
import { Topbar } from "@/components/admin/layout/topbar";
import { Toaster } from "@/components/ui/toaster";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-[#f7f7f7]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
```

**Step 4: Write placeholder dashboard page**

Write `app/(admin)/admin/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">仪表盘</h1>
      <p className="text-[#5f6368]">管理后台就绪。从左侧导航开始使用。</p>
    </div>
  );
}
```

**Step 5: Install lucide-react for icons**

```bash
npm install lucide-react
```

**Step 6: Commit**

```bash
git add app/(admin)/ components/admin/
git commit -m "feat: add admin layout with sidebar, topbar, and auth guard"
```

---

### Task 8: Seed Script + Admin Account

**Files:**

- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma seed config)

**Step 1: Write seed script**

Write `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  console.log("✓ Admin user created: admin@gallery.local / Gallery2025!");

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
  console.log("✓ Supplier created: Aarge Overseas");

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
  console.log("✓ Supplier created: 沈康");

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
  console.log("✓ Sample products created");

  // 4. Create sample items (SKU)
  await prisma.item.upsert({
    where: { slug: "pj-office-chair-001" },
    update: {},
    create: {
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
  console.log("✓ Sample items created");

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
  console.log("✓ Sample customer created");

  // 6. Create hero slides (placeholder)
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
  console.log("✓ Hero slides created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Add seed config to package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

**Step 3: Install tsx for running seed**

```bash
npm install --save-dev tsx
```

**Step 4: Run seed**

```bash
npx prisma db seed
```

Expected output:

```
✓ Admin user created: admin@gallery.local / Gallery2025!
✓ Supplier created: Aarge Overseas
✓ Supplier created: 沈康
✓ Sample products created
✓ Sample items created
✓ Sample customer created
✓ Hero slides created
🎉 Seed complete!
```

**Step 5: Verify login works**

```bash
npm run dev
```

Open `http://localhost:3000/login`, enter `admin@gallery.local` / `Gallery2025!`. Should redirect to `/admin`.

**Step 6: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed script with admin account and sample data"
```

---

### Task 9: Image Upload API

**Files:**

- Create: `app/api/upload/route.ts`
- Create: `components/admin/ui/image-uploader.tsx`

**Skill reference:** Use @image-optimization for sharp patterns.

**Step 1: Write upload API**

Write `app/api/upload/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const SIZES = {
  thumb: { width: 300, height: 300 },
  medium: { width: 800, height: 800 },
  full: { width: 1600, height: 1600 },
} as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const entity = formData.get("entity") as string; // "products" | "items"
  const entityId = formData.get("entityId") as string;

  if (!file || !entity || !entityId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const dir = path.join(process.cwd(), "public", "uploads", entity, entityId);
  await mkdir(dir, { recursive: true });

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

  return NextResponse.json({
    url: urls.full,
    thumb: urls.thumb,
    medium: urls.medium,
    full: urls.full,
  });
}
```

**Step 2: Write ImageUploader component**

Write `components/admin/ui/image-uploader.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, GripVertical } from "lucide-react";

interface ImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageUploaderProps {
  entity: string;
  entityId: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ entity, entityId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      const newImages = [...images];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entity", entity);
        formData.append("entityId", entityId);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          newImages.push({
            url: data.url,
            isPrimary: newImages.length === 0,
            sortOrder: newImages.length,
          });
        }
      }

      onChange(newImages);
      setUploading(false);
    },
    [entity, entityId, images, onChange],
  );

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, isPrimary: i === index }));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-[#e8eaed] p-6 text-center transition-colors hover:border-[#1a73e8]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = () => input.files && handleUpload(input.files);
          input.click();
        }}
      >
        <Upload className="mx-auto mb-2 text-[#9aa0a6]" size={24} />
        <p className="text-sm text-[#5f6368]">
          {uploading ? "上传中..." : "点击或拖拽上传图片 (最大 10MB)"}
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-lg border ${img.isPrimary ? "border-[#1a73e8] ring-2 ring-[#1a73e8]/20" : "border-[#e8eaed]"}`}
            >
              <img
                src={img.url.replace("-full.", "-thumb.")}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isPrimary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPrimary(i)}
                    className="text-xs"
                  >
                    设为主图
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(i)}
                  className="text-xs"
                >
                  <X size={14} />
                </Button>
              </div>
              {img.isPrimary && (
                <span className="absolute top-1 left-1 rounded bg-[#1a73e8] px-1.5 py-0.5 text-[10px] text-white">
                  主图
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add app/api/upload/ components/admin/ui/
git commit -m "feat: add image upload API (sharp WebP) and ImageUploader component"
```

---

### Task 10: Zod Schemas for Validation

**Files:**

- Create: `lib/validations.ts`

**Step 1: Write all entity validation schemas**

Write `lib/validations.ts`:

```typescript
import { z } from "zod";

// ============ Product ============
export const productSchema = z.object({
  nameZh: z.string().min(1, "中文名必填"),
  nameEn: z.string().min(1, "英文名必填"),
  category: z.string().min(1, "分类必填"),
  subcategory: z.string().optional(),
  model: z.string().optional(),
  descriptionZh: z.string().optional(),
  descriptionEn: z.string().optional(),
  designer: z.string().optional(),
  designerSeries: z.string().optional(),
  priceRangeLow: z.coerce.number().optional(),
  priceRangeHigh: z.coerce.number().optional(),
  collectionValue: z.string().optional(),
  featured: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ============ Item ============
export const itemSchema = z.object({
  name: z.string().min(1, "名称必填"),
  nameEn: z.string().optional(),
  notes: z.string().optional(),
  productId: z.string().optional(),
  designerSeries: z.string().optional(),
  manufacturer: z.string().optional(),
  era: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  conditionGrade: z.string().optional(),
  supplierId: z.string().optional(),
  listPrice: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  shippingCostUsd: z.coerce.number().optional(),
  shippingCostRmb: z.coerce.number().optional(),
  customsFees: z.coerce.number().optional(),
  importDuties: z.coerce.number().optional(),
  purchasePriceUsd: z.coerce.number().optional(),
  purchasePriceRmb: z.coerce.number().optional(),
  status: z.string().default("IN_STOCK"),
  showOnWebsite: z.boolean().default(true),
});

export type ItemFormData = z.infer<typeof itemSchema>;

// ============ Customer ============
export const customerSchema = z.object({
  name: z.string().min(1, "名称必填"),
  type: z.string().default("INDIVIDUAL"),
  source: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  wechat: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// ============ Sales Order ============
export const salesOrderSchema = z.object({
  orderNumber: z.string().min(1, "单号必填"),
  customerId: z.string().min(1, "客户必选"),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional(),
  status: z.string().default("PENDING"),
  paymentDate: z.coerce.date().optional(),
  shippingAddr: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        price: z.coerce.number(),
        cost: z.coerce.number(),
      }),
    )
    .min(1, "至少添加一个商品"),
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

// ============ Supplier ============
export const supplierSchema = z.object({
  name: z.string().min(1, "名称必填"),
  code: z.string().optional(),
  country: z.string().min(1, "国家必填"),
  contactName: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  phone: z.string().optional(),
  wechat: z.string().optional(),
  address: z.string().optional(),
  status: z.string().default("ACTIVE"),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

// ============ Contact Form ============
export const contactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  itemRef: z.string().optional(),
  message: z.string().min(1, "留言内容必填"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

**Step 2: Commit**

```bash
git add lib/validations.ts
git commit -m "feat: add zod validation schemas for all entities"
```

---

**Stage 1 complete.** At this point the application should:

- Start with `npm run dev`
- Show login page at `/login`
- Authenticate with `admin@gallery.local` / `Gallery2025!`
- Show admin dashboard shell at `/admin`
- Have a working image upload API at `/api/upload`
- Have sample data in the database

---

## Stage 2A: Admin Builder (Teammate)

> **Assignment:** admin-builder
> **File scope:** `app/(admin)/admin/*`, `components/admin/*`, `lib/actions/*`
> **Skills:** @nextjs-shadcn-builder, @prisma-orm, @vercel-composition-patterns, @vercel-react-best-practices

> **Pattern:** Each entity follows the same CRUD pattern:
>
> 1. Server Actions file (`lib/actions/{entity}.ts`) — list, get, create, update, delete
> 2. List page with DataTable (`app/(admin)/admin/{entity}/page.tsx`)
> 3. Form component (`components/admin/forms/{entity}-form.tsx`)
> 4. New page (`app/(admin)/admin/{entity}/new/page.tsx`)
> 5. Edit page (`app/(admin)/admin/{entity}/[id]/page.tsx`)

---

### Task 11: Supplier CRUD (Establish Pattern)

Build suppliers first as the simplest entity to establish the CRUD pattern.

**Files:**

- Create: `lib/actions/suppliers.ts`
- Create: `app/(admin)/admin/suppliers/page.tsx`
- Create: `app/(admin)/admin/suppliers/new/page.tsx`
- Create: `app/(admin)/admin/suppliers/[id]/page.tsx`
- Create: `components/admin/forms/supplier-form.tsx`

Server Actions should use `"use server"` directive, accept form data, validate with zod, call Prisma, and `revalidatePath`. List page is a Server Component that fetches data, renders a table using shadcn `<Table>`. Form is a Client Component with react-hook-form + zod resolver.

Refer to `docs/ADMIN-SPEC.md` section 9 for supplier field spec.

**Commit:** `feat: add supplier CRUD (list/create/edit/delete)`

---

### Task 12: Product CRUD (With Images)

Same CRUD pattern as suppliers but with:

- ImageUploader integration for ProductImage
- Slug auto-generation from nameEn
- Featured toggle

**Files:**

- Create: `lib/actions/products.ts`
- Create: `app/(admin)/admin/products/page.tsx`
- Create: `app/(admin)/admin/products/new/page.tsx`
- Create: `app/(admin)/admin/products/[id]/page.tsx`
- Create: `components/admin/forms/product-form.tsx`

Refer to `docs/ADMIN-SPEC.md` section 4 for product field spec.

**Commit:** `feat: add product CRUD with image upload`

---

### Task 13: Item CRUD (With Cost Calculation)

Most complex entity. Key features:

- Product dropdown (select from existing products)
- Supplier dropdown
- Auto-calculated `totalCost` (read-only display)
- Cost breakdown fields grouped in sections
- ImageUploader for ItemImage
- Status dropdown with colored badges

**Files:**

- Create: `lib/actions/items.ts`
- Create: `app/(admin)/admin/inventory/page.tsx`
- Create: `app/(admin)/admin/inventory/new/page.tsx`
- Create: `app/(admin)/admin/inventory/[id]/page.tsx`
- Create: `components/admin/forms/item-form.tsx`
- Create: `components/admin/ui/status-badge.tsx`

The `totalCost` field should be computed on save: `shippingCostRmb + customsFees + importDuties + purchasePriceRmb`.

Refer to `docs/ADMIN-SPEC.md` section 5 for inventory field spec.

**Commit:** `feat: add inventory CRUD with cost calculation and images`

---

### Task 14: Customer CRUD

Standard CRUD. Additional feature: customer detail page shows related sales orders.

**Files:**

- Create: `lib/actions/customers.ts`
- Create: `app/(admin)/admin/customers/page.tsx`
- Create: `app/(admin)/admin/customers/new/page.tsx`
- Create: `app/(admin)/admin/customers/[id]/page.tsx`
- Create: `components/admin/forms/customer-form.tsx`

Refer to `docs/ADMIN-SPEC.md` section 6 for customer field spec.

**Commit:** `feat: add customer CRUD with order history`

---

### Task 15: Sales Order CRUD (With Line Items + Status Automation)

Most complex form. Key features:

- Customer search/select dropdown
- Dynamic line items table — select from IN_STOCK items, set price
- Auto-calculated totals (totalAmount, totalCost, grossProfit)
- Order number auto-generation (SO-2026-001)
- **Business logic:** When status → COMPLETED, update all line item Items to SOLD. When status → CANCELLED, restore Items to IN_STOCK.

**Files:**

- Create: `lib/actions/sales-orders.ts`
- Create: `app/(admin)/admin/sales-orders/page.tsx`
- Create: `app/(admin)/admin/sales-orders/new/page.tsx`
- Create: `app/(admin)/admin/sales-orders/[id]/page.tsx`
- Create: `components/admin/forms/sales-order-form.tsx`

The status transition logic in `lib/actions/sales-orders.ts`:

```typescript
// Inside the update action, after saving the order:
if (data.status === "COMPLETED") {
  // Mark all items as SOLD
  await prisma.item.updateMany({
    where: { id: { in: itemIds } },
    data: { status: "SOLD" },
  });
}
if (data.status === "CANCELLED") {
  // Restore items to IN_STOCK
  await prisma.item.updateMany({
    where: { id: { in: itemIds } },
    data: { status: "IN_STOCK" },
  });
}
```

Refer to `docs/ADMIN-SPEC.md` section 7 for sales order field spec.

**Commit:** `feat: add sales order CRUD with line items and status automation`

---

### Task 16: Dashboard Stats

Simple stats page (no charts in v1). Display 4 KPI cards + recent orders table.

**Files:**

- Modify: `app/(admin)/admin/page.tsx`
- Create: `components/admin/dashboard/stats-cards.tsx`
- Create: `components/admin/dashboard/recent-orders.tsx`

KPI cards query using Prisma aggregate:

1. **本月营收** — `SalesOrder.totalAmount` sum where `orderDate` is current month
2. **累计毛利** — `SalesOrder.grossProfit` sum (all time)
3. **库存数量** — `Item.count` grouped by status
4. **客户数** — `Customer.count`

Recent orders: last 10 sales orders with customer name, amount, status.

**Commit:** `feat: add dashboard with KPI stats and recent orders`

---

## Stage 2B: Web Builder (Teammate)

> **Assignment:** web-builder
> **File scope:** `app/(web)/*`, `components/web/*`, `lib/queries/*`
> **Skills:** @tailwind-design-system, @i18n-date-patterns, @ui-ux-pro-max, @web-design-guidelines, @frontend-design

---

### Task 17: Website Design System + Layout

**Files:**

- Create/Modify: `app/globals.css` (website CSS variables)
- Create: `app/(web)/[locale]/layout.tsx`
- Create: `components/web/layout/header.tsx`
- Create: `components/web/layout/footer.tsx`
- Create: `components/web/layout/language-switcher.tsx`

**Design tokens** from `docs/WEBSITE-SPEC.md`:

- Colors: cream `#FAF8F5`, warm-gray `#8B7E74`, charcoal `#2C2C2C`, brass `#B8956A`
- Fonts: Playfair Display (headings) + Inter (body) + Noto Serif SC / Noto Sans SC (Chinese)
- Section spacing: 80-120px

Header: fixed top, glassmorphism on scroll, nav links (Collection, Designers, About, Contact), language switcher (ZH/EN). Mobile: hamburger menu.

Footer: 4-column layout with nav links, designer list, social links.

**Commit:** `feat: add website layout with header, footer, and design system`

---

### Task 18: Homepage

**Files:**

- Create: `app/(web)/[locale]/page.tsx`
- Create: `components/web/home/hero-carousel.tsx`
- Create: `components/web/home/featured-items.tsx`
- Create: `components/web/home/about-teaser.tsx`
- Create: `components/web/home/contact-cta.tsx`
- Create: `lib/queries/web.ts`

4 sections as per `docs/WEBSITE-SPEC.md` section 3:

1. **Hero**: Embla Carousel, full viewport height, crossfade, 5s autoplay
2. **Featured**: 4-col grid of items where `Product.featured=true AND Item.showOnWebsite=true`, limit 8
3. **About teaser**: Left image + right text, "Learn More" CTA
4. **Contact CTA**: Full-width background + overlay + button

`lib/queries/web.ts` — server-side query functions:

```typescript
export async function getFeaturedItems(limit = 8) { ... }
export async function getHeroSlides() { ... }
```

**Commit:** `feat: add homepage with hero carousel, featured items, and CTAs`

---

### Task 19: Collection Listing Page

**Files:**

- Create: `app/(web)/[locale]/collection/page.tsx`
- Create: `components/web/collection/item-grid.tsx`
- Create: `components/web/collection/item-card.tsx`
- Create: `components/web/collection/filters.tsx`
- Create: `components/web/collection/pagination.tsx`

Per `docs/WEBSITE-SPEC.md` section 4:

- Left sidebar: category checkboxes, designer checkboxes, status radio
- Right grid: 4/3/2/1 columns responsive
- URL search params: `?category=椅子&designer=Eames&status=available&page=1`
- 24 items per page
- Item card: 4:5 aspect ratio image, hover scale(1.03), name, designer, "Sold" badge overlay

Filters use URL search params (Server Component reads them, no client state needed).

**Commit:** `feat: add collection page with filters and pagination`

---

### Task 20: Item Detail Page

**Files:**

- Create: `app/(web)/[locale]/collection/[slug]/page.tsx`
- Create: `components/web/product/image-gallery.tsx`
- Create: `components/web/product/product-specs.tsx`
- Create: `components/web/product/related-items.tsx`

Per `docs/WEBSITE-SPEC.md` section 5:

- Left: Image gallery (main image + thumbnail strip, click to switch)
- Right: Specs panel (designer series, name, era, manufacturer, material, dimensions, condition, status)
- "Inquire About This Piece" button → links to `/contact?item={slug}`
- Bottom: Description text (locale-aware zh/en)
- Related items: 4 items from same designerSeries or category

**Commit:** `feat: add item detail page with image gallery and specs`

---

### Task 21: Designer Page

**Files:**

- Create: `app/(web)/[locale]/designer/[slug]/page.tsx`

Reuses `ItemGrid` component from Task 19 with `designerSeries` pre-filtered. Top section: designer name + description (hardcoded per designer, bilingual).

Supported slugs: `eames`, `pierre-jeanneret`, `le-corbusier`, `charlotte-perriand`, `jean-prouve`, `pierre-chapo`, `poul-henningsen`, `bernard-albin-gras`

**Commit:** `feat: add designer page with filtered collection grid`

---

### Task 22: Contact Page

**Files:**

- Create: `app/(web)/[locale]/contact/page.tsx`
- Create: `components/web/contact/contact-form.tsx`
- Create: `app/api/contact/route.ts`

Per `docs/WEBSITE-SPEC.md` section 8:

- Left: Form (name, email*, phone, subject dropdown, item ref, message*)
- Right: Gallery info (address, phone, email, WeChat QR, hours)
- Submit → `POST /api/contact` → save to `ContactInquiry` table
- Auto-fill `itemRef` from `?item=` search param (when coming from detail page)

**Commit:** `feat: add contact page with form and gallery info`

---

### Task 23: About Page

**Files:**

- Create: `app/(web)/[locale]/about/page.tsx`

Simple content page:

- Hero image (full-width)
- Gallery story (alternating text/image sections)
- Gallery info (address, hours, contact)

Content is placeholder text in v1, bilingual via `messages/{zh,en}.json`.

**Commit:** `feat: add about page with gallery story`

---

### Task 24: SEO + Metadata

**Files:**

- Modify: `app/(web)/[locale]/layout.tsx` (add metadata)
- Modify: all `(web)` page files (add `generateMetadata`)
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

Each page exports `generateMetadata` with locale-aware title and description. Add OG tags with images for collection/detail pages.

**Commit:** `feat: add SEO metadata, OG tags, robots.txt and sitemap`

---

## Stage 3: Integration & Verification

> **Assignment:** Team Lead
> **Prerequisite:** Stage 2A + 2B both complete

---

### Task 25: Integration Testing

**Verification checklist** (manual, per `docs/DEVELOPMENT-PLAN.md`):

| Check            | Command / Action                  | Expected                           |
| ---------------- | --------------------------------- | ---------------------------------- |
| App starts       | `npm run dev`                     | No errors, port 3000               |
| Login            | Go to `/login`, enter credentials | Redirects to `/admin`              |
| Dashboard        | View `/admin`                     | 4 KPI cards with seed data numbers |
| Supplier CRUD    | Create → Edit → List              | Data persists correctly            |
| Product CRUD     | Create with images                | Images uploaded, thumbnails show   |
| Item CRUD        | Create, verify cost calculation   | totalCost auto-computed            |
| Customer CRUD    | Create, view order history        | Empty history for new customer     |
| Sales Order      | Create with line items            | Totals auto-calculated             |
| Order → Complete | Change status to COMPLETED        | Items become SOLD                  |
| Homepage         | Visit `/zh`                       | Hero, featured items, CTAs render  |
| Collection       | Visit `/zh/collection`            | Grid shows seed items              |
| Filters          | Filter by designer                | Results filter correctly           |
| Detail           | Click an item card                | Full detail page with specs        |
| i18n             | Switch to `/en`                   | All text switches to English       |
| Contact form     | Submit form                       | Data saved to ContactInquiry       |
| Data flow        | Create item in admin              | Appears on website after refresh   |

**Step 1: Fix any issues found during verification**

**Step 2: Commit**

```bash
git add -A
git commit -m "fix: integration fixes from end-to-end testing"
```

---

### Task 26: Update CLAUDE.md + Clean Up

**Files:**

- Modify: `CLAUDE.md` — update to reflect actual structure (single app, SQLite, etc.)
- Remove any placeholder files
- Ensure `.env.example` is accurate

**Commit:** `docs: update CLAUDE.md with final project structure`

---

## Dependency Graph

```
Stage 1: Foundation (Tasks 1-10) — sequential, Team Lead
    │
    ├─────────────────────────────────────────┐
    ▼                                         ▼
Stage 2A: Admin (Tasks 11-16)           Stage 2B: Web (Tasks 17-24)
  admin-builder                           web-builder
    │ T11 → T12 → T13 → T14 → T15 → T16    │ T17 → T18 → T19 → T20
    │ suppliers→products→items→customers     │ layout→home→collection→detail
    │          →orders→dashboard             │      → T21 → T22 → T23 → T24
    │                                         │      designer→contact→about→SEO
    └─────────────────────────────────────────┘
                        │
                        ▼
              Stage 3: Integration (Tasks 25-26)
                    Team Lead
```

---

## Skills Reference (Quick Lookup)

| Task              | Recommended Skills                                                      |
| ----------------- | ----------------------------------------------------------------------- |
| T1 (init)         | @next-best-practices                                                    |
| T2 (prisma)       | @prisma-orm                                                             |
| T5 (i18n)         | @i18n-date-patterns                                                     |
| T6 (shadcn)       | @nextjs-shadcn-builder                                                  |
| T7 (admin layout) | @nextjs-shadcn-builder, admin-ui-design-system.md                       |
| T9 (images)       | @image-optimization                                                     |
| T11-16 (CRUD)     | @prisma-orm, @vercel-react-best-practices, @vercel-composition-patterns |
| T17 (web layout)  | @tailwind-design-system, @frontend-design, @web-design-guidelines       |
| T18-23 (pages)    | @ui-ux-pro-max, @web-design-guidelines                                  |
| T24 (SEO)         | @seo-audit                                                              |
| T25 (testing)     | @webapp-testing                                                         |
