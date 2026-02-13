"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Archive, Users, ShoppingCart, Truck } from "lucide-react";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/products", label: "商品", icon: Package },
  { href: "/admin/inventory", label: "库存", icon: Archive },
  { href: "/admin/customers", label: "客户", icon: Users },
  { href: "/admin/sales-orders", label: "销售单", icon: ShoppingCart },
  { href: "/admin/suppliers", label: "供应商", icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#e8eaed] bg-white">
      <div className="flex h-14 items-center border-b border-[#e8eaed] px-4">
        <span className="text-base font-semibold text-[#202124]">旧地管理平台</span>
      </div>
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mx-2 flex items-center gap-3 rounded-md px-4 py-2 text-[13px] transition-colors ${
                isActive
                  ? "bg-[#e8f0fe] font-medium text-[#1a73e8]"
                  : "text-[#5f6368] hover:bg-[#f1f3f4]"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
