"use client";

import { useState, useTransition } from "react";
import { deleteSalesOrder } from "@/lib/actions/sales-orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteSalesOrderButton({ id, orderNumber }: { id: string; orderNumber: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSalesOrder(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("订单已删除");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Trash2 size={14} className="text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#202124]">确认删除</DialogTitle>
          <DialogDescription className="text-[#5f6368]">
            确定要删除订单 <strong>{orderNumber}</strong>{" "}
            吗？关联商品将恢复为在库状态。此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="text-[13px]">
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="text-[13px]"
          >
            {isPending ? "删除中..." : "确认删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
