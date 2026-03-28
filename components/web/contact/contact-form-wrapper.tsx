"use client";

import { Suspense } from "react";
import { ContactForm } from "./contact-form";

export function ContactFormWrapper() {
  return (
    <Suspense fallback={<div className="rounded-xl bg-white p-6 md:p-8 animate-pulse h-96" />}>
      <ContactForm />
    </Suspense>
  );
}