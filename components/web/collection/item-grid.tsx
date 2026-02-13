"use client";

import { useTranslations } from "next-intl";
import { ItemCard } from "./item-card";

type Item = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  status: string;
  product: {
    nameZh: string;
    nameEn: string;
    designerSeries: string | null;
    category: string;
  } | null;
  images: { url: string; alt: string | null }[];
};

export function ItemGrid({ items }: { items: Item[] }) {
  const t = useTranslations("collection");

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[var(--gallery-warm-gray)]">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
