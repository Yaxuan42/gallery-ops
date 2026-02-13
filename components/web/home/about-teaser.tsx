"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

export function AboutTeaser() {
  const t = useTranslations("home");

  return (
    <section className="gallery-section bg-[var(--gallery-cream)]">
      <div className="gallery-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Image */}
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--gallery-light-gray)]"
            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/uploads/about-teaser.jpg')",
              }}
            />
            {/* Fallback gradient when no image */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gallery-warm-gray)]/20 to-[var(--gallery-brass)]/10" />
          </div>

          {/* Right: Text */}
          <div>
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-[var(--gallery-brown)] uppercase">
              {/* Subtle section label */}
              Gallery
            </p>
            <h2
              className="mb-6 text-2xl text-[var(--gallery-charcoal)] md:text-3xl lg:text-4xl"
              style={{ fontFamily: "var(--font-gallery-heading)", lineHeight: 1.1 }}
            >
              {t("aboutTitle")}
            </h2>
            <p className="mb-8 text-[1.1rem] leading-[1.8] text-[var(--gallery-text-secondary)]">
              {t("aboutText")}
            </p>
            <Link
              href="/about"
              className="inline-block rounded-full border border-[var(--gallery-charcoal)] px-8 py-3 text-sm tracking-[0.08em] text-[var(--gallery-charcoal)] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--gallery-charcoal)] hover:text-white"
            >
              {t("aboutCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
