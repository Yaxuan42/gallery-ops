#!/usr/bin/env node

/**
 * Gallery Data CLI — JSON file CRUD for OpenClaw gallery agent
 *
 * Usage: node gallery-data.mjs <action> [options]
 *
 * Operates on JSON files in the gallery-data/ directory.
 * Each file has: { meta: { version, last_updated, next_seq }, records: [...] }
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, appendFileSync, readdirSync, unlinkSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Data dir: env var > workspace-gallery/gallery-data > sibling data/ folder
const DATA_DIR =
  process.env.GALLERY_DATA_DIR ||
  (() => {
    // Try OpenClaw workspace path first
    const wsPath = join(homedir(), ".openclaw", "workspace-gallery", "gallery-data");
    try { readFileSync(join(wsPath, "items.json")); return wsPath; } catch {}
    // Fallback to sibling data/ directory
    return join(__dirname, "..", "data");
  })();

// --- Helpers ---

function loadStore(name) {
  const path = join(DATA_DIR, `${name}.json`);
  return JSON.parse(readFileSync(path, "utf-8"));
}

function saveStore(name, store, { oldRecords, auditEntityType } = {}) {
  snapshotBefore(name);
  store.meta.last_updated = new Date().toISOString();
  const path = join(DATA_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(store, null, 2) + "\n", "utf-8");
  if (oldRecords && auditEntityType) {
    const oldMap = new Map(oldRecords.map((r) => [r.id, r]));
    for (const rec of store.records) {
      const old = oldMap.get(rec.id);
      const changes = diffRecord(old || null, rec);
      if (changes) {
        appendAudit(
          old ? `${auditEntityType}.update` : `${auditEntityType}.create`,
          auditEntityType,
          rec.id,
          changes,
        );
      }
    }
  }
}

function nextId(store, prefix, pad = 3) {
  const seq = store.meta.next_seq || 1;
  store.meta.next_seq = seq + 1;
  return `${prefix}${String(seq).padStart(pad, "0")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

function parseData(args) {
  const idx = args.indexOf("--data");
  if (idx === -1 || idx + 1 >= args.length) return null;
  return JSON.parse(args[idx + 1]);
}

function parseFlag(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

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
    execSync("git add -A && git commit -m " + JSON.stringify(message), {
      cwd: DATA_DIR,
      stdio: "ignore",
      timeout: 5000,
    });
  } catch {
    // git not initialized or nothing to commit — skip
  }
}

// --- Products (SPU) ---

function listProducts(args) {
  const store = loadStore("products");
  const q = parseFlag(args, "--q");
  const cat = parseFlag(args, "--category");
  let records = store.records;
  if (q) {
    const ql = q.toLowerCase();
    records = records.filter(
      (r) =>
        r.id.toLowerCase().includes(ql) ||
        r.name.toLowerCase().includes(ql) ||
        (r.nickname && r.nickname.includes(ql)),
    );
  }
  if (cat) records = records.filter((r) => r.category === cat);
  out({ total: records.length, records });
}

function getProduct(args) {
  const id = args[0];
  if (!id) return out({ error: "Usage: get-product <id>" });
  const store = loadStore("products");
  const record = store.records.find((r) => r.id === id);
  if (!record) return out({ error: `Product ${id} not found` });
  // Count related items
  const items = loadStore("items");
  const relatedItems = items.records.filter((i) => i.product_id === id);
  out({ ...record, _item_count: relatedItems.length });
}

function createProduct(args) {
  const data = parseData(args);
  if (!data || !data.id || !data.name || !data.category)
    return out({ error: "Required: id, name, category" });
  const store = loadStore("products");
  if (store.records.find((r) => r.id === data.id))
    return out({ error: `Product ${data.id} already exists` });
  const record = {
    id: data.id,
    name: data.name,
    nickname: data.nickname || null,
    category: data.category,
    designer: data.designer || null,
    origin: data.origin || null,
    design_year: data.design_year || null,
    materials: data.materials || [],
    description: data.description || null,
    design_story: data.design_story || null,
    historical_context: data.historical_context || null,
    extra: data.extra || {},
    created_at: now(),
    updated_at: now(),
  };
  const oldRecords = store.records.map((r) => structuredClone(r));
  store.records.push(record);
  saveStore("products", store, { oldRecords, auditEntityType: "product" });
  out({ ok: true, record });
}

function updateProduct(args) {
  const id = args[0];
  const data = parseData(args);
  if (!id || !data) return out({ error: "Usage: update-product <id> --data '{...}'" });
  const store = loadStore("products");
  const oldRecords = store.records.map((r) => structuredClone(r));
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx === -1) return out({ error: `Product ${id} not found` });
  const old = { ...store.records[idx] };
  Object.assign(store.records[idx], data, { updated_at: now() });
  // Don't let id be changed
  store.records[idx].id = id;
  saveStore("products", store, { oldRecords, auditEntityType: "product" });
  out({ ok: true, record: store.records[idx] });
}

// --- Items (SKU) ---

function listItems(args) {
  const store = loadStore("items");
  const products = loadStore("products");
  const status = parseFlag(args, "--status");
  const q = parseFlag(args, "--q");
  const productId = parseFlag(args, "--product");
  let records = store.records;
  if (status) records = records.filter((r) => r.status === status);
  if (productId) records = records.filter((r) => r.product_id === productId);
  if (q) {
    const ql = q.toLowerCase();
    records = records.filter((r) => {
      const prod = products.records.find((p) => p.id === r.product_id);
      return (
        r.id.toLowerCase().includes(ql) ||
        (prod && prod.name.toLowerCase().includes(ql)) ||
        (prod && prod.nickname && prod.nickname.includes(ql))
      );
    });
  }
  // Enrich with product name
  const enriched = records.map((r) => {
    const prod = products.records.find((p) => p.id === r.product_id);
    return {
      ...r,
      _product_name: prod ? prod.name : null,
      _product_nickname: prod ? prod.nickname : null,
    };
  });
  out({ total: enriched.length, records: enriched });
}

function getItem(args) {
  const id = args[0];
  if (!id) return out({ error: "Usage: get-item <id>" });
  const store = loadStore("items");
  const record = store.records.find((r) => r.id === id);
  if (!record) return out({ error: `Item ${id} not found` });
  // Enrich with SPU
  const products = loadStore("products");
  const product = products.records.find((p) => p.id === record.product_id);
  // Enrich with transactions
  const sales = loadStore("sales");
  const purchases = loadStore("purchases");
  const sale = record.sale_id
    ? sales.records.find((s) => s.id === record.sale_id)
    : null;
  const purchase = record.purchase_id
    ? purchases.records.find((p) => p.id === record.purchase_id)
    : null;
  out({ ...record, _product: product || null, _sale: sale, _purchase: purchase });
}

function createItem(args) {
  const data = parseData(args);
  if (!data || !data.product_id)
    return out({ error: "Required: product_id" });
  // Verify product exists
  const products = loadStore("products");
  if (!products.records.find((p) => p.id === data.product_id))
    return out({ error: `Product ${data.product_id} not found. Create it first.` });
  const store = loadStore("items");
  const id = nextId(store, "JD-");
  const record = {
    id,
    product_id: data.product_id,
    production_year: data.production_year || null,
    condition: data.condition || null,
    dimensions: data.dimensions || null,
    pricing: {
      retail: data.pricing?.retail ?? null,
      acquisition: data.pricing?.acquisition ?? null,
      reference: data.pricing?.reference ?? null,
    },
    provenance: {
      institution: data.provenance?.institution ?? null,
      region: data.provenance?.region ?? null,
      previous_owner: data.provenance?.previous_owner ?? null,
    },
    status: data.status || "在库",
    location: data.location || null,
    photos: data.photos || [],
    notes: data.notes || null,
    purchase_id: data.purchase_id || null,
    sale_id: null,
    created_at: now(),
    updated_at: now(),
  };
  const oldRecords = store.records.map((r) => structuredClone(r));
  store.records.push(record);
  saveStore("items", store, { oldRecords, auditEntityType: "item" });
  out({ ok: true, record });
}

function updateItem(args) {
  const id = args[0];
  const data = parseData(args);
  if (!id || !data) return out({ error: "Usage: update-item <id> --data '{...}'" });
  const store = loadStore("items");
  const oldRecords = store.records.map((r) => structuredClone(r));
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx === -1) return out({ error: `Item ${id} not found` });
  const rec = store.records[idx];
  // Deep merge for nested objects
  if (data.pricing) rec.pricing = { ...rec.pricing, ...data.pricing };
  if (data.provenance) rec.provenance = { ...rec.provenance, ...data.provenance };
  // Shallow merge for top-level
  const { pricing, provenance, ...flat } = data;
  Object.assign(rec, flat, { updated_at: now() });
  rec.id = id; // protect id
  saveStore("items", store, { oldRecords, auditEntityType: "item" });
  out({ ok: true, record: rec });
}

// --- Customers ---

function listCustomers(args) {
  const store = loadStore("customers");
  const q = parseFlag(args, "--q");
  let records = store.records;
  if (q) {
    const ql = q.toLowerCase();
    records = records.filter(
      (r) =>
        r.name.includes(ql) ||
        (r.source && r.source.includes(ql)) ||
        r.interests.some((i) => i.includes(ql)),
    );
  }
  out({ total: records.length, records });
}

function getCustomer(args) {
  const id = args[0];
  if (!id) return out({ error: "Usage: get-customer <id>" });
  const store = loadStore("customers");
  const record = store.records.find((r) => r.id === id);
  if (!record) return out({ error: `Customer ${id} not found` });
  // Enrich with purchase history
  const sales = loadStore("sales");
  const history = sales.records.filter((s) => s.customer_id === id);
  out({ ...record, _sales: history });
}

function createCustomer(args) {
  const data = parseData(args);
  if (!data || !data.name) return out({ error: "Required: name" });
  const store = loadStore("customers");
  const id = nextId(store, "C-");
  const record = {
    id,
    name: data.name,
    contact: data.contact || null,
    type: data.type || "个人",
    source: data.source || null,
    interests: data.interests || [],
    budget_range: data.budget_range || null,
    interactions: data.interactions || [],
    notes: data.notes || null,
    created_at: now(),
    updated_at: now(),
  };
  const oldRecords = store.records.map((r) => structuredClone(r));
  store.records.push(record);
  saveStore("customers", store, { oldRecords, auditEntityType: "customer" });
  out({ ok: true, record });
}

function updateCustomer(args) {
  const id = args[0];
  const data = parseData(args);
  if (!id || !data) return out({ error: "Usage: update-customer <id> --data '{...}'" });
  const store = loadStore("customers");
  const oldRecords = store.records.map((r) => structuredClone(r));
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx === -1) return out({ error: `Customer ${id} not found` });
  const rec = store.records[idx];
  // Append interactions if provided
  if (data.interactions) {
    rec.interactions = [...rec.interactions, ...data.interactions];
    delete data.interactions;
  }
  // Append interests if provided
  if (data.interests) {
    rec.interests = [...new Set([...rec.interests, ...data.interests])];
    delete data.interests;
  }
  Object.assign(rec, data, { updated_at: now() });
  rec.id = id;
  saveStore("customers", store, { oldRecords, auditEntityType: "customer" });
  out({ ok: true, record: rec });
}

// --- Suppliers ---

function listSuppliers() {
  const store = loadStore("suppliers");
  out({ total: store.records.length, records: store.records });
}

function createSupplier(args) {
  const data = parseData(args);
  if (!data || !data.name) return out({ error: "Required: name" });
  const store = loadStore("suppliers");
  const id = nextId(store, "SUP-");
  const record = {
    id,
    name: data.name,
    contact: data.contact || null,
    region: data.region || null,
    notes: data.notes || null,
    created_at: now(),
  };
  const oldRecords = store.records.map((r) => structuredClone(r));
  store.records.push(record);
  saveStore("suppliers", store, { oldRecords, auditEntityType: "supplier" });
  out({ ok: true, record });
}

// --- Sales ---

function listSales(args) {
  const store = loadStore("sales");
  const customerId = parseFlag(args, "--customer");
  let records = store.records;
  if (customerId) records = records.filter((r) => r.customer_id === customerId);
  // Enrich
  const customers = loadStore("customers");
  const enriched = records.map((r) => {
    const cust = customers.records.find((c) => c.id === r.customer_id);
    return { ...r, _customer_name: cust ? cust.name : null };
  });
  out({ total: enriched.length, records: enriched });
}

function createSale(args) {
  const data = parseData(args);
  if (!data || !data.customer_id || !data.item_ids || !data.amount)
    return out({ error: "Required: customer_id, item_ids, amount" });
  // Verify references
  const customers = loadStore("customers");
  if (!customers.records.find((c) => c.id === data.customer_id))
    return out({ error: `Customer ${data.customer_id} not found` });
  const itemStore = loadStore("items");
  for (const itemId of data.item_ids) {
    if (!itemStore.records.find((i) => i.id === itemId))
      return out({ error: `Item ${itemId} not found` });
  }
  const store = loadStore("sales");
  // Capture old records for both stores before any mutations
  const oldSaleRecords = store.records.map((r) => structuredClone(r));
  const oldItemRecords = itemStore.records.map((r) => structuredClone(r));
  const seq = store.meta.next_seq || 1;
  store.meta.next_seq = seq + 1;
  const dateStr = (data.date || today()).replace(/-/g, "");
  const id = `SO-${dateStr}-${String(seq).padStart(3, "0")}`;
  // Calculate gross profit
  let totalAcquisition = 0;
  let hasAcquisition = false;
  for (const itemId of data.item_ids) {
    const item = itemStore.records.find((i) => i.id === itemId);
    if (item?.pricing?.acquisition != null) {
      totalAcquisition += item.pricing.acquisition;
      hasAcquisition = true;
    }
  }
  const record = {
    id,
    date: data.date || today(),
    customer_id: data.customer_id,
    item_ids: data.item_ids,
    amount: data.amount,
    currency: data.currency || "CNY",
    payment_status: data.payment_status || "已付",
    gross_profit: hasAcquisition ? data.amount - totalAcquisition : null,
    notes: data.notes || null,
    created_at: now(),
  };
  store.records.push(record);
  saveStore("sales", store, { oldRecords: oldSaleRecords, auditEntityType: "sale" });
  // Update item statuses + sale_id
  for (const itemId of data.item_ids) {
    const idx = itemStore.records.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      itemStore.records[idx].status = "已售";
      itemStore.records[idx].sale_id = id;
      itemStore.records[idx].updated_at = now();
    }
  }
  saveStore("items", itemStore, { oldRecords: oldItemRecords, auditEntityType: "item" });
  out({ ok: true, record, items_updated: data.item_ids });
}

// --- Purchases ---

function listPurchases() {
  const store = loadStore("purchases");
  out({ total: store.records.length, records: store.records });
}

function createPurchase(args) {
  const data = parseData(args);
  if (!data || !data.supplier_id || !data.item_ids)
    return out({ error: "Required: supplier_id, item_ids" });
  const store = loadStore("purchases");
  const itemStore = loadStore("items");
  // Capture old records for both stores before any mutations
  const oldPurchaseRecords = store.records.map((r) => structuredClone(r));
  const oldItemRecords = itemStore.records.map((r) => structuredClone(r));
  const seq = store.meta.next_seq || 1;
  store.meta.next_seq = seq + 1;
  const dateStr = (data.date || today()).replace(/-/g, "");
  const id = `PO-${dateStr}-${String(seq).padStart(3, "0")}`;
  const cost = data.cost || {};
  const record = {
    id,
    date: data.date || today(),
    supplier_id: data.supplier_id,
    item_ids: data.item_ids,
    cost: {
      goods: cost.goods || 0,
      shipping: cost.shipping || null,
      customs: cost.customs || null,
      other: cost.other || null,
      total: cost.total || cost.goods || 0,
    },
    currency: data.currency || "CNY",
    exchange_rate: data.exchange_rate || null,
    payment_status: data.payment_status || "已付",
    notes: data.notes || null,
    created_at: now(),
  };
  store.records.push(record);
  saveStore("purchases", store, { oldRecords: oldPurchaseRecords, auditEntityType: "purchase" });
  // Link items to purchase
  for (const itemId of data.item_ids) {
    const idx = itemStore.records.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      itemStore.records[idx].purchase_id = id;
      itemStore.records[idx].updated_at = now();
    }
  }
  saveStore("items", itemStore, { oldRecords: oldItemRecords, auditEntityType: "item" });
  out({ ok: true, record, items_updated: data.item_ids });
}

// --- Exhibitions ---

function listExhibitions() {
  const store = loadStore("exhibitions");
  out({ total: store.records.length, records: store.records });
}

function createExhibition(args) {
  const data = parseData(args);
  if (!data || !data.title) return out({ error: "Required: title" });
  const store = loadStore("exhibitions");
  // Capture old records before any mutations
  const oldExhibitionRecords = store.records.map((r) => structuredClone(r));
  const id = nextId(store, "EX-");
  const record = {
    id,
    title: data.title,
    date_start: data.date_start || null,
    date_end: data.date_end || null,
    venue: data.venue || null,
    status: data.status || "筹备中",
    item_ids: data.item_ids || [],
    description: data.description || null,
    notes: data.notes || null,
    created_at: now(),
    updated_at: now(),
  };
  store.records.push(record);
  saveStore("exhibitions", store, { oldRecords: oldExhibitionRecords, auditEntityType: "exhibition" });
  // Update item status if items assigned
  if (record.item_ids.length > 0) {
    const itemStore = loadStore("items");
    const oldItemRecords = itemStore.records.map((r) => structuredClone(r));
    for (const itemId of record.item_ids) {
      const idx = itemStore.records.findIndex((i) => i.id === itemId);
      if (idx !== -1 && itemStore.records[idx].status === "在库") {
        itemStore.records[idx].status = "在展";
        itemStore.records[idx].updated_at = now();
      }
    }
    saveStore("items", itemStore, { oldRecords: oldItemRecords, auditEntityType: "item" });
  }
  out({ ok: true, record });
}

function updateExhibition(args) {
  const id = args[0];
  const data = parseData(args);
  if (!id || !data) return out({ error: "Usage: update-exhibition <id> --data '{...}'" });
  const store = loadStore("exhibitions");
  const oldExhibitionRecords = store.records.map((r) => structuredClone(r));
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx === -1) return out({ error: `Exhibition ${id} not found` });
  const rec = store.records[idx];
  const oldItemIds = new Set(rec.item_ids);
  Object.assign(rec, data, { updated_at: now() });
  rec.id = id;
  saveStore("exhibitions", store, { oldRecords: oldExhibitionRecords, auditEntityType: "exhibition" });
  // Handle item status changes if item_ids changed
  if (data.item_ids) {
    const newItemIds = new Set(data.item_ids);
    const itemStore = loadStore("items");
    const oldItemRecords = itemStore.records.map((r) => structuredClone(r));
    // Removed items → back to 在库
    for (const oid of oldItemIds) {
      if (!newItemIds.has(oid)) {
        const i = itemStore.records.findIndex((r) => r.id === oid);
        if (i !== -1 && itemStore.records[i].status === "在展") {
          itemStore.records[i].status = "在库";
          itemStore.records[i].updated_at = now();
        }
      }
    }
    // Added items → 在展
    for (const nid of newItemIds) {
      if (!oldItemIds.has(nid)) {
        const i = itemStore.records.findIndex((r) => r.id === nid);
        if (i !== -1 && itemStore.records[i].status === "在库") {
          itemStore.records[i].status = "在展";
          itemStore.records[i].updated_at = now();
        }
      }
    }
    saveStore("items", itemStore, { oldRecords: oldItemRecords, auditEntityType: "item" });
  }
  out({ ok: true, record: rec });
}

// --- Dashboard ---

function dashboard(args) {
  const section = parseFlag(args, "--section");
  const items = loadStore("items").records;
  const sales = loadStore("sales").records;
  const products = loadStore("products").records;
  const customers = loadStore("customers").records;

  if (section === "stats" || !section) {
    const byStatus = {};
    for (const i of items) byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    const totalRetail = items
      .filter((i) => i.status !== "已售" && i.pricing?.retail)
      .reduce((s, i) => s + i.pricing.retail, 0);
    const totalRevenue = sales.reduce((s, r) => s + r.amount, 0);
    const totalProfit = sales
      .filter((r) => r.gross_profit != null)
      .reduce((s, r) => s + r.gross_profit, 0);
    const stats = {
      total_items: items.length,
      by_status: byStatus,
      total_products: products.length,
      total_customers: customers.length,
      total_sales: sales.length,
      inventory_value_retail: totalRetail,
      total_revenue: totalRevenue,
      total_gross_profit: totalProfit,
    };
    if (section === "stats") return out(stats);
    // Full dashboard
    const recentSales = sales.slice(-5).reverse();
    out({ stats, recent_sales: recentSales });
  }
}

// --- Photos ---

const PHOTOS_DIR = join(DATA_DIR, "photos");

function addPhotos(args) {
  const itemId = args[0];
  const filesRaw = parseFlag(args, "--files");
  if (!itemId || !filesRaw)
    return out({ error: "Usage: add-photos <item_id> --files '/path/1.jpg,/path/2.jpg'" });

  // Verify item exists
  const store = loadStore("items");
  const oldRecords = store.records.map((r) => structuredClone(r));
  const idx = store.records.findIndex((r) => r.id === itemId);
  if (idx === -1) return out({ error: `Item ${itemId} not found` });

  const itemDir = join(PHOTOS_DIR, itemId);
  mkdirSync(itemDir, { recursive: true });

  // Find next photo number
  const existing = store.records[idx].photos || [];
  let seq = existing.length + 1;

  const files = filesRaw.split(",").map((f) => f.trim()).filter(Boolean);
  const saved = [];

  for (const srcPath of files) {
    if (!existsSync(srcPath)) {
      saved.push({ source: srcPath, error: "file not found" });
      continue;
    }
    const ext = extname(srcPath) || ".jpg";
    const filename = `${String(seq).padStart(2, "0")}${ext}`;
    const destPath = join(itemDir, filename);
    copyFileSync(srcPath, destPath);
    const relativePath = `photos/${itemId}/${filename}`;
    existing.push(relativePath);
    saved.push({ source: srcPath, saved_as: relativePath });
    seq++;
  }

  store.records[idx].photos = existing;
  store.records[idx].updated_at = now();
  saveStore("items", store, { oldRecords, auditEntityType: "item" });

  out({ ok: true, item_id: itemId, photos_added: saved, total_photos: existing.length });
}

function listPhotos(args) {
  const itemId = args[0];
  if (!itemId) return out({ error: "Usage: list-photos <item_id>" });
  const store = loadStore("items");
  const record = store.records.find((r) => r.id === itemId);
  if (!record) return out({ error: `Item ${itemId} not found` });
  out({ item_id: itemId, photos: record.photos || [], total: (record.photos || []).length });
}

// --- Router ---

const [, , action, ...rest] = process.argv;

const routes = {
  // Products (SPU)
  "list-products": () => listProducts(rest),
  "get-product": () => getProduct(rest),
  "create-product": () => createProduct(rest),
  "update-product": () => updateProduct(rest),
  // Items (SKU)
  "list-items": () => listItems(rest),
  "get-item": () => getItem(rest),
  "create-item": () => createItem(rest),
  "update-item": () => updateItem(rest),
  // Customers
  "list-customers": () => listCustomers(rest),
  "get-customer": () => getCustomer(rest),
  "create-customer": () => createCustomer(rest),
  "update-customer": () => updateCustomer(rest),
  // Photos
  "add-photos": () => addPhotos(rest),
  "list-photos": () => listPhotos(rest),
  // Suppliers
  "list-suppliers": () => listSuppliers(),
  "create-supplier": () => createSupplier(rest),
  // Sales
  "list-sales": () => listSales(rest),
  "create-sale": () => createSale(rest),
  // Purchases
  "list-purchases": () => listPurchases(),
  "create-purchase": () => createPurchase(rest),
  // Exhibitions
  "list-exhibitions": () => listExhibitions(),
  "create-exhibition": () => createExhibition(rest),
  "update-exhibition": () => updateExhibition(rest),
  // Dashboard
  dashboard: () => dashboard(rest),
  // Help
  help: () =>
    out({
      actions: Object.keys(routes).filter((k) => k !== "help"),
      usage: "node gallery-data.mjs <action> [--data '{...}'] [--status X] [--q X]",
    }),
};

if (!action || !routes[action]) {
  out({ error: `Unknown action: ${action || "(none)"}. Use 'help' for available actions.` });
  process.exit(1);
}

const WRITE_ACTIONS = new Set([
  "create-product", "update-product",
  "create-item", "update-item",
  "create-customer", "update-customer",
  "create-supplier",
  "create-sale", "create-purchase",
  "create-exhibition", "update-exhibition",
  "add-photos",
]);

_currentAction = action;

try {
  routes[action]();
  if (WRITE_ACTIONS.has(action)) {
    gitAutoCommit(`agent: ${action}`);
  }
} catch (e) {
  out({ error: e.message });
  process.exit(1);
}
