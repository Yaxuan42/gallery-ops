import { describe, it, expect } from "vitest";
import {
  ITEM_STATUS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_COLORS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  SUPPLIER_STATUS,
  CUSTOMER_TYPE,
  CUSTOMER_TYPE_LABELS,
  CATEGORIES,
  DESIGNER_SERIES,
  SKU_PREFIX_MAP,
  CUSTOMER_SOURCES,
  CONDITION_GRADES,
  SUPPLIER_COUNTRIES,
} from "@/lib/constants";

// ============ ITEM_STATUS ============
describe("ITEM_STATUS", () => {
  it("has exactly 4 statuses", () => {
    expect(Object.keys(ITEM_STATUS)).toHaveLength(4);
  });

  it("contains expected status values", () => {
    expect(ITEM_STATUS.IN_STOCK).toBe("IN_STOCK");
    expect(ITEM_STATUS.IN_TRANSIT).toBe("IN_TRANSIT");
    expect(ITEM_STATUS.SOLD).toBe("SOLD");
    expect(ITEM_STATUS.RESERVED).toBe("RESERVED");
  });

  it("has labels for every status", () => {
    for (const key of Object.keys(ITEM_STATUS)) {
      expect(ITEM_STATUS_LABELS[key]).toBeDefined();
      expect(ITEM_STATUS_LABELS[key].zh).toBeTruthy();
      expect(ITEM_STATUS_LABELS[key].en).toBeTruthy();
    }
  });

  it("has colors for every status", () => {
    for (const key of Object.keys(ITEM_STATUS)) {
      expect(ITEM_STATUS_COLORS[key]).toBeDefined();
      expect(ITEM_STATUS_COLORS[key]).toBeTruthy();
    }
  });
});

// ============ ORDER_STATUS ============
describe("ORDER_STATUS", () => {
  it("has exactly 6 statuses", () => {
    expect(Object.keys(ORDER_STATUS)).toHaveLength(6);
  });

  it("contains expected status values", () => {
    expect(ORDER_STATUS.PENDING).toBe("PENDING");
    expect(ORDER_STATUS.CONFIRMED).toBe("CONFIRMED");
    expect(ORDER_STATUS.PAID).toBe("PAID");
    expect(ORDER_STATUS.SHIPPED).toBe("SHIPPED");
    expect(ORDER_STATUS.COMPLETED).toBe("COMPLETED");
    expect(ORDER_STATUS.CANCELLED).toBe("CANCELLED");
  });

  it("has labels for every status", () => {
    for (const key of Object.keys(ORDER_STATUS)) {
      expect(ORDER_STATUS_LABELS[key]).toBeDefined();
      expect(ORDER_STATUS_LABELS[key].zh).toBeTruthy();
      expect(ORDER_STATUS_LABELS[key].en).toBeTruthy();
    }
  });
});

// ============ SUPPLIER_STATUS ============
describe("SUPPLIER_STATUS", () => {
  it("has exactly 3 statuses", () => {
    expect(Object.keys(SUPPLIER_STATUS)).toHaveLength(3);
  });

  it("contains ACTIVE, INACTIVE, PAUSED", () => {
    expect(SUPPLIER_STATUS.ACTIVE).toBe("ACTIVE");
    expect(SUPPLIER_STATUS.INACTIVE).toBe("INACTIVE");
    expect(SUPPLIER_STATUS.PAUSED).toBe("PAUSED");
  });
});

// ============ CUSTOMER_TYPE ============
describe("CUSTOMER_TYPE", () => {
  it("has exactly 3 types", () => {
    expect(Object.keys(CUSTOMER_TYPE)).toHaveLength(3);
  });

  it("contains expected types", () => {
    expect(CUSTOMER_TYPE.INDIVIDUAL).toBe("INDIVIDUAL");
    expect(CUSTOMER_TYPE.COMMERCIAL_SPACE).toBe("COMMERCIAL_SPACE");
    expect(CUSTOMER_TYPE.GALLERY).toBe("GALLERY");
  });

  it("has labels for every type", () => {
    for (const key of Object.keys(CUSTOMER_TYPE)) {
      expect(CUSTOMER_TYPE_LABELS[key]).toBeDefined();
      expect(CUSTOMER_TYPE_LABELS[key].zh).toBeTruthy();
      expect(CUSTOMER_TYPE_LABELS[key].en).toBeTruthy();
    }
  });
});

// ============ CATEGORIES ============
describe("CATEGORIES", () => {
  it("has 8 categories", () => {
    expect(CATEGORIES).toHaveLength(8);
  });

  it("each category has value, labelZh, and labelEn", () => {
    for (const cat of CATEGORIES) {
      expect(cat.value).toBeTruthy();
      expect(cat.labelZh).toBeTruthy();
      expect(cat.labelEn).toBeTruthy();
    }
  });

  it("includes the expected categories", () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(values).toContain("椅子");
    expect(values).toContain("桌子");
    expect(values).toContain("灯具");
    expect(values).toContain("其他");
  });
});

// ============ DESIGNER_SERIES ============
describe("DESIGNER_SERIES", () => {
  it("has 9 entries", () => {
    expect(DESIGNER_SERIES).toHaveLength(9);
  });

  it("each entry has value and label", () => {
    for (const ds of DESIGNER_SERIES) {
      expect(ds.value).toBeTruthy();
      expect(ds.label).toBeTruthy();
    }
  });

  it("includes Eames and Chandigarh entries", () => {
    const values = DESIGNER_SERIES.map((d) => d.value);
    expect(values).toContain("Eames");
    expect(values).toContain("昌迪加尔");
  });
});

// ============ SKU_PREFIX_MAP ============
describe("SKU_PREFIX_MAP", () => {
  it("has a 2-letter prefix for every designer series", () => {
    for (const ds of DESIGNER_SERIES) {
      const prefix = SKU_PREFIX_MAP[ds.value];
      expect(prefix).toBeDefined();
      expect(prefix).toHaveLength(2);
    }
  });

  it("maps known designers to expected prefixes", () => {
    expect(SKU_PREFIX_MAP["Eames"]).toBe("EM");
    expect(SKU_PREFIX_MAP["昌迪加尔"]).toBe("PJ");
    expect(SKU_PREFIX_MAP["Le Corbusier"]).toBe("LC");
    expect(SKU_PREFIX_MAP["其他"]).toBe("OT");
  });
});

// ============ CUSTOMER_SOURCES ============
describe("CUSTOMER_SOURCES", () => {
  it("has 6 sources", () => {
    expect(CUSTOMER_SOURCES).toHaveLength(6);
  });

  it("includes common sources", () => {
    expect(CUSTOMER_SOURCES).toContain("小红书");
    expect(CUSTOMER_SOURCES).toContain("闲鱼");
    expect(CUSTOMER_SOURCES).toContain("朋友介绍");
  });
});

// ============ CONDITION_GRADES ============
describe("CONDITION_GRADES", () => {
  it("has 4 grades: A, B, C, D", () => {
    expect(CONDITION_GRADES).toEqual(["A", "B", "C", "D"]);
  });
});

// ============ SUPPLIER_COUNTRIES ============
describe("SUPPLIER_COUNTRIES", () => {
  it("has 6 countries", () => {
    expect(SUPPLIER_COUNTRIES).toHaveLength(6);
  });

  it("each country has value, labelEn, and flag", () => {
    for (const country of SUPPLIER_COUNTRIES) {
      expect(country.value).toBeTruthy();
      expect(country.labelEn).toBeTruthy();
      expect(country.flag).toBeTruthy();
    }
  });

  it("includes USA and India (primary suppliers)", () => {
    const values = SUPPLIER_COUNTRIES.map((c) => c.value);
    expect(values).toContain("美国");
    expect(values).toContain("印度");
  });
});
