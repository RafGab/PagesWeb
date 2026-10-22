"use client";
import { createContext, useContext } from "react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const Ctx = createContext<{ t: Dictionary; locale: Locale } | null>(null);

export function I18nProvider({ t, locale, children }: { t: Dictionary; locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ t, locale }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n fuera de I18nProvider");
  return v;
}
