# Gallery-Ops

**Agent-Driven Development 实验田** — 一个由 AI Agent 全程开发、由自动化流水线守护的中古家具画廊管理系统。

> A gallery management system built entirely by AI agents, guarded by automated CI/CD pipelines. This repo is an experiment in agent-driven development: every PR is machine-generated, machine-reviewed, and human-approved.

---

## 核心理念

- **Agent 是开发者，人类是审批者。** 所有代码由 Agent 编写，通过 PR 提交，由 CI + AI Review 验证，人类做最终审批。
- **可验证优先于可运行。** 功能不是目标，验证机制才是：每次变更都必须通过 7 道自动化门禁才能合并。
- **小步提交，证据驱动。** 每个 PR 小而聚焦，附带测试、类型检查、lint 结果作为「通过证据」。
- **失败是信号，不是错误。** CI 红灯意味着 Agent 的输出被拦截了——这正是系统在正常工作。
- **零信任，全验证。** 不信任任何一次提交（包括人类的），所有变更走同一条流水线。

---

## 背景与目标

### 为什么做这个项目

当 AI Agent 成为代码的主要生产者时，传统的开发流程（人写代码 → 人 review → 人部署）需要被重新设计。这个项目验证一个假设：

> **假设：通过足够严格的自动化验证体系，AI Agent 可以安全地承担从编码到提交的全流程，人类只需在关键节点审批。**

### 要验证的具体问题

| 问题 | 验证方式 |
|------|---------|
| Agent 生成的代码类型安全吗？ | `tsc --noEmit` 零错误 |
| Agent 会引入 lint 违规吗？ | oxlint（Rust，42ms/116 files）零错误 |
| Agent 会破坏现有功能吗？ | Vitest 101 个测试全绿 |
| Agent 会泄露密钥吗？ | detect-secrets 基线扫描 |
| Agent 的代码逻辑合理吗？ | Claude Sonnet 4.5 自动 code review |
| Agent 能构建出可部署产物吗？ | `next build` 通过 |
| Agent 的变更范围可控吗？ | 自动 size + scope 标签 |

### 业务载体

画廊管理系统本身是真实可用的：管理中古家具（Eames 系列、Chandigarh 系列）的库存、客户、订单、供应商，以及中英双语展示官网。但它的首要角色是 Agent 开发实验的载体。

---

## 验证体系全景

每个 PR 自动经过以下门禁：

```
PR opened / updated
 |
 |-- CI Pipeline (ci.yml) --------------------------------
 |   |-- Type Check + Lint    tsc --noEmit + oxlint      ~45s   REQUIRED
 |   |-- Unit Tests           vitest (101 tests)         ~43s   REQUIRED
 |   |-- Build                next build + prisma        ~60s   REQUIRED
 |   |-- Secret Scan          detect-secrets             ~10s
 |
 |-- AI Review (ai-review.yml) ---------------------------
 |   |-- Claude Review        bugs/security/perf/logic   ~20s
 |   |   输出: PR comment（severity: critical/suggestion/nice-to-have）
 |
 |-- Labeler (labeler.yml) --------------------------------
 |   |-- PR Size              XS(<50) S(<200) M(<500) L(<1000) XL(>=1000)
 |   |-- PR Scope             api/web/admin/database/ci/ui/tests/config
 |
 |-- Branch Protection (GitHub Ruleset) -------------------
 |   |-- 禁止直接 push main
 |   |-- 合并前 Type Check + Lint / Unit Tests / Build 必须全绿
 |   |-- Strict: 分支必须 up-to-date with main
 |
 |-- Dependabot (dependabot.yml) --------------------------
 |   |-- npm: 每周一 09:00 CST 扫描，minor/patch 合并为一个 PR
 |   |-- GitHub Actions: 每周一扫描 action 版本更新
 |
 |-- Pre-commit (lint-staged) -----------------------------
     |-- oxlint --quiet     快速 Rust lint
     |-- eslint --fix        自动修复
     |-- prettier --write    格式化
```

**关键设计原则：**
- `check` 是第一道关卡，`test` 和 `build` 依赖它（`needs: check`）—— 类型错误不会浪费后续资源
- `secrets` 独立运行，不依赖任何 job —— 安全扫描无条件执行
- AI Review 设置 `continue-on-error: true` —— API 故障不阻断流水线
- `cancel-in-progress: true` —— 新 push 自动取消旧 run，Agent 高频提交时不浪费资源

---

## Agent 操作协议

> 本节是新 Agent（执行器）接入本项目的操作协议。所有 Agent 必须严格遵循以下流程，不得跳过任何步骤。

### 1. 理解上下文

```
tech stack:
  framework:  Next.js 16 (App Router) + TypeScript
  database:   SQLite via Prisma 7 (driver adapter: better-sqlite3)
  styling:    Tailwind CSS 4 + shadcn/ui
  i18n:       next-intl (zh/en)
  auth:       cookie-based (bcryptjs + base64url token)
  validation: Zod 4 + react-hook-form
  testing:    Vitest
  linting:    oxlint (primary) + ESLint (auto-fix)
  node:       25.x (.nvmrc)
  pkg mgr:    npm
```

关键路径（修改前务必理解影响范围）：

| 路径 | 内容 | 风险等级 |
|------|------|---------|
| `lib/services/` | 业务逻辑层（被 actions + API 共用） | 高 |
| `lib/auth.ts` / `lib/api-auth.ts` | 认证逻辑 | 高 |
| `prisma/schema.prisma` | 数据模型（11 models） | 高 |
| `.github/workflows/` | CI/CD 流水线 | 高 |
| `app/api/admin/` | REST API（Bearer token auth） | 中 |
| `components/` | UI 组件 | 低 |
| `messages/` | i18n 翻译文件 | 低 |

### 2. 提交 PR

```bash
# 1. 从 main 创建分支（命名规范：feat/ fix/ docs/ test/ refactor/）
git checkout main && git pull
git checkout -b feat/your-feature-name

# 2. 编码（遵循现有模式）

# 3. 本地自证（必须全部通过后再提交）
npm run check          # tsc --noEmit && oxlint
npm test               # vitest run (101+ tests)
npm run build          # next build

# 4. 提交（conventional commits 格式）
git add <files>        # 不要 git add .（避免意外提交 .env / 数据库文件）
git commit -m "feat(scope): description"

# 5. 推送并创建 PR
git push -u origin feat/your-feature-name
gh pr create --title "feat(scope): description" --body "..."
```

### 3. PR 模板

PR 会自动填充模板（`.github/PULL_REQUEST_TEMPLATE.md`），Agent 必须填写以下字段：

- **Summary**: 1-3 bullet 说明做了什么
- **Type**: 勾选类型（Bug fix / New feature / Enhancement / ...）
- **Changes**: 列出关键变更
- **Test plan**: 如何测试的（单元测试 / 手动测试 / 构建验证）
- **Checklist**: 无密钥 / 无 any / 测试通过

### 3.5 Agent PR 交付证据（必填）

除 PR 模板外，Agent 必须在 PR 描述中提供以下交付证据，缺失任何一项视为不可合并：

| 证据项 | 要求 | 示例 |
|--------|------|------|
| **变更摘要** | 1-3 句话说明改了什么、为什么改 | "提取批量删除逻辑到 service 层，消除 action 与 API 的代码重复" |
| **影响面** | 列出受影响的模块/页面/API | "影响: `lib/services/items.ts`, `app/api/admin/items/`" |
| **验证证据** | 贴出 CI 各门禁的通过链接或截图 | Type ✅ · Lint ✅ · Test ✅ · Build ✅ · Secret Scan ✅ · AI Review ✅ |
| **回滚方案** | 说明如何安全回滚此次变更 | "`git revert <commit>` 即可，无数据库迁移" |
| **风险评估** | 标注风险等级（低/中/高）及理由 | "低风险：纯重构，无 schema 变更，测试全覆盖" |

> 验证证据中的链接格式：`https://github.com/Yaxuan42/gallery-ops/actions/runs/<run-id>` — 直接指向该 PR 触发的 CI run。

### 4. 等待验证

PR 创建后，以下自动触发：

| 门禁 | 关注项 | 失败时的操作 |
|------|-------------|------------|
| Type Check + Lint | 是否有类型错误或 lint error | 修复后 push，CI 自动重跑 |
| Unit Tests | 现有测试是否被破坏 | 检查 test 报告，修复回归 |
| Build | 构建是否成功 | 检查 Prisma schema / 页面预渲染错误 |
| Secret Scan | 是否有密钥泄露 | 立即删除敏感数据，force-push 清除历史 |
| Claude Review | AI 是否发现逻辑/安全问题 | 阅读 review comment，修复后 push |
| Labels | `size: S` + `scope: api` 等 | 仅供参考，无需操作 |

### 5. 人类审批

所有门禁通过后，`@Yaxuan42`（CODEOWNERS）进行最终审批。审批关注：

- AI Review 提出的问题是否被充分处理
- 变更范围是否与 PR 描述一致
- 是否符合项目架构（三层复用：services → actions + API）

### 6. 合并

审批通过后，squash merge 到 main。分支自动删除。

---

## 快速开始

### 环境要求

- Node.js 25.x（见 `.nvmrc`）
- npm
- Python 3.12+（仅 detect-secrets 需要）

### 本地开发

```bash
# 克隆
git clone https://github.com/Yaxuan42/gallery-ops.git
cd gallery-ops

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入实际值：
#   DATABASE_URL="file:./prisma/gallery.db"
#   AUTH_SECRET="your-random-secret-string"
#   NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 初始化数据库
npx prisma generate
npx prisma migrate dev

# （可选）导入种子数据
npx prisma db seed

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000（官网）
# 访问 http://localhost:3000/admin（管理后台）
# 默认管理员：admin@gallery.local / Gallery2025!
```

### 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run check` | 类型检查 + lint（tsc + oxlint） |
| `npm test` | 运行测试（vitest） |
| `npm run build` | 生产构建 |
| `npm run lint` | 仅 oxlint |
| `npm run lint:next` | 仅 ESLint（Next.js 规则） |
| `npm run secrets` | 密钥扫描（detect-secrets） |
| `npm run format` | 格式化（prettier） |
| `npm run studio` | Prisma Studio（数据库 GUI） |

### GitHub Secrets 配置

仓库需要以下 secrets（Settings > Secrets and variables > Actions）：

| Secret | 用途 | 必需 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API 密钥（AI Review 用） | 否（缺失时 graceful skip） |
| `ANTHROPIC_API_URL` | Claude API 端点（代理 URL） | 否（默认 `api.anthropic.com`） |

> 不要在代码、配置文件、commit message 中写入任何密钥。

---

## Agent 交付标准

### PR Checklist（合并前必须满足）

- [ ] 分支从最新 `main` 创建
- [ ] commit message 遵循 conventional commits（`feat:` / `fix:` / `docs:` / ...）
- [ ] `npm run check` 本地通过（类型 + lint）
- [ ] `npm test` 本地通过（101+ tests）
- [ ] `npm run build` 本地通过
- [ ] PR 描述填写完整（使用模板）
- [ ] CI 全绿（7 个 check）
- [ ] AI Review 的 critical 问题已处理
- [ ] 变更范围小而聚焦（推荐 size: XS 或 S）
- [ ] 无密钥/凭据泄露

### 核心原则

**小步迭代** — 一个 PR 做一件事。「加了批量删除 + 改了 UI + 修了 bug」= 3 个 PR。

**可回滚** — 每个 PR 都应该是可以安全 revert 的。不要在一个 PR 里做不可逆的数据库迁移 + 业务代码变更。

**证据驱动** — 「我测过了」不够。CI 全绿 + AI Review 无 critical = 证据。本地「跑了一下没问题」不算。

---

## Secrets 与日志安全规范

> 本节是强制性安全协议，违反任何一条将导致 PR 被拒绝或回滚。

### 禁止项

| 编号 | 禁止行为 | 说明 |
|------|---------|------|
| S-1 | 将密钥写入代码或配置文件 | 包括 `.ts`, `.json`, `.yml`, `.env`（已 gitignore）以外的任何文件 |
| S-2 | 将密钥写入 PR 描述、issue、commit message | GitHub 历史不可篡改，泄露即永久泄露 |
| S-3 | 在 CI 日志中打印密钥 | 禁止 `echo $SECRET`、`console.log(key)` 等 |
| S-4 | 在代码中硬编码 API 端点的认证信息 | 使用环境变量或 GitHub Secrets |
| S-5 | 将 `.env` 文件提交到仓库 | `.env` 已在 `.gitignore` 中，但 Agent 不得手动 `git add .env` |

### 允许的密钥配置方式

**唯一合法途径：GitHub Secrets**（Settings > Secrets and variables > Actions）

```bash
# 配置示例（不含真实值）
gh secret set ANTHROPIC_API_KEY --body "<your-api-key>"
gh secret set ANTHROPIC_API_URL --body "https://<your-proxy-domain>/v1/messages"
gh secret set ADMIN_API_SECRET --body "<your-admin-token>"
```

### 日志中的安全输出规范

当 Agent 需要在日志或输出中确认密钥配置状态时，只允许以下方式：

```bash
# ✅ 允许：输出长度和前缀
echo "ANTHROPIC_API_KEY: length=${#ANTHROPIC_API_KEY}, prefix=${ANTHROPIC_API_KEY:0:4}..."

# ❌ 禁止：输出完整值
echo "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY"
```

### 泄露应急流程

如果密钥被意外提交：
1. **立即** rotate 密钥（在密钥提供方处重新生成）
2. 更新 GitHub Secrets 为新密钥
3. `git revert` 或 `git push --force` 清除历史（需人类审批）
4. 在 PR 中记录事件和修复措施

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 16.1.6 (App Router) + TypeScript |
| 样式 | Tailwind CSS 4 |
| 数据库 | SQLite (Prisma 7 + better-sqlite3 driver adapter) |
| 管理后台 UI | shadcn/ui (New York style) |
| 官网轮播 | Embla Carousel |
| i18n | next-intl 4.8 (zh/en) |
| 认证 | 自实现 cookie-based (bcryptjs + base64url token) |
| 图片处理 | sharp (WebP + 三尺寸) |
| 表单验证 | Zod 4 + react-hook-form |
| 测试 | Vitest (4 test files, 101 tests) |
| Lint | oxlint (Rust, 42ms) + ESLint (Next.js rules) |
| 密钥扫描 | detect-secrets |
| CI/CD | GitHub Actions (4 workflows) |
| 依赖管理 | Dependabot |
| AI Review | Claude Sonnet 4.5 (via GitHub Actions) |

---

## 数据模型

11 个 Prisma models，覆盖画廊管理全链路：

```
User ──── 管理员账户
Product ── 产品 SPU（nameZh/En, category, designer, slug）
  └── ProductImage
Item ───── 库存 SKU（status, totalCost, showOnWebsite）
  └── ItemImage
Customer ── 客户（name, type, source, wechat）
SalesOrder ── 订单（orderNumber, totalAmount, grossProfit）
  └── SalesOrderItem ── 订单行项
Supplier ── 供应商（name, code, country）
HeroSlide ── 首页轮播
ContactInquiry ── 联系表单
```

业务逻辑要点：
- 订单 COMPLETED → Item.status 自动更新为 SOLD
- 订单取消/删除 → Item.status 恢复为 IN_STOCK
- totalCost 自动计算：shippingCostRmb + customsFees + importDuties + purchasePriceRmb
- 官网只展示 `showOnWebsite = true` 的 Item

---

## 项目结构

```
gallery-ops/
├── app/
│   ├── (admin)/              # 管理后台（需认证）
│   ├── (web)/[locale]/       # 客户展示官网（i18n: zh/en）
│   ├── api/
│   │   ├── auth/             # 登录/登出
│   │   ├── upload/           # 图片上传
│   │   ├── contact/          # 联系表单
│   │   └── admin/            # REST API (Bearer token auth)
│   └── layout.tsx
├── components/
│   ├── admin/                # 管理后台组件
│   ├── web/                  # 官网组件
│   └── ui/                   # shadcn/ui 基础组件
├── lib/
│   ├── services/             # 业务逻辑层（纯函数，被 actions + API 共用）
│   ├── actions/              # Server Actions（薄封装：调用 services → redirect）
│   ├── queries/              # 官网数据查询（server-only）
│   ├── __tests__/            # 测试文件（4 files, 101 tests）
│   ├── validations.ts        # Zod schemas
│   ├── constants.ts          # 枚举/分类常量
│   ├── auth.ts               # Cookie auth
│   ├── api-auth.ts           # Bearer token auth
│   └── prisma.ts             # PrismaClient 单例
├── prisma/
│   ├── schema.prisma         # 数据模型（11 models）
│   ├── migrations/           # 迁移文件
│   └── seed.ts               # 种子数据
├── messages/                 # i18n 翻译（zh.json, en.json）
├── .github/
│   ├── workflows/            # CI, AI Review, Labeler, Stale
│   ├── dependabot.yml        # 依赖自动更新
│   ├── labeler.yml           # Scope label 定义
│   ├── CODEOWNERS            # 代码所有者
│   └── PULL_REQUEST_TEMPLATE.md
├── .nvmrc                    # Node 版本锁定（25.x）
├── .oxlintrc.json            # oxlint 配置
├── .secrets.baseline         # detect-secrets 基线
└── .coderabbit.yaml          # CodeRabbit 配置（可选第二道 AI review）
```

### 三层架构

```
Service Layer (lib/services/)        纯业务逻辑，可测试
  ├── Server Actions (lib/actions/)  前端表单 → redirect/revalidate
  └── REST API (app/api/admin/)      Agent 调用 → JSON response
```

---

## 里程碑与路线图

### 已完成

- [x] Layer 1: Unit Tests（Vitest, 101 tests）
- [x] Layer 2: Lint（oxlint, Rust-powered, 42ms）
- [x] Layer 3: Secret Scan（detect-secrets baseline）
- [x] Layer 4: GitHub Actions CI（type check → test + build | secret scan）
- [x] Layer 5: Branch Protection（Ruleset, 3 required checks）
- [x] Layer 6: AI Code Review（Claude Sonnet 4.5, 代理支持）
- [x] Layer 7: Advanced Automation（Dependabot, scope labels, artifacts, lint-staged）

### 下一步探索

- [ ] **Deploy Preview** — PR 自动部署预览环境，人类可视化审查 UI 变更
- [ ] **Release Automation** — 基于 conventional commits 自动生成 changelog + 版本号
- [ ] **E2E Tests** — Playwright 端到端测试，覆盖关键用户路径
- [ ] **更多质量门禁** — bundle size check, lighthouse score, accessibility audit
- [ ] **Multi-Agent 协作** — 多个 Agent 并行开发不同功能，通过 CI 保证互不破坏
- [ ] **Agent 自治度实验** — 逐步减少人类审批频率，观察 CI 拦截率变化

---

## FAQ

### 为什么需要 AI Review？

机械检查（类型、lint、测试、构建）只能验证「代码能不能跑」，不能验证「代码该不该这样写」。AI Review 填补逻辑层面的审查空白：认证缺失、N+1 查询、密钥泄露到响应体、缺少事务保护等问题，只有理解业务语义才能发现。

实测：在一个故意埋入 7 个 bug 的 PR 中（无认证、`any` 类型、泄露 `DATABASE_URL`、N+1 删除、无事务），AI Review 检出了 7/7 + 额外发现 2 个问题。同一个 PR 的 tsc / oxlint / vitest / build 全部绿灯。

### 为什么不允许直推 main？

Agent 的输出质量波动比人类更大。同一个 Agent 在不同 session 可能产出完全不同质量的代码。Branch Protection 确保每次变更都必须经过完整验证管道，无论提交者是 Agent 还是人类。

### 为什么用 oxlint 而不是只用 ESLint？

oxlint 用 Rust 写，在 116 个文件上运行时间 42ms（ESLint 同样规模 ~3.4s，慢 80 倍）。在 Agent 高频提交的场景下，lint 速度直接影响反馈循环效率。两者并存：oxlint 做 CI 快速检查，ESLint 在 lint-staged 中做 auto-fix。

### 密钥怎么配置？

1. **GitHub Secrets**（CI 用）：Settings > Secrets and variables > Actions，添加 `ANTHROPIC_API_KEY`
2. **本地 `.env`**（开发用）：从 `.env.example` 复制，填入实际值
3. **绝不**在代码、配置文件、commit message 中写入密钥
4. detect-secrets 会扫描每个 PR，密钥泄露会被自动拦截

### Dependabot PR 太多怎么办？

配置已做优化：minor + patch 更新合并为一个 grouped PR（而非每个依赖一个 PR）。安全更新始终单独创建 PR（高优先级）。如果仍然太多，可以在 `.github/dependabot.yml` 中调整 `open-pull-requests-limit`。

---

## License

MIT
