import Link from "next/link";
import { getItems } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { ITEM_STATUS_COLORS, ITEM_STATUS_LABELS } from "@/lib/constants";
import { formatRMB } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";
import { DeleteItemButton } from "./delete-button";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function InventoryPage() {
  const items = await getItems();

  return (
    <AdminPageLayout
      hint={{
        title: "操作指南",
        items: [
          "库存 (SKU) 是每件实物家具，关联商品 (SPU) 和供应商",
          "状态：IN_STOCK（在库）、RESERVED（已预留）、SOLD（已售）",
          "总成本 = 运费 + 关税 + 进口税 + 采购价，自动计算",
          "开启「在官网展示」后该件家具会出现在客户展示官网",
        ],
      }}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#202124]">库存管理</h1>
          <Link href="/admin/inventory/new">
            <Button className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]">
              <Plus size={16} className="mr-1" />
              新建库存
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-[#e8eaed] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e8eaed]">
                <TableHead className="w-12 text-[13px] text-[#5f6368]"></TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">编号</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">名称</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">关联商品</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">供应商</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">状态</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">售价</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">总成本</TableHead>
                <TableHead className="text-right text-[13px] text-[#5f6368]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-[13px] text-[#5f6368]">
                    暂无库存数据
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id} className="border-[#e8eaed]">
                  <TableCell>
                    {item.images[0] ? (
                      <img
                        src={item.images[0].url.replace("-full.", "-thumb.")}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-[#f1f3f4] text-[10px] text-[#9aa0a6]">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[13px] font-medium text-[#1a73e8]">
                    {item.skuCode}
                  </TableCell>
                  <TableCell className="text-[13px] font-medium text-[#202124]">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {item.product?.nameZh || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {item.supplier?.name || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={item.status}
                      colorMap={ITEM_STATUS_COLORS}
                      labelMap={ITEM_STATUS_LABELS}
                    />
                  </TableCell>
                  <TableCell className="text-[13px] text-[#202124]">
                    {formatRMB(item.sellingPrice)}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {formatRMB(item.totalCost)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/inventory/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-[#5f6368]" />
                        </Button>
                      </Link>
                      <DeleteItemButton id={item.id} name={item.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminPageLayout>
  );
}
