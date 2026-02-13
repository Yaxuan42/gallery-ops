import { getCustomerOptions } from "@/lib/actions/customers";
import { getAvailableItems, getNewOrderNumber } from "@/lib/actions/sales-orders";
import { SalesOrderForm } from "@/components/admin/forms/sales-order-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function NewSalesOrderPage() {
  const [customers, availableItems, orderNumber] = await Promise.all([
    getCustomerOptions(),
    getAvailableItems(),
    getNewOrderNumber(),
  ]);

  return (
    <AdminPageLayout
      hint={{
        title: "新建销售单",
        items: [
          "订单号自动生成，无需手动填写",
          "先选择客户，再添加商品明细",
          "商品列表只显示状态为「在库」的库存",
          "售价和成本自动带入，可手动修改售价",
          "毛利 = 总售价 - 总成本，实时计算",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">新建销售单</h1>
        <SalesOrderForm
          customers={customers}
          availableItems={availableItems}
          defaultOrderNumber={orderNumber}
        />
      </div>
    </AdminPageLayout>
  );
}
