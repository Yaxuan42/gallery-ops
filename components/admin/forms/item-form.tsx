"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type ItemFormData } from "@/lib/validations";
import { createItem, updateItem } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ui/image-uploader";
import { ITEM_STATUS, DESIGNER_SERIES, CONDITION_GRADES } from "@/lib/constants";
import { calcTotalCost, formatRMB } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useTransition } from "react";

interface ImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ItemFormProps {
  item?: {
    id: string;
    skuCode: string;
    name: string;
    nameEn: string | null;
    recommendation: string | null;
    notes: string | null;
    productId: string | null;
    designerSeries: string | null;
    manufacturer: string | null;
    era: string | null;
    material: string | null;
    dimensions: string | null;
    conditionGrade: string | null;
    supplierId: string | null;
    listPrice: number | null;
    sellingPrice: number | null;
    shippingCostUsd: number | null;
    shippingCostRmb: number | null;
    customsFees: number | null;
    importDuties: number | null;
    purchasePriceUsd: number | null;
    purchasePriceRmb: number | null;
    totalCost: number | null;
    status: string;
    showOnWebsite: boolean;
    slug: string;
    images: ImageItem[];
  };
  products: { id: string; nameZh: string; nameEn: string }[];
  suppliers: { id: string; name: string }[];
}

const NONE_VALUE = "__none__";

export function ItemForm({ item, products, suppliers }: ItemFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!item;
  const [images, setImages] = useState<ImageItem[]>(item?.images ?? []);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema) as never,
    defaultValues: {
      name: item?.name ?? "",
      nameEn: item?.nameEn ?? "",
      recommendation: item?.recommendation ?? "",
      notes: item?.notes ?? "",
      productId: item?.productId ?? "",
      designerSeries: item?.designerSeries ?? "",
      manufacturer: item?.manufacturer ?? "",
      era: item?.era ?? "",
      material: item?.material ?? "",
      dimensions: item?.dimensions ?? "",
      conditionGrade: item?.conditionGrade ?? "",
      supplierId: item?.supplierId ?? "",
      listPrice: item?.listPrice ?? undefined,
      sellingPrice: item?.sellingPrice ?? undefined,
      shippingCostUsd: item?.shippingCostUsd ?? undefined,
      shippingCostRmb: item?.shippingCostRmb ?? undefined,
      customsFees: item?.customsFees ?? undefined,
      importDuties: item?.importDuties ?? undefined,
      purchasePriceUsd: item?.purchasePriceUsd ?? undefined,
      purchasePriceRmb: item?.purchasePriceRmb ?? undefined,
      status: item?.status ?? "IN_STOCK",
      showOnWebsite: item?.showOnWebsite ?? true,
    },
  });

  const watchedCostFields = form.watch([
    "shippingCostRmb",
    "customsFees",
    "importDuties",
    "purchasePriceRmb",
  ]);

  const computedTotalCost = calcTotalCost({
    shippingCostRmb: watchedCostFields[0],
    customsFees: watchedCostFields[1],
    importDuties: watchedCostFields[2],
    purchasePriceRmb: watchedCostFields[3],
  });

  const onSubmit = (data: ItemFormData) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateItem(item.id, data, images)
        : await createItem(data, images);
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

        {item?.skuCode && (
          <div className="flex w-fit items-center gap-2 rounded-md bg-[#f0f4ff] px-3 py-2">
            <span className="text-[12px] text-[#5f6368]">编号</span>
            <span className="font-mono text-[15px] font-semibold text-[#1a73e8]">
              {item.skuCode}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">名称 *</Label>
            <Input {...form.register("name")} className="text-[13px]" />
            {form.formState.errors.name && (
              <p className="text-[12px] text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">英文名</Label>
            <Input {...form.register("nameEn")} className="text-[13px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">关联商品 (SPU)</Label>
            <Select
              value={form.watch("productId") || NONE_VALUE}
              onValueChange={(val) => form.setValue("productId", val === NONE_VALUE ? "" : val)}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择商品" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>不关联</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nameZh} ({p.nameEn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">供应商</Label>
            <Select
              value={form.watch("supplierId") || NONE_VALUE}
              onValueChange={(val) => form.setValue("supplierId", val === NONE_VALUE ? "" : val)}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择供应商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>无</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">设计师系列</Label>
            <Select
              value={form.watch("designerSeries") || NONE_VALUE}
              onValueChange={(val) =>
                form.setValue("designerSeries", val === NONE_VALUE ? "" : val)
              }
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择系列" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>无</SelectItem>
                {DESIGNER_SERIES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {Object.values(ITEM_STATUS).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">制造商</Label>
            <Input {...form.register("manufacturer")} className="text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">年代</Label>
            <Input {...form.register("era")} className="text-[13px]" placeholder="如: 1960s" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">材质</Label>
            <Input {...form.register("material")} className="text-[13px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">尺寸</Label>
            <Input
              {...form.register("dimensions")}
              className="text-[13px]"
              placeholder="如: W60 x D55 x H80 cm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">品相</Label>
            <Select
              value={form.watch("conditionGrade") || NONE_VALUE}
              onValueChange={(val) =>
                form.setValue("conditionGrade", val === NONE_VALUE ? "" : val)
              }
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择品相" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>未评级</SelectItem>
                {CONDITION_GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g} 级
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">备注</Label>
          <Textarea {...form.register("notes")} className="text-[13px]" rows={2} />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.watch("showOnWebsite")}
            onCheckedChange={(checked) => form.setValue("showOnWebsite", checked)}
          />
          <Label className="text-[13px] text-[#202124]">在官网展示</Label>
        </div>
      </div>

      {/* Recommendation */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">推荐语</h2>
        <p className="text-[12px] text-[#5f6368]">为这件藏品撰写推荐描述，用于官网展示和客户沟通</p>
        <Textarea
          {...form.register("recommendation")}
          className="text-[13px]"
          rows={4}
          placeholder="例：这把 Pierre Jeanneret Easy Chair 来自昌迪加尔项目原作，保存状态极佳，柚木色泽温润，藤编完整无损..."
        />
      </div>

      {/* Pricing */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">定价</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">标价 (RMB)</Label>
            <Input
              {...form.register("listPrice")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">售价 (RMB)</Label>
            <Input
              {...form.register("sellingPrice")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Cost */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">成本明细</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">采购价 (USD)</Label>
            <Input
              {...form.register("purchasePriceUsd")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">采购价 (RMB)</Label>
            <Input
              {...form.register("purchasePriceRmb")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">运费 (USD)</Label>
            <Input
              {...form.register("shippingCostUsd")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">运费 (RMB)</Label>
            <Input
              {...form.register("shippingCostRmb")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">关税</Label>
            <Input
              {...form.register("customsFees")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">进口税</Label>
            <Input
              {...form.register("importDuties")}
              type="number"
              step="0.01"
              className="text-[13px]"
            />
          </div>
        </div>

        <div className="border-t border-[#e8eaed] pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#5f6368]">总成本 (自动计算)</span>
            <span className="text-[16px] font-semibold text-[#202124]">
              {formatRMB(computedTotalCost)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#9aa0a6]">
            = 运费(RMB) + 关税 + 进口税 + 采购价(RMB)
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">库存图片</h2>
        <ImageUploader
          entity="item"
          entityId={item?.id ?? "new"}
          images={images}
          onChange={setImages}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]"
        >
          {isPending ? "保存中..." : isEditing ? "更新库存" : "创建库存"}
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
