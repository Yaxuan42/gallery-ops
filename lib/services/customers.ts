import { prisma } from "@/lib/prisma";
import { customerSchema, type CustomerFormData } from "@/lib/validations";

export async function listCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { salesOrders: true } },
    },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      salesOrders: {
        orderBy: { orderDate: "desc" },
        select: {
          id: true,
          orderNumber: true,
          orderDate: true,
          totalAmount: true,
          status: true,
        },
      },
    },
  });
}

export async function getCustomerOptions() {
  return prisma.customer.findMany({
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
}

export async function createCustomerService(data: CustomerFormData) {
  const parsed = customerSchema.parse(data);
  return prisma.customer.create({ data: parsed });
}

export async function updateCustomerService(id: string, data: CustomerFormData) {
  const parsed = customerSchema.parse(data);
  return prisma.customer.update({ where: { id }, data: parsed });
}

export async function deleteCustomerService(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!customer) throw new Error("客户不存在");
  await prisma.customer.delete({ where: { id } });
  return customer;
}
