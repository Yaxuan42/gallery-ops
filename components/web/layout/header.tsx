"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { Menu, X, ChevronDown } from "lucide-react";
import { DESIGNER_SLUG_MAP, DESIGNER_DISPLAY_NAMES } from "@/lib/designers";

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [designerDropdownOpen, setDesignerDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const designerSlugs = Object.keys(DESIGNER_SLUG_MAP);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-[var(--gallery-border)] backdrop-blur-[15px]" : "bg-transparent"
      }`}
      style={
        scrolled
          ? {
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(250,250,250,0.92), rgba(250,250,250,0.85))",
              boxShadow: "0 1px 8px rgba(0, 0, 0, 0.04)",
            }
          : undefined
      }
    >
      <nav className="gallery-container flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link
          href="/"
          className="gallery-heading text-[1.8rem] font-black tracking-wide text-[var(--gallery-charcoal)]"
        >
          Gallery
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/collection"
            className="nav-link-underline text-[0.95rem] font-normal text-[var(--gallery-charcoal)] transition-colors duration-300 hover:text-[var(--gallery-brown)]"
          >
            {t("collection")}
          </Link>

          {/* Designers Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDesignerDropdownOpen(true)}
            onMouseLeave={() => setDesignerDropdownOpen(false)}
          >
            <button className="nav-link-underline flex items-center gap-1 text-[0.95rem] font-normal text-[var(--gallery-charcoal)] transition-colors duration-300 hover:text-[var(--gallery-brown)]">
              {t("designers")}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${designerDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {designerDropdownOpen && (
              <div className="absolute top-full left-0 pt-2">
                <div className="gallery-dropdown-enter min-w-[220px] rounded-xl border border-[var(--gallery-border-light)] bg-white/95 py-2 shadow-lg backdrop-blur-[15px]">
                  {designerSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={`/designer/${slug}`}
                      className="block px-4 py-2.5 text-sm text-[var(--gallery-charcoal)] transition-colors duration-200 hover:bg-[rgba(139,69,19,0.03)] hover:text-[var(--gallery-brown)]"
                      onClick={() => setDesignerDropdownOpen(false)}
                    >
                      {DESIGNER_DISPLAY_NAMES[slug]?.en || slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="nav-link-underline text-[0.95rem] font-normal text-[var(--gallery-charcoal)] transition-colors duration-300 hover:text-[var(--gallery-brown)]"
          >
            {t("about")}
          </Link>

          <Link
            href="/contact"
            className="nav-link-underline text-[0.95rem] font-normal text-[var(--gallery-charcoal)] transition-colors duration-300 hover:text-[var(--gallery-brown)]"
          >
            {t("contact")}
          </Link>

          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[var(--gallery-charcoal)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--gallery-border)] bg-[var(--gallery-page-bg)]/95 backdrop-blur-[10px] md:hidden">
          <div className="gallery-container flex flex-col gap-1 py-4">
            <Link
              href="/collection"
              className="flex min-h-[44px] items-center text-base text-[var(--gallery-charcoal)] transition-colors hover:text-[var(--gallery-brown)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("collection")}
            </Link>

            <div>
              <span className="flex min-h-[44px] items-center text-base font-medium text-[var(--gallery-charcoal)]">
                {t("designers")}
              </span>
              <div className="ml-4 flex flex-col">
                {designerSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/designer/${slug}`}
                    className="flex min-h-[44px] items-center text-sm text-[var(--gallery-text-secondary)] transition-colors hover:text-[var(--gallery-brown)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {DESIGNER_DISPLAY_NAMES[slug]?.en || slug}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              className="flex min-h-[44px] items-center text-base text-[var(--gallery-charcoal)] transition-colors hover:text-[var(--gallery-brown)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("about")}
            </Link>

            <Link
              href="/contact"
              className="flex min-h-[44px] items-center text-base text-[var(--gallery-charcoal)] transition-colors hover:text-[var(--gallery-brown)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
