import { describe, it, expect } from "vitest";
import {
  productSchema,
  itemSchema,
  customerSchema,
  salesOrderSchema,
  supplierSchema,
  contactSchema,
} from "@/lib/validations";

// ============ productSchema ============
describe("productSchema", () => {
  it("accepts valid minimal product data", () => {
    const result = productSchema.safeParse({
      nameZh: "伊姆斯休闲椅",
      nameEn: "Eames Lounge Chair",
      category: "椅子",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid full product data", () => {
    const result = productSchema.safeParse({
      nameZh: "伊姆斯休闲椅",
      nameEn: "Eames Lounge Chair",
      category: "椅子",
      subcategory: "休闲椅",
      model: "670",
      descriptionZh: "经典设计",
      descriptionEn: "Classic design",
      designer: "Charles Eames",
      designerSeries: "Eames",
      priceRangeLow: 50000,
      priceRangeHigh: 80000,
      collectionValue: "高",
      featured: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing nameZh", () => {
    const result = productSchema.safeParse({
      nameEn: "Eames Lounge Chair",
      category: "椅子",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing nameEn", () => {
    const result = productSchema.safeParse({
      nameZh: "伊姆斯休闲椅",
      category: "椅子",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing category", () => {
    const result = productSchema.safeParse({
      nameZh: "伊姆斯休闲椅",
      nameEn: "Eames Lounge Chair",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty nameZh string", () => {
    const result = productSchema.safeParse({
      nameZh: "",
      nameEn: "Eames Lounge Chair",
      category: "椅子",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers for price fields", () => {
    const result = productSchema.safeParse({
      nameZh: "椅子",
      nameEn: "Chair",
      category: "椅子",
      priceRangeLow: "50000",
      priceRangeHigh: "80000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceRangeLow).toBe(50000);
      expect(result.data.priceRangeHigh).toBe(80000);
    }
  });
});

// ============ itemSchema ============
describe("itemSchema", () => {
  it("accepts valid minimal item data", () => {
    const result = itemSchema.safeParse({
      name: "Eames LCW 670",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid full item data", () => {
    const result = itemSchema.safeParse({
      name: "Eames LCW 670",
      nameEn: "Eames Lounge Chair",
      recommendation: "推荐",
      notes: "少许磨损",
      productId: "abc123",
      designerSeries: "Eames",
      manufacturer: "Herman Miller",
      era: "1960s",
      material: "胡桃木",
      dimensions: "84x82x82cm",
      conditionGrade: "A",
      supplierId: "sup001",
      listPrice: 80000,
      sellingPrice: 75000,
      shippingCostUsd: 500,
      shippingCostRmb: 3500,
      customsFees: 200,
      importDuties: 800,
      purchasePriceUsd: 5000,
      purchasePriceRmb: 35000,
      status: "IN_STOCK",
      showOnWebsite: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = itemSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = itemSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers for price fields", () => {
    const result = itemSchema.safeParse({
      name: "Chair",
      listPrice: "50000",
      sellingPrice: "45000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.listPrice).toBe(50000);
      expect(result.data.sellingPrice).toBe(45000);
    }
  });
});

// ============ customerSchema ============
describe("customerSchema", () => {
  it("accepts valid minimal customer data", () => {
    const result = customerSchema.safeParse({
      name: "张三",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid full customer data", () => {
    const result = customerSchema.safeParse({
      name: "张三",
      type: "INDIVIDUAL",
      source: "小红书",
      phone: "13800138000",
      email: "zhang@example.com",
      wechat: "zhangsan_wx",
      address: "北京市朝阳区",
      notes: "VIP客户",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = customerSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = customerSchema.safeParse({
      name: "张三",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for email (allows clearing the field)", () => {
    const result = customerSchema.safeParse({
      name: "张三",
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts omitted email", () => {
    const result = customerSchema.safeParse({
      name: "张三",
    });
    expect(result.success).toBe(true);
  });
});

// ============ salesOrderSchema ============
describe("salesOrderSchema", () => {
  it("accepts valid sales order data", () => {
    const result = salesOrderSchema.safeParse({
      orderNumber: "SO-2026-001",
      customerId: "cust-001",
      orderDate: "2026-01-15",
      items: [
        { itemId: "item-001", price: 75000, cost: 40000 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts order with multiple items and optional fields", () => {
    const result = salesOrderSchema.safeParse({
      orderNumber: "SO-2026-002",
      customerId: "cust-002",
      orderDate: new Date("2026-02-01"),
      deliveryDate: "2026-02-15",
      status: "PENDING",
      paymentDate: "2026-02-10",
      shippingAddr: "上海市静安区",
      notes: "尽快发货",
      items: [
        { itemId: "item-001", price: 50000, cost: 30000 },
        { itemId: "item-002", price: 30000, cost: 15000 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing orderNumber", () => {
    const result = salesOrderSchema.safeParse({
      customerId: "cust-001",
      orderDate: "2026-01-15",
      items: [{ itemId: "item-001", price: 75000, cost: 40000 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing customerId", () => {
    const result = salesOrderSchema.safeParse({
      orderNumber: "SO-2026-001",
      orderDate: "2026-01-15",
      items: [{ itemId: "item-001", price: 75000, cost: 40000 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty items array", () => {
    const result = salesOrderSchema.safeParse({
      orderNumber: "SO-2026-001",
      customerId: "cust-001",
      orderDate: "2026-01-15",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("coerces date strings to Date objects", () => {
    const result = salesOrderSchema.safeParse({
      orderNumber: "SO-2026-001",
      customerId: "cust-001",
      orderDate: "2026-01-15",
      items: [{ itemId: "item-001", price: 75000, cost: 40000 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orderDate).toBeInstanceOf(Date);
    }
  });
});

// ============ supplierSchema ============
describe("supplierSchema", () => {
  it("accepts valid minimal supplier data", () => {
    const result = supplierSchema.safeParse({
      name: "Vintage Furniture Co.",
      country: "美国",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid full supplier data", () => {
    const result = supplierSchema.safeParse({
      name: "Vintage Furniture Co.",
      code: "VFC",
      country: "美国",
      contactName: "John Smith",
      email: "john@vintagefurniture.com",
      phone: "+1-555-0100",
      wechat: "john_vfc",
      address: "123 Main St, Los Angeles, CA",
      status: "ACTIVE",
      tags: "eames,mid-century",
      notes: "Primary Eames supplier",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = supplierSchema.safeParse({
      country: "美国",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing country", () => {
    const result = supplierSchema.safeParse({
      name: "Vintage Furniture Co.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = supplierSchema.safeParse({
      name: "Vintage Furniture Co.",
      country: "美国",
      email: "bad-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for email", () => {
    const result = supplierSchema.safeParse({
      name: "Vintage Furniture Co.",
      country: "美国",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

// ============ contactSchema ============
describe("contactSchema", () => {
  it("accepts valid minimal contact data", () => {
    const result = contactSchema.safeParse({
      email: "visitor@example.com",
      message: "I am interested in the Eames chair.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid full contact data", () => {
    const result = contactSchema.safeParse({
      name: "李四",
      email: "lisi@example.com",
      phone: "13900139000",
      subject: "询价",
      itemRef: "eames-lounge-chair",
      message: "请问这把椅子还有吗？",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = contactSchema.safeParse({
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({
      email: "not-valid",
      message: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = contactSchema.safeParse({
      email: "visitor@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = contactSchema.safeParse({
      email: "visitor@example.com",
      message: "",
    });
    expect(result.success).toBe(false);
  });
});
