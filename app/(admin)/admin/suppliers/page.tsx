import Link from "next/link";
import { getSuppliers, deleteSupplier } from "@/lib/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteSupplierButton } from "./delete-button";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  PAUSED: "bg-yellow-100 text-yellow-700",
};

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <AdminPageLayout
      hint={{
        title: "操作指南",
        items: [
          "供应商是家具采购来源，按国家分类管理",
          "编号 (Code) 用于内部标识，如 SUP-001",
          "状态可设为 ACTIVE（活跃）、PAUSED（暂停）或 INACTIVE（停用）",
          "标签字段用逗号分隔，便于快速筛选，如 Eames,美国",
        ],
      }}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#202124]">供应商管理</h1>
          <Link href="/admin/suppliers/new">
            <Button className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]">
              <Plus size={16} className="mr-1" />
              新建供应商
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-[#e8eaed] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e8eaed]">
                <TableHead className="text-[13px] text-[#5f6368]">名称</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">编号</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">国家</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">状态</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">邮箱</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">电话</TableHead>
                <TableHead className="text-right text-[13px] text-[#5f6368]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[13px] text-[#5f6368]">
                    暂无供应商数据
                  </TableCell>
                </TableRow>
              )}
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id} className="border-[#e8eaed]">
                  <TableCell className="text-[13px] font-medium text-[#202124]">
                    {supplier.name}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {supplier.code || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">{supplier.country}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`border-0 text-[12px] font-normal ${STATUS_BADGE[supplier.status] || ""}`}
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {supplier.email || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {supplier.phone || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/suppliers/${supplier.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-[#5f6368]" />
                        </Button>
                      </Link>
                      <DeleteSupplierButton id={supplier.id} name={supplier.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminPageLayout>
  );
}
