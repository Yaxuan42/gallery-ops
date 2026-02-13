# Gallery-Ops 产品规格说明书 (Product Specification)

> 中古家具画廊管理系统 + 客户展示官网

> ⚠️ 文档状态说明（2026-02-13）：本文件包含历史方案。当前实现基线请优先阅读：
>
> - `docs/ARCHITECTURE-CURRENT.md`
> - `docs/plans/2026-02-12-gallery-ops-v1.md`

---

## 1. 项目概述

### 1.1 背景

为合伙经营的中古家具画廊开发一套数字化管理系统，替代现有 Excel 手工管理方式。画廊主营两大产品线：

- **Eames 系列**：来源美国供应商（沈康），涵盖 1945-2014 年间各代 Shell Chair、Wire Chair、DCW/LCW、Aluminum Group 等经典设计
- **昌迪加尔/Pierre Jeanneret 系列**：来源印度政府仓库，包括 Office Chair、Kangaroo Chair、Student Chair、各类书架桌椅等

其他供应商覆盖摩洛哥（Jean Prouve/Charlotte Perriand）、丹麦（Poul Henningsen）、法国（Bernard-Albin Gras）。

### 1.2 项目目标

| 目标     | 描述                                                              |
| -------- | ----------------------------------------------------------------- |
| 管理后台 | 完整的库存、客户、订单、供应商、财务管理系统，含经营数据仪表盘    |
| 客户官网 | 中英双语展示型网站，展示藏品、设计师、画廊故事，提供联系/询价入口 |
| 数据迁移 | 将现有 Excel 数据完整导入系统                                     |

### 1.3 用户角色

| 角色         | 描述                 | 访问范围           |
| ------------ | -------------------- | ------------------ |
| 画廊管理员   | 画廊合伙人/运营人员  | 管理后台全部功能   |
| 访客（客户） | 潜在买家、设计爱好者 | 官网浏览、联系询价 |

---

## 2. 当前技术架构（已更新）

### 2.1 技术栈

| 层级     | 技术选型                             | 说明                                              |
| -------- | ------------------------------------ | ------------------------------------------------- |
| 框架     | Next.js 16 (App Router) + TypeScript | 单应用，Route Groups 分区 admin/web               |
| 样式     | Tailwind CSS 4 + shadcn/ui           | 后台与官网统一组件体系                            |
| 数据库   | SQLite                               | 本地文件数据库（`prisma/gallery.db`）             |
| ORM      | Prisma                               | 类型安全数据访问                                  |
| i18n     | next-intl                            | 中英双语 (`messages/zh.json`, `messages/en.json`) |
| 认证     | Cookie Session（自定义）             | 非 NextAuth                                       |
| 图片处理 | sharp                                | 上传后转 WebP + 多尺寸                            |
| 表单验证 | zod + react-hook-form                | Schema 校验 + 表单状态                            |

### 2.2 项目结构（当前）

```text
02-gallery-ops/
├── app/
│   ├── (admin)/admin/*
│   ├── (web)/[locale]/*
│   └── api/*
├── components/
│   ├── admin/*
│   ├── web/*
│   └── ui/*
├── lib/
│   ├── actions/*
│   ├── queries/*
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── gallery.db
├── messages/
├── public/uploads/
└── docs/
```

### 2.3 图片处理管线

| 阶段   | 处理                                                       |
| ------ | ---------------------------------------------------------- |
| 上传   | 管理后台 `/api/upload` 接收 multipart/form-data，限制 10MB |
| 转换   | sharp 转为 WebP，质量 80                                   |
| 多尺寸 | 生成 `thumb/medium/full` 三个版本                          |
| 存储   | `public/uploads/{entity}/{id}/{timestamp}-{size}.webp`     |
| 数据库 | 记录基础 URL，前端按后缀拼接尺寸                           |

---

## 3. 文档索引

| 文档                                                 | 内容                                                   |
| ---------------------------------------------------- | ------------------------------------------------------ |
| [DATA-MODEL.md](./DATA-MODEL.md)                     | 完整数据模型 + Prisma Schema + CSV 映射规则 + 种子脚本 |
| [ADMIN-SPEC.md](./ADMIN-SPEC.md)                     | 管理后台全部功能规格（认证、仪表盘、CRUD、媒体管理）   |
| [WEBSITE-SPEC.md](./WEBSITE-SPEC.md)                 | 客户官网页面规格（设计语言、各页面布局、i18n、SEO）    |
| [ARCHITECTURE-CURRENT.md](./ARCHITECTURE-CURRENT.md) | 当前代码实现基线（单应用架构、真实技术栈、已知问题）   |
| [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md)         | 当前迭代计划 + 修复优先级 + 验证清单                   |
