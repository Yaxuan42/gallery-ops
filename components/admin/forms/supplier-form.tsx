"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, type SupplierFormData } from "@/lib/validations";
import { createSupplier, updateSupplier } from "@/lib/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPLIER_STATUS, SUPPLIER_COUNTRIES } from "@/lib/constants";
import { toast } from "sonner";
import { useTransition } from "react";

interface SupplierFormProps {
  supplier?: {
    id: string;
    name: string;
    code: string | null;
    country: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    wechat: string | null;
    address: string | null;
    status: string;
    tags: string | null;
    notes: string | null;
  };
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!supplier;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema) as never,
    defaultValues: {
      name: supplier?.name ?? "",
      code: supplier?.code ?? "",
      country: supplier?.country ?? "",
      contactName: supplier?.contactName ?? "",
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
      wechat: supplier?.wechat ?? "",
      address: supplier?.address ?? "",
      status: supplier?.status ?? "ACTIVE",
      tags: supplier?.tags ?? "",
      notes: supplier?.notes ?? "",
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateSupplier(supplier.id, data)
        : await createSupplier(data);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
      {/* Basic Info */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">基本信息</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">名称 *</Label>
            <Input {...form.register("name")} className="text-[13px]" />
            {form.formState.errors.name && (
              <p className="text-[12px] text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">编号</Label>
            <Input {...form.register("code")} className="text-[13px]" placeholder="如: SUP-001" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">国家 *</Label>
            <Select
              value={form.watch("country")}
              onValueChange={(val) => form.setValue("country", val)}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择国家" />
              </SelectTrigger>
              <SelectContent>
                {SUPPLIER_COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.flag} {c.value} / {c.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.country && (
              <p className="text-[12px] text-red-500">{form.formState.errors.country.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">状态</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(val) => form.setValue("status", val)}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SUPPLIER_STATUS).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">联系信息</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">联系人</Label>
            <Input {...form.register("contactName")} className="text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">邮箱</Label>
            <Input {...form.register("email")} type="email" className="text-[13px]" />
            {form.formState.errors.email && (
              <p className="text-[12px] text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">电话</Label>
            <Input {...form.register("phone")} className="text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">微信</Label>
            <Input {...form.register("wechat")} className="text-[13px]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">地址</Label>
          <Textarea {...form.register("address")} className="text-[13px]" rows={2} />
        </div>
      </div>

      {/* Extra */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">其他</h2>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">标签</Label>
          <Input
            {...form.register("tags")}
            className="text-[13px]"
            placeholder="用逗号分隔, 如: Eames,美国"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">备注</Label>
          <Textarea {...form.register("notes")} className="text-[13px]" rows={3} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]"
        >
          {isPending ? "保存中..." : isEditing ? "更新供应商" : "创建供应商"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-[13px]"
          onClick={() => window.history.back()}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
