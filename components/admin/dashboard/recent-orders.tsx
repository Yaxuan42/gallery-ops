import Link from "next/link";
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

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

interface RecentOrder {
  id: string;
  orderNumber: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  customer: { name: string };
}

interface RecentOrdersProps {
  orders: RecentOrder[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="rounded-lg border border-[#e8eaed] bg-white">
      <div className="border-b border-[#e8eaed] p-4">
        <h2 className="text-[20px] font-semibold text-[#202124]">近期订单</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-[#e8eaed]">
            <TableHead className="text-[13px] text-[#5f6368]">订单号</TableHead>
            <TableHead className="text-[13px] text-[#5f6368]">客户</TableHead>
            <TableHead className="text-[13px] text-[#5f6368]">日期</TableHead>
            <TableHead className="text-[13px] text-[#5f6368]">金额</TableHead>
            <TableHead className="text-[13px] text-[#5f6368]">状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-[13px] text-[#5f6368]">
                暂无订单数据
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => (
            <TableRow key={order.id} className="border-[#e8eaed]">
              <TableCell className="text-[13px]">
                <Link
                  href={`/admin/sales-orders/${order.id}`}
                  className="font-medium text-[#1a73e8] hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="text-[13px] text-[#202124]">{order.customer.name}</TableCell>
              <TableCell className="text-[13px] text-[#5f6368]">
                {formatDate(order.orderDate)}
              </TableCell>
              <TableCell className="text-[13px] font-medium text-[#202124]">
                {formatRMB(order.totalAmount)}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={order.status}
                  colorMap={ORDER_STATUS_COLORS}
                  labelMap={ORDER_STATUS_LABELS}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
