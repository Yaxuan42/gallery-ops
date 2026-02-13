"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIES } from "@/lib/constants";
import { DESIGNER_SLUG_MAP } from "@/lib/designers";

type FiltersProps = {
  availableCategories: string[];
  availableDesigners: string[];
};

export function Filters({ availableCategories, availableDesigners }: FiltersProps) {
  const t = useTranslations("collection");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentDesigner = searchParams.get("designer") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    },
    [searchParams, router, pathname],
  );

  const categoryOptions = CATEGORIES.filter((c) => availableCategories.includes(c.value));

  // Map designer series values to display info
  const designerOptions = availableDesigners.map((series) => {
    const slug = Object.entries(DESIGNER_SLUG_MAP).find(([, val]) => val === series)?.[0];
    return {
      value: series,
      label: series,
      slug,
    };
  });

  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:gap-16">
      {/* Category */}
      <div>
        <h4 className="mb-3 text-xs font-medium tracking-[0.15em] text-[var(--gallery-text-muted)] uppercase">
          {t("filterCategory")}
        </h4>
        <div className="flex flex-wrap gap-0">
          <button
            onClick={() => updateParam("category", "")}
            className={`mr-8 pb-1 text-[0.9rem] transition-colors duration-200 ${
              !currentCategory
                ? "border-b border-[var(--gallery-charcoal)] font-medium text-[var(--gallery-charcoal)]"
                : "font-normal text-[var(--gallery-text-muted)] hover:text-[var(--gallery-charcoal)]"
            }`}
          >
            {t("statusAll")}
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                updateParam("category", currentCategory === cat.value ? "" : cat.value)
              }
              className={`mr-8 pb-1 text-[0.9rem] transition-colors duration-200 ${
                currentCategory === cat.value
                  ? "border-b border-[var(--gallery-charcoal)] font-medium text-[var(--gallery-charcoal)]"
                  : "font-normal text-[var(--gallery-text-muted)] hover:text-[var(--gallery-charcoal)]"
              }`}
            >
              {locale === "zh" ? cat.labelZh : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Designer */}
      <div>
        <h4 className="mb-3 text-xs font-medium tracking-[0.15em] text-[var(--gallery-text-muted)] uppercase">
          {t("filterDesigner")}
        </h4>
        <div className="flex flex-wrap gap-0">
          <button
            onClick={() => updateParam("designer", "")}
            className={`mr-8 pb-1 text-[0.9rem] transition-colors duration-200 ${
              !currentDesigner
                ? "border-b border-[var(--gallery-charcoal)] font-medium text-[var(--gallery-charcoal)]"
                : "font-normal text-[var(--gallery-text-muted)] hover:text-[var(--gallery-charcoal)]"
            }`}
          >
            {t("statusAll")}
          </button>
          {designerOptions.map((d) => (
            <button
              key={d.value}
              onClick={() => updateParam("designer", currentDesigner === d.value ? "" : d.value)}
              className={`mr-8 pb-1 text-[0.9rem] transition-colors duration-200 ${
                currentDesigner === d.value
                  ? "border-b border-[var(--gallery-charcoal)] font-medium text-[var(--gallery-charcoal)]"
                  : "font-normal text-[var(--gallery-text-muted)] hover:text-[var(--gallery-charcoal)]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h4 className="mb-3 text-xs font-medium tracking-[0.15em] text-[var(--gallery-text-muted)] uppercase">
          {t("filterStatus")}
        </h4>
        <div className="flex flex-wrap gap-0">
          {[
            { value: "", label: t("statusAll") },
            { value: "available", label: t("statusAvailable") },
            { value: "sold", label: t("statusSold") },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => updateParam("status", currentStatus === s.value ? "" : s.value)}
              className={`mr-8 pb-1 text-[0.9rem] transition-colors duration-200 ${
                currentStatus === s.value
                  ? "border-b border-[var(--gallery-charcoal)] font-medium text-[var(--gallery-charcoal)]"
                  : "font-normal text-[var(--gallery-text-muted)] hover:text-[var(--gallery-charcoal)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
