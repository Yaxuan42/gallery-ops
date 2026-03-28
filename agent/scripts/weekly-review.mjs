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

const daysArg = process.argv.indexOf("--days");
const days = daysArg !== -1 && process.argv[daysArg + 1]
  ? parseInt(process.argv[daysArg + 1], 10)
  : 7;
const cutoff = new Date(Date.now() - days * 86400000).toISOString();

// Read audit log
const auditPath = join(DATA_DIR, "logs", "audit.jsonl");
let entries = [];
if (existsSync(auditPath)) {
  entries = readFileSync(auditPath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean)
    .filter((e) => e.ts >= cutoff);
}

// Read current data
function load(name) {
  return JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), "utf-8")).records;
}

const items = load("items");
const sales = load("sales");
const products = load("products");
const customers = load("customers");

// Aggregate operations by action type
const actionCounts = {};
for (const e of entries) {
  const label = e.action || "unknown";
  actionCounts[label] = (actionCounts[label] || 0) + 1;
}

// Aggregate operations by trigger (which CLI command)
const triggerCounts = {};
for (const e of entries) {
  const label = e.trigger || "unknown";
  triggerCounts[label] = (triggerCounts[label] || 0) + 1;
}

// Inventory by status
const byStatus = {};
for (const i of items) byStatus[i.status] = (byStatus[i.status] || 0) + 1;

// Recent sales
const recentSales = sales.filter((s) => s.created_at >= cutoff);
const revenue = recentSales.reduce((sum, s) => sum + (s.amount || 0), 0);
const profit = recentSales
  .filter((s) => s.gross_profit != null)
  .reduce((sum, s) => sum + s.gross_profit, 0);

// Week number
const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 1);
const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

// Entities affected
const entitiesAffected = new Set(entries.map((e) => e.entity).filter(Boolean));

// Format report
const report = `📊 Gallery Agent 周报 — ${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}
期间：最近 ${days} 天（${cutoff.slice(0, 10)} 至今）

操作：${entries.length} 次数据变更，涉及 ${entitiesAffected.size} 个实体
${Object.entries(triggerCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `  • ${k} ×${v}`)
  .join("\n") || "  （无操作）"}

变更明细：
${Object.entries(actionCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `  • ${k} ×${v}`)
  .join("\n") || "  （无变更）"}

库存现状：${items.length} 件
${Object.entries(byStatus)
  .map(([k, v]) => `  • ${k}：${v}`)
  .join("\n") || "  （无库存）"}

SPU：${products.length} 种 / 客户：${customers.length} 位

本期销售：${recentSales.length} 单
  营收：¥${revenue.toLocaleString()}
  毛利：¥${profit.toLocaleString()}
`;

console.log(report);

// JSON output
const json = {
  period: { days, since: cutoff.slice(0, 10) },
  operations: { total: entries.length, entities_affected: entitiesAffected.size, by_trigger: triggerCounts, by_action: actionCounts },
  inventory: { total: items.length, by_status: byStatus },
  products: products.length,
  customers: customers.length,
  sales: { count: recentSales.length, revenue, gross_profit: profit },
};
console.log("--- JSON ---");
console.log(JSON.stringify(json, null, 2));
