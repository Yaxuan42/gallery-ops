"use client";

import { useTranslations } from "next-intl";
import { ItemCard } from "@/components/web/collection/item-card";

type RelatedItem = {
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

export function RelatedItems({ items }: { items: RelatedItem[] }) {
  const t = useTranslations("detail");

  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[var(--gallery-border-light)] pt-16">
      <h2
        className="gallery-section-title mb-10 text-[var(--gallery-charcoal)]"
        style={{ fontFamily: "var(--font-gallery-heading)" }}
      >
        {t("relatedItems")}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
