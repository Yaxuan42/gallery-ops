import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { Playfair_Display, Inter, Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import { Header } from "@/components/web/layout/header";
import { Footer } from "@/components/web/layout/footer";
import type { Metadata } from "next";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: {
      default: t("siteTitle"),
      template: `%s | ${t("siteTitle")}`,
    },
    description: t("siteDescription"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function WebsiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default;

  const fontVars = [
    playfairDisplay.variable,
    inter.variable,
    notoSerifSC.variable,
    notoSansSC.variable,
  ].join(" ");

  // Set CSS custom properties for heading/body fonts based on locale
  const headingFont =
    locale === "zh"
      ? "var(--font-noto-serif-sc), var(--font-playfair), serif"
      : "var(--font-playfair), var(--font-noto-serif-sc), serif";
  const bodyFont =
    locale === "zh"
      ? "var(--font-noto-sans-sc), var(--font-inter), sans-serif"
      : "var(--font-inter), var(--font-noto-sans-sc), sans-serif";

  return (
    <div
      className={fontVars}
      style={
        {
          "--font-gallery-heading": headingFont,
          "--font-gallery-body": bodyFont,
        } as React.CSSProperties
      }
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div
          className="flex min-h-screen flex-col bg-[var(--gallery-cream)]"
          style={{ fontFamily: bodyFont }}
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </div>
  );
}
