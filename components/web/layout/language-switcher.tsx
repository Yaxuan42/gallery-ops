"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: "zh" | "en") {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLocale("zh")}
        className={`px-1.5 py-0.5 transition-colors duration-300 ${
          locale === "zh"
            ? "font-medium text-[var(--gallery-charcoal)]"
            : "text-[var(--gallery-warm-gray)] hover:text-[var(--gallery-charcoal)]"
        }`}
      >
        ZH
      </button>
      <span className="text-[var(--gallery-warm-gray)]">/</span>
      <button
        onClick={() => switchLocale("en")}
        className={`px-1.5 py-0.5 transition-colors duration-300 ${
          locale === "en"
            ? "font-medium text-[var(--gallery-charcoal)]"
            : "text-[var(--gallery-warm-gray)] hover:text-[var(--gallery-charcoal)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
