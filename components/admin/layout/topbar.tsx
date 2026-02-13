"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e8eaed] bg-white px-6">
      <div />
      <Button
        variant="ghost"
        size="sm"
        className="text-[13px] text-[#5f6368]"
        onClick={handleLogout}
      >
        退出登录
      </Button>
    </header>
  );
}
