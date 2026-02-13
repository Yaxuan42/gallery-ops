import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  labelMap?: Record<string, { zh: string; en?: string }>;
  className?: string;
}

export function StatusBadge({ status, colorMap, labelMap, className }: StatusBadgeProps) {
  const colors = colorMap[status] || "bg-gray-100 text-gray-600";
  const label = labelMap?.[status]?.zh || status;

  return (
    <Badge
      variant="secondary"
      className={cn("border-0 text-[12px] font-normal", colors, className)}
    >
      {label}
    </Badge>
  );
}
