import Link from "next/link";
import { getCustomers } from "@/lib/actions/customers";
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
import { CUSTOMER_TYPE_LABELS } from "@/lib/constants";
import { Plus, Pencil } from "lucide-react";
import { DeleteCustomerButton } from "./delete-button";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <AdminPageLayout
      hint={{
        title: "操作指南",
        items: [
          "客户分为「个人」和「企业」两种类型",
          "来源字段记录客户渠道，如小红书、微信、朋友介绍等",
          "「订单数」列显示该客户的历史购买记录",
          "删除客户前需先删除关联的销售订单",
        ],
      }}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#202124]">客户管理</h1>
          <Link href="/admin/customers/new">
            <Button className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]">
              <Plus size={16} className="mr-1" />
              新建客户
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-[#e8eaed] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e8eaed]">
                <TableHead className="text-[13px] text-[#5f6368]">名称</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">类型</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">来源</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">电话</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">微信</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">订单数</TableHead>
                <TableHead className="text-right text-[13px] text-[#5f6368]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[13px] text-[#5f6368]">
                    暂无客户数据
                  </TableCell>
                </TableRow>
              )}
              {customers.map((customer) => (
                <TableRow key={customer.id} className="border-[#e8eaed]">
                  <TableCell className="text-[13px] font-medium text-[#202124]">
                    {customer.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="border-0 bg-blue-50 text-[12px] font-normal text-blue-700"
                    >
                      {CUSTOMER_TYPE_LABELS[customer.type]?.zh || customer.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {customer.source || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {customer.phone || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {customer.wechat || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {customer._count.salesOrders}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-[#5f6368]" />
                        </Button>
                      </Link>
                      <DeleteCustomerButton id={customer.id} name={customer.name} />
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
