"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

interface ImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageUploaderProps {
  entity: string;
  entityId: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ entity, entityId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      const newImages = [...images];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entity", entity);
        formData.append("entityId", entityId);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          newImages.push({
            url: data.url,
            isPrimary: newImages.length === 0,
            sortOrder: newImages.length,
          });
        }
      }

      onChange(newImages);
      setUploading(false);
    },
    [entity, entityId, images, onChange],
  );

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, isPrimary: i === index }));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-[#e8eaed] p-6 text-center transition-colors hover:border-[#1a73e8]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = () => input.files && handleUpload(input.files);
          input.click();
        }}
      >
        <Upload className="mx-auto mb-2 text-[#9aa0a6]" size={24} />
        <p className="text-sm text-[#5f6368]">
          {uploading ? "上传中..." : "点击或拖拽上传图片 (最大 10MB)"}
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-lg border ${img.isPrimary ? "border-[#1a73e8] ring-2 ring-[#1a73e8]/20" : "border-[#e8eaed]"}`}
            >
              <img
                src={img.url.replace("-full.", "-thumb.")}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isPrimary && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPrimary(i)}
                    className="text-xs"
                  >
                    设为主图
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(i)}
                  className="text-xs"
                >
                  <X size={14} />
                </Button>
              </div>
              {img.isPrimary && (
                <span className="absolute top-1 left-1 rounded bg-[#1a73e8] px-1.5 py-0.5 text-[10px] text-white">
                  主图
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
