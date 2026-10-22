import "server-only";
import { cookies, headers } from "next/headers";
import { getSessionUser } from "@/lib/auth/session";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "bx_locale";

export async function getLocale(): Promise<Locale> {
  const user = await getSessionUser();
  if (user && isLocale(user.locale)) return user.locale;
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(c)) return c;
  const accept = (await headers()).get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("en") ? "en" : DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: LOCALES[locale] };
}
