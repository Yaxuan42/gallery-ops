import { prisma } from "@/lib/prisma";
import { supplierSchema, type SupplierFormData } from "@/lib/validations";

export async function listSuppliers() {
  return prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({ where: { id } });
}

export async function createSupplierService(data: SupplierFormData) {
  const parsed = supplierSchema.parse(data);
  return prisma.supplier.create({ data: parsed });
}

export async function updateSupplierService(id: string, data: SupplierFormData) {
  const parsed = supplierSchema.parse(data);
  return prisma.supplier.update({ where: { id }, data: parsed });
}

export async function deleteSupplierService(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!supplier) throw new Error("供应商不存在");
  await prisma.supplier.delete({ where: { id } });
  return supplier;
}
