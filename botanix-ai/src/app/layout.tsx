import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getDictionary } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/auth/session";
import { I18nProvider } from "@/components/i18n";
import { Logo } from "@/components/Logo";
import { DesktopNav, MobileNav } from "@/components/NavLinks";
import { LogoutButton } from "@/components/LogoutButton";
import { UserRound } from "lucide-react";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: { default: "Botanix AI", template: "%s · Botanix AI" },
  description: "Identifica plantas, diagnostica problemas, descubre qué sembrar según tu clima y diseña tu jardín.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "Botanix", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fbf9f4" }, { media: "(prefers-color-scheme: dark)", color: "#0f1a14" }],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getDictionary();
  const user = await getSessionUser();
  return (
    <html lang={locale}>
      <body className="min-h-dvh">
        <I18nProvider t={t} locale={locale}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 btn btn-primary">
            {locale === "es" ? "Saltar al contenido" : "Skip to content"}
          </a>
          <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur no-print">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
              <Link href="/" className="flex items-center gap-2.5 font-semibold">
                <Logo />
                <span className="font-[family-name:var(--font-display)] text-xl">Botanix<span className="text-[var(--color-sage-500)]"> AI</span></span>
              </Link>
              {user && <DesktopNav />}
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <Link href="/profile" className="btn btn-ghost !px-3 !py-2 text-sm" aria-label={t.nav.profile}>
                      <UserRound className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{user.name ?? t.nav.profile}</span>
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-ghost !py-2 text-sm">{t.nav.login}</Link>
                    <Link href="/register" className="btn btn-primary !py-2 text-sm">{t.nav.register}</Link>
                  </>
                )}
              </div>
            </div>
          </header>
          <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-16">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 pb-24 text-xs muted lg:pb-8 no-print">
            <p>
              Botanix AI · <Link href="/privacy" className="underline">{t.nav.privacy}</Link> · {locale === "es" ? "Los diagnósticos e identificaciones por imagen son orientativos." : "Image-based identifications and diagnoses are orientative."}
            </p>
          </footer>
          {user && <MobileNav />}
          <ServiceWorker />
        </I18nProvider>
      </body>
    </html>
  );
}
