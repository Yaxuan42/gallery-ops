import { notFound } from "next/navigation";
import { getItem, getProductOptions, getSupplierOptions } from "@/lib/actions/items";
import { ItemForm } from "@/components/admin/forms/item-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, products, suppliers] = await Promise.all([
    getItem(id),
    getProductOptions(),
    getSupplierOptions(),
  ]);

  if (!item) notFound();

  return (
    <AdminPageLayout
      hint={{
        title: "编辑库存",
        items: [
          "修改售价不会影响已创建的订单金额",
          "状态为「已售」时表示已被订单关联",
          "总成本会根据成本明细自动重算",
          "图片变更后官网展示同步更新",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">编辑库存</h1>
        <ItemForm item={item} products={products} suppliers={suppliers} />
      </div>
    </AdminPageLayout>
  );
}
