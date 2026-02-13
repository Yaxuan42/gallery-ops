"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[var(--gallery-light-gray)]">
        <span className="text-[var(--gallery-warm-gray)]">No image</span>
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--gallery-light-gray)]"
        style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <Image
          src={mainImage.url}
          alt={mainImage.alt || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className="relative shrink-0 overflow-hidden border-2 transition-all duration-200"
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "8px",
                borderColor: index === selectedIndex ? "var(--gallery-brown)" : "transparent",
                opacity: index === selectedIndex ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (index !== selectedIndex) (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) (e.currentTarget as HTMLElement).style.opacity = "0.7";
              }}
            >
              <Image
                src={image.url}
                alt={image.alt || ""}
                fill
                className="object-cover"
                sizes="55px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
