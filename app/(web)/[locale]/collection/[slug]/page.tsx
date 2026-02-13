import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getItemBySlug, getRelatedItems } from "@/lib/queries/web";
import { ImageGallery } from "@/components/web/product/image-gallery";
import { ProductSpecs } from "@/components/web/product/product-specs";
import { RelatedItems } from "@/components/web/product/related-items";
import { Link } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    return { title: "Not Found" };
  }

  const displayName =
    locale === "zh"
      ? item.product?.nameZh || item.name
      : item.product?.nameEn || item.nameEn || item.name;
  const description = locale === "zh" ? item.product?.descriptionZh : item.product?.descriptionEn;
  const primaryImage = item.images.find((img) => img.isPrimary) || item.images[0];

  return {
    title: displayName,
    description: description || displayName,
    openGraph: {
      title: displayName,
      description: description || displayName,
      images: primaryImage ? [{ url: primaryImage.url }] : undefined,
    },
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  // Merge item images and product images for the gallery
  const allImages = item.images.length > 0 ? item.images : item.product?.images || [];

  const relatedItems = await getRelatedItems(
    item.id,
    item.product?.designerSeries || item.designerSeries,
    item.product?.category,
    4,
  );

  const t = await getTranslations({ locale, namespace: "detail" });

  return (
    <div className="pt-20 md:pt-24">
      <section className="gallery-section">
        <div className="gallery-container">
          {/* Back Link */}
          <Link
            href="/collection"
            className="group mb-8 inline-flex items-center gap-2 text-sm text-[var(--gallery-warm-gray)] transition-colors duration-300 hover:text-[var(--gallery-brown)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {t("backToCollection")}
          </Link>

          {/* Main Content: Image + Specs */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: Image Gallery */}
            <ImageGallery images={allImages} />

            {/* Right: Product Specs */}
            <ProductSpecs item={item} />
          </div>

          {/* Related Items */}
          <RelatedItems items={relatedItems} />
        </div>
      </section>
    </div>
  );
}
