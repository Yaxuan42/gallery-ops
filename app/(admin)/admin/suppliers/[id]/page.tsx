import { notFound } from "next/navigation";
import { getSupplier } from "@/lib/actions/suppliers";
import { SupplierForm } from "@/components/admin/forms/supplier-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();

  return (
    <AdminPageLayout
      hint={{
        title: "编辑供应商",
        items: [
          "设为「暂停」或「停用」不影响已有库存的关联",
          "修改联系信息用于更新采购沟通渠道",
          "标签用逗号分隔，如 Eames,美国",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">编辑供应商</h1>
        <SupplierForm supplier={supplier} />
      </div>
    </AdminPageLayout>
  );
}
