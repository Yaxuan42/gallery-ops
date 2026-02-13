import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCollectionItems, getFilterOptions } from "@/lib/queries/web";
import { ItemGrid } from "@/components/web/collection/item-grid";
import { Filters } from "@/components/web/collection/filters";
import { Pagination } from "@/components/web/collection/pagination";
import { Suspense } from "react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("collectionTitle"),
    description: t("collectionDescription"),
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const designer = typeof sp.designer === "string" ? sp.designer : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const page = typeof sp.page === "string" ? parseInt(sp.page, 10) || 1 : 1;

  const [{ items, total, totalPages }, filterOptions] = await Promise.all([
    getCollectionItems({ category, designer, status, page }),
    getFilterOptions(),
  ]);

  const t = await getTranslations({ locale, namespace: "collection" });

  return (
    <div className="pt-20 md:pt-24">
      <section className="gallery-section">
        <div className="gallery-container">
          {/* Page Header */}
          <div className="mb-12 border-b border-[var(--gallery-border-light)] pb-6">
            <h1
              className="mb-3 text-3xl text-[var(--gallery-charcoal)] md:text-4xl"
              style={{ fontFamily: "var(--font-gallery-heading)", lineHeight: 1.1 }}
            >
              {t("title")}
            </h1>
            <p className="text-[1.05rem] leading-relaxed text-[var(--gallery-warm-gray)]">
              {t("subtitle")}
            </p>
          </div>

          {/* Filters */}
          <Suspense fallback={null}>
            <Filters
              availableCategories={filterOptions.categories}
              availableDesigners={filterOptions.designers}
            />
          </Suspense>

          {/* Results count */}
          <p className="mb-6 text-sm text-[var(--gallery-warm-gray)]">
            {t("showingResults", { count: total })}
          </p>

          {/* Items Grid */}
          <ItemGrid items={items} />

          {/* Pagination */}
          <Suspense fallback={null}>
            <Pagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
