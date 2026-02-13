import { CustomerForm } from "@/components/admin/forms/customer-form";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default function NewCustomerPage() {
  return (
    <AdminPageLayout
      hint={{
        title: "新建客户",
        items: [
          "名称为必填项，其他联系信息按需填写",
          "类型分为「个人」和「企业」",
          "来源字段用于统计获客渠道",
          "微信号方便后续日常沟通",
        ],
      }}
    >
      <div>
        <h1 className="mb-6 text-[28px] font-semibold text-[#202124]">新建客户</h1>
        <CustomerForm />
      </div>
    </AdminPageLayout>
  );
}
