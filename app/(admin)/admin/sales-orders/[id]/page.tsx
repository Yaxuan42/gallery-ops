import { notFound } from "next/navigation";
import { getSalesOrder, getAvailableItems } from "@/lib/actions/sales-orders";
import { getCustomerOptions } from "@/lib/actions/customers";
import { SalesOrderForm } from "@/components/admin/forms/sales-order-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function EditSalesOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, customers, availableItems] = await Promise.all([
    getSalesOrder(id),
    getCustomerOptions(),
    getAvailableItems(),
  ]);

  if (!order) notFound();

  return (
    <AdminPageLayout
      hint={{
        title: "编辑销售单",
        items: [
          "修改状态为「已完成」会自动将库存标记为「已售」",
          "取消订单会恢复库存状态为「在库」",
          "可增减商品明细，金额和毛利实时更新",
          "付款日期用于财务对账",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">编辑销售单</h1>
        <SalesOrderForm
          order={order}
          customers={customers}
          availableItems={availableItems}
          defaultOrderNumber={order.orderNumber}
        />
      </div>
    </AdminPageLayout>
  );
}
