"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

export function ContactCta() {
  const t = useTranslations("home");

  return (
    <section className="relative py-24 md:py-32">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-fixed bg-center"
        style={{
          backgroundImage: "url('/uploads/contact-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-[var(--gallery-charcoal)]/70" />
      </div>

      {/* Content */}
      <div className="gallery-container relative text-center">
        <h2
          className="mb-4 text-3xl text-white md:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-gallery-heading)", lineHeight: 1.1 }}
        >
          {t("contactTitle")}
        </h2>
        <p className="mx-auto mb-10 max-w-md text-[1.1rem] leading-[1.8] text-white/60">
          {t("contactSubtitle")}
        </p>
        <Link
          href="/contact"
          className="inline-block rounded-sm border border-white/60 px-10 py-3.5 text-sm tracking-[0.08em] text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[var(--gallery-charcoal)]"
        >
          {t("contactCta")}
        </Link>
      </div>
    </section>
  );
}
