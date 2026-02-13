import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/forms/product-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <AdminPageLayout
      hint={{
        title: "编辑商品",
        items: [
          "修改英文名会自动更新 URL slug",
          "已关联库存的商品删除前需先解除关联",
          "切换「推荐」状态会实时影响官网首页展示",
          "图片建议上传正面主图 + 2-3张细节图",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">编辑商品</h1>
        <ProductForm product={product} />
      </div>
    </AdminPageLayout>
  );
}
