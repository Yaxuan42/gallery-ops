-- Add sku_code (required, unique) and recommendation (optional) to items
-- Existing rows get auto-generated SKU codes based on designer_series

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku_code" TEXT NOT NULL,
    "product_id" TEXT,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "recommendation" TEXT,
    "notes" TEXT,
    "manufacturer" TEXT,
    "era" TEXT,
    "material" TEXT,
    "dimensions" TEXT,
    "condition_grade" TEXT,
    "designer_series" TEXT,
    "supplier_id" TEXT,
    "list_price" REAL,
    "selling_price" REAL,
    "shipping_cost_usd" REAL,
    "shipping_cost_rmb" REAL,
    "customs_fees" REAL,
    "import_duties" REAL,
    "purchase_price_usd" REAL,
    "purchase_price_rmb" REAL,
    "total_cost" REAL,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "show_on_website" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Generate SKU codes for existing items using designer_series prefix + row_number
INSERT INTO "new_items" (
  "id", "sku_code", "product_id", "name", "name_en", "recommendation", "notes",
  "manufacturer", "era", "material", "dimensions", "condition_grade", "designer_series",
  "supplier_id", "list_price", "selling_price", "shipping_cost_usd", "shipping_cost_rmb",
  "customs_fees", "import_duties", "purchase_price_usd", "purchase_price_rmb",
  "total_cost", "status", "show_on_website", "slug", "created_at", "updated_at"
)
SELECT
  "id",
  CASE "designer_series"
    WHEN '昌迪加尔' THEN 'PJ-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Le Corbusier' THEN 'LC-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Charlotte Perriand' THEN 'CP-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Jean Prouve' THEN 'JP-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Pierre Chapo' THEN 'PC-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Eames' THEN 'EM-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Poul Henningsen' THEN 'PH-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    WHEN 'Bernard-Albin Gras' THEN 'BG-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY "designer_series" ORDER BY "created_at"))
    ELSE 'GD-' || printf('%03d', ROW_NUMBER() OVER (PARTITION BY CASE WHEN "designer_series" IS NULL OR "designer_series" NOT IN ('昌迪加尔','Le Corbusier','Charlotte Perriand','Jean Prouve','Pierre Chapo','Eames','Poul Henningsen','Bernard-Albin Gras') THEN 'OTHER' ELSE "designer_series" END ORDER BY "created_at"))
  END,
  "product_id", "name", "name_en", NULL, "notes",
  "manufacturer", "era", "material", "dimensions", "condition_grade", "designer_series",
  "supplier_id", "list_price", "selling_price", "shipping_cost_usd", "shipping_cost_rmb",
  "customs_fees", "import_duties", "purchase_price_usd", "purchase_price_rmb",
  "total_cost", "status", "show_on_website", "slug", "created_at", "updated_at"
FROM "items";

DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
CREATE UNIQUE INDEX "items_sku_code_key" ON "items"("sku_code");
CREATE UNIQUE INDEX "items_slug_key" ON "items"("slug");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
