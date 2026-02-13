import Link from "next/link";
import { getSalesOrders } from "@/lib/actions/sales-orders";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatRMB, formatDate } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";
import { DeleteSalesOrderButton } from "./delete-button";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

export default async function SalesOrdersPage() {
  const orders = await getSalesOrders();

  return (
    <AdminPageLayout
      hint={{
        title: "操作指南",
        items: [
          "订单号自动生成，格式为 SO-YYYYMM-NNN",
          "状态流转：待确认 → 已确认 → 已付款 → 已发货 → 已完成",
          "订单完成后关联库存自动标记为「已售」",
          "取消订单会恢复库存状态为「在库」",
          "毛利 = 总金额 - 总成本，红色表示亏损",
        ],
      }}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#202124]">销售单管理</h1>
          <Link href="/admin/sales-orders/new">
            <Button className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]">
              <Plus size={16} className="mr-1" />
              新建销售单
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-[#e8eaed] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e8eaed]">
                <TableHead className="text-[13px] text-[#5f6368]">订单号</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">客户</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">日期</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">金额</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">毛利</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">商品数</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">状态</TableHead>
                <TableHead className="text-right text-[13px] text-[#5f6368]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-[13px] text-[#5f6368]">
                    暂无订单数据
                  </TableCell>
                </TableRow>
              )}
              {orders.map((order) => (
                <TableRow key={order.id} className="border-[#e8eaed]">
                  <TableCell className="text-[13px] font-medium text-[#1a73e8]">
                    <Link href={`/admin/sales-orders/${order.id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[13px] text-[#202124]">
                    {order.customer.name}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {formatDate(order.orderDate)}
                  </TableCell>
                  <TableCell className="text-[13px] font-medium text-[#202124]">
                    {formatRMB(order.totalAmount)}
                  </TableCell>
                  <TableCell
                    className={`text-[13px] font-medium ${order.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatRMB(order.grossProfit)}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">{order._count.items}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={order.status}
                      colorMap={ORDER_STATUS_COLORS}
                      labelMap={ORDER_STATUS_LABELS}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/sales-orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-[#5f6368]" />
                        </Button>
                      </Link>
                      <DeleteSalesOrderButton id={order.id} orderNumber={order.orderNumber} />
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
