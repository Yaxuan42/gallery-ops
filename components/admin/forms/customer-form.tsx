"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormData } from "@/lib/validations";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
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
import { CUSTOMER_TYPE, CUSTOMER_TYPE_LABELS, CUSTOMER_SOURCES } from "@/lib/constants";
import { toast } from "sonner";
import { useTransition } from "react";

interface CustomerFormProps {
  customer?: {
    id: string;
    name: string;
    type: string;
    source: string | null;
    phone: string | null;
    email: string | null;
    wechat: string | null;
    address: string | null;
    notes: string | null;
  };
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!customer;

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as never,
    defaultValues: {
      name: customer?.name ?? "",
      type: customer?.type ?? "INDIVIDUAL",
      source: customer?.source ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      wechat: customer?.wechat ?? "",
      address: customer?.address ?? "",
      notes: customer?.notes ?? "",
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateCustomer(customer.id, data)
        : await createCustomer(data);
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
            <Label className="text-[13px] text-[#202124]">类型</Label>
            <Select value={form.watch("type")} onValueChange={(val) => form.setValue("type", val)}>
              <SelectTrigger className="text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CUSTOMER_TYPE).map(([key, val]) => (
                  <SelectItem key={key} value={val}>
                    {CUSTOMER_TYPE_LABELS[val]?.zh || val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">来源</Label>
          <Select
            value={form.watch("source") || "__none__"}
            onValueChange={(val) => form.setValue("source", val === "__none__" ? "" : val)}
          >
            <SelectTrigger className="text-[13px]">
              <SelectValue placeholder="选择来源" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">未指定</SelectItem>
              {CUSTOMER_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">联系信息</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">电话</Label>
            <Input {...form.register("phone")} className="text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">邮箱</Label>
            <Input {...form.register("email")} type="email" className="text-[13px]" />
            {form.formState.errors.email && (
              <p className="text-[12px] text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">微信</Label>
          <Input {...form.register("wechat")} className="text-[13px]" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">地址</Label>
          <Textarea {...form.register("address")} className="text-[13px]" rows={2} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">备注</h2>
        <Textarea {...form.register("notes")} className="text-[13px]" rows={3} />
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]"
        >
          {isPending ? "保存中..." : isEditing ? "更新客户" : "创建客户"}
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
