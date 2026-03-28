# 可观测、评估与迭代机制

## 现有基础

OpenClaw 已提供：
- **会话日志**：`~/.openclaw/agents/gallery/sessions/*.jsonl`（完整对话记录，含消息、工具调用、模型输出）
- **会话索引**：`sessions.json`（会话元数据：渠道、时间、来源）
- **系统日志**：`~/.openclaw/logs/`（gateway、commands、config 变更）

**本方案不重复造轮子。** 在 OpenClaw 已有的会话日志之上，叠加三层能力。

---

## 架构总览

```
┌─────────────────────────────────────────────────┐
│ Layer 1: 操作审计（每次写操作自动记录）            │
│   audit.jsonl — who/what/when/before/after       │
├─────────────────────────────────────────────────┤
│ Layer 2: 数据完整性（每次写操作后自动校验）        │
│   integrity-check.mjs — 引用完整性 + 状态一致性   │
├─────────────────────────────────────────────────┤
│ Layer 3: 备份与恢复（写前快照 + Git + 定时同步）   │
│   backups/ + git log + rsync cron               │
├─────────────────────────────────────────────────┤
│ Layer 4: 评估与迭代（周期性人工 review）          │
│   OpenClaw sessions → review notes → prompt 改进 │
└─────────────────────────────────────────────────┘
```

---

## Layer 1: 操作审计

### 目的
记录每一次数据变更的完整上下文：谁触发、改了什么、改前改后的值。

### 存储
`gallery-data/logs/audit.jsonl`（追加写入，不可修改）

### 日志格式
```jsonl
{
  "ts": "2026-03-28T14:30:00.123+08:00",
  "action": "item.update",
  "entity": "JD-001",
  "changes": {
    "status": ["在库", "已售"],
    "sale_id": [null, "SO-20260328-001"]
  },
  "trigger": "create-sale",
  "context": "袋鼠椅卖给张先生了，15万"
}
```

### 实现
在 `gallery-data.mjs` 的 `saveStore()` 中注入。每次写入前 diff 变更的 record，追加一行到 audit.jsonl。

### 查询
```bash
# 最近 20 条操作
tail -20 gallery-data/logs/audit.jsonl | jq .

# 某件藏品的变更历史
jq 'select(.entity == "JD-001")' gallery-data/logs/audit.jsonl

# 某天的所有操作
jq 'select(.ts | startswith("2026-03-28"))' gallery-data/logs/audit.jsonl

# 所有销售相关操作
jq 'select(.action | startswith("sale"))' gallery-data/logs/audit.jsonl
```

---

## Layer 2: 数据完整性校验

### 目的
每次写操作后自动验证，防止数据关联断裂。

### 校验规则

| # | 规则 | 严重程度 |
|---|------|---------|
| 1 | 每个 Item.product_id 必须在 products.json 中存在 | 🔴 |
| 2 | 每个 Item.sale_id 非空时必须在 sales.json 中存在 | 🔴 |
| 3 | 每个 Item.purchase_id 非空时必须在 purchases.json 中存在 | 🔴 |
| 4 | 每个 Sale.customer_id 必须在 customers.json 中存在 | 🔴 |
| 5 | 每个 Purchase.supplier_id 必须在 suppliers.json 中存在 | 🔴 |
| 6 | 状态为"已售"的 Item 必须有 sale_id | 🟡 |
| 7 | 有 sale_id 的 Item 状态必须为"已售" | 🟡 |
| 8 | 所有实体的 ID 在各自集合内唯一 | 🔴 |
| 9 | meta.next_seq 大于已有最大序号 | 🟡 |
| 10 | Sale.item_ids 中的每个 ID 必须在 items.json 中存在 | 🔴 |

### 实现
`scripts/integrity-check.mjs` — 独立脚本，可手动运行或写操作后自动调用。

### 输出
```json
{
  "ok": true,
  "checks_passed": 10,
  "checks_failed": 0,
  "warnings": [],
  "errors": []
}
```

或失败时：
```json
{
  "ok": false,
  "checks_passed": 8,
  "checks_failed": 2,
  "errors": [
    "Item JD-003.product_id='PJ-XX-99-A' not found in products",
    "Item JD-005 status='已售' but sale_id is null"
  ]
}
```

---

## Layer 3: 备份与恢复

### 三层备份

| 层级 | 机制 | 频率 | 恢复速度 |
|------|------|------|---------|
| **L1: 写前快照** | 操作前复制受影响的 JSON 文件 | 每次写操作 | 秒级 |
| **L2: Git 版本** | gallery-data/ 作为 git repo，写操作后自动 commit | 每次写操作 | 秒级 |
| **L3: 异地同步** | rsync 到本机 Mac（你的电脑）| 每日 | 分钟级 |

### L1: 写前快照

```
gallery-data/backups/
├── items.2026-03-28T143000.json
├── items.2026-03-28T151200.json
├── sales.2026-03-28T143000.json
└── ...
```

在 `saveStore()` 写入前，先复制当前文件到 `backups/`。保留最近 100 个快照，超出自动清理。

### L2: Git 版本控制

```bash
# 初始化
cd gallery-data && git init && git add -A && git commit -m "init"

# 每次写操作后（在 gallery-data.mjs 中自动执行）
git add -A && git commit -m "agent: create-sale SO-20260328-001"
```

Git 提供：
- `git log --oneline` — 人类可读的变更历史
- `git diff HEAD~1` — 查看上一次改了什么
- `git revert HEAD` — 撤销最近一次操作
- `git show HEAD:items.json` — 查看任意版本的文件内容

### L3: 定时同步

Cron 每天凌晨同步到你的 Mac：

```bash
# Mini 上的 crontab
0 2 * * * rsync -az ~/.openclaw/workspace-gallery/gallery-data/ /Users/yaxuan/backup/gallery-data-$(date +\%Y\%m\%d)/
```

### 恢复操作

| 场景 | 恢复方式 |
|------|---------|
| 刚才改错了一个字段 | `git revert HEAD` |
| 想看某件藏品的历史 | `git log -- items.json` + `git show <commit>:items.json` |
| 文件被损坏 | 从 `backups/` 复制最近的快照 |
| Mini 硬盘坏了 | 从你 Mac 上的每日同步恢复 |

---

## Layer 4: 评估与迭代

### 数据来源

评估基于两个来源：
1. **OpenClaw 会话日志** — `~/.openclaw/agents/gallery/sessions/*.jsonl`（完整对话）
2. **操作审计** — `gallery-data/logs/audit.jsonl`（数据变更）

### 周期性 Review

**频率：** 每周一次，20 分钟

**Review 脚本** `scripts/weekly-review.mjs`：
- 统计本周会话数、操作数、错误数
- 列出所有写操作摘要
- 标记异常（确认被拒绝、完整性校验失败、多次追问）
- 输出可读报告

**报告格式：**
```
📊 Gallery Agent 周报 — 2026-W13

会话：12 次（飞书 8 / 微信 4）
操作：18 次写入
  • 录入藏品 ×5
  • 记录销售 ×2
  • 更新藏品 ×8
  • 新建客户 ×2
  • 更新 SPU ×1

数据完整性：✅ 全部通过
异常事件：0 次确认拒绝，0 次完整性错误

库存变化：在库 8→11（+3）/ 已售 1→3（+2）
营收：¥350,000 / 毛利：¥120,000

待改进（从会话中发现）：
  —（需人工标注）
```

### 改进闭环

```
发现问题（review session logs）
    ↓
记录 issue（logs/improvements.jsonl）
    ↓
分类修复：
  • knowledge.md 缺失 → 补充型号/推断规则
  • system-prompt 不当 → 调整对话策略
  • gallery-data.mjs 缺陷 → 修脚本逻辑
    ↓
验证：跑 integrity-check + 复现场景
    ↓
部署（scp 到 Mini）
```

### 改进记录

`gallery-data/logs/improvements.jsonl`：
```jsonl
{
  "date": "2026-03-28",
  "category": "inference",
  "issue": "Agent 未能识别 PJ-SI-28-D 是办公藤椅的 D 变体",
  "fix": "knowledge.md 已包含但 Agent 未查询",
  "action": "在 SKILL.md 中强调查询 knowledge.md 的推断规则",
  "status": "fixed"
}
```

---

## 文件结构

```
gallery-data/
├── logs/
│   ├── audit.jsonl              ← 操作审计（自动）
│   └── improvements.jsonl       ← 改进记录（手动）
├── backups/                     ← 写前快照（自动）
├── .git/                        ← Git 版本控制（自动）
├── products.json
├── items.json
├── ...
└── photos/

scripts/
├── gallery-data.mjs             ← 主脚本（含审计 + 快照 + git commit）
├── integrity-check.mjs          ← 完整性校验
└── weekly-review.mjs            ← 周报生成
```

---

## 实施优先级

| 阶段 | 内容 | 工作量 |
|------|------|--------|
| **P0** | gallery-data/ 初始化 Git | 5 分钟 |
| **P0** | gallery-data.mjs 加入审计日志 + 写前快照 | 实现 |
| **P0** | integrity-check.mjs 完整性校验脚本 | 实现 |
| **P1** | gallery-data.mjs 写操作后自动 git commit | 实现 |
| **P1** | weekly-review.mjs 周报脚本 | 实现 |
| **P2** | cron 定时同步到 Mac | 配置 |
| **P2** | improvements.jsonl 改进记录流程 | 流程 |
