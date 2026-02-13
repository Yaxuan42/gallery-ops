# Gallery-Ops — 中古家具画廊管理系统

> 管理后台 + 客户展示官网 | 单 Next.js 应用 + Route Groups

---

## 项目概述

为中古家具画廊开发数字化管理系统，替代 Excel 手工管理。主营 Eames 系列（美国供应商）和昌迪加尔/Pierre Jeanneret 系列（印度来源），涵盖库存、客户、订单、供应商的全链路管理，以及中英双语展示官网。

部署环境：Mac Mini 本地部署，单人操作，日访问量 <100。

---

## 技术栈

| 层级        | 选型                                                      |
| ----------- | --------------------------------------------------------- |
| 框架        | Next.js 16.1.6 (App Router) + TypeScript                  |
| 样式        | Tailwind CSS 4                                            |
| 数据库      | SQLite (via Prisma + better-sqlite3)                      |
| ORM         | Prisma 7 (driver adapter: @prisma/adapter-better-sqlite3) |
| 管理后台 UI | shadcn/ui v3.8 (New York style, sonner for toasts)        |
| 官网轮播    | Embla Carousel                                            |
| i18n        | next-intl 4.8                                             |
| 认证        | 自实现 cookie-based (bcryptjs + base64url token)          |
| 图片处理    | sharp (WebP + 三尺寸)                                     |
| 表单验证    | zod 4.3 + react-hook-form 7.71                            |
| 包管理      | npm                                                       |

---

## 项目结构

```
02-gallery-ops/
├── app/
│   ├── (admin)/                    # 管理后台 (需认证)
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Sidebar + Topbar + auth guard
│   │   │   ├── page.tsx            # Dashboard (KPI + 近期订单)
│   │   │   ├── products/           # Product CRUD (SPU)
│   │   │   ├── inventory/          # Item CRUD (SKU)
│   │   │   ├── customers/          # Customer CRUD
│   │   │   ├── sales-orders/       # Sales Order CRUD
│   │   │   └── suppliers/          # Supplier CRUD
│   │   └── login/page.tsx
│   ├── (web)/                      # 客户展示官网 (i18n)
│   │   └── [locale]/
│   │       ├── layout.tsx          # Header + Footer + fonts
│   │       ├── page.tsx            # 首页 (hero/featured/about/CTA)
│   │       ├── collection/         # 藏品列表 + 详情
│   │       ├── designer/[slug]/    # 设计师页
│   │       ├── about/              # 关于
│   │       └── contact/            # 联系
│   ├── api/
│   │   ├── auth/route.ts           # 登录/登出 API
│   │   ├── upload/route.ts         # 图片上传 API
│   │   ├── contact/route.ts        # 联系表单 API
│   │   └── admin/                  # REST API (Bearer token auth)
│   │       ├── items/              # GET/POST + [id] GET/PUT/DELETE + options
│   │       ├── products/           # GET/POST + [id] GET/PUT/DELETE
│   │       ├── customers/          # GET/POST + [id] GET/PUT/DELETE + options
│   │       ├── suppliers/          # GET/POST + [id] GET/PUT/DELETE
│   │       ├── sales-orders/       # GET/POST + [id] + next-number + available-items
│   │       └── dashboard/          # GET (stats + recent orders)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # shadcn vars + gallery design tokens
│   ├── robots.ts                   # SEO
│   └── sitemap.ts                  # SEO
├── components/
│   ├── admin/                      # 管理后台组件
│   │   ├── layout/                 # Sidebar, Topbar
│   │   ├── forms/                  # 各实体表单 (react-hook-form)
│   │   ├── dashboard/              # StatsCards, RecentOrders
│   │   └── ui/                     # StatusBadge, ImageUploader
│   ├── web/                        # 官网组件
│   │   ├── layout/                 # Header, Footer, LanguageSwitcher
│   │   ├── home/                   # HeroCarousel, FeaturedItems, etc.
│   │   ├── collection/             # ItemGrid, ItemCard, Filters, Pagination
│   │   ├── product/                # ImageGallery, ProductSpecs, RelatedItems
│   │   └── contact/                # ContactForm
│   └── ui/                         # shadcn/ui 基础组件 (17个)
├── lib/
│   ├── prisma.ts                   # PrismaClient 单例 (driver adapter)
│   ├── auth.ts                     # Cookie auth helpers
│   ├── api-auth.ts                 # Bearer token auth for REST API
│   ├── constants.ts                # 状态枚举/分类/设计师系列
│   ├── designers.ts                # 设计师 slug 映射 (client-safe)
│   ├── utils.ts                    # cn, formatRMB/USD, calcTotalCost, etc.
│   ├── validations.ts              # Zod schemas for all entities
│   ├── navigation.ts               # next-intl createNavigation helper
│   ├── i18n/routing.ts             # next-intl routing config
│   ├── i18n/request.ts             # next-intl request config
│   ├── services/                   # 业务逻辑层 (被 actions + API 共用)
│   │   ├── items.ts                # 库存 CRUD + SKU 自动生成
│   │   ├── products.ts             # 产品 CRUD
│   │   ├── customers.ts            # 客户 CRUD
│   │   ├── suppliers.ts            # 供应商 CRUD
│   │   ├── sales-orders.ts         # 订单 CRUD + 状态联动
│   │   └── dashboard.ts            # 统计 + 近期订单
│   ├── actions/                    # Server Actions (薄封装层: 调用 services → redirect/revalidate)
│   │   ├── suppliers.ts
│   │   ├── products.ts
│   │   ├── items.ts
│   │   ├── customers.ts
│   │   ├── sales-orders.ts
│   │   └── dashboard.ts
│   └── queries/
│       └── web.ts                  # 官网数据查询 (server-only)
├── messages/
│   ├── zh.json                     # 中文翻译
│   └── en.json                     # 英文翻译
├── prisma/
│   ├── schema.prisma               # 11 models
│   ├── seed.ts                     # 种子数据
│   └── migrations/                 # SQLite migrations
├── prisma.config.ts                # Prisma 7 config
└── public/uploads/                 # 上传的图片文件
```

---

## 开发命令

```bash
# 启动开发服务器 (localhost:3000)
npm run dev

# 数据库迁移
npx prisma migrate dev --name <name>

# 生成 Prisma Client
npx prisma generate

# 导入种子数据
npx prisma db seed

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## REST API (Agent 调用接口)

所有 `/api/admin/*` 端点需要 Bearer Token 认证：

```
Authorization: Bearer ${ADMIN_API_SECRET}
```

### 架构：三层复用

```
Service Layer (lib/services/)     ← 纯业务逻辑
  ├── Server Actions (lib/actions/) ← 前端表单 → redirect/revalidate
  └── REST API (app/api/admin/)     ← Agent 调用 → JSON response
```

### 端点一览

| 实体      | 列表              | 详情                   | 创建               | 更新                   | 删除                      | 其他                          |
| --------- | ----------------- | ---------------------- | ------------------ | ---------------------- | ------------------------- | ----------------------------- |
| Items     | GET /items        | GET /items/[id]        | POST /items        | PUT /items/[id]        | DELETE /items/[id]        | GET /items/options            |
| Products  | GET /products     | GET /products/[id]     | POST /products     | PUT /products/[id]     | DELETE /products/[id]     | —                             |
| Customers | GET /customers    | GET /customers/[id]    | POST /customers    | PUT /customers/[id]    | DELETE /customers/[id]    | GET /customers/options        |
| Suppliers | GET /suppliers    | GET /suppliers/[id]    | POST /suppliers    | PUT /suppliers/[id]    | DELETE /suppliers/[id]    | —                             |
| Orders    | GET /sales-orders | GET /sales-orders/[id] | POST /sales-orders | PUT /sales-orders/[id] | DELETE /sales-orders/[id] | next-number, available-items  |
| Dashboard | GET /dashboard    | —                      | —                  | —                      | —                         | ?section=stats\|recent-orders |

- Items 列表支持 `?status=&designer=&category=&q=&limit=` 筛选
- PUT 支持 partial update（只传需改字段，自动与现有数据合并）
- 订单 `orderNumber`、`totalAmount`、`grossProfit` 自动生成/计算

### OpenClaw Skill

Gallery Agent (圈宝) 通过 `gallery-api.mjs` 脚本调用 API：

```bash
node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/gallery-api.mjs <action> [options]
```

配置在 `~/.openclaw/openclaw.json` → `gallery-ops` 节。

---

## 关键技术注意事项

### Prisma 7 特殊配置

- 使用 `prisma.config.ts`（不是 schema 里的 datasource url）
- 必须使用 driver adapter: `@prisma/adapter-better-sqlite3`
- Client 生成到 `lib/generated/prisma/`，import 路径: `@/lib/generated/prisma/client`
- 不支持 native enum（使用 String + 应用层 zod 验证）
- 不支持 Decimal（使用 Float，对 ~100 件库存规模足够）

### Zod 4 + react-hook-form

- zodResolver 类型与 Zod 4 有兼容性问题，使用 `as never` cast
- schema 中不使用 `.default()`（在表单 defaultValues 和 server action 中处理默认值）

### Client/Server 边界

- `lib/queries/web.ts` 是 server-only（import prisma）
- `lib/designers.ts` 是 client-safe（纯数据常量）
- Client Components 不可直接 import `lib/queries/` 或 `lib/prisma.ts`

### Next.js 16 注意

- Page 组件的 `params` 和 `searchParams` 是 Promise，需 await
- middleware 已被标记 deprecated，将迁移至 proxy

---

## 数据模型 (11 models)

| Model          | 说明       | 关键字段                                          |
| -------------- | ---------- | ------------------------------------------------- |
| User           | 管理员账户 | email, passwordHash, role                         |
| Product        | 产品 SPU   | nameZh/En, category, designer, slug, featured     |
| ProductImage   | 产品图片   | productId, url, isPrimary                         |
| Item           | 库存 SKU   | productId, supplierId, status, totalCost, slug    |
| ItemImage      | 库存图片   | itemId, url, isPrimary                            |
| Customer       | 客户       | name, type, source, phone, wechat                 |
| SalesOrder     | 销售订单   | orderNumber, customerId, totalAmount, grossProfit |
| SalesOrderItem | 订单行项   | salesOrderId, itemId, price, cost                 |
| Supplier       | 供应商     | name, code, country, status                       |
| HeroSlide      | 首页轮播   | imageUrl, titleZh/En, active                      |
| ContactInquiry | 联系表单   | email, message, itemRef, read                     |

---

## 业务逻辑要点

- 订单状态 → COMPLETED 时，自动将关联 Item.status 更新为 SOLD
- 订单取消/删除时，恢复 Item.status 为 IN_STOCK
- 总成本自动计算：`totalCost = shippingCostRmb + customsFees + importDuties + purchasePriceRmb`
- 订单金额自动计算：`totalAmount = sum(行项售价)`，`grossProfit = totalAmount - totalCost`
- 初始管理员：admin@gallery.local / Gallery2025!
- 官网只展示 `showOnWebsite = true` 的 Item
- 联系表单支持从详情页带入 itemRef（`/contact?item={slug}`）

---

## 官网设计语言

- 极简画廊美学
- 色板：奶白 `#FAF8F5`、灰褐 `#8B7E74`、炭灰 `#2C2C2C`、黄铜 `#B8956A`
- 字体：Playfair Display (标题) + Inter (正文) + Noto Serif/Sans SC (中文)
- CSS 变量：`--gallery-cream`, `--gallery-warm-gray`, `--gallery-charcoal`, `--gallery-brass`
- 大量留白 (section 间距 80-120px)，hover 图片 scale(1.03)

---

## 管理后台 UI 规范

- 背景 `#f7f7f7`，卡片白底 + `border-[#e8eaed]`
- 主色 `#1a73e8`，文字 `#202124` / `#5f6368`
- 页面标题 `text-[28px]`，正文 `text-[13px]`
- shadcn/ui 组件为基础，toast 用 sonner
