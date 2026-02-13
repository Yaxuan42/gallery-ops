"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { DESIGNER_DISPLAY_NAMES } from "@/lib/designers";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  const designerSlugs = Object.keys(DESIGNER_DISPLAY_NAMES);

  return (
    <footer>
      {/* Main footer content */}
      <div className="bg-[var(--gallery-charcoal)] text-white/80">
        <div className="gallery-container py-14 md:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Column 1: Gallery Info */}
            <div>
              <h3 className="gallery-heading mb-4 text-xl font-semibold !text-white">
                {t("galleryName")}
              </h3>
              <p className="text-sm leading-relaxed text-white/50">{t("galleryDesc")}</p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="mb-4 text-xs font-medium tracking-[0.15em] text-white/70 uppercase">
                {t("navigation")}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/collection"
                    className="text-sm text-white/50 transition-colors duration-300 hover:text-[var(--gallery-brown-gold)]"
                  >
                    {nav("collection")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-white/50 transition-colors duration-300 hover:text-[var(--gallery-brown-gold)]"
                  >
                    {nav("about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-white/50 transition-colors duration-300 hover:text-[var(--gallery-brown-gold)]"
                  >
                    {nav("contact")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Designers */}
            <div>
              <h4 className="mb-4 text-xs font-medium tracking-[0.15em] text-white/70 uppercase">
                {t("designerSection")}
              </h4>
              <ul className="space-y-2.5">
                {designerSlugs.slice(0, 6).map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/designer/${slug}`}
                      className="text-sm text-white/50 transition-colors duration-300 hover:text-[var(--gallery-brown-gold)]"
                    >
                      {DESIGNER_DISPLAY_NAMES[slug]?.en || slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="mb-4 text-xs font-medium tracking-[0.15em] text-white/70 uppercase">
                {t("contactSection")}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gallery-brown-gold)]" />
                  <span className="text-sm text-white/50">{t("address")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--gallery-brown-gold)]" />
                  <span className="text-sm text-white/50">{t("phone")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--gallery-brown-gold)]" />
                  <span className="text-sm text-white/50">{t("email")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom black copyright bar */}
      <div className="flex h-[60px] items-center justify-center bg-black">
        <p className="text-[0.85rem] tracking-wide text-white/50">
          &copy; {new Date().getFullYear()} Gallery. {t("rights")}.
        </p>
      </div>
    </footer>
  );
}
