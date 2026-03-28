# 旧地工作室管理系统 + 站点 — 完整开发方案

## 目标

基于 legacy-nextjs 分支的 Next.js 16 应用，修复、完善并重新设计为生产级的：
1. **Admin 管理系统** — 团队内部管理藏品、交易、客户、展览
2. **Public 对外站点** — 面向藏家和设计爱好者的展示网站

## 技术栈

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma 7 + SQLite（Mac Mini 单机部署）
- Tailwind CSS 4 + shadcn/ui
- Playwright（浏览器截图验证）
- Vitest（单元/集成测试）

## 开发循环架构

```
┌─────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                       │
│   读取 progress.md → 决定下一步 → 调度执行            │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│   │  PLAN    │───→│  BUILD   │───→│  EVAL    │     │
│   │          │    │          │    │          │     │
│   │ 读状态    │    │ 写代码    │    │ 跑测试    │     │
│   │ 读设计规范 │    │ 跑 lint  │    │ 截屏验证  │     │
│   │ 输出任务   │    │ 跑 unit  │    │ 对比设计  │     │
│   └──────────┘    └──────────┘    └──┬───────┘     │
│                                      │              │
│                        PASS ←────────┤              │
│                        FAIL ─────────→ 回到 BUILD   │
│                                                     │
│   质量门禁：                                         │
│   ✅ TypeScript 零错误                               │
│   ✅ Lint 零错误                                     │
│   ✅ 单元测试全部通过                                 │
│   ✅ 浏览器截图无视觉回归                             │
│   ✅ 设计规范对比通过（字体/颜色/间距）                │
│   ✅ 页面加载 < 3s                                   │
└─────────────────────────────────────────────────────┘
```

## tmux 会话布局

```
Mini 上 tmux session: gallery-dev
├── window 0: dev-server     → next dev（持续运行）
├── window 1: orchestrator   → Claude Code 主控会话
├── window 2: logs           → tail -f 可观测性日志
└── window 3: shell          → 手动操作/调试
```

## 可观测性

### 循环日志
`logs/dev-loop.jsonl` — 每次循环迭代记录：
```jsonl
{
  "iteration": 1,
  "phase": "build",
  "task": "fix-p0-build-blockers",
  "status": "pass",
  "duration_ms": 45000,
  "tests": { "unit": 12, "pass": 12, "fail": 0 },
  "screenshots": ["screenshots/001-admin-dashboard.png"],
  "ts": "2026-03-28T22:00:00Z"
}
```

### 截图存档
`screenshots/` — 每次 eval 阶段保存浏览器截图，按迭代编号命名。

### 进度面板
`progress.md` — 每次循环结束更新，人类可读的进度总览。

## 开发阶段

### Phase 0: 基础设施（修复 + 环境）
1. 切换 gallery-ops repo 到 legacy-nextjs 代码
2. 修 3 个 P0 build blocker（import 脚本缺 skuCode、3 个 lint 错误）
3. 安装依赖、初始化数据库、验证 `npm run build` 通过
4. 配置 Playwright 截图脚本
5. 写基础 vitest 配置和第一批测试（service layer）
6. 设置可观测性基础设施（logs/、screenshots/、progress.md）

### Phase 1: Admin 系统完善
1. 落实设计系统 tokens（CSS 变量、字体、颜色）
2. 修复/完善现有 Admin 页面
3. 补充缺失功能（PurchaseOrder CRUD）
4. 对接 gallery-ops agent REST API（保持兼容）
5. Admin 全页面截图验证
6. 单元测试覆盖 service layer（成本计算、状态流转、SKU 生成）

### Phase 2: Public 站点重设计
1. 首页（Hero + Featured Items + About Teaser + Contact CTA）
2. Collection 列表页（筛选 + 网格 + 分页）
3. 藏品详情页（图片画廊 + 信息面板 + 相关推荐）
4. 设计师页面
5. 关于页面
6. 联系页面
7. 每个页面截图验证 + 设计规范对比
8. 响应式验证（Desktop 1440px / Tablet 768px / Mobile 375px）

### Phase 3: 质量收尾
1. 集成测试（API 端到端）
2. 性能优化（图片、LCP、CLS）
3. SEO 验证（meta、sitemap、structured data）
4. 全站截图回归测试
5. 部署配置（pm2 + 开机启动）

## 质量标准

### 必须通过才能结束
- `npm run build` 零错误
- `npm run lint` 零错误
- `npm run test` 全部通过（覆盖率 > 80% for service layer）
- Playwright 截图覆盖所有页面（desktop + mobile）
- 每个页面 LCP < 3s
- 设计规范一致性（字体、颜色、间距人工审核通过）
- Admin 全 CRUD 流程可操作
- Public 站点全页面可访问

### 截图验证矩阵

| 页面 | Desktop 1440px | Tablet 768px | Mobile 375px |
|------|---------------|-------------|-------------|
| Admin Dashboard | ✓ | — | — |
| Admin Inventory List | ✓ | — | — |
| Admin Inventory Form | ✓ | — | — |
| Admin Orders | ✓ | — | — |
| Public Home | ✓ | ✓ | ✓ |
| Public Collection | ✓ | ✓ | ✓ |
| Public Item Detail | ✓ | ✓ | ✓ |
| Public About | ✓ | ✓ | ✓ |
| Public Contact | ✓ | ✓ | ✓ |

## 执行方式

在 Mini 上通过 tmux + Claude Code 执行，使用 `--max-turns` 和高 agent budget。
Orchestrator 会话持续运行，按 phase/task 推进，每完成一个 task 更新 progress.md。
