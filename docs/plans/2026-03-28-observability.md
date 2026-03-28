# Gallery Agent Observability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add audit logging, pre-write snapshots, data integrity checks, auto git commit, and a weekly review script to the gallery agent's data layer — so every mutation is traceable, every state is recoverable, and agent quality is measurable.

**Architecture:** Inject observability into the existing `gallery-data.mjs` by wrapping `saveStore()` with snapshot + audit + git-commit side-effects. Add a standalone `integrity-check.mjs` that validates all cross-entity references. Add a `weekly-review.mjs` that reads audit logs and produces a human-readable report. All new code is pure Node.js with zero dependencies.

**Tech Stack:** Node.js (ESM), JSON/JSONL files, git CLI, no external packages.

**Working directory:** `/Users/yaxuan/Projects/JIUDI/inventory-agent`

**Test approach:** Each script is tested via `node scripts/<name>.mjs <action>` against the existing `data/` directory. Verify JSON output format and side-effects (files created, git commits made).

---

### Task 1: Audit + Snapshot infrastructure in gallery-data.mjs

**Files:**
- Modify: `scripts/gallery-data.mjs` (lines 12, 30-41 — imports and `saveStore`)
- Create: `data/logs/` directory (auto-created by script)
- Create: `data/backups/` directory (auto-created by script)

**Step 1: Add `appendFileSync` and `readdirSync` to imports**

In `scripts/gallery-data.mjs` line 12, change:
```javascript
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
```
to:
```javascript
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, appendFileSync, readdirSync, unlinkSync } from "fs";
```

**Step 2: Add audit + snapshot helpers after `parseFlag` (after line 71)**

Insert these functions between the helpers section and the Products section:

```javascript
// --- Observability ---

const LOGS_DIR = join(DATA_DIR, "logs");
const BACKUPS_DIR = join(DATA_DIR, "backups");
const AUDIT_PATH = join(LOGS_DIR, "audit.jsonl");
const MAX_BACKUPS_PER_STORE = 100;

// Current action context — set by router before executing
let _currentAction = null;

function snapshotBefore(storeName) {
  mkdirSync(BACKUPS_DIR, { recursive: true });
  const src = join(DATA_DIR, `${storeName}.json`);
  if (!existsSync(src)) return;
  const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const dest = join(BACKUPS_DIR, `${storeName}.${ts}.json`);
  copyFileSync(src, dest);
  pruneBackups(storeName);
}

function pruneBackups(storeName) {
  const prefix = `${storeName}.`;
  const files = readdirSync(BACKUPS_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort();
  while (files.length > MAX_BACKUPS_PER_STORE) {
    const oldest = files.shift();
    try { unlinkSync(join(BACKUPS_DIR, oldest)); } catch {}
  }
}

function appendAudit(action, entityType, entityId, changes) {
  mkdirSync(LOGS_DIR, { recursive: true });
  const entry = {
    ts: new Date().toISOString(),
    action,
    entity_type: entityType,
    entity: entityId,
    changes,
    trigger: _currentAction,
  };
  appendFileSync(AUDIT_PATH, JSON.stringify(entry) + "\n", "utf-8");
}

function diffRecord(oldRec, newRec) {
  if (!oldRec) return { _new: true };
  const changes = {};
  const allKeys = new Set([...Object.keys(oldRec), ...Object.keys(newRec)]);
  for (const k of allKeys) {
    if (k.startsWith("_")) continue; // skip enrichment fields
    const ov = JSON.stringify(oldRec[k]);
    const nv = JSON.stringify(newRec[k]);
    if (ov !== nv) changes[k] = [oldRec[k], newRec[k]];
  }
  return Object.keys(changes).length > 0 ? changes : null;
}

function gitAutoCommit(message) {
  try {
    const { execSync } = await import("child_process");
    execSync("git add -A && git commit -m " + JSON.stringify(message), {
      cwd: DATA_DIR,
      stdio: "ignore",
      timeout: 5000,
    });
  } catch {
    // git not initialized or nothing to commit — silently skip
  }
}
```

Wait — `await import` in a non-async context won't work. Use dynamic import differently.

**Step 2 (revised): Add audit + snapshot helpers — use sync `execSync` import at top**

Add to line 15 (after the `homedir` import):
```javascript
import { execSync } from "child_process";
```

Then insert the observability functions after `parseFlag` (after line 71):

```javascript
// --- Observability ---

const LOGS_DIR = join(DATA_DIR, "logs");
const BACKUPS_DIR = join(DATA_DIR, "backups");
const AUDIT_PATH = join(LOGS_DIR, "audit.jsonl");
const MAX_BACKUPS_PER_STORE = 100;

let _currentAction = null;

function snapshotBefore(storeName) {
  mkdirSync(BACKUPS_DIR, { recursive: true });
  const src = join(DATA_DIR, `${storeName}.json`);
  if (!existsSync(src)) return;
  const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const dest = join(BACKUPS_DIR, `${storeName}.${ts}.json`);
  copyFileSync(src, dest);
  pruneBackups(storeName);
}

function pruneBackups(storeName) {
  const prefix = `${storeName}.`;
  const files = readdirSync(BACKUPS_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort();
  while (files.length > MAX_BACKUPS_PER_STORE) {
    const oldest = files.shift();
    try { unlinkSync(join(BACKUPS_DIR, oldest)); } catch {}
  }
}

function appendAudit(action, entityType, entityId, changes) {
  mkdirSync(LOGS_DIR, { recursive: true });
  const entry = {
    ts: new Date().toISOString(),
    action,
    entity_type: entityType,
    entity: entityId,
    changes,
    trigger: _currentAction,
  };
  appendFileSync(AUDIT_PATH, JSON.stringify(entry) + "\n", "utf-8");
}

function diffRecord(oldRec, newRec) {
  if (!oldRec) return { _new: true };
  const changes = {};
  const allKeys = new Set([...Object.keys(oldRec), ...Object.keys(newRec)]);
  for (const k of allKeys) {
    if (k.startsWith("_")) continue;
    const ov = JSON.stringify(oldRec[k]);
    const nv = JSON.stringify(newRec[k]);
    if (ov !== nv) changes[k] = [oldRec[k], newRec[k]];
  }
  return Object.keys(changes).length > 0 ? changes : null;
}

function gitAutoCommit(message) {
  try {
    execSync("git add -A && git commit --allow-empty -m " + JSON.stringify(message), {
      cwd: DATA_DIR,
      stdio: "ignore",
      timeout: 5000,
    });
  } catch {
    // git not initialized or nothing to commit — skip
  }
}
```

**Step 3: Wrap `saveStore` with snapshot + audit**

Replace the existing `saveStore` function (lines 37-41):

```javascript
// oldRecords: pass the records array BEFORE mutation to enable diffing
function saveStore(name, store, { oldRecords, auditAction, auditEntityType } = {}) {
  // L1: Pre-write snapshot
  snapshotBefore(name);

  // Write
  store.meta.last_updated = new Date().toISOString();
  const path = join(DATA_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(store, null, 2) + "\n", "utf-8");

  // L1: Audit log — diff each changed record
  if (oldRecords && auditAction && auditEntityType) {
    const idField = "id";
    const oldMap = new Map(oldRecords.map((r) => [r[idField], r]));
    for (const rec of store.records) {
      const old = oldMap.get(rec[idField]);
      const changes = diffRecord(old || null, rec);
      if (changes) {
        appendAudit(
          old ? `${auditEntityType}.update` : `${auditEntityType}.create`,
          auditEntityType,
          rec[idField],
          changes,
        );
      }
    }
  }
}
```

**Step 4: Update every `saveStore` call site to pass old records**

Every function that calls `saveStore` needs to capture the old state first. The pattern:

```javascript
// Before mutation:
const oldRecords = store.records.map((r) => ({ ...r }));
// ... mutate store.records ...
saveStore("items", store, { oldRecords, auditAction: "create", auditEntityType: "item" });
```

Apply to all write functions:
- `createProduct` — `oldRecords` before push, type `"product"`
- `updateProduct` — `oldRecords` before assign, type `"product"`
- `createItem` — `oldRecords` before push, type `"item"`
- `updateItem` — `oldRecords` before merge, type `"item"`
- `createCustomer` — `oldRecords` before push, type `"customer"`
- `updateCustomer` — `oldRecords` before merge, type `"customer"`
- `createSupplier` — `oldRecords` before push, type `"supplier"`
- `createSale` — two stores: `sales` + `items`
- `createPurchase` — two stores: `purchases` + `items`
- `createExhibition` — `exhibitions` + possibly `items`
- `updateExhibition` — `exhibitions` + possibly `items`
- `addPhotos` — `items`

**Step 5: Add git auto-commit + set `_currentAction` in router**

In the router section (around line 710), before executing the route:

```javascript
_currentAction = action;
```

And after route execution, add git commit:

```javascript
try {
  routes[action]();
  // Auto git commit after write operations
  const writeActions = [
    "create-product", "update-product",
    "create-item", "update-item",
    "create-customer", "update-customer",
    "create-supplier",
    "create-sale", "create-purchase",
    "create-exhibition", "update-exhibition",
    "add-photos",
  ];
  if (writeActions.includes(action)) {
    gitAutoCommit(`agent: ${action}`);
  }
} catch (e) {
  out({ error: e.message });
  process.exit(1);
}
```

**Step 6: Test locally**

```bash
cd /Users/yaxuan/Projects/JIUDI/inventory-agent

# Initialize git in data/
cd data && git init && git add -A && git commit -m "init" && cd ..

# Test: create a product
node scripts/gallery-data.mjs create-product --data '{"id":"TEST-001","name":"Test Chair","category":"Test"}'

# Verify audit log was written
cat data/logs/audit.jsonl

# Verify backup was created
ls data/backups/

# Verify git commit was made
cd data && git log --oneline -3 && cd ..

# Cleanup test
node scripts/gallery-data.mjs update-product TEST-001 --data '{"nickname":"测试椅"}'
cat data/logs/audit.jsonl
```

Expected: audit.jsonl has two entries (create + update), backups/ has snapshot files, git log shows commits.

**Step 7: Commit**

```bash
git add scripts/gallery-data.mjs
git commit -m "feat: add audit logging, pre-write snapshots, and auto git commit to gallery-data.mjs"
```

---

### Task 2: Integrity check script

**Files:**
- Create: `scripts/integrity-check.mjs`

**Step 1: Write the integrity check script**

```javascript
#!/usr/bin/env node

/**
 * Data Integrity Check for Gallery Data
 *
 * Validates cross-entity references and status consistency.
 * Exit code 0 = all pass, 1 = errors found.
 *
 * Usage: node integrity-check.mjs [--fix]
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR =
  process.env.GALLERY_DATA_DIR ||
  (() => {
    const wsPath = join(homedir(), ".openclaw", "workspace-gallery", "gallery-data");
    try { readFileSync(join(wsPath, "items.json")); return wsPath; } catch {}
    return join(__dirname, "..", "data");
  })();

function load(name) {
  return JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), "utf-8")).records;
}

const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// Load all stores
const products = load("products");
const items = load("items");
const customers = load("customers");
const suppliers = load("suppliers");
const sales = load("sales");
const purchases = load("purchases");
const exhibitions = load("exhibitions");

const productIds = new Set(products.map((r) => r.id));
const itemIds = new Set(items.map((r) => r.id));
const customerIds = new Set(customers.map((r) => r.id));
const supplierIds = new Set(suppliers.map((r) => r.id));
const saleIds = new Set(sales.map((r) => r.id));
const purchaseIds = new Set(purchases.map((r) => r.id));

// Rule 1: Item.product_id → products
for (const item of items) {
  if (!productIds.has(item.product_id))
    err(`Item ${item.id}.product_id='${item.product_id}' not found in products`);
}

// Rule 2: Item.sale_id → sales
for (const item of items) {
  if (item.sale_id && !saleIds.has(item.sale_id))
    err(`Item ${item.id}.sale_id='${item.sale_id}' not found in sales`);
}

// Rule 3: Item.purchase_id → purchases
for (const item of items) {
  if (item.purchase_id && !purchaseIds.has(item.purchase_id))
    err(`Item ${item.id}.purchase_id='${item.purchase_id}' not found in purchases`);
}

// Rule 4: Sale.customer_id → customers
for (const sale of sales) {
  if (!customerIds.has(sale.customer_id))
    err(`Sale ${sale.id}.customer_id='${sale.customer_id}' not found in customers`);
}

// Rule 5: Purchase.supplier_id → suppliers
for (const purchase of purchases) {
  if (!supplierIds.has(purchase.supplier_id))
    err(`Purchase ${purchase.id}.supplier_id='${purchase.supplier_id}' not found in suppliers`);
}

// Rule 6: status=已售 → must have sale_id
for (const item of items) {
  if (item.status === "已售" && !item.sale_id)
    warn(`Item ${item.id} status='已售' but sale_id is null`);
}

// Rule 7: has sale_id → status must be 已售
for (const item of items) {
  if (item.sale_id && item.status !== "已售")
    warn(`Item ${item.id} has sale_id='${item.sale_id}' but status='${item.status}'`);
}

// Rule 8: Unique IDs
function checkUnique(records, label) {
  const seen = new Set();
  for (const r of records) {
    if (seen.has(r.id)) err(`Duplicate ${label} ID: ${r.id}`);
    seen.add(r.id);
  }
}
checkUnique(products, "Product");
checkUnique(items, "Item");
checkUnique(customers, "Customer");
checkUnique(suppliers, "Supplier");
checkUnique(sales, "Sale");
checkUnique(purchases, "Purchase");
checkUnique(exhibitions, "Exhibition");

// Rule 9: meta.next_seq > max existing seq
function checkSeq(storeName, records, prefix) {
  const meta = JSON.parse(readFileSync(join(DATA_DIR, `${storeName}.json`), "utf-8")).meta;
  const maxSeq = records.reduce((max, r) => {
    const match = r.id.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  if (meta.next_seq <= maxSeq)
    warn(`${storeName}.meta.next_seq (${meta.next_seq}) <= max existing seq (${maxSeq})`);
}
checkSeq("items", items, "JD-");
checkSeq("customers", customers, "C-");
checkSeq("suppliers", suppliers, "SUP-");
checkSeq("exhibitions", exhibitions, "EX-");

// Rule 10: Sale.item_ids → items
for (const sale of sales) {
  for (const itemId of sale.item_ids || []) {
    if (!itemIds.has(itemId))
      err(`Sale ${sale.id}.item_ids contains '${itemId}' not found in items`);
  }
}

// Rule 10b: Purchase.item_ids → items
for (const purchase of purchases) {
  for (const itemId of purchase.item_ids || []) {
    if (!itemIds.has(itemId))
      err(`Purchase ${purchase.id}.item_ids contains '${itemId}' not found in items`);
  }
}

// Rule 10c: Exhibition.item_ids → items
for (const exhibition of exhibitions) {
  for (const itemId of exhibition.item_ids || []) {
    if (!itemIds.has(itemId))
      err(`Exhibition ${exhibition.id}.item_ids contains '${itemId}' not found in items`);
  }
}

// Output
const totalChecks = 10;
const result = {
  ok: errors.length === 0,
  checks_passed: totalChecks - (errors.length > 0 ? 1 : 0) - (warnings.length > 0 ? 1 : 0),
  errors,
  warnings,
  summary: {
    products: products.length,
    items: items.length,
    customers: customers.length,
    suppliers: suppliers.length,
    sales: sales.length,
    purchases: purchases.length,
    exhibitions: exhibitions.length,
  },
};

console.log(JSON.stringify(result, null, 2));
process.exit(errors.length > 0 ? 1 : 0);
```

**Step 2: Test the integrity check**

```bash
node scripts/integrity-check.mjs
```

Expected output:
```json
{
  "ok": true,
  "checks_passed": 10,
  "errors": [],
  "warnings": [],
  "summary": { "products": 12, "items": 1, ... }
}
```

**Step 3: Add `check` action to gallery-data.mjs router**

In the router, add:
```javascript
"check": () => {
  const { execSync } = require("child_process");
  // not needed — just guide the agent to call integrity-check.mjs directly
},
```

Actually, simpler: just register it in the `help` output and document it. The agent calls `integrity-check.mjs` directly.

**Step 4: Commit**

```bash
git add scripts/integrity-check.mjs
git commit -m "feat: add data integrity check script with 10 validation rules"
```

---

### Task 3: Weekly review script

**Files:**
- Create: `scripts/weekly-review.mjs`

**Step 1: Write the weekly review script**

```javascript
#!/usr/bin/env node

/**
 * Weekly Review — reads audit.jsonl and produces a human-readable report.
 *
 * Usage: node weekly-review.mjs [--days 7]
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR =
  process.env.GALLERY_DATA_DIR ||
  (() => {
    const wsPath = join(homedir(), ".openclaw", "workspace-gallery", "gallery-data");
    try { readFileSync(join(wsPath, "items.json")); return wsPath; } catch {}
    return join(__dirname, "..", "data");
  })();

const days = parseInt(process.argv.find((a, i) => process.argv[i - 1] === "--days") || "7", 10);
const cutoff = new Date(Date.now() - days * 86400000).toISOString();

// Read audit log
const auditPath = join(DATA_DIR, "logs", "audit.jsonl");
let entries = [];
if (existsSync(auditPath)) {
  entries = readFileSync(auditPath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((e) => e.ts >= cutoff);
}

// Read current stats
function load(name) {
  return JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), "utf-8"));
}

const items = load("items").records;
const sales = load("sales").records;
const products = load("products").records;
const customers = load("customers").records;

// Aggregate
const actionCounts = {};
for (const e of entries) {
  const label = e.action || e.trigger || "unknown";
  actionCounts[label] = (actionCounts[label] || 0) + 1;
}

const byStatus = {};
for (const i of items) byStatus[i.status] = (byStatus[i.status] || 0) + 1;

const recentSales = sales.filter((s) => s.created_at >= cutoff);
const revenue = recentSales.reduce((sum, s) => sum + s.amount, 0);
const profit = recentSales
  .filter((s) => s.gross_profit != null)
  .reduce((sum, s) => sum + s.gross_profit, 0);

// Week number
const weekNum = Math.ceil(
  ((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 + 1) / 7,
);

// Format report
const report = `📊 Gallery Agent 周报 — ${new Date().getFullYear()}-W${String(weekNum).padStart(2, "0")}
期间：最近 ${days} 天（${cutoff.slice(0, 10)} 至今）

操作：${entries.length} 次写入
${Object.entries(actionCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `  • ${k} ×${v}`)
  .join("\n") || "  （无操作）"}

库存现状：${items.length} 件
${Object.entries(byStatus)
  .map(([k, v]) => `  • ${k}：${v}`)
  .join("\n")}

SPU：${products.length} 种 / 客户：${customers.length} 位

本期销售：${recentSales.length} 单
  营收：¥${revenue.toLocaleString()}
  毛利：¥${profit.toLocaleString()}
`;

console.log(report);

// Also output as JSON for machine consumption
const json = {
  period: { days, since: cutoff.slice(0, 10) },
  operations: { total: entries.length, by_action: actionCounts },
  inventory: { total: items.length, by_status: byStatus },
  products: products.length,
  customers: customers.length,
  sales: { count: recentSales.length, revenue, gross_profit: profit },
};
console.log("\n--- JSON ---");
console.log(JSON.stringify(json, null, 2));
```

**Step 2: Test**

```bash
node scripts/weekly-review.mjs --days 30
```

Expected: A formatted report showing current stats (mostly zeros since data is fresh).

**Step 3: Commit**

```bash
git add scripts/weekly-review.mjs
git commit -m "feat: add weekly review report script"
```

---

### Task 4: Initialize Git in data/ and deploy to Mini

**Step 1: Initialize git in local data/**

```bash
cd /Users/yaxuan/Projects/JIUDI/inventory-agent/data
git init
echo "backups/" > .gitignore
echo "logs/" >> .gitignore
echo "photos/" >> .gitignore
git add -A
git commit -m "init: gallery data store"
cd ..
```

**Step 2: Deploy all scripts to Mini**

```bash
scp scripts/gallery-data.mjs mini:~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/gallery-data.mjs
scp scripts/integrity-check.mjs mini:~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/integrity-check.mjs
scp scripts/weekly-review.mjs mini:~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/weekly-review.mjs
```

**Step 3: Initialize git in Mini's gallery-data/**

```bash
ssh mini "cd ~/.openclaw/workspace-gallery/gallery-data && git init && echo 'backups/' > .gitignore && echo 'logs/' >> .gitignore && echo 'photos/' >> .gitignore && git add -A && git commit -m 'init: gallery data store'"
```

**Step 4: Run full verification on Mini**

```bash
# Test integrity check
ssh mini "export PATH=/usr/local/bin:\$PATH && node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/integrity-check.mjs"

# Test a write operation and verify audit + snapshot + git
ssh mini "export PATH=/usr/local/bin:\$PATH && node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/gallery-data.mjs create-product --data '{\"id\":\"TEST-VERIFY\",\"name\":\"Verify Test\",\"category\":\"Test\"}'"

# Check audit log exists
ssh mini "cat ~/.openclaw/workspace-gallery/gallery-data/logs/audit.jsonl"

# Check backup exists
ssh mini "ls ~/.openclaw/workspace-gallery/gallery-data/backups/"

# Check git commit
ssh mini "cd ~/.openclaw/workspace-gallery/gallery-data && git log --oneline -3"

# Run weekly review
ssh mini "export PATH=/usr/local/bin:\$PATH && node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/weekly-review.mjs"

# Clean up test product
ssh mini "export PATH=/usr/local/bin:\$PATH && node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/gallery-data.mjs update-product TEST-VERIFY --data '{\"nickname\":\"cleanup\"}'"

# Final integrity check
ssh mini "export PATH=/usr/local/bin:\$PATH && node ~/.openclaw/workspace-gallery/skills/gallery-ops/scripts/integrity-check.mjs"
```

**Step 5: Commit the plan itself**

```bash
git add docs/plans/2026-03-28-observability.md scripts/
git commit -m "feat: observability implementation plan + scripts"
```

---

### Task 5: Update SKILL.md on Mini with observability actions

**Step 1: Append observability section to SKILL.md**

SSH to Mini and append:

```markdown
### 可观测性

| 操作 | 命令 | 说明 |
|------|------|------|
| 完整性校验 | `node .../integrity-check.mjs` | 校验所有跨实体引用和状态一致性 |
| 周报 | `node .../weekly-review.mjs [--days 7]` | 生成操作统计和库存概况报告 |
| 审计日志 | `cat gallery-data/logs/audit.jsonl` | 查看所有数据变更记录 |
| Git 历史 | `cd gallery-data && git log --oneline` | 查看数据版本历史 |
| 撤销操作 | `cd gallery-data && git revert HEAD` | 撤销最近一次数据变更 |

所有写操作自动触发：
1. 写前快照（`backups/`，保留最近 100 个）
2. 审计日志（`logs/audit.jsonl`，追加写入）
3. Git commit（自动提交变更）
```

**Step 2: Commit**

Final state verification on Mini — all observability features working.
