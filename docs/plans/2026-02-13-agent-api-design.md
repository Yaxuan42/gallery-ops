# Gallery-Ops Agent API 设计方案

> 更新：2026-02-13
>
> 目标：将管理后台的全部操作能力通过 REST API 暴露，供 OpenClaw gallery agent（圈宝）在飞书中使用

---

## 1. 架构

```
家属 ←→ 飞书群 ←→ 圈宝 Agent (workspace-gallery)
                        │
                  gallery-ops skill
                   (scripts/gallery-api.mjs)
                        │
                        ▼
                 REST API Layer
                 /api/admin/*
                    Bearer Token
                        │
                        ▼
                  Service Layer
                  lib/services/*
                (纯业务逻辑，无 redirect)
                        │
                        ▼
                  Prisma + SQLite
```

### 三层职责

| 层            | 位置                       | 职责                                                                         |
| ------------- | -------------------------- | ---------------------------------------------------------------------------- |
| Service       | `lib/services/*.ts`        | 纯业务逻辑：校验、计算、数据库读写。返回数据或抛异常。无 redirect/revalidate |
| Server Action | `lib/actions/*.ts`         | 前端表单调用入口。调 Service → catch error → revalidatePath → redirect       |
| REST API      | `app/api/admin/*/route.ts` | Agent 调用入口。校验 Bearer Token → 调 Service → 返回 JSON                   |

核心原则：**业务逻辑只写一次**，在 Service Layer 中。

---

## 2. 认证

### API Token

```env
# .env
ADMIN_API_SECRET=<随机生成的 64 字符 hex>
```

```typescript
// lib/api-auth.ts
import { NextRequest, NextResponse } from "next/server";

export function requireApiAuth(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // auth passed
}
```

所有 `/api/admin/*` 路由的第一行调用此函数。

理由：单用户 Mac Mini 本地部署，静态 token 足够。无需 OAuth/JWT 复杂度。

---

## 3. API 端点设计

### 3.1 库存 (Items / SKU)

**日常操作频率最高**，设计最详细。

#### `GET /api/admin/items`

查询库存列表。支持筛选和搜索。

```
Query params:
  ?status=IN_STOCK          # 按状态筛选
  ?designer=昌迪加尔         # 按设计师系列筛选
  ?category=椅子             # 按品类筛选
  ?q=PJ-001                 # 搜索（skuCode / name / nameEn）
  ?limit=50                 # 分页

Response 200:
{
  "data": [
    {
      "id": "cuid",
      "skuCode": "PJ-001",
      "name": "PJ办公椅 #001",
      "nameEn": "PJ Office Chair #001",
      "status": "IN_STOCK",
      "listPrice": 38000,
      "sellingPrice": null,
      "totalCost": 15000,
      "conditionGrade": "B",
      "material": "柚木 + 藤编",
      "era": "1955-1960",
      "designerSeries": "昌迪加尔",
      "product": { "nameZh": "PJ办公椅" },
      "supplier": { "name": "Aarge Overseas" },
      "primaryImage": "/uploads/items/.../thumb.webp"
    }
  ],
  "total": 15
}
```

#### `GET /api/admin/items/:id`

获取单个库存详情（含所有字段、图片、关联产品/供应商）。

```
Response 200:
{
  "data": {
    "id": "cuid",
    "skuCode": "PJ-001",
    "name": "...",
    // ...全部字段
    "product": { "id": "...", "nameZh": "...", "nameEn": "..." },
    "supplier": { "id": "...", "name": "..." },
    "images": [{ "url": "...", "isPrimary": true, "sortOrder": 0 }],
    "recommendation": "这把椅子来自昌迪加尔..."
  }
}
```

#### `POST /api/admin/items`

创建库存。SKU 编号自动生成。

```
Request body:
{
  "name": "PJ办公椅 #002",
  "nameEn": "PJ Office Chair #002",
  "productId": "cuid-of-product",     // 可选
  "supplierId": "cuid-of-supplier",   // 可选
  "designerSeries": "昌迪加尔",
  "material": "柚木 + 藤编",
  "era": "1955-1960",
  "conditionGrade": "B",
  "listPrice": 38000,
  "sellingPrice": 35000,
  "purchasePriceUsd": 5600,
  "shippingCostRmb": 3000,
  "customsFees": 500,
  "importDuties": 200,
  "purchasePriceRmb": 0,
  "status": "IN_STOCK",
  "showOnWebsite": true,
  "recommendation": "..."
}

Response 201:
{
  "data": {
    "id": "new-cuid",
    "skuCode": "PJ-012",
    // ...全部字段
  }
}

Response 400:
{ "error": "名称必填" }
```

#### `PUT /api/admin/items/:id`

更新库存。只传需要修改的字段（partial update）。

```
Request body:
{
  "sellingPrice": 42000,
  "status": "RESERVED",
  "recommendation": "更新后的推荐语"
}

Response 200:
{ "data": { ...updated item } }
```

#### `DELETE /api/admin/items/:id`

删除库存。

```
Response 200:
{ "success": true, "deleted": { "skuCode": "PJ-012", "name": "..." } }
```

#### `GET /api/admin/items/options`

创建库存时需要的选项（产品列表、供应商列表、枚举值）。

```
Response 200:
{
  "products": [{ "id": "...", "nameZh": "...", "nameEn": "..." }],
  "suppliers": [{ "id": "...", "name": "..." }],
  "categories": ["椅子", "桌子", ...],
  "designerSeries": ["Eames", "昌迪加尔", ...],
  "conditionGrades": ["A", "B", "C", "D"],
  "statuses": ["IN_STOCK", "IN_TRANSIT", "SOLD", "RESERVED"]
}
```

---

### 3.2 产品 (Products / SPU)

| Method | Path                      | 说明                            |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/api/admin/products`     | 产品列表（含首图、关联 SKU 数） |
| GET    | `/api/admin/products/:id` | 产品详情（含全部图片）          |
| POST   | `/api/admin/products`     | 创建产品                        |
| PUT    | `/api/admin/products/:id` | 更新产品                        |
| DELETE | `/api/admin/products/:id` | 删除产品                        |

Request/Response 格式与 Items 类似，字段对应 `productSchema`。

---

### 3.3 客户 (Customers)

| Method | Path                           | 说明                     |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/admin/customers`         | 客户列表（含订单数）     |
| GET    | `/api/admin/customers/:id`     | 客户详情（含关联订单）   |
| POST   | `/api/admin/customers`         | 创建客户                 |
| PUT    | `/api/admin/customers/:id`     | 更新客户                 |
| DELETE | `/api/admin/customers/:id`     | 删除客户                 |
| GET    | `/api/admin/customers/options` | 客户选项（用于订单创建） |

---

### 3.4 供应商 (Suppliers)

| Method | Path                       | 说明       |
| ------ | -------------------------- | ---------- |
| GET    | `/api/admin/suppliers`     | 供应商列表 |
| GET    | `/api/admin/suppliers/:id` | 供应商详情 |
| POST   | `/api/admin/suppliers`     | 创建供应商 |
| PUT    | `/api/admin/suppliers/:id` | 更新供应商 |
| DELETE | `/api/admin/suppliers/:id` | 删除供应商 |

---

### 3.5 订单 (Sales Orders)

| Method | Path                                  | 说明                          |
| ------ | ------------------------------------- | ----------------------------- |
| GET    | `/api/admin/sales-orders`             | 订单列表（含客户名、商品数）  |
| GET    | `/api/admin/sales-orders/:id`         | 订单详情（含行项明细）        |
| POST   | `/api/admin/sales-orders`             | 创建订单（自动计算总额/毛利） |
| PUT    | `/api/admin/sales-orders/:id`         | 更新订单（含状态变更联动）    |
| DELETE | `/api/admin/sales-orders/:id`         | 删除订单（恢复库存状态）      |
| GET    | `/api/admin/sales-orders/next-number` | 获取下一个订单编号            |

**创建订单 Request:**

```json
{
  "customerId": "cuid",
  "orderDate": "2026-02-13",
  "status": "PENDING",
  "items": [{ "itemId": "cuid-of-item", "price": 38000, "cost": 15000 }],
  "shippingAddr": "上海市...",
  "notes": "客户要求2月底前发货"
}
```

`orderNumber` 由服务端自动生成（`SO-2026-NNN`）。

---

### 3.6 仪表盘 (Dashboard)

| Method | Path                                 | 说明                                     |
| ------ | ------------------------------------ | ---------------------------------------- |
| GET    | `/api/admin/dashboard/stats`         | KPI 数字（月营收、毛利、库存数、客户数） |
| GET    | `/api/admin/dashboard/recent-orders` | 最近 10 笔订单                           |

---

### 3.7 错误响应格式（统一）

```json
// 400 Bad Request（校验失败）
{ "error": "名称必填" }

// 401 Unauthorized
{ "error": "Unauthorized" }

// 404 Not Found
{ "error": "资源不存在" }

// 500 Internal Server Error
{ "error": "服务器内部错误" }
```

---

## 4. Service Layer 重构

### 重构模式

**Before（当前 Server Action）：**

```typescript
// lib/actions/items.ts
export async function createItem(data: ItemFormData, images: ImageInput[]) {
  try {
    const parsed = itemSchema.parse(data);
    const totalCost = calcTotalCost(parsed);
    const slug = generateSlug(parsed.nameEn || parsed.name, existingSlugs);
    const skuCode = await generateSkuCode(parsed.designerSeries);
    const item = await prisma.item.create({ data: { ...parsed, totalCost, slug, skuCode } });
    // images...
  } catch (e) {
    return { error: message };
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}
```

**After（Service + Action + API）：**

```typescript
// lib/services/items.ts — 纯业务逻辑
export async function createItemService(
  data: ItemFormData,
  images: ImageInput[] = [],
): Promise<Item> {
  const parsed = itemSchema.parse(data);
  const totalCost = calcTotalCost(parsed);
  const existingSlugs = (await prisma.item.findMany({ select: { slug: true } })).map((i) => i.slug);
  const slug = generateSlug(parsed.nameEn || parsed.name, existingSlugs);
  const skuCode = await generateSkuCode(parsed.designerSeries);

  const item = await prisma.item.create({
    data: {
      ...parsed,
      totalCost,
      slug,
      skuCode,
      images: images.length > 0 ? { create: images } : undefined,
    },
    include: { product: true, supplier: true, images: true },
  });
  return item;
}

// lib/actions/items.ts — 前端表单入口（不变的调用方式）
export async function createItem(data: ItemFormData, images: ImageInput[]) {
  try {
    await createItemService(data, images);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "创建失败" };
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

// app/api/admin/items/route.ts — Agent API 入口
export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const item = await createItemService(body, []);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

### 需要重构的文件

| Service 文件                   | 提取自                        | 函数                                                                                               |
| ------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `lib/services/items.ts`        | `lib/actions/items.ts`        | listItems, getItem, createItem, updateItem, deleteItem, getItemOptions                             |
| `lib/services/products.ts`     | `lib/actions/products.ts`     | listProducts, getProduct, createProduct, updateProduct, deleteProduct                              |
| `lib/services/customers.ts`    | `lib/actions/customers.ts`    | listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerOptions     |
| `lib/services/suppliers.ts`    | `lib/actions/suppliers.ts`    | listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier                         |
| `lib/services/sales-orders.ts` | `lib/actions/sales-orders.ts` | listOrders, getOrder, createOrder, updateOrder, deleteOrder, getNextOrderNumber, getAvailableItems |
| `lib/services/dashboard.ts`    | `lib/actions/dashboard.ts`    | getStats, getRecentOrders                                                                          |

---

## 5. OpenClaw Skill 设计

### 安装位置

```
~/.openclaw/workspace-gallery/skills/gallery-ops/
├── SKILL.md
└── scripts/
    └── gallery-api.mjs
```

### SKILL.md

```markdown
---
name: gallery-ops
description: 中古画廊管理系统操作技能。查询和管理库存、产品、客户、订单、供应商。
user-invocable: true
metadata:
  openclaw:
    emoji: "🏛️"
    always: true
---

# Gallery-Ops 管理技能

通过 REST API 操作画廊管理系统。

## 使用方式

通过 exec 调用脚本：

\`\`\`bash
node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/gallery-api.mjs <action> [options]
\`\`\`

## 可用操作

### 库存 (Items)

- `list-items [--status X] [--designer X] [--q X]` — 查询库存列表
- `get-item <id>` — 查看库存详情
- `create-item --data '{...}'` — 创建库存（SKU 编号自动生成）
- `update-item <id> --data '{...}'` — 更新库存
- `delete-item <id>` — 删除库存
- `item-options` — 获取产品/供应商/枚举选项

### 产品 (Products)

- `list-products` — 产品列表
- `get-product <id>` — 产品详情
- `create-product --data '{...}'`
- `update-product <id> --data '{...}'`
- `delete-product <id>`

### 客户 (Customers)

- `list-customers` — 客户列表
- `get-customer <id>` — 客户详情（含订单历史）
- `create-customer --data '{...}'`
- `update-customer <id> --data '{...}'`
- `delete-customer <id>`

### 订单 (Sales Orders)

- `list-orders` — 订单列表
- `get-order <id>` — 订单详情
- `create-order --data '{...}'` — 创建订单（编号自动生成、金额自动计算）
- `update-order <id> --data '{...}'` — 更新订单（状态变更自动联动库存）
- `delete-order <id>` — 删除订单（自动恢复库存状态）
- `available-items` — 查询可售库存

### 供应商 (Suppliers)

- `list-suppliers`
- `get-supplier <id>`
- `create-supplier --data '{...}'`
- `update-supplier <id> --data '{...}'`
- `delete-supplier <id>`

### 仪表盘

- `dashboard` — 月营收、毛利、库存数、客户数
- `recent-orders` — 最近 10 笔订单

## 字段参考

### 创建库存必填

- `name`: 中文名称

### 创建库存常用字段

- `designerSeries`: Eames / 昌迪加尔 / Le Corbusier / Charlotte Perriand / Jean Prouve / Pierre Chapo
- `material`: 如 "柚木 + 藤编"
- `era`: 如 "1955-1960"
- `conditionGrade`: A / B / C / D
- `listPrice`: 标价（人民币）
- `purchasePriceUsd`: 采购价（美元）
- `status`: IN_STOCK（默认）/ IN_TRANSIT / RESERVED

### 创建订单

- `customerId`: 客户 ID（先查客户列表获取）
- `items`: [{ itemId, price, cost }]（先查可售库存获取 ID 和成本）

## 确认机制

**所有写操作（create/update/delete）执行前，必须先向用户展示操作摘要，获得确认后再执行。**

展示格式示例：

> 即将创建库存：
>
> - 名称：PJ办公椅 #002
> - 系列：昌迪加尔
> - 品相：B
> - 标价：¥38,000
>
> 确认执行吗？
```

### gallery-api.mjs 核心逻辑

```javascript
#!/usr/bin/env node
// 从环境变量或 openclaw.json 读取配置
const API_BASE = process.env.GALLERY_API_BASE || "http://localhost:3000";
const API_SECRET = process.env.GALLERY_API_SECRET || readFromConfig();

// 统一 HTTP 调用
async function api(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_SECRET}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// 路由到对应操作
const [action, ...args] = process.argv.slice(2);
// switch(action) { case "list-items": ... }
```

---

## 6. 确认流程

所有写操作在 Agent 层面实现两阶段确认，**API 本身不需要 preview 端点**。

```
用户: "帮我上架一个新的 PJ 办公椅，Aarge 那边进的，B品，标价3.8万"

Agent 思考:
  1. 调用 item-options 获取 productId 和 supplierId
  2. 构造创建数据
  3. 展示预览卡片给用户

Agent 回复（飞书卡片）:
  ┌─────────────────────────┐
  │ 📦 即将创建库存           │
  │                         │
  │ 名称：PJ办公椅 #XXX      │
  │ 系列：昌迪加尔            │
  │ 供应商：Aarge Overseas    │
  │ 品相：B                  │
  │ 标价：¥38,000            │
  │ 状态：现货                │
  │                         │
  │ 确认创建吗？              │
  └─────────────────────────┘

用户: "好的"

Agent:
  1. 调用 create-item
  2. 返回结果

Agent 回复:
  ✅ 已创建库存 PJ-012「PJ办公椅 #XXX」
```

确认逻辑由 SKILL.md 中的指令约束，Agent 在对话中自然执行。

---

## 7. 配置变更

### .env 新增

```env
ADMIN_API_SECRET=<生成的 token>
```

### openclaw.json 新增（gallery agent 配置）

```json
{
  "gallery-ops": {
    "apiBase": "http://localhost:3000",
    "apiSecret": "<同上 token>"
  }
}
```

---

## 8. 实现任务清单

### Phase 1: Service Layer 提取（前置，不影响前端）

| #   | 任务                                 | 文件                             |
| --- | ------------------------------------ | -------------------------------- |
| 1   | 创建 `lib/api-auth.ts`               | 新建                             |
| 2   | 提取 `lib/services/items.ts`         | 从 `lib/actions/items.ts`        |
| 3   | 提取 `lib/services/products.ts`      | 从 `lib/actions/products.ts`     |
| 4   | 提取 `lib/services/customers.ts`     | 从 `lib/actions/customers.ts`    |
| 5   | 提取 `lib/services/suppliers.ts`     | 从 `lib/actions/suppliers.ts`    |
| 6   | 提取 `lib/services/sales-orders.ts`  | 从 `lib/actions/sales-orders.ts` |
| 7   | 提取 `lib/services/dashboard.ts`     | 从 `lib/actions/dashboard.ts`    |
| 8   | 重写 `lib/actions/*.ts` 调用 Service | 修改 6 个文件                    |
| 9   | 验证：`npm run build` + 前端功能回归 | —                                |

### Phase 2: REST API 端点

| #   | 任务                    | 路由文件                                                |
| --- | ----------------------- | ------------------------------------------------------- |
| 10  | Items CRUD API          | `app/api/admin/items/route.ts` + `[id]/route.ts`        |
| 11  | Items options API       | `app/api/admin/items/options/route.ts`                  |
| 12  | Products CRUD API       | `app/api/admin/products/route.ts` + `[id]/route.ts`     |
| 13  | Customers CRUD API      | `app/api/admin/customers/route.ts` + `[id]/route.ts`    |
| 14  | Suppliers CRUD API      | `app/api/admin/suppliers/route.ts` + `[id]/route.ts`    |
| 15  | Sales Orders CRUD API   | `app/api/admin/sales-orders/route.ts` + `[id]/route.ts` |
| 16  | Dashboard API           | `app/api/admin/dashboard/route.ts`                      |
| 17  | 验证：curl 测试全部端点 | —                                                       |

### Phase 3: OpenClaw Skill

| #   | 任务                        | 文件                                            |
| --- | --------------------------- | ----------------------------------------------- |
| 18  | 编写 `gallery-api.mjs` 脚本 | `workspace-gallery/skills/gallery-ops/scripts/` |
| 19  | 编写 `SKILL.md`             | `workspace-gallery/skills/gallery-ops/`         |
| 20  | 更新 gallery workspace 配置 | `AGENTS.md` / `SOUL.md`                         |
| 21  | 端到端测试：飞书对话验证    | —                                               |

### Phase 4: 文档同步

| #   | 任务                               |
| --- | ---------------------------------- |
| 22  | 更新 `CLAUDE.md` 加入 API 端点文档 |
| 23  | 更新 `ARCHITECTURE-CURRENT.md`     |

---

## 9. 不做的事（v1 边界）

- 图片上传 API（v2 再做）
- HeroSlide 管理 API（低频操作，在后台 UI 做）
- ContactInquiry 管理 API（同上）
- 用户管理 API（单管理员）
- API 限流/审计日志（部署环境不需要）
- OpenAPI/Swagger 文档生成（过度工程）
