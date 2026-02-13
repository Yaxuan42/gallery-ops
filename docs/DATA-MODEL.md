# 数据模型 (Data Model)

## 1. ER 关系图

```
Supplier 1──N Item
Product  1──N Item
Product  1──N ProductImage
Item     1──N ItemImage
Item     N──N SalesOrder  (through SalesOrderItem)
Customer 1──N SalesOrder
Supplier 1──N PurchaseOrder
PurchaseOrder 1──N PurchaseOrderItem
```

---

## 2. 完整 Prisma Schema

### 2.1 Product（商品目录）

商品是品类层面的抽象，每个商品可以对应多个库存单件。

```prisma
model Product {
  id              String   @id @default(cuid())
  nameZh          String   @map("name_zh")              // 中文名：袋鼠椅
  nameEn          String   @map("name_en")              // English: Kangaroo Chair
  category        String                                 // 大类：椅子、桌子、收纳、灯具...
  subcategory     String?                                // 小类：休闲椅、办公椅...
  model           String?                                // 型号：PJ-SI-59
  descriptionZh   String?  @map("description_zh") @db.Text  // 中文详细描述
  descriptionEn   String?  @map("description_en") @db.Text  // English description
  designer        String?                                // 设计师名称
  designerSeries  String?  @map("designer_series")       // 设计师系列：Eames/昌迪加尔
  priceRangeLow   Decimal? @map("price_range_low") @db.Decimal(12,2)
  priceRangeHigh  Decimal? @map("price_range_high") @db.Decimal(12,2)
  collectionValue String?  @map("collection_value") @db.Text
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
```

### 2.2 Item（库存单件）

每件实际库存品，含完整成本核算。

```prisma
model Item {
  id               String     @id @default(cuid())
  productId        String?    @map("product_id")
  product          Product?   @relation(fields: [productId], references: [id])
  name             String                                 // 中文名：原型蜡木DCW
  nameEn           String?    @map("name_en")             // English name
  notes            String?    @db.Text                    // 备注
  manufacturer     String?                                // 厂家：Evans, Zenith...
  era              String?                                // 年代：1945-46
  material         String?                                // 材质
  dimensions       String?                                // 尺寸 L x W x H
  conditionGrade   String?    @map("condition_grade")     // 成色等级 A/B/C/D
  designerSeries   String?    @map("designer_series")     // 设计师系列

  supplierId       String?    @map("supplier_id")
  supplier         Supplier?  @relation(fields: [supplierId], references: [id])

  // 定价
  listPrice        Decimal?   @map("list_price") @db.Decimal(12,2)      // 标价 (RMB)
  sellingPrice     Decimal?   @map("selling_price") @db.Decimal(12,2)   // 实际售价 (RMB)

  // 成本明细
  shippingCostUsd  Decimal?   @map("shipping_cost_usd") @db.Decimal(12,2)
  shippingCostRmb  Decimal?   @map("shipping_cost_rmb") @db.Decimal(12,2)
  customsFees      Decimal?   @map("customs_fees") @db.Decimal(12,2)
  importDuties     Decimal?   @map("import_duties") @db.Decimal(12,2)
  purchasePriceUsd Decimal?   @map("purchase_price_usd") @db.Decimal(12,2)
  purchasePriceRmb Decimal?   @map("purchase_price_rmb") @db.Decimal(12,2)
  totalCost        Decimal?   @map("total_cost") @db.Decimal(12,2)

  // 状态与展示
  status           ItemStatus @default(IN_STOCK)
  showOnWebsite    Boolean    @default(true) @map("show_on_website")
  slug             String     @unique

  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")

  images           ItemImage[]
  salesOrderItems  SalesOrderItem[]

  @@map("items")
}

enum ItemStatus {
  IN_STOCK     // 现货
  IN_TRANSIT   // 在途（未清关）
  SOLD         // 已售
  RESERVED     // 预留
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
```

### 2.3 Customer（客户）

```prisma
model Customer {
  id          String       @id @default(cuid())
  name        String
  type        CustomerType @default(INDIVIDUAL)
  source      String?                                    // 来源渠道
  phone       String?
  email       String?
  wechat      String?
  address     String?      @db.Text
  notes       String?      @db.Text
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  salesOrders SalesOrder[]

  @@map("customers")
}

enum CustomerType {
  INDIVIDUAL        // 散客
  COMMERCIAL_SPACE  // 商业空间
  GALLERY           // 画廊
}
```

### 2.4 SalesOrder（销售订单）

```prisma
model SalesOrder {
  id            String           @id @default(cuid())
  orderNumber   String           @unique @map("order_number")
  customerId    String           @map("customer_id")
  customer      Customer         @relation(fields: [customerId], references: [id])
  orderDate     DateTime         @map("order_date")
  deliveryDate  DateTime?        @map("delivery_date")
  totalAmount   Decimal          @map("total_amount") @db.Decimal(12,2)
  totalCost     Decimal          @map("total_cost") @db.Decimal(12,2)
  grossProfit   Decimal          @map("gross_profit") @db.Decimal(12,2)
  status        SalesOrderStatus @default(PENDING)
  paymentDate   DateTime?        @map("payment_date")
  shippingAddr  String?          @map("shipping_addr") @db.Text
  notes         String?          @db.Text
  createdAt     DateTime         @default(now()) @map("created_at")
  updatedAt     DateTime         @updatedAt @map("updated_at")

  items         SalesOrderItem[]

  @@map("sales_orders")
}

enum SalesOrderStatus {
  PENDING     // 待处理
  CONFIRMED   // 已确认
  PAID        // 已全款
  SHIPPED     // 已发货
  COMPLETED   // 已完成
  CANCELLED   // 已取消
}

model SalesOrderItem {
  id           String     @id @default(cuid())
  salesOrderId String     @map("sales_order_id")
  salesOrder   SalesOrder @relation(fields: [salesOrderId], references: [id], onDelete: Cascade)
  itemId       String     @map("item_id")
  item         Item       @relation(fields: [itemId], references: [id])
  price        Decimal    @db.Decimal(12,2)
  cost         Decimal    @db.Decimal(12,2)

  @@map("sales_order_items")
}
```

### 2.5 PurchaseOrder（采购订单）

```prisma
model PurchaseOrder {
  id              String              @id @default(cuid())
  orderNumber     String              @unique @map("order_number")
  supplierId      String              @map("supplier_id")
  supplier        Supplier            @relation(fields: [supplierId], references: [id])
  downPayment     Decimal?            @map("down_payment") @db.Decimal(12,2)
  orderDate       DateTime?           @map("order_date")
  selectionDate   DateTime?           @map("selection_date")
  publishDate     DateTime?           @map("publish_date")
  repairPeriod    String?             @map("repair_period")
  repairPayment   Decimal?            @map("repair_payment") @db.Decimal(12,2)
  shippingBalance Decimal?            @map("shipping_balance") @db.Decimal(12,2)
  balanceDate     DateTime?           @map("balance_date")
  contractTotal   Decimal?            @map("contract_total") @db.Decimal(12,2)
  totalCost       Decimal?            @map("total_cost") @db.Decimal(12,2)
  soldAmount      Decimal?            @map("sold_amount") @db.Decimal(12,2)
  pendingValue    Decimal?            @map("pending_value") @db.Decimal(12,2)
  recoveredAmount Decimal?            @map("recovered_amount") @db.Decimal(12,2)
  shippingDate    DateTime?           @map("shipping_date")
  arrivalDate     DateTime?           @map("arrival_date")
  status          PurchaseOrderStatus @default(DRAFT)
  notes           String?             @db.Text
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  items           PurchaseOrderItem[]

  @@map("purchase_orders")
}

enum PurchaseOrderStatus {
  DRAFT       // 草稿
  SUBMITTED   // 已提交
  IN_TRANSIT  // 运输中/在途
  CUSTOMS     // 清关中
  RECEIVED    // 已收货
  COMPLETED   // 已完成
  CANCELLED   // 已取消
}

model PurchaseOrderItem {
  id              String        @id @default(cuid())
  purchaseOrderId String        @map("purchase_order_id")
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  description     String
  quantity        Int           @default(1)
  unitPriceUsd    Decimal?      @map("unit_price_usd") @db.Decimal(12,2)
  unitPriceRmb    Decimal?      @map("unit_price_rmb") @db.Decimal(12,2)
  notes           String?       @db.Text

  @@map("purchase_order_items")
}
```

### 2.6 Supplier（供应商）

```prisma
model Supplier {
  id          String         @id @default(cuid())
  name        String
  code        String?        @unique
  country     String
  contactName String?        @map("contact_name")
  email       String?
  phone       String?
  wechat      String?
  address     String?        @db.Text
  status      SupplierStatus @default(ACTIVE)
  tags        String?
  notes       String?        @db.Text
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  items          Item[]
  purchaseOrders PurchaseOrder[]

  @@map("suppliers")
}

enum SupplierStatus {
  ACTIVE
  INACTIVE
  PAUSED
}
```

### 2.7 辅助模型

```prisma
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

model SiteSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String @db.Text
  @@map("site_settings")
}

model ContactInquiry {
  id        String   @id @default(cuid())
  name      String?
  email     String
  phone     String?
  subject   String?
  message   String   @db.Text
  itemRef   String?  @map("item_ref")
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("contact_inquiries")
}
```

---

## 3. 数据映射（CSV → 数据库）

| CSV 字段              | 数据库字段            | 转换规则        |
| --------------------- | --------------------- | --------------- |
| 状态="现货"           | status=IN_STOCK       | 枚举映射        |
| 状态="在途（未清关）" | status=IN_TRANSIT     | 枚举映射        |
| 客户类型="散客"       | type=INDIVIDUAL       | 枚举映射        |
| 客户类型="商业空间"   | type=COMMERCIAL_SPACE | 枚举映射        |
| 客户类型="画廊"       | type=GALLERY          | 枚举映射        |
| 中文名                | name + 自动生成 slug  | slugify(pinyin) |
| 采购价（人民币）      | purchasePriceRmb      | 解析为 Decimal  |
| 订单状态="已全款"     | status=PAID           | 枚举映射        |

---

## 4. 数据种子脚本

### 4.1 CSV 导入顺序（按依赖关系）

1. **Supplier** ← 经营分析\_Supplier.csv
2. **Product** ← 经营分析\_Product.csv
3. **Customer** ← 经营分析\_Customer.csv
4. **PurchaseOrder** ← 经营分析\_Purchase_Order.csv
5. **Item** ← 经营分析\_Item.csv（关联 Product + Supplier + PO + SO）
6. **SalesOrder** ← 经营分析\_Sales_Order.csv（关联 Customer + Item）

### 4.2 Slug 生成规则

- 英文名直接 slugify：`Kangaroo Chair` → `kangaroo-chair`
- 中文名转拼音后 slugify：`袋鼠椅` → `dai-shu-yi`
- 重复时追加数字后缀：`office-chair-2`

### 4.3 成本自动计算规则

```
totalCost = shippingCostRmb + customsFees + importDuties + purchasePriceRmb
```

### 4.4 初始管理员账号

```
email: admin@gallery.local
password: Gallery2025!
```
