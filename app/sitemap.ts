import type { MetadataRoute } from "next";
import { getAllWebsiteItemSlugs, DESIGNER_SLUG_MAP } from "@/lib/queries/web";
import { routing } from "@/lib/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gallery.com";
  const locales = routing.locales;

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ["", "/collection", "/contact", "/about"];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.8,
      });
    }
  }

  // Designer pages
  const designerSlugs = Object.keys(DESIGNER_SLUG_MAP);
  for (const slug of designerSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/designer/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Item detail pages
  try {
    const items = await getAllWebsiteItemSlugs();
    for (const item of items) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/collection/${item.slug}`,
          lastModified: item.updatedAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB might not be available during build
    console.warn("Could not fetch items for sitemap");
  }

  return entries;
}
