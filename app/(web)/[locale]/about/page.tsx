import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/uploads/hero/slide-0/1770906669060-full.webp')",
          }}
        >
          <div className="absolute inset-0 bg-[var(--gallery-charcoal)]/60" />
        </div>
        <div className="gallery-container relative flex h-full items-center justify-center">
          <div className="text-center">
            <h1
              className="mb-4 text-4xl text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-gallery-heading)" }}
            >
              {t("title")}
            </h1>
            <p className="mx-auto max-w-lg text-lg text-white/70">{t("heroSubtitle")}</p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="gallery-section bg-white">
        <div className="gallery-container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Text */}
            <div>
              <h2
                className="mb-6 text-2xl text-[var(--gallery-charcoal)] md:text-3xl"
                style={{ fontFamily: "var(--font-gallery-heading)" }}
              >
                {t("storyTitle")}
              </h2>
              <p className="mb-6 text-base leading-relaxed text-[var(--gallery-warm-gray)]">
                {t("storyText1")}
              </p>
              <p className="text-base leading-relaxed text-[var(--gallery-warm-gray)]">
                {t("storyText2")}
              </p>
            </div>

            {/* Image */}
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--gallery-light-gray)]"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/uploads/hero/slide-1/1770906670599-full.webp')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gallery-warm-gray)]/10 to-[var(--gallery-brass)]/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="gallery-section bg-[var(--gallery-cream)]">
        <div className="gallery-container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image (left on desktop) */}
            <div
              className="relative order-2 aspect-[4/3] overflow-hidden rounded-xl bg-[var(--gallery-light-gray)] lg:order-1"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/uploads/hero/slide-2/1770906671696-full.webp')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gallery-brass)]/5 to-[var(--gallery-warm-gray)]/10" />
            </div>

            {/* Text (right on desktop) */}
            <div className="order-1 lg:order-2">
              <h2
                className="mb-6 text-2xl text-[var(--gallery-charcoal)] md:text-3xl"
                style={{ fontFamily: "var(--font-gallery-heading)" }}
              >
                {t("philosophyTitle")}
              </h2>
              <p className="text-base leading-relaxed text-[var(--gallery-warm-gray)]">
                {t("philosophyText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit the Gallery */}
      <section className="gallery-section bg-white">
        <div className="gallery-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="mb-4 text-2xl text-[var(--gallery-charcoal)] md:text-3xl"
              style={{ fontFamily: "var(--font-gallery-heading)" }}
            >
              {t("visitTitle")}
            </h2>
            <p className="mb-10 text-base text-[var(--gallery-warm-gray)]">{t("visitText")}</p>

            <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
              {/* Address */}
              <div className="gallery-contact-card flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                  <MapPin className="h-5 w-5 text-[var(--gallery-brown)]" />
                </div>
                <p className="text-sm leading-relaxed text-[var(--gallery-charcoal)]">
                  {t("address")}
                </p>
              </div>

              {/* Hours */}
              <div className="gallery-contact-card flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                  <Clock className="h-5 w-5 text-[var(--gallery-brown)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--gallery-charcoal)]">{t("hours")}</p>
                  <p className="text-sm text-[var(--gallery-text-secondary)]">{t("hoursClosed")}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="gallery-contact-card flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                  <Phone className="h-5 w-5 text-[var(--gallery-brown)]" />
                </div>
                <p className="text-sm text-[var(--gallery-charcoal)]">{t("phone")}</p>
              </div>

              {/* Email */}
              <div className="gallery-contact-card flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                  <Mail className="h-5 w-5 text-[var(--gallery-brown)]" />
                </div>
                <p className="text-sm text-[var(--gallery-charcoal)]">{t("email")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
