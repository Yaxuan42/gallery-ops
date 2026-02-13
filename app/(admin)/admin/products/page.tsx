import Link from "next/link";
import { getProducts } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Star } from "lucide-react";
import { DeleteProductButton } from "./delete-button";
import { AdminPageLayout } from "@/components/admin/layout/page-layout";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <AdminPageLayout
      hint={{
        title: "操作指南",
        items: [
          "商品 (SPU) 是产品模板，定义名称、分类和设计师系列",
          "每个商品可关联多件库存 (SKU)，「库存数」列显示实物数量",
          "标记「推荐」的商品会在官网首页优先展示",
          "点击铅笔图标编辑，垃圾桶图标删除（需先删除关联库存）",
        ],
      }}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#202124]">商品管理</h1>
          <Link href="/admin/products/new">
            <Button className="bg-[#1a73e8] text-[13px] text-white hover:bg-[#1557b0]">
              <Plus size={16} className="mr-1" />
              新建商品
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-[#e8eaed] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e8eaed]">
                <TableHead className="w-12 text-[13px] text-[#5f6368]"></TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">中文名</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">英文名</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">分类</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">设计师系列</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">库存数</TableHead>
                <TableHead className="text-[13px] text-[#5f6368]">推荐</TableHead>
                <TableHead className="text-right text-[13px] text-[#5f6368]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-[13px] text-[#5f6368]">
                    暂无商品数据
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id} className="border-[#e8eaed]">
                  <TableCell>
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url.replace("-full.", "-thumb.")}
                        alt={product.nameZh}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-[#f1f3f4] text-[10px] text-[#9aa0a6]">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-[13px] font-medium text-[#202124]">
                    {product.nameZh}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">{product.nameEn}</TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">{product.category}</TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {product.designerSeries || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#5f6368]">
                    {product._count.items}
                  </TableCell>
                  <TableCell>
                    {product.featured && (
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil size={14} className="text-[#5f6368]" />
                        </Button>
                      </Link>
                      <DeleteProductButton id={product.id} name={product.nameZh} />
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
