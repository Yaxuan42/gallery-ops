import { getProductOptions, getSupplierOptions } from "@/lib/actions/items";
import { ItemForm } from "@/components/admin/forms/item-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function NewItemPage() {
  const [products, suppliers] = await Promise.all([getProductOptions(), getSupplierOptions()]);

  return (
    <AdminPageLayout
      hint={{
        title: "新建库存",
        items: [
          "库存 (SKU) 对应一件具体的实物家具",
          "关联商品 (SPU) 和供应商，便于追溯来源",
          "成本明细：采购价 + 运费 + 关税 + 进口税 = 总成本",
          "开启「在官网展示」后客户可在展示站看到",
          "品相等级：A 级（近新）到 D 级（需要修复）",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">新建库存</h1>
        <ItemForm products={products} suppliers={suppliers} />
      </div>
    </AdminPageLayout>
  );
}
