import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/web/contact/contact-form";
import { Suspense } from "react";
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
    title: t("contactTitle"),
    description: t("contactDescription"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

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

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Form */}
            <div>
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>

            {/* Right: Gallery Info */}
            <div className="lg:pl-8">
              <h2
                className="mb-8 text-xl text-[var(--gallery-charcoal)]"
                style={{ fontFamily: "var(--font-gallery-heading)" }}
              >
                {t("galleryInfo")}
              </h2>

              <div className="flex flex-col gap-5">
                {/* Address */}
                <div className="gallery-contact-card flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                    <MapPin className="h-5 w-5 text-[var(--gallery-brown)]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-[var(--gallery-charcoal)]">
                      {t("address")}
                    </h3>
                    <p className="text-sm text-[var(--gallery-text-secondary)]">
                      {t("addressValue")}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="gallery-contact-card flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                    <Phone className="h-5 w-5 text-[var(--gallery-brown)]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-[var(--gallery-charcoal)]">
                      {t("phone")}
                    </h3>
                    <p className="text-sm text-[var(--gallery-text-secondary)]">
                      {t("phoneValue")}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="gallery-contact-card flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                    <Mail className="h-5 w-5 text-[var(--gallery-brown)]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-[var(--gallery-charcoal)]">
                      {t("email")}
                    </h3>
                    <p className="text-sm text-[var(--gallery-text-secondary)]">
                      {t("emailValue")}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="gallery-contact-card flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(139,69,19,0.06)]">
                    <Clock className="h-5 w-5 text-[var(--gallery-brown)]" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-[var(--gallery-charcoal)]">
                      {t("hours")}
                    </h3>
                    <p className="text-sm text-[var(--gallery-text-secondary)]">
                      {t("hoursValue")}
                    </p>
                    <p className="text-sm text-[var(--gallery-text-secondary)]">
                      {t("hoursClosed")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div
                className="mt-12 rounded-xl border border-[rgba(139,69,19,0.08)] p-8"
                style={{ background: "rgba(139, 69, 19, 0.03)" }}
              >
                <p
                  className="gallery-gradient-text text-lg italic"
                  style={{ fontFamily: "var(--font-gallery-heading)" }}
                >
                  &ldquo;Good design is as little design as possible.&rdquo;
                </p>
                <p className="mt-2 text-sm text-[var(--gallery-text-muted)]">&mdash; Dieter Rams</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
