# Skills 使用指南 (Agent Skills Guide)

> 本文档记录了与 Gallery-Ops 项目匹配的 Agent Skills，按开发阶段和 Teammate 角色组织。
> 所有 skills 已全局安装 (`-g`)，可在任何 Claude Code 会话中直接使用。

---

## 已安装 Skills 总览

### 核心 Skills（项目技术栈直接匹配）

| Skill                         | 来源                           | 用途                                                       |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------- |
| `next-best-practices`         | vercel-labs/next-skills        | Next.js 15 App Router 最佳实践                             |
| `vercel-react-best-practices` | vercel-labs/agent-skills       | React Server Components、数据获取模式                      |
| `vercel-composition-patterns` | vercel-labs/agent-skills       | 组件组合、复用模式                                         |
| `nextjs-shadcn-builder`       | ovachiever/droid-tings         | Next.js + shadcn/ui 构建模式（**find-skills 发现**）       |
| `prisma-orm`                  | bobmatnyc/claude-mpm-skills    | Prisma Schema 设计、迁移、查询优化（**find-skills 发现**） |
| `authjs-skills`               | gocallum/nextjs16-agent-skills | Auth.js/NextAuth v5 认证实现（**find-skills 发现**）       |
| `tailwind-design-system`      | wshobson/agents                | Tailwind CSS 设计系统搭建（**find-skills 发现**）          |
| `monorepo-management`         | wshobson/agents                | pnpm workspace monorepo 管理（**find-skills 发现**）       |
| `recharts-patterns`           | yonatangross/orchestkit        | Recharts 图表组件模式（**find-skills 发现**）              |
| `i18n-date-patterns`          | yonatangross/orchestkit        | 国际化与日期格式化模式（**find-skills 发现**）             |
| `image-optimization`          | secondsky/claude-skills        | 图片优化（sharp/WebP 处理）（**find-skills 发现**）        |

### 设计 & UI Skills

| Skill                   | 来源                     | 用途                |
| ----------------------- | ------------------------ | ------------------- |
| `web-design-guidelines` | vercel-labs/agent-skills | Web 设计规范与美学  |
| `frontend-design`       | anthropics/skills        | 前端设计系统实现    |
| `ui-ux-pro-max`         | nextlevelbuilder         | 高级 UI/UX 设计模式 |

### 开发流程 Skills

| Skill                     | 来源             | 用途               |
| ------------------------- | ---------------- | ------------------ |
| `writing-plans`           | obra/superpowers | 编写开发计划       |
| `executing-plans`         | obra/superpowers | 按计划执行开发任务 |
| `systematic-debugging`    | obra/superpowers | 系统化调试方法     |
| `test-driven-development` | obra/superpowers | 测试驱动开发       |
| `brainstorming`           | obra/superpowers | 头脑风暴与方案探索 |

### 测试 & 审计 Skills

| Skill            | 来源                          | 用途               |
| ---------------- | ----------------------------- | ------------------ |
| `webapp-testing` | anthropics/skills             | Web 应用端到端测试 |
| `audit-website`  | squirrelscan/skills           | 网站安全与质量审计 |
| `seo-audit`      | coreyhaines31/marketingskills | SEO 优化检查       |

### 内容 Skills

| Skill         | 来源                          | 用途                           |
| ------------- | ----------------------------- | ------------------------------ |
| `copywriting` | coreyhaines31/marketingskills | 文案撰写（画廊故事、产品描述） |

### 工具 Skills

| Skill                            | 来源                      | 用途              |
| -------------------------------- | ------------------------- | ----------------- |
| `find-skills`                    | vercel-labs/skills        | 搜索发现新 skills |
| `skill-creator`                  | anthropics/skills         | 创建自定义 skills |
| `mcp-builder`                    | anthropics/skills         | 构建 MCP 服务器   |
| `pdf` / `pptx` / `docx` / `xlsx` | anthropics/skills         | 文档生成          |
| `agent-browser` / `browser-use`  | vercel-labs / browser-use | 浏览器自动化      |

---

## 按开发阶段的 Skills 使用建议

### Phase 1: 基础设施搭建（Team Lead）

```
任务                          推荐 Skills
─────────────────────────────────────────────────────────
初始化 pnpm workspace        → monorepo-management
创建 Prisma schema + 迁移    → prisma-orm
docker-compose 配置          → (无特定 skill，基础操作)
创建 shared 包               → monorepo-management
初始化 Next.js 应用空壳      → next-best-practices
```

**调用示例**：

```
在编写 Prisma schema 时参考 /prisma-orm skill 的最佳实践，
确保使用正确的 @map 命名、索引策略和关联关系模式。
```

---

### Phase 2: 并行开发

#### Teammate 1: admin-builder

```
任务                          推荐 Skills
─────────────────────────────────────────────────────────
#1 shadcn/ui + Tailwind 配置  → nextjs-shadcn-builder, tailwind-design-system
#2 布局框架                    → vercel-composition-patterns, nextjs-shadcn-builder
#3 NextAuth.js 认证            → authjs-skills
#4 通用 DataTable + 表单       → vercel-composition-patterns, vercel-react-best-practices
#5-#10 各实体 CRUD             → prisma-orm, next-best-practices, vercel-react-best-practices
#11 仪表盘图表                 → recharts-patterns
#12 媒体管理                   → image-optimization
```

**调用示例**：

```
构建 DataTable 组件时参考 /vercel-composition-patterns 的组合模式，
使用 Server Components 获取数据 + Client Components 处理交互。
实现认证时参考 /authjs-skills 的 Credentials Provider + JWT 配置。
仪表盘图表参考 /recharts-patterns 的 Bar/Line/Pie 图表最佳实践。
```

#### Teammate 2: web-builder

```
任务                          推荐 Skills
─────────────────────────────────────────────────────────
#1 Tailwind 设计系统           → tailwind-design-system, frontend-design
#2 next-intl 国际化            → i18n-date-patterns
#3 Header + Footer 布局        → web-design-guidelines, vercel-composition-patterns
#4 首页（Hero + Featured）     → ui-ux-pro-max, web-design-guidelines
#5 藏品列表页                  → vercel-react-best-practices, ui-ux-pro-max
#6 藏品详情页                  → web-design-guidelines, image-optimization
#7 设计师专页                  → copywriting (设计师简介内容)
#8 关于页                      → copywriting (画廊故事内容)
#9 联系页                      → next-best-practices (API route + form)
#10 响应式适配                 → tailwind-design-system, web-design-guidelines
#11 SEO 优化                   → seo-audit
```

**调用示例**：

```
设计系统搭建参考 /tailwind-design-system 定义色板(#FAF8F5/#8B7E74/#2C2C2C/#B8956A)、
字体(Playfair Display + Inter + Noto Serif/Sans SC)、间距规范。
首页设计参考 /ui-ux-pro-max 的画廊级视觉效果和微交互。
SEO 实现参考 /seo-audit 确保 metadata、OG tags、sitemap、JSON-LD 完整。
```

#### Teammate 3: data-builder

```
任务                          推荐 Skills
─────────────────────────────────────────────────────────
#1 CSV 种子脚本                → prisma-orm (批量插入、关联创建)
#2 图片上传 API                → image-optimization (sharp WebP 管线)
#3 ImageUploader 组件          → vercel-react-best-practices
#4-#5 uploads 目录 + 占位图    → image-optimization
#6 导入真实数据                → prisma-orm, systematic-debugging
#7 集成验证                    → webapp-testing, systematic-debugging
```

**调用示例**：

```
图片处理管线参考 /image-optimization 的 sharp 最佳实践，
确保 WebP 转换(quality 80) + 多尺寸生成(300/800/1600)的性能和质量。
CSV 导入遇到关联问题时参考 /systematic-debugging 的诊断流程。
```

---

### Phase 3: 集成与验证

```
验证项                        推荐 Skills
─────────────────────────────────────────────────────────
端到端功能验证                 → webapp-testing
浏览器自动化测试               → agent-browser, browser-use
网站安全审计                   → audit-website
SEO 检查                       → seo-audit
响应式测试                     → agent-browser (多视口测试)
性能检查                       → image-optimization (图片加载性能)
```

---

## Skills 与项目技术栈对照

| 技术栈组件                       | 对应 Skill(s)                                                |
| -------------------------------- | ------------------------------------------------------------ |
| Next.js 15 (App Router)          | `next-best-practices`, `nextjs-shadcn-builder`               |
| React (Server/Client Components) | `vercel-react-best-practices`, `vercel-composition-patterns` |
| Tailwind CSS 4                   | `tailwind-design-system`, `frontend-design`                  |
| shadcn/ui (Radix UI)             | `nextjs-shadcn-builder`                                      |
| PostgreSQL + Prisma              | `prisma-orm`                                                 |
| NextAuth.js v5                   | `authjs-skills`                                              |
| Recharts                         | `recharts-patterns`                                          |
| next-intl (i18n)                 | `i18n-date-patterns`                                         |
| sharp (图片处理)                 | `image-optimization`                                         |
| pnpm workspace (Monorepo)        | `monorepo-management`                                        |
| 设计美学                         | `web-design-guidelines`, `ui-ux-pro-max`                     |
| SEO                              | `seo-audit`                                                  |

---

## 未安装但可按需搜索的领域

通过 `npx skills find <query>` 或 `/find-skills` 可随时搜索：

| 需求                    | 搜索关键词            | 候选                                    |
| ----------------------- | --------------------- | --------------------------------------- |
| Embla Carousel 最佳实践 | `embla carousel`      | 暂无专用 skill                          |
| zod + react-hook-form   | `zod form validation` | 多个社区 skill                          |
| Docker 部署优化         | `docker deployment`   | bobmatnyc/docker                        |
| 无障碍访问 (a11y)       | `accessibility`       | charlesjones-dev/accessibility-auditing |
| 性能监控                | `web performance`     | sickn33/web-performance-optimization    |

---

## 管理命令

```bash
# 查看所有已安装 skills
npx skills ls -g

# 搜索新 skills
npx skills find <关键词>

# 安装新 skill
npx skills add <owner/repo> --skill <name> -y -g

# 检查更新
npx skills check

# 更新所有 skills
npx skills update
```
