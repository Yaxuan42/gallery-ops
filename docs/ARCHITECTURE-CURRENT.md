# Gallery-Ops 当前架构基线（2026-02-13）

> 本文件是当前代码实现的权威基线。若与旧文档冲突，以本文件和 `docs/plans/2026-02-12-gallery-ops-v1.md` 为准。

## 1) 架构形态

- **单 Next.js 应用**（非 monorepo）
- 通过 Route Groups 分区：
  - `app/(admin)`：管理后台
  - `app/(web)/[locale]`：对外官网（中英）

## 2) 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma + SQLite（`prisma/gallery.db`）
- next-intl（`messages/zh.json`, `messages/en.json`）
- sharp（图片上传处理）
- Embla Carousel（首页轮播）
- zod + react-hook-form（表单校验）

## 3) 认证

- 当前为轻量 cookie/session 方案（`lib/auth.ts` + `/api/auth`）
- 非 NextAuth

## 4) 关键目录

- `app/(admin)/admin/*`：后台页面
- `app/(web)/[locale]/*`：官网页面
- `app/api/*`：接口（auth/contact/upload）
- `lib/actions/*`：后台 CRUD Server Actions
- `lib/queries/web.ts`：官网读取查询
- `prisma/schema.prisma`：数据模型
- `scripts/import-gallery-data.ts`：导入脚本

## 5) 当前已知问题（需优先修复）

- `npm run build` 失败：导入脚本未对齐 `Item.skuCode` 必填
- `npm run lint` 存在 3 个 error（setState in effect）
- 文档存在历史版本残留（旧 monorepo / PostgreSQL / NextAuth 描述）

## 6) 开发运行命令（当前）

```bash
npm install
npm run dev
npm run lint
npm run build
```

## 7) 文档优先级

1. `docs/ARCHITECTURE-CURRENT.md`（本文件）
2. `docs/plans/2026-02-12-gallery-ops-v1.md`
3. 其他历史文档（仅供参考）
