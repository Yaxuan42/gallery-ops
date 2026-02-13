"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesOrderSchema, type SalesOrderFormData } from "@/lib/validations";
import { createSalesOrder, updateSalesOrder } from "@/lib/actions/sales-orders";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatRMB } from "@/lib/utils";
import { toast } from "sonner";
import { useTransition } from "react";
import { Plus, X } from "lucide-react";

interface AvailableItem {
  id: string;
  skuCode: string;
  name: string;
  sellingPrice: number | null;
  totalCost: number | null;
}

interface ExistingLineItem {
  item: { id: string; skuCode: string; name: string; totalCost: number | null; status: string };
  price: number;
  cost: number;
}

interface SalesOrderFormProps {
  order?: {
    id: string;
    orderNumber: string;
    customerId: string;
    orderDate: Date;
    deliveryDate: Date | null;
    status: string;
    paymentDate: Date | null;
    shippingAddr: string | null;
    notes: string | null;
    items: ExistingLineItem[];
  };
  customers: { id: string; name: string; type: string }[];
  availableItems: AvailableItem[];
  defaultOrderNumber: string;
}

function formatDateForInput(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function SalesOrderForm({
  order,
  customers,
  availableItems,
  defaultOrderNumber,
}: SalesOrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!order;

  // Build the combined items list for the select: available + already-in-order items
  const allSelectableItems: AvailableItem[] = [...availableItems];
  if (order) {
    for (const li of order.items) {
      if (!allSelectableItems.find((a) => a.id === li.item.id)) {
        allSelectableItems.push({
          id: li.item.id,
          skuCode: li.item.skuCode,
          name: li.item.name,
          sellingPrice: li.price,
          totalCost: li.item.totalCost,
        });
      }
    }
  }

  const form = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema) as never,
    defaultValues: {
      orderNumber: order?.orderNumber ?? defaultOrderNumber,
      customerId: order?.customerId ?? "",
      orderDate: order?.orderDate ?? new Date(),
      deliveryDate: order?.deliveryDate ?? undefined,
      status: order?.status ?? "PENDING",
      paymentDate: order?.paymentDate ?? undefined,
      shippingAddr: order?.shippingAddr ?? "",
      notes: order?.notes ?? "",
      items:
        order?.items.map((li) => ({
          itemId: li.item.id,
          price: li.price,
          cost: li.cost,
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const totalAmount = watchedItems?.reduce((sum, li) => sum + (Number(li.price) || 0), 0) ?? 0;
  const totalCost = watchedItems?.reduce((sum, li) => sum + (Number(li.cost) || 0), 0) ?? 0;
  const grossProfit = totalAmount - totalCost;

  const handleAddItem = () => {
    append({ itemId: "", price: 0, cost: 0 });
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = allSelectableItems.find((i) => i.id === itemId);
    if (selectedItem) {
      form.setValue(`items.${index}.itemId`, itemId);
      form.setValue(`items.${index}.price`, selectedItem.sellingPrice ?? 0);
      form.setValue(`items.${index}.cost`, selectedItem.totalCost ?? 0);
    }
  };

  const onSubmit = (data: SalesOrderFormData) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateSalesOrder(order.id, data)
        : await createSalesOrder(data);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  // Items already selected in the form
  const selectedItemIds = new Set(watchedItems?.map((li) => li.itemId).filter(Boolean) ?? []);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
      {/* Order Info */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">订单信息</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">订单号</Label>
            <Input
              {...form.register("orderNumber")}
              className="bg-[#f7f7f7] text-[13px]"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">客户 *</Label>
            <Select
              value={form.watch("customerId")}
              onValueChange={(val) => form.setValue("customerId", val)}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="选择客户" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.customerId && (
              <p className="text-[12px] text-red-500">{form.formState.errors.customerId.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">下单日期 *</Label>
            <Input
              type="date"
              className="text-[13px]"
              value={formatDateForInput(form.watch("orderDate"))}
              onChange={(e) => form.setValue("orderDate", new Date(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">交付日期</Label>
            <Input
              type="date"
              className="text-[13px]"
              value={formatDateForInput(form.watch("deliveryDate") ?? null)}
              onChange={(e) =>
                form.setValue("deliveryDate", e.target.value ? new Date(e.target.value) : undefined)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#202124]">付款日期</Label>
            <Input
              type="date"
              className="text-[13px]"
              value={formatDateForInput(form.watch("paymentDate") ?? null)}
              onChange={(e) =>
                form.setValue("paymentDate", e.target.value ? new Date(e.target.value) : undefined)
              }
            />
          </div>
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
              {Object.entries(ORDER_STATUS).map(([key, val]) => (
                <SelectItem key={key} value={val}>
                  {ORDER_STATUS_LABELS[val]?.zh || val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">收货地址</Label>
          <Textarea {...form.register("shippingAddr")} className="text-[13px]" rows={2} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] text-[#202124]">备注</Label>
          <Textarea {...form.register("notes")} className="text-[13px]" rows={2} />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4 rounded-lg border border-[#e8eaed] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#202124]">商品明细</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-[13px]"
            onClick={handleAddItem}
          >
            <Plus size={14} className="mr-1" />
            添加商品
          </Button>
        </div>

        {form.formState.errors.items &&
          typeof form.formState.errors.items === "object" &&
          "message" in form.formState.errors.items && (
            <p className="text-[12px] text-red-500">
              {(form.formState.errors.items as { message?: string }).message}
            </p>
          )}

        {fields.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="border-[#e8eaed]">
                <TableHead className="text-[13px] text-[#5f6368]">商品</TableHead>
                <TableHead className="w-36 text-[13px] text-[#5f6368]">售价</TableHead>
                <TableHead className="w-36 text-[13px] text-[#5f6368]">成本</TableHead>
                <TableHead className="w-12 text-[13px] text-[#5f6368]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} className="border-[#e8eaed]">
                  <TableCell>
                    <Select
                      value={form.watch(`items.${index}.itemId`)}
                      onValueChange={(val) => handleItemSelect(index, val)}
                    >
                      <SelectTrigger className="text-[13px]">
                        <SelectValue placeholder="选择商品" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSelectableItems.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id}
                            disabled={
                              selectedItemIds.has(item.id) &&
                              form.watch(`items.${index}.itemId`) !== item.id
                            }
                          >
                            [{item.skuCode}] {item.name}
                            {item.sellingPrice ? ` (${formatRMB(item.sellingPrice)})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      className="text-[13px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      {...form.register(`items.${index}.cost`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      className="bg-[#f7f7f7] text-[13px]"
                      readOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => remove(index)}
                    >
                      <X size={14} className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {fields.length === 0 && (
          <p className="py-4 text-center text-[13px] text-[#5f6368]">点击上方按钮添加商品</p>
        )}

        {/* Totals */}
        <div className="space-y-2 border-t border-[#e8eaed] pt-4">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#5f6368]">总金额</span>
            <span className="font-medium text-[#202124]">{formatRMB(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#5f6368]">总成本</span>
            <span className="text-[#5f6368]">{formatRMB(totalCost)}</span>
          </div>
          <div className="flex justify-between text-[14px] font-semibold">
            <span className="text-[#202124]">毛利</span>
            <span className={grossProfit >= 0 ? "text-green-600" : "text-red-600"}>
              {formatRMB(grossProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]"
        >
          {isPending ? "保存中..." : isEditing ? "更新订单" : "创建订单"}
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
