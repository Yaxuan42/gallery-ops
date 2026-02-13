"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/validations";
import { createProduct, updateProduct } from "@/lib/actions/products";
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
import { CATEGORIES, DESIGNER_SERIES } from "@/lib/constants";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useTransition } from "react";

interface ImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductFormProps {
  product?: {
    id: string;
    nameZh: string;
    nameEn: string;
    category: string;
    subcategory: string | null;
    model: string | null;
    descriptionZh: string | null;
    descriptionEn: string | null;
    designer: string | null;
    designerSeries: string | null;
    priceRangeLow: number | null;
    priceRangeHigh: number | null;
    collectionValue: string | null;
    featured: boolean;
    slug: string;
    images: ImageItem[];
  };
}

export function ProductForm({ product }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!product;
  const [images, setImages] = useState<ImageItem[]>(product?.images ?? []);
  const [slugPreview, setSlugPreview] = useState(product?.slug ?? "");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      nameZh: product?.nameZh ?? "",
      nameEn: product?.nameEn ?? "",
      category: product?.category ?? "",
      subcategory: product?.subcategory ?? "",
      model: product?.model ?? "",
      descriptionZh: product?.descriptionZh ?? "",
      descriptionEn: product?.descriptionEn ?? "",
      designer: product?.designer ?? "",
      designerSeries: product?.designerSeries ?? "",
      priceRangeLow: product?.priceRangeLow ?? undefined,
      priceRangeHigh: product?.priceRangeHigh ?? undefined,
      collectionValue: product?.collectionValue ?? "",
      featured: product?.featured ?? false,
    },
  });

  const onSubmit = (data: ProductFormData) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, data, images)
        : await createProduct(data, images);
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
            <Label className="text-[13px] text-[#202124]">中文名 *</Label>
            <Input {...form.register("nameZh")} className="text-[13px]" />
            {form.formState.errors.nameZh && (
              <p className="text-[12px] text-red-500">{form.formState.errors.nameZh.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">英文名 *</Label>
            <Input
              {...form.register("nameEn")}
              className="text-[13px]"
              onChange={(e) => {
                form.setValue("nameEn", e.target.value);
                setSlugPreview(generateSlug(e.target.value));
              }}
            />
            {form.formState.errors.nameEn && (
              <p className="text-[12px] text-red-500">{form.formState.errors.nameEn.message}</p>
            )}
            {slugPreview && <p className="text-[11px] text-[#5f6368]">Slug: {slugPreview}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">分类 *</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(val) => form.setValue("category", val)}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.labelZh} / {c.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-[12px] text-red-500">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">子分类</Label>
            <Input {...form.register("subcategory")} className="text-[13px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">型号</Label>
            <Input {...form.register("model")} className="text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">设计师</Label>
            <Input {...form.register("designer")} className="text-[13px]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">设计师系列</Label>
          <Select
            value={form.watch("designerSeries") || ""}
            onValueChange={(val) => form.setValue("designerSeries", val)}
          >
            <SelectTrigger className="text-[13px]">
              <SelectValue placeholder="选择系列" />
            </SelectTrigger>
            <SelectContent>
              {DESIGNER_SERIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">描述</h2>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">中文描述</Label>
          <Textarea {...form.register("descriptionZh")} className="text-[13px]" rows={3} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">英文描述</Label>
          <Textarea {...form.register("descriptionEn")} className="text-[13px]" rows={3} />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">价格与收藏</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">价格区间 (低)</Label>
            <Input {...form.register("priceRangeLow")} type="number" className="text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">价格区间 (高)</Label>
            <Input {...form.register("priceRangeHigh")} type="number" className="text-[13px]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">收藏价值</Label>
          <Input {...form.register("collectionValue")} className="text-[13px]" />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.watch("featured")}
            onCheckedChange={(checked) => form.setValue("featured", checked)}
          />
          <Label className="text-[13px] text-[#202124]">推荐商品 (Featured)</Label>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">商品图片</h2>
        <ImageUploader
          entity="product"
          entityId={product?.id ?? "new"}
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
          {isPending ? "保存中..." : isEditing ? "更新商品" : "创建商品"}
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
