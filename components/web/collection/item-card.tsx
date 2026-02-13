"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import Image from "next/image";

type ItemCardProps = {
  item: {
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
};

export function ItemCard({ item }: ItemCardProps) {
  const locale = useLocale();
  const t = useTranslations("collection");

  const imageUrl = item.images[0]?.url || "/uploads/placeholder.jpg";
  const displayName =
    locale === "zh"
      ? item.product?.nameZh || item.name
      : item.product?.nameEn || item.nameEn || item.name;
  const designer = item.product?.designerSeries;

  const category = item.product?.category;

  return (
    <Link href={`/collection/${item.slug}`} className="gallery-card group block overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--gallery-light-gray)]">
        <Image
          src={imageUrl}
          alt={displayName}
          fill
          className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        {/* Bottom gradient overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
        {item.status === "SOLD" && (
          <span className="gallery-badge gallery-badge-sold absolute top-3 left-3">
            {t("sold")}
          </span>
        )}
        {category && (
          <span className="gallery-badge gallery-badge-new absolute top-3 right-3">{category}</span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="mb-1.5 text-[0.95rem] leading-snug font-medium text-[var(--gallery-charcoal)] transition-colors duration-300 group-hover:text-[var(--gallery-brown)]">
          {displayName}
        </h3>
        {designer && <p className="text-[0.8rem] text-[var(--gallery-text-muted)]">{designer}</p>}
      </div>
    </Link>
  );
}
