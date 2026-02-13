import { describe, it, expect } from "vitest";
import { cn, formatRMB, formatUSD, calcTotalCost, generateSlug, generateOrderNumber, formatDate } from "@/lib/utils";

// Branch protection test: this comment verifies that PRs require CI checks before merge.

// ============ cn ============
describe("cn", () => {
  it("merges simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

// ============ formatRMB ============
describe("formatRMB", () => {
  it("formats a positive integer", () => {
    expect(formatRMB(1000)).toBe("\u00A51,000");
  });

  it("formats a decimal value (up to 2 fraction digits)", () => {
    expect(formatRMB(1234.5)).toBe("\u00A51,234.5");
  });

  it("formats zero", () => {
    expect(formatRMB(0)).toBe("\u00A50");
  });

  it("returns dash for null", () => {
    expect(formatRMB(null)).toBe("\u2014");
  });

  it("returns dash for undefined", () => {
    expect(formatRMB(undefined)).toBe("\u2014");
  });
});

// ============ formatUSD ============
describe("formatUSD", () => {
  it("formats a positive integer", () => {
    expect(formatUSD(1000)).toBe("$1,000");
  });

  it("formats a decimal value", () => {
    expect(formatUSD(99.99)).toBe("$99.99");
  });

  it("formats zero", () => {
    expect(formatUSD(0)).toBe("$0");
  });

  it("returns dash for null", () => {
    expect(formatUSD(null)).toBe("\u2014");
  });

  it("returns dash for undefined", () => {
    expect(formatUSD(undefined)).toBe("\u2014");
  });
});

// ============ calcTotalCost ============
describe("calcTotalCost", () => {
  it("sums all cost fields", () => {
    const result = calcTotalCost({
      shippingCostRmb: 100,
      customsFees: 50,
      importDuties: 30,
      purchasePriceRmb: 500,
    });
    expect(result).toBe(680);
  });

  it("treats null fields as zero", () => {
    const result = calcTotalCost({
      shippingCostRmb: null,
      customsFees: null,
      importDuties: null,
      purchasePriceRmb: 200,
    });
    expect(result).toBe(200);
  });

  it("treats undefined fields as zero", () => {
    const result = calcTotalCost({
      purchasePriceRmb: 300,
    });
    expect(result).toBe(300);
  });

  it("returns zero when all fields are null/undefined", () => {
    const result = calcTotalCost({});
    expect(result).toBe(0);
  });
});

// ============ generateSlug ============
describe("generateSlug", () => {
  it("generates a slug from English text", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("strips special characters in strict mode", () => {
    expect(generateSlug("Eames Lounge Chair (670)")).toBe("eames-lounge-chair-670");
  });

  it("deduplicates against existing slugs", () => {
    const existing = ["hello-world"];
    expect(generateSlug("Hello World", existing)).toBe("hello-world-2");
  });

  it("increments counter when multiple duplicates exist", () => {
    const existing = ["hello-world", "hello-world-2", "hello-world-3"];
    expect(generateSlug("Hello World", existing)).toBe("hello-world-4");
  });

  it("returns original slug when no collision with existingSlugs", () => {
    const existing = ["other-slug"];
    expect(generateSlug("Hello World", existing)).toBe("hello-world");
  });

  it("generates a timestamp-based slug for pure Chinese text", () => {
    const slug = generateSlug("椅子");
    expect(slug).toMatch(/^item-\d+$/);
  });
});

// ============ generateOrderNumber ============
describe("generateOrderNumber", () => {
  it("formats with prefix, current year, and zero-padded sequence", () => {
    const year = new Date().getFullYear();
    expect(generateOrderNumber("SO", 1)).toBe(`SO-${year}-001`);
  });

  it("pads single digit sequences to 3 digits", () => {
    const year = new Date().getFullYear();
    expect(generateOrderNumber("SO", 5)).toBe(`SO-${year}-005`);
  });

  it("handles sequences above 999", () => {
    const year = new Date().getFullYear();
    expect(generateOrderNumber("SO", 1234)).toBe(`SO-${year}-1234`);
  });

  it("works with different prefixes", () => {
    const year = new Date().getFullYear();
    expect(generateOrderNumber("PO", 42)).toBe(`PO-${year}-042`);
  });
});

// ============ formatDate ============
describe("formatDate", () => {
  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("\u2014");
  });

  it("formats a Date object to zh-CN locale string", () => {
    const date = new Date(2026, 0, 15); // Jan 15, 2026
    const result = formatDate(date);
    // zh-CN format: 2026/01/15
    expect(result).toBe("2026/01/15");
  });

  it("formats a date string", () => {
    const result = formatDate("2025-12-25T00:00:00.000Z");
    // The exact output depends on timezone, but it should contain 2025 and 12 and 25
    expect(result).toContain("2025");
    expect(result).toContain("12");
    expect(result).toContain("25");
  });
});
