#!/usr/bin/env node

/**
 * Data Integrity Check for Gallery Data
 *
 * Validates cross-entity references and status consistency.
 * Exit code 0 = all pass, 1 = errors found.
 *
 * Usage: node integrity-check.mjs
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
  return JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), "utf-8"));
}

const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// Load all stores
const products = load("products").records;
const items = load("items").records;
const customers = load("customers").records;
const suppliers = load("suppliers").records;
const sales = load("sales").records;
const purchases = load("purchases").records;
const exhibitions = load("exhibitions").records;

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

// Rule 8: Unique IDs per entity type
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

// Rule 9: meta.next_seq > max existing numeric suffix
function checkSeq(storeName, records) {
  const store = load(storeName);
  const maxSeq = records.reduce((max, r) => {
    const match = r.id.match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  if (store.meta.next_seq <= maxSeq)
    warn(`${storeName}.meta.next_seq (${store.meta.next_seq}) <= max existing seq (${maxSeq})`);
}
checkSeq("items", items);
checkSeq("customers", customers);
checkSeq("suppliers", suppliers);
checkSeq("exhibitions", exhibitions);

// Rule 10: Sale.item_ids / Purchase.item_ids / Exhibition.item_ids → items
for (const sale of sales) {
  for (const itemId of sale.item_ids || []) {
    if (!itemIds.has(itemId))
      err(`Sale ${sale.id}.item_ids contains '${itemId}' not found in items`);
  }
}
for (const purchase of purchases) {
  for (const itemId of purchase.item_ids || []) {
    if (!itemIds.has(itemId))
      err(`Purchase ${purchase.id}.item_ids contains '${itemId}' not found in items`);
  }
}
for (const exhibition of exhibitions) {
  for (const itemId of exhibition.item_ids || []) {
    if (!itemIds.has(itemId))
      err(`Exhibition ${exhibition.id}.item_ids contains '${itemId}' not found in items`);
  }
}

// Output
const result = {
  ok: errors.length === 0,
  errors_count: errors.length,
  warnings_count: warnings.length,
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
