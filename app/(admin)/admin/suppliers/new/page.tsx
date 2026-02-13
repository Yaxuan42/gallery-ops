import { SupplierForm } from "@/components/admin/forms/supplier-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default function NewSupplierPage() {
  return (
    <AdminPageLayout
      hint={{
        title: "新建供应商",
        items: [
          "名称和国家为必填项",
          "编号建议使用统一格式，如 SUP-001",
          "标签用逗号分隔，方便按关键词筛选",
          "联系人信息便于日常采购沟通",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">新建供应商</h1>
        <SupplierForm />
      </div>
    </AdminPageLayout>
  );
}
