"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const itemFromUrl = searchParams.get("item");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: itemFromUrl ? "Item" : "General",
    itemRef: itemFromUrl || "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t("required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General",
          itemRef: "",
          message: "",
        });
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const inputBase = "gallery-input w-full px-4 py-3 text-sm text-[var(--gallery-charcoal)]";
  const inputError = "!border-red-400";

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-base text-green-800">{t("success")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl bg-white p-6 md:p-8"
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)" }}
    >
      {/* Name */}
      <div>
        <label className="mb-2 block text-sm text-[var(--gallery-text-secondary)]">
          {t("name")}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm text-[var(--gallery-text-secondary)]">
          {t("email")} *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`${inputBase} ${errors.email ? inputError : ""}`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm text-[var(--gallery-text-secondary)]">
          {t("phone")}
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Subject */}
      <div>
        <label className="mb-2 block text-sm text-[var(--gallery-text-secondary)]">
          {t("subject")}
        </label>
        <select
          value={formData.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          className={inputBase}
        >
          <option value="General">{t("subjectGeneral")}</option>
          <option value="Item">{t("subjectItem")}</option>
          <option value="Visit">{t("subjectVisit")}</option>
        </select>
      </div>

      {/* Item Reference (shown when subject is Item) */}
      {formData.subject === "Item" && (
        <div>
          <label className="mb-2 block text-sm text-[var(--gallery-text-secondary)]">
            {t("itemRef")}
          </label>
          <input
            type="text"
            value={formData.itemRef}
            onChange={(e) => updateField("itemRef", e.target.value)}
            className={inputBase}
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="mb-2 block text-sm text-[var(--gallery-text-secondary)]">
          {t("message")} *
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => updateField("message", e.target.value)}
          rows={5}
          className={`${inputBase} resize-none ${errors.message ? inputError : ""}`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
      </div>

      {/* Error message */}
      {status === "error" && <p className="text-sm text-red-500">{t("error")}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="gallery-btn-gradient w-full py-3.5 text-sm tracking-[0.08em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
