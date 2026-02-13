import { ProductForm } from "@/components/admin/forms/product-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default function NewProductPage() {
  return (
    <AdminPageLayout
      hint={{
        title: "新建商品",
        items: [
          "商品 (SPU) 是产品模板，用于归类同类型的库存实物",
          "中英文名必填，英文名自动生成 URL slug",
          "选择「设计师系列」后，官网按设计师分组展示",
          "开启「推荐」后商品出现在官网首页精选区域",
          "图片建议上传正面主图 + 2-3张细节图",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">新建商品</h1>
        <ProductForm />
      </div>
    </AdminPageLayout>
  );
}
