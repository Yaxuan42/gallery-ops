import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHeroSlides, getFeaturedItems } from "@/lib/queries/web";
import { HeroCarousel } from "@/components/web/home/hero-carousel";
import { FeaturedItems } from "@/components/web/home/featured-items";
import { AboutTeaser } from "@/components/web/home/about-teaser";
import { ContactCta } from "@/components/web/home/contact-cta";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("homeTitle"),
    description: t("siteDescription"),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [slides, featuredItems] = await Promise.all([getHeroSlides(), getFeaturedItems(8)]);

  return (
    <>
      <HeroCarousel slides={slides} />
      <FeaturedItems items={featuredItems} />
      <AboutTeaser />
      <ContactCta />
    </>
  );
}
