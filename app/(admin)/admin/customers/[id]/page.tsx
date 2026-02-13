import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/admin/forms/customer-form";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRMB, formatDate } from "@/lib/utils";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  return (
    <AdminPageLayout
      hint={{
        title: "编辑客户",
        items: [
          "修改客户信息不影响已有订单记录",
          "下方「关联订单」显示该客户的购买历史",
          "点击订单号可跳转到订单详情",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">编辑客户</h1>
        <CustomerForm customer={customer} />

        {/* Related Sales Orders */}
        {customer.salesOrders.length > 0 && (
          <div className="mt-8 max-w-4xl">
            <div className="rounded-lg border border-[#e8eaed] bg-white p-6">
              <h2 className="mb-4 text-[20px] font-semibold text-[#202124]">关联订单</h2>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#e8eaed]">
                    <TableHead className="text-[13px] text-[#5f6368]">单号</TableHead>
                    <TableHead className="text-[13px] text-[#5f6368]">日期</TableHead>
                    <TableHead className="text-[13px] text-[#5f6368]">金额</TableHead>
                    <TableHead className="text-[13px] text-[#5f6368]">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.salesOrders.map((order) => (
                    <TableRow key={order.id} className="border-[#e8eaed]">
                      <TableCell className="text-[13px]">
                        <Link
                          href={`/admin/sales-orders/${order.id}`}
                          className="text-[#1a73e8] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[13px] text-[#5f6368]">
                        {formatDate(order.orderDate)}
                      </TableCell>
                      <TableCell className="text-[13px] text-[#202124]">
                        {formatRMB(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} colorMap={ORDER_STATUS_COLORS} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
