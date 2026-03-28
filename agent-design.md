# 旧地数字合伙人 — v1 设计规范

## 定位

画廊的**数字合伙人**——人与数据系统之间的翻译层。人用自然语言说事情，Agent 理解业务语境，操作结构化数据，维护实体之间的一致性。

```
人（对话）→ Agent（理解 + 推断 + 路由）→ 数据系统（结构化存储）
                    ↕
              领域知识（推断 + 校验）
```

## 设计原则

1. **对话即操作** — 不要求人学习系统概念，说人话就能办事
2. **一个入口** — 所有业务操作通过同一个 Agent，内部路由到对应技能
3. **推断优先** — 能从上下文推断的不问，减少认知负担
4. **确认兜底** — 金额、状态变更等关键操作，必须确认后执行
5. **数据归一** — Agent 是唯一写入口，保证一致性
6. **联动自然** — 一句话可能触发多个技能协同，Agent 自行编排

---

## 数据模型

以 TypeScript 类型定义为权威建模语言。所有存储实现（JSON / DB / API）必须与此一致。

### 核心概念

```
Product（SPU，产品类型）
    ↓ 1:N
Item（SKU，具体藏品）←→ ConditionReport
    ↑                ↑
    |                |
Purchase（采购单）   Sale（销售单）→ Customer
    ↑
Supplier（供应商）

Exhibition ←→ Item（N:M）
```

**SPU vs SKU：**
- **Product（SPU）**= 产品类型模板。如"PJ-SI-59-A Low Caned Armless Easy Chair"——描述的是这个设计本身
- **Item（SKU）**= 具体藏品实例。如"JD-001"——你仓库里那一把具体的椅子，有自己的品相、来源、价格

SKU 继承 SPU 的共性属性（设计师、材质、年代），叠加自身的个性属性（品相、价格、溯源）。

### 类型定义

```typescript
// ============================================================
// Product（SPU — 产品类型）
// ============================================================
interface Product {
  id: string;                  // 型号即 ID，如 "PJ-SI-59-A"
  name: string;                // 英文名 "Low Caned Armless Easy Chair"
  nickname: string | null;     // 中文俗称 "袋鼠椅"
  category: string;            // 品类 "Chandigarh" / "Danish Modern" / ...
  designer: string | null;     // 设计师
  origin: string | null;       // 产地
  design_year: string | null;  // 设计年代，如 "1965" 或 "1960-65"
  materials: string[];         // 典型材质 ["Teak", "Cane"]

  // 面向用户的内容（人话，用于展示和介绍）
  description: string | null;  // 一段话介绍这个产品是什么
  design_story: string | null; // 设计语言、为什么长这样、为什么叫这个名字
  historical_context: string | null; // 历史背景、在 Chandigarh 项目中的角色

  // 品类特有属性
  extra: Record<string, unknown>;

  created_at: string;          // ISO 8601
  updated_at: string;
}

// ============================================================
// Item（SKU — 具体藏品）
// ============================================================
interface Item {
  id: string;                  // 内部编号 "JD-001"
  product_id: string;          // → Product.id（SPU 引用）

  // SKU 级别属性（覆盖或补充 SPU）
  production_year: string | null;    // 这件的生产年份
  condition: "A" | "B" | "C" | "D" | null;
  dimensions: string | null;        // "长×宽×高 cm"

  // 价格（每件不同）
  pricing: {
    retail: number | null;           // 定价（CNY）
    acquisition: number | null;      // 买手价（CNY）⚠️ 敏感
    reference: string | null;        // 参考公价（可能是范围或外币描述）
  };

  // 溯源（每件不同）
  provenance: {
    institution: string | null;      // 认证机构
    region: string | null;           // 来源区域
    previous_owner: string | null;   // 前使用者
  };

  // 管理
  status: "在库" | "在展" | "在途" | "已售" | "预定";
  location: string | null;           // 物理位置（仓库货架 / 展厅 / 运输中）
  photos: string[];
  notes: string | null;

  // 关联
  purchase_id: string | null;        // → Purchase.id
  sale_id: string | null;            // → Sale.id

  created_at: string;
  updated_at: string;
}

// ============================================================
// Customer（客户）
// ============================================================
interface Customer {
  id: string;                        // "C-001"
  name: string;                      // 称呼
  contact: string | null;            // 联系方式（手机/微信）
  type: "个人" | "商业空间" | "画廊" | "机构";
  source: string | null;             // 来源渠道
  interests: string[];               // 兴趣标签
  budget_range: string | null;       // 预算描述
  interactions: Interaction[];        // 互动记录（按时间追加）
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Interaction {
  date: string;                      // ISO 8601 date
  summary: string;                   // 一句话描述
}

// ============================================================
// Sale（销售单）
// ============================================================
interface Sale {
  id: string;                        // "SO-20260328-001"
  date: string;
  customer_id: string;               // → Customer.id
  item_ids: string[];                // → Item.id[]
  amount: number;
  currency: "CNY" | "USD";
  payment_status: "待付" | "部分付" | "已付";
  gross_profit: number | null;       // 自动计算：amount - Σ item.pricing.acquisition
  notes: string | null;
  created_at: string;
}

// ============================================================
// Purchase（采购单）
// ============================================================
interface Purchase {
  id: string;                        // "PO-20260328-001"
  date: string;
  supplier_id: string;               // → Supplier.id
  item_ids: string[];                // → Item.id[]
  cost: {
    goods: number;                   // 货款
    shipping: number | null;
    customs: number | null;
    other: number | null;
    total: number;                   // 总成本
  };
  currency: "CNY" | "USD";
  exchange_rate: number | null;      // 外币时记录汇率
  payment_status: "待付" | "部分付" | "已付";
  notes: string | null;
  created_at: string;
}

// ============================================================
// Supplier（供应商）
// ============================================================
interface Supplier {
  id: string;                        // "SUP-001"
  name: string;
  contact: string | null;
  region: string | null;             // 所在地区
  notes: string | null;
  created_at: string;
}

// ============================================================
// Exhibition（展览）
// ============================================================
interface Exhibition {
  id: string;                        // "EX-001"
  title: string;
  date_start: string | null;
  date_end: string | null;
  venue: string | null;
  status: "筹备中" | "进行中" | "已结束";
  item_ids: string[];                // → Item.id[]（展品，有序）
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// ConditionReport（品相报告）
// ============================================================
interface ConditionReport {
  id: string;                        // "CR-001"
  item_id: string;                   // → Item.id
  date: string;
  grade: "A" | "B" | "C" | "D";
  structure: string | null;          // 结构状态
  surface: string | null;            // 表面状态
  cane: string | null;               // 藤编状态（如适用）
  damage: string | null;             // 损伤描述
  photos: string[];
  recommendation: string | null;     // 修复建议
  created_at: string;
}
```

### 存储结构

```
data/
├── products.json           ← SPU 产品类型
├── items.json              ← SKU 藏品
├── customers.json          ← 客户
├── suppliers.json          ← 供应商
├── sales.json              ← 销售单
├── purchases.json          ← 采购单
├── exhibitions.json        ← 展览
└── condition-reports.json  ← 品相报告
```

每个文件统一信封结构：
```json
{
  "meta": { "version": "1.0", "last_updated": "ISO8601", "next_seq": 1 },
  "records": [ ... ]
}
```

---

## 技能设计

### 总览

| # | 技能 | 标识 | 触发示例 | 级别 |
|---|---|---|---|---|
| 1 | 录入藏品 | `add-item` | "新到了一把袋鼠椅" | P0 |
| 2 | 更新藏品 | `update-item` | "JD-001 品相改成 A" | P0 |
| 3 | 查询藏品 | `query-items` | "库里有几把椅子" | P0 |
| 4 | 维护产品类型 | `manage-product` | "加一个新 SPU" / "更新袋鼠椅的介绍" | P0 |
| 5 | 记录采购 | `record-purchase` | "从印度进了 5 件" | P0 |
| 6 | 记录销售 | `record-sale` | "袋鼠椅卖给张先生了" | P0 |
| 7 | 查询交易 | `query-transactions` | "这个月卖了多少" | P1 |
| 8 | 查询客户 | `query-customers` | "谁之前问过办公椅" | P1 |
| 9 | 创建展览 | `create-exhibition` | "下个月做个 Pop-up" | P1 |
| 10 | 管理展品 | `manage-exhibition` | "把 JD-001~005 加到展览" | P1 |
| 11 | 生成价目表 | `generate-pricelist` | "出一份展览价目表" | P1 |
| 12 | 生成藏品档案 | `generate-dossier` | "整理 JD-001 的完整档案" | P2 |
| 13 | 记录品相 | `record-condition` | "JD-003 有个裂纹" | P2 |
| 14 | 库存统计 | `inventory-stats` | "总库存价值" | P2 |
| 15 | 成本核算 | `cost-analysis` | "袋鼠椅的利润率" | P2 |

> 客户录入和更新不是独立技能——它们作为交易记录的自然副作用发生。

---

### 技能详细设计

#### `add-item` 录入藏品

**触发：** 新到 / 录入 / 入库 / 来了一件

**流程：**
```
用户描述
  ↓
提取字段 + 查找匹配的 Product（SPU）
  ↓
SPU 存在？──是──→ 引用已有 SPU，创建 Item（SKU）
  │
  否
  ↓
先创建新 SPU（触发 manage-product）→ 再创建 Item
  ↓
展示确认卡片 → 写入 → 返回编号
```

**推断规则（基于 knowledge.md）：**
- 型号 `PJ-*` → 设计师、产地、分类、材质
- "六几年的" → design_year ≈ "1960s"，production_year 留空
- "品相不错" → 不猜等级，追问 A 还是 B
- 未提状态 → 默认"在库"

**确认卡片：**
```
📦 JD-001 | Low Caned Armless Easy Chair（袋鼠椅）
   SPU: PJ-SI-59-A

基本：Pierre Jeanneret / Chandigarh, India
年代：设计 1965 / 生产 1965
规格：Teak, Cane / 品相 —
价格：定价 — / 买手价 — / 参考 —
状态：在库

⚡ 推断：设计师、产地、材质（基于 SPU PJ-SI-59-A）
```

**支持批量。**

---

#### `update-item` 更新藏品

**触发：** 改一下 / 更新 / 补充 / JD-XXX 的 xxx

**Diff 确认：**
```
📝 JD-001

  品相等级：— → A
  定价：— → ¥150,000

确认？
```

**联动：** 状态变更为"已售"时，检查是否有对应的 Sale 记录。

---

#### `query-items` 查询藏品

**触发：** 有什么 / 几件 / 查 / 找 / 库存

**能力：**
- 按状态 / 品类 / 设计师 / 价格区间筛选
- 单件详情（合并 SPU + SKU 展示完整信息）
- 全量概览

**输出：**
- 列表 → 精简表格（编号 / 名称 / 型号 / 状态）
- 单件 → 完整卡片（SPU 共性 + SKU 个性合并展示）
- 统计 → 数字 + 分类汇总

---

#### `manage-product` 维护产品类型（SPU）

**触发：**
- 新品入库时 SPU 不存在 → 自动触发
- "加一个新产品类型" / "更新袋鼠椅的介绍"
- "我们开始做 Danish Modern 了"

**两个场景：**

**a) 创建新 SPU**

```
Agent：这个型号我还没有记录。帮你创建产品类型：

📋 新产品类型 PJ-SI-59-A

名称：Low Caned Armless Easy Chair
俗称：袋鼠椅
品类：Chandigarh
设计师：Pierre Jeanneret
产地：Chandigarh, India
设计年代：1965
材质：Teak, Cane

描述：—（待补充）
设计故事：—（待补充）
历史背景：—（待补充）

确认先这样？描述可以之后再补。
```

**b) 更新 SPU 内容**

用户随时可以补充面向藏家的描述：
```
用户：袋鼠椅的介绍写一下，它因为侧面轮廓像袋鼠得名

Agent：我更新了 PJ-SI-59-A 的 design_story：

  "这把椅子因其侧面轮廓酷似袋鼠的姿态而得名'袋鼠椅'。
   低矮宽敞的座面搭配向后倾斜的靠背，形成独特的休憩姿态……"

你看这样写合适吗？还是你有自己的版本？
```

Agent 可以基于 knowledge.md 和用户提供的要点，帮助撰写面向藏家的 SPU 描述。

---

#### `record-sale` 记录销售

**触发：** 卖了 / 出了 / 成交 / xxx 买了

**一句话触发多个操作：**
```
用户："袋鼠椅卖给张先生了，15万，他是从小红书来的"
```

Agent 拆解为：
1. **识别藏品** → JD-001（袋鼠椅）
2. **识别/创建客户** → 查找"张先生"；不存在则新建，来源=小红书
3. **创建销售单** → SO-20260328-001，金额 ¥150,000
4. **更新藏品状态** → JD-001 在库 → 已售
5. **计算毛利** → 如有买手价则自动算

**确认卡片：**
```
🧾 SO-20260328-001

客户：张先生（新建 C-003，来源：小红书）
藏品：JD-001 Low Caned Armless Easy Chair（袋鼠椅）
成交价：¥150,000
成本：¥80,000 → 毛利：¥70,000（46.7%）

将同时更新：
  • JD-001 状态：在库 → 已售
  • 新建客户 C-003

确认？
```

---

#### `record-purchase` 记录采购

**触发：** 进了 / 买了 / 到货 / 从 xxx 拿的

**一句话触发：**
```
用户："从印度政府仓库进了 3 件，两把办公椅 PJ-SI-28-A 和一个文件架，总共 2 万美金"
```

Agent 拆解为：
1. **识别/创建供应商** → "印度政府仓库"
2. **匹配/创建 SPU** → PJ-SI-28-A（已有）、PJ-R-27-A（已有）
3. **创建 3 个 Item** → JD-XXX, JD-XXX, JD-XXX
4. **创建采购单** → PO-20260328-001，总成本 $20,000
5. **关联** → 每个 Item 挂 purchase_id

**确认卡片：**
```
📥 PO-20260328-001

供应商：印度政府仓库
总成本：$20,000（货款 $20,000）

藏品：
  • JD-006 Office Cane Chair（PJ-SI-28-A）
  • JD-007 Office Cane Chair（PJ-SI-28-A）
  • JD-008 File Rack（PJ-R-27-A）

将同时创建：
  • 3 件新藏品（状态：在途）
  • 供应商 SUP-002

确认？
```

---

#### `query-transactions` 查询交易

**触发：** 这个月 / 销售额 / 利润 / 采购记录

**能力：**
- 按时间："这个月卖了多少"
- 按客户："张先生买过什么"
- 按藏品："袋鼠椅的交易记录"
- 汇总："今年总销售额和毛利"

---

#### `query-customers` 查询客户

**触发：** 谁 / 哪个客户 / 联系方式

**能力：**
- 按兴趣："谁对办公椅感兴趣"
- 按来源："从小红书来的"
- 按交易："买过 Jeanneret 的客户"
- 单人详情："张先生的所有信息"

> 客户信息的创建和更新总是伴随交易或互动发生，不作为独立录入流程。

---

#### `create-exhibition` / `manage-exhibition`

**创建：**
```
用户：下个月在 M50 做个 Chandigarh 专题展

Agent：
🎨 EX-002 | Chandigarh 专题展
场地：M50 / 状态：筹备中
日期：待定

要从库存里选展品吗？
```

**管理展品：** 添加/移除展品，自动切换 Item 状态（在库↔在展）。

---

#### `generate-pricelist` 生成价目表

**输入：** 展览 ID 或藏品列表
**输出：** Markdown 格式，合并 SPU 描述 + SKU 定价

```
旧地 JIUDI — Chandigarh 专题展 价目表

1. Low Caned Armless Easy Chair
   PJ-SI-59-A | Pierre Jeanneret | c. 1965
   Teak, Cane | Condition: A
   ¥150,000
```

---

#### `generate-dossier` 藏品档案

合并 SPU 描述 + SKU 溯源 + 交易历史 + 展览历史 + 品相记录，生成完整档案。面向藏家展示用。

---

#### `record-condition` 品相报告

```
用户：JD-003 右侧扶手有条裂纹，不影响结构，拍了照片

Agent：
📋 品相报告 CR-001 → JD-003

等级：B（原 —）
结构：完好
表面：右侧扶手有裂纹（不影响结构）
建议：可考虑填充修复

JD-003 品相等级将更新为 B，确认？
```

---

#### `inventory-stats` / `cost-analysis`

统计查询，按需聚合数据。不改写任何数据。

---

## 技能路由

```
用户消息
  ↓
意图识别
  ↓
┌────────────────────────────────────────┐
│ 一句话可能命中多个技能，Agent 自行编排：  │
│                                        │
│ "从印度进了3件"                         │
│  → record-purchase                     │
│    → manage-product (如 SPU 不存在)     │
│    → add-item ×3                       │
│                                        │
│ "袋鼠椅卖给张先生了"                     │
│  → record-sale                         │
│    → 创建/匹配 Customer                 │
│    → update-item (状态→已售)            │
│                                        │
│ "更新袋鼠椅的介绍"                       │
│  → manage-product (更新 SPU 内容)       │
└────────────────────────────────────────┘
  ↓
聚合确认卡片 → 用户确认 → 批量写入 → 反馈
```

关键：**一次对话、一次确认、多个实体同步写入**。不要让用户分步确认。

---

## 优先级

### P0 — 核心数据闭环
- `add-item` / `update-item` / `query-items`
- `manage-product`（SPU 维护）
- `record-purchase` / `record-sale`

这 6 个技能覆盖：藏品进 → 藏品管理 → 藏品出，以及支撑它们的 SPU 产品类型体系。客户和供应商作为交易的副产物自动创建。

### P1 — 业务运营
- `query-transactions` / `query-customers`
- `create-exhibition` / `manage-exhibition`
- `generate-pricelist`

### P2 — 深度运营
- `generate-dossier` / `record-condition`
- `inventory-stats` / `cost-analysis`
