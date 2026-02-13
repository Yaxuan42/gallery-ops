"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HeroSlide = {
  id: string;
  imageUrl: string;
  titleZh: string | null;
  titleEn: string | null;
  linkUrl: string | null;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  // Fallback when no slides
  if (!slides || slides.length === 0) {
    return (
      <section className="relative flex h-screen items-center justify-center bg-[var(--gallery-charcoal)]">
        <div className="text-center">
          <h1
            className="mb-6 text-4xl font-semibold text-white md:text-6xl"
            style={{ fontFamily: "var(--font-gallery-heading)" }}
          >
            Gallery
          </h1>
          <Link
            href="/collection"
            className="inline-block border border-white px-8 py-3 text-sm tracking-wider text-white uppercase transition-colors duration-300 hover:bg-white hover:text-[var(--gallery-charcoal)]"
          >
            {t("heroButton")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide) => {
            const title = locale === "zh" ? slide.titleZh : slide.titleEn;
            return (
              <div key={slide.id} className="relative h-full min-w-0 flex-[0_0_100%]">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Content */}
                <div className="gallery-container relative flex h-full items-center justify-center">
                  <div className="max-w-3xl text-center">
                    {title && (
                      <h2
                        className="gallery-fade-in mb-8 text-[2.5rem] leading-[1.1] font-bold tracking-tight text-white md:text-[3rem] lg:text-[3.5rem]"
                        style={{ fontFamily: "var(--font-gallery-heading)" }}
                      >
                        {title}
                      </h2>
                    )}
                    <Link
                      href={slide.linkUrl || "/collection"}
                      className="inline-block rounded-sm border border-white/60 px-10 py-3.5 text-sm tracking-[0.08em] text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[var(--gallery-charcoal)]"
                    >
                      {t("heroButton")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrow Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full p-2 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-[rgba(139,69,19,0.08)] hover:text-white active:scale-95 md:left-8 md:p-3"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-[rgba(139,69,19,0.08)] hover:text-white active:scale-95 md:right-8 md:p-3"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </>
      )}

      {/* Progress indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className="relative overflow-hidden rounded-full"
              style={{
                width: index === selectedIndex ? "40px" : "20px",
                height: "3px",
                background:
                  index === selectedIndex ? "rgba(139, 69, 19, 0.15)" : "rgba(255, 255, 255, 0.3)",
                transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease",
              }}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === selectedIndex && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--gallery-brown), var(--gallery-brown-light))",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
