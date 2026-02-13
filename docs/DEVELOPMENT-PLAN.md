# 开发计划（当前版本）

> 更新时间：2026-02-13
>
> 说明：旧版并行 monorepo 计划已过时。当前按**单 Next.js 应用**实际代码推进。

---

## 0. 当前目标

把项目从“开发中间态”推进到“可持续迭代基线”：

1. `lint` 通过（至少无 error）
2. `build` 通过
3. 数据导入脚本与 schema 对齐
4. 文档与实现一致

---

## 1. 当前架构基线

- 单应用：`app/(admin)` + `app/(web)/[locale]`
- 数据层：Prisma + SQLite
- 认证：cookie session（非 NextAuth）
- i18n：next-intl

详见：`docs/ARCHITECTURE-CURRENT.md`

---

## 2. 修复优先级

### P0（阻断项）

1. **Build 失败修复**
   - 文件：`scripts/import-gallery-data.ts`
   - 问题：`prisma.item.create` 缺少必填字段 `skuCode`
   - 验收：`npm run build` 通过

2. **Lint error 修复（3个）**
   - 文件：
     - `components/web/contact/contact-form.tsx`
     - `components/web/home/hero-carousel.tsx`
     - `components/web/layout/header.tsx`
   - 问题：`react-hooks/set-state-in-effect`
   - 验收：`npm run lint` 无 error

### P1（稳定性）

3. 清理高价值 warning
   - unused vars
   - `<img>` 逐步迁移 `next/image`（优先首屏关键图）

4. 导入链路回归测试
   - 跑导入脚本，校验 Product/Item/Supplier/Order 关系正确

### P2（体验与治理）

5. 文档持续同步
   - 新增字段、路由、认证策略变更必须更新 `ARCHITECTURE-CURRENT.md`

6. 质量门禁
   - PR/提交前固定执行：`npm run lint && npm run build`

---

## 3. 验证清单（当前）

| 验证项   | 命令            | 预期                |
| -------- | --------------- | ------------------- |
| 静态检查 | `npm run lint`  | 无 error            |
| 构建     | `npm run build` | 成功输出            |
| 本地启动 | `npm run dev`   | admin/web 均可访问  |
| 登录     | `/login`        | 可进入 `/admin`     |
| 官网路由 | `/zh` `/en`     | 语言切换正常        |
| 图片上传 | 后台上传流程    | 成功生成多尺寸 webp |

---

## 4. 开发命令

```bash
npm install
npm run dev
npm run lint
npm run build
```

---

## 5. 里程碑

- M1：P0 全部通过（可构建）
- M2：P1 完成（稳定可演示）
- M3：P2 完成（可持续迭代）
