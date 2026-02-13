"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import { ITEM_STATUS_LABELS } from "@/lib/constants";

type ProductSpecsProps = {
  item: {
    name: string;
    nameEn: string | null;
    slug: string;
    era: string | null;
    manufacturer: string | null;
    material: string | null;
    dimensions: string | null;
    conditionGrade: string | null;
    designerSeries: string | null;
    status: string;
    listPrice: number | null;
    product: {
      nameZh: string;
      nameEn: string;
      designer: string | null;
      designerSeries: string | null;
      descriptionZh: string | null;
      descriptionEn: string | null;
      category: string;
    } | null;
  };
};

export function ProductSpecs({ item }: ProductSpecsProps) {
  const t = useTranslations("detail");
  const locale = useLocale();

  const displayName =
    locale === "zh"
      ? item.product?.nameZh || item.name
      : item.product?.nameEn || item.nameEn || item.name;

  const description = locale === "zh" ? item.product?.descriptionZh : item.product?.descriptionEn;

  const statusLabel = ITEM_STATUS_LABELS[item.status]?.[locale as "zh" | "en"] || item.status;

  const designer = item.product?.designer || item.designerSeries || item.product?.designerSeries;

  const specs = [
    { label: t("designer"), value: designer },
    { label: t("series"), value: item.product?.designerSeries },
    { label: t("era"), value: item.era },
    { label: t("manufacturer"), value: item.manufacturer },
    { label: t("material"), value: item.material },
    { label: t("dimensions"), value: item.dimensions },
    { label: t("condition"), value: item.conditionGrade },
    { label: t("status"), value: statusLabel },
  ].filter((s) => s.value);

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1
          className="mb-2 text-2xl text-[var(--gallery-charcoal)] md:text-3xl"
          style={{
            fontFamily: "var(--font-gallery-heading)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          {displayName}
        </h1>
        {designer && (
          <p className="text-[1.1rem] leading-relaxed text-[var(--gallery-text-secondary)]">
            {designer}
          </p>
        )}
      </div>

      {/* Price */}
      <div
        className="gallery-gradient-text text-xl font-semibold"
        style={{ fontFamily: "var(--font-gallery-heading)" }}
      >
        {item.listPrice ? `¥${item.listPrice.toLocaleString("zh-CN")}` : t("contactForPrice")}
      </div>

      {/* Specs */}
      <div className="rounded-xl border border-[var(--gallery-border-light)] bg-[var(--gallery-placeholder-bg)] p-5">
        <div className="grid grid-cols-1 gap-3">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-baseline justify-between border-b border-[var(--gallery-border-light)] pb-3 last:border-0 last:pb-0"
            >
              <span className="text-sm text-[var(--gallery-text-muted)]">{spec.label}</span>
              <span className="text-right text-sm font-medium text-[var(--gallery-charcoal)]">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inquire Button */}
      <Link
        href={`/contact?item=${item.slug}`}
        className="gallery-btn-gradient block w-full py-3.5 text-center text-sm tracking-[0.08em] text-white uppercase"
      >
        {t("inquire")}
      </Link>

      {/* Description */}
      {description && (
        <div className="border-t border-[var(--gallery-border)] pt-6">
          <h3 className="mb-3 text-sm font-medium tracking-[0.15em] text-[var(--gallery-text-muted)] uppercase">
            {t("description")}
          </h3>
          <p className="text-sm leading-[1.7] text-[var(--gallery-charcoal)]">{description}</p>
        </div>
      )}
    </div>
  );
}
