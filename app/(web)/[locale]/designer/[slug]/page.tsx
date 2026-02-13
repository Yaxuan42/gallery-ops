import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DESIGNER_SLUG_MAP, DESIGNER_DISPLAY_NAMES, getDesignerItems } from "@/lib/queries/web";
import { ItemGrid } from "@/components/web/collection/item-grid";
import type { Metadata } from "next";

const validSlugs = Object.keys(DESIGNER_SLUG_MAP);

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!DESIGNER_SLUG_MAP[slug]) {
    return { title: "Not Found" };
  }

  const displayName = DESIGNER_DISPLAY_NAMES[slug]?.[locale as "zh" | "en"] || slug;

  const t = await getTranslations({ locale, namespace: "designer" });

  return {
    title: t("title", { name: displayName }),
    description: t("subtitle", { name: displayName }),
  };
}

export default async function DesignerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const designerSeries = DESIGNER_SLUG_MAP[slug];
  if (!designerSeries) {
    notFound();
  }

  const items = await getDesignerItems(designerSeries);
  const t = await getTranslations({ locale, namespace: "designer" });

  const displayName = DESIGNER_DISPLAY_NAMES[slug]?.[locale as "zh" | "en"] || slug;

  // Get description from translations
  const descKey = slug as keyof typeof DESIGNER_DISPLAY_NAMES;
  let description = "";
  try {
    description = t(`descriptions.${descKey}` as never);
  } catch {
    // Fallback if key doesn't exist
    description = "";
  }

  return (
    <div className="pt-20 md:pt-24">
      <section className="gallery-section">
        <div className="gallery-container">
          {/* Hero Section */}
          <div className="mb-16 max-w-3xl">
            <h1
              className="mb-4 text-3xl text-[var(--gallery-charcoal)] md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-gallery-heading)" }}
            >
              {displayName}
            </h1>
            <p className="mb-4 text-sm text-[var(--gallery-warm-gray)]">
              {t("itemCount", { count: items.length })}
            </p>
            {description && (
              <p className="text-base leading-relaxed text-[var(--gallery-warm-gray)]">
                {description}
              </p>
            )}
          </div>

          {/* Items Grid */}
          <ItemGrid items={items} />
        </div>
      </section>
    </div>
  );
}
