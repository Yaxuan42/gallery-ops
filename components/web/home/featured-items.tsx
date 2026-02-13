"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import Image from "next/image";

type FeaturedItem = {
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

export function FeaturedItems({ items }: { items: FeaturedItem[] }) {
  const t = useTranslations("home");
  const locale = useLocale();

  if (items.length === 0) return null;

  return (
    <section className="bg-[var(--gallery-page-bg)]" style={{ padding: "4rem 0" }}>
      <div className="gallery-container">
        {/* Section header with bottom border */}
        <div className="mb-10 flex items-end justify-between border-b border-[var(--gallery-border-light)] pb-4">
          <h2
            className="gallery-section-title !mb-0 !border-0 !pb-0 text-[var(--gallery-charcoal)]"
            style={{ fontFamily: "var(--font-gallery-heading)" }}
          >
            {t("featuredTitle")}
          </h2>
          <Link
            href="/collection"
            className="nav-link-underline pb-0.5 text-sm text-[var(--gallery-warm-gray)] transition-colors duration-300 hover:text-[var(--gallery-brown)]"
          >
            {t("viewAll")}
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const imageUrl = item.images[0]?.url || "/uploads/placeholder.jpg";
            const displayName =
              locale === "zh"
                ? item.product?.nameZh || item.name
                : item.product?.nameEn || item.nameEn || item.name;
            const designer = item.product?.designerSeries;
            const category = item.product?.category;

            return (
              <Link
                key={item.id}
                href={`/collection/${item.slug}`}
                className="gallery-card gallery-card-stagger group block overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[5/4] overflow-hidden bg-[var(--gallery-light-gray)]">
                  <Image
                    src={imageUrl}
                    alt={displayName}
                    fill
                    className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Bottom gradient overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                  {item.status === "SOLD" && (
                    <span className="gallery-badge gallery-badge-sold absolute top-3 left-3">
                      {locale === "zh" ? "已售" : "Sold"}
                    </span>
                  )}
                  {/* Category tag top-right */}
                  {category && (
                    <span className="gallery-badge gallery-badge-new absolute top-3 right-3">
                      {category}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="mb-1.5 text-[0.95rem] leading-snug font-medium text-[var(--gallery-charcoal)] transition-colors duration-300 group-hover:text-[var(--gallery-brown)]">
                    {displayName}
                  </h3>
                  {designer && (
                    <p className="text-[0.8rem] text-[var(--gallery-text-muted)]">{designer}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
