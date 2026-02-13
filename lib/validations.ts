import { z } from "zod";

// ============ Product ============
export const productSchema = z.object({
  nameZh: z.string().min(1, "中文名必填"),
  nameEn: z.string().min(1, "英文名必填"),
  category: z.string().min(1, "分类必填"),
  subcategory: z.string().optional(),
  model: z.string().optional(),
  descriptionZh: z.string().optional(),
  descriptionEn: z.string().optional(),
  designer: z.string().optional(),
  designerSeries: z.string().optional(),
  priceRangeLow: z.coerce.number().optional(),
  priceRangeHigh: z.coerce.number().optional(),
  collectionValue: z.string().optional(),
  featured: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ============ Item ============
export const itemSchema = z.object({
  name: z.string().min(1, "名称必填"),
  nameEn: z.string().optional(),
  recommendation: z.string().optional(),
  notes: z.string().optional(),
  productId: z.string().optional(),
  designerSeries: z.string().optional(),
  manufacturer: z.string().optional(),
  era: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  conditionGrade: z.string().optional(),
  supplierId: z.string().optional(),
  listPrice: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  shippingCostUsd: z.coerce.number().optional(),
  shippingCostRmb: z.coerce.number().optional(),
  customsFees: z.coerce.number().optional(),
  importDuties: z.coerce.number().optional(),
  purchasePriceUsd: z.coerce.number().optional(),
  purchasePriceRmb: z.coerce.number().optional(),
  status: z.string().optional(),
  showOnWebsite: z.boolean().optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;

// ============ Customer ============
export const customerSchema = z.object({
  name: z.string().min(1, "名称必填"),
  type: z.string().optional(),
  source: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  wechat: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// ============ Sales Order ============
export const salesOrderSchema = z.object({
  orderNumber: z.string().min(1, "单号必填"),
  customerId: z.string().min(1, "客户必选"),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional(),
  status: z.string().optional(),
  paymentDate: z.coerce.date().optional(),
  shippingAddr: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        price: z.coerce.number(),
        cost: z.coerce.number(),
      }),
    )
    .min(1, "至少添加一个商品"),
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

// ============ Supplier ============
export const supplierSchema = z.object({
  name: z.string().min(1, "名称必填"),
  code: z.string().optional(),
  country: z.string().min(1, "国家必填"),
  contactName: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  phone: z.string().optional(),
  wechat: z.string().optional(),
  address: z.string().optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

// ============ Contact Form ============
export const contactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  itemRef: z.string().optional(),
  message: z.string().min(1, "留言内容必填"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
