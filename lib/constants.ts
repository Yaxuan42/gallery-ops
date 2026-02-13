// Item status values (replaces enum)
export const ITEM_STATUS = {
  IN_STOCK: "IN_STOCK",
  IN_TRANSIT: "IN_TRANSIT",
  SOLD: "SOLD",
  RESERVED: "RESERVED",
} as const;

export const ITEM_STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  IN_STOCK: { zh: "现货", en: "Available" },
  IN_TRANSIT: { zh: "在途", en: "In Transit" },
  SOLD: { zh: "已售", en: "Sold" },
  RESERVED: { zh: "预留", en: "Reserved" },
};

export const ITEM_STATUS_COLORS: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-yellow-100 text-yellow-700",
  SOLD: "bg-gray-100 text-gray-500",
  RESERVED: "bg-blue-100 text-blue-700",
};

// Sales order status
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ORDER_STATUS_LABELS: Record<string, { zh: string; en: string }> = {
  PENDING: { zh: "待处理", en: "Pending" },
  CONFIRMED: { zh: "已确认", en: "Confirmed" },
  PAID: { zh: "已全款", en: "Paid" },
  SHIPPED: { zh: "已发货", en: "Shipped" },
  COMPLETED: { zh: "已完成", en: "Completed" },
  CANCELLED: { zh: "已取消", en: "Cancelled" },
};

// Supplier status
export const SUPPLIER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PAUSED: "PAUSED",
} as const;

// Customer types
export const CUSTOMER_TYPE = {
  INDIVIDUAL: "INDIVIDUAL",
  COMMERCIAL_SPACE: "COMMERCIAL_SPACE",
  GALLERY: "GALLERY",
} as const;

export const CUSTOMER_TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  INDIVIDUAL: { zh: "散客", en: "Individual" },
  COMMERCIAL_SPACE: { zh: "商业空间", en: "Commercial" },
  GALLERY: { zh: "画廊", en: "Gallery" },
};

// Product categories
export const CATEGORIES = [
  { value: "椅子", labelZh: "椅子", labelEn: "Chairs" },
  { value: "桌子", labelZh: "桌子", labelEn: "Tables" },
  { value: "沙发", labelZh: "沙发", labelEn: "Sofas" },
  { value: "收纳", labelZh: "收纳", labelEn: "Storage" },
  { value: "灯具", labelZh: "灯具", labelEn: "Lighting" },
  { value: "屏风", labelZh: "屏风", labelEn: "Screens" },
  { value: "凳子", labelZh: "凳子", labelEn: "Stools" },
  { value: "其他", labelZh: "其他", labelEn: "Other" },
] as const;

// Designer series
export const DESIGNER_SERIES = [
  { value: "Eames", label: "Eames" },
  { value: "昌迪加尔", label: "Chandigarh / Pierre Jeanneret" },
  { value: "Le Corbusier", label: "Le Corbusier" },
  { value: "Charlotte Perriand", label: "Charlotte Perriand" },
  { value: "Jean Prouve", label: "Jean Prouve" },
  { value: "Pierre Chapo", label: "Pierre Chapo" },
  { value: "Poul Henningsen", label: "Poul Henningsen" },
  { value: "Bernard-Albin Gras", label: "Bernard-Albin Gras" },
  { value: "其他", label: "Other" },
] as const;

// SKU code prefix mapping (designer series → 2-letter prefix)
export const SKU_PREFIX_MAP: Record<string, string> = {
  Eames: "EM",
  昌迪加尔: "PJ",
  "Le Corbusier": "LC",
  "Charlotte Perriand": "CP",
  "Jean Prouve": "JP",
  "Pierre Chapo": "PC",
  "Poul Henningsen": "PH",
  "Bernard-Albin Gras": "BG",
  其他: "OT",
} as const;

// Customer sources
export const CUSTOMER_SOURCES = [
  "小红书",
  "闲鱼",
  "朋友介绍",
  "老客户",
  "客户介绍",
  "其他",
] as const;

// Condition grades
export const CONDITION_GRADES = ["A", "B", "C", "D"] as const;

// Supplier countries
export const SUPPLIER_COUNTRIES = [
  { value: "美国", labelEn: "USA", flag: "🇺🇸" },
  { value: "印度", labelEn: "India", flag: "🇮🇳" },
  { value: "法国", labelEn: "France", flag: "🇫🇷" },
  { value: "丹麦", labelEn: "Denmark", flag: "🇩🇰" },
  { value: "摩洛哥", labelEn: "Morocco", flag: "🇲🇦" },
  { value: "其他", labelEn: "Other", flag: "🌍" },
] as const;
