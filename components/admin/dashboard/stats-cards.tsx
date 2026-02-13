import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRMB } from "@/lib/utils";
import { DollarSign, TrendingUp, Package, Users } from "lucide-react";

interface StatsCardsProps {
  monthlyRevenue: number;
  totalGrossProfit: number;
  inStockCount: number;
  customerCount: number;
}

export function StatsCards({
  monthlyRevenue,
  totalGrossProfit,
  inStockCount,
  customerCount,
}: StatsCardsProps) {
  const cards = [
    {
      title: "本月营收",
      value: formatRMB(monthlyRevenue),
      icon: DollarSign,
      color: "text-[#1a73e8]",
      bg: "bg-blue-50",
    },
    {
      title: "累计毛利",
      value: formatRMB(totalGrossProfit),
      icon: TrendingUp,
      color: totalGrossProfit >= 0 ? "text-green-600" : "text-red-600",
      bg: totalGrossProfit >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "库存数量",
      value: String(inStockCount),
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "客户数",
      value: String(customerCount),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-[#e8eaed] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[13px] font-medium text-[#5f6368]">{card.title}</CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon size={16} className={card.color} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[24px] font-semibold text-[#202124]">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
