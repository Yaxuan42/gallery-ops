import { prisma } from "@/lib/prisma";
import { salesOrderSchema, type SalesOrderFormData } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";

export async function listOrders() {
  return prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      items: {
        include: {
          item: {
            select: {
              id: true,
              skuCode: true,
              name: true,
              totalCost: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

export async function getAvailableItems() {
  return prisma.item.findMany({
    where: { status: "IN_STOCK" },
    select: {
      id: true,
      skuCode: true,
      name: true,
      sellingPrice: true,
      totalCost: true,
    },
    orderBy: { skuCode: "asc" },
  });
}

export async function getNextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = "SO";

  const lastOrder = await prisma.salesOrder.findFirst({
    where: {
      orderNumber: { startsWith: `${prefix}-${year}-` },
    },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let sequence = 1;
  if (lastOrder) {
    const parts = lastOrder.orderNumber.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return generateOrderNumber(prefix, sequence);
}

export async function createOrderService(data: SalesOrderFormData) {
  const parsed = salesOrderSchema.parse(data);

  // Auto-generate order number if not provided
  const orderNumber = parsed.orderNumber || (await getNextOrderNumber());

  // Calculate totals
  const totalAmount = parsed.items.reduce((sum, li) => sum + li.price, 0);
  const totalCost = parsed.items.reduce((sum, li) => sum + li.cost, 0);
  const grossProfit = totalAmount - totalCost;

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId: parsed.customerId,
      orderDate: parsed.orderDate,
      deliveryDate: parsed.deliveryDate || null,
      status: parsed.status,
      paymentDate: parsed.paymentDate || null,
      shippingAddr: parsed.shippingAddr || null,
      notes: parsed.notes || null,
      totalAmount,
      totalCost,
      grossProfit,
      items: {
        create: parsed.items.map((li) => ({
          itemId: li.itemId,
          price: li.price,
          cost: li.cost,
        })),
      },
    },
    include: {
      customer: { select: { name: true } },
      items: { include: { item: { select: { skuCode: true, name: true } } } },
    },
  });

  // CRITICAL: If created as COMPLETED, mark items as SOLD
  if (parsed.status === "COMPLETED") {
    const itemIds = parsed.items.map((li) => li.itemId);
    await prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { status: "SOLD" },
    });
  }

  return order;
}

export async function updateOrderService(id: string, data: SalesOrderFormData) {
  const parsed = salesOrderSchema.parse(data);

  const previousOrder = await prisma.salesOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!previousOrder) throw new Error("订单不存在");

  const previousStatus = previousOrder.status;
  const newStatus = parsed.status;

  const totalAmount = parsed.items.reduce((sum, li) => sum + li.price, 0);
  const totalCost = parsed.items.reduce((sum, li) => sum + li.cost, 0);
  const grossProfit = totalAmount - totalCost;

  // Delete old line items and re-create
  await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: id } });

  const order = await prisma.salesOrder.update({
    where: { id },
    data: {
      orderNumber: parsed.orderNumber,
      customerId: parsed.customerId,
      orderDate: parsed.orderDate,
      deliveryDate: parsed.deliveryDate || null,
      status: newStatus,
      paymentDate: parsed.paymentDate || null,
      shippingAddr: parsed.shippingAddr || null,
      notes: parsed.notes || null,
      totalAmount,
      totalCost,
      grossProfit,
      items: {
        create: parsed.items.map((li) => ({
          itemId: li.itemId,
          price: li.price,
          cost: li.cost,
        })),
      },
    },
    include: {
      customer: { select: { name: true } },
      items: { include: { item: { select: { skuCode: true, name: true } } } },
    },
  });

  // CRITICAL STATUS AUTOMATION
  if (newStatus === "COMPLETED" && previousStatus !== "COMPLETED") {
    await prisma.item.updateMany({
      where: { id: { in: parsed.items.map((li) => li.itemId) } },
      data: { status: "SOLD" },
    });
  }
  if (newStatus === "CANCELLED" && previousStatus !== "CANCELLED") {
    await prisma.item.updateMany({
      where: { id: { in: parsed.items.map((li) => li.itemId) } },
      data: { status: "IN_STOCK" },
    });
  }

  return order;
}

export async function deleteOrderService(id: string) {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw new Error("订单不存在");

  // Restore items to IN_STOCK before deleting (unless already cancelled)
  if (order.status !== "CANCELLED") {
    const itemIds = order.items.map((li) => li.itemId);
    if (itemIds.length > 0) {
      await prisma.item.updateMany({
        where: { id: { in: itemIds }, status: "SOLD" },
        data: { status: "IN_STOCK" },
      });
    }
  }

  await prisma.salesOrder.delete({ where: { id } });
  return { id: order.id, orderNumber: order.orderNumber };
}
