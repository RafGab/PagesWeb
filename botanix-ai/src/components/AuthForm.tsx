"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "./api";
import { useI18n } from "./i18n";
import { Notice } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      if (mode === "register") {
        await api("/api/auth/register", {
          method: "POST",
          json: { email: f.get("email"), password: f.get("password"), name: f.get("name") || undefined, locale, acceptTerms: f.get("acceptTerms") === "on", imageConsent: f.get("imageConsent") === "on" },
        });
      } else {
        await api("/api/auth/login", { method: "POST", json: { email: f.get("email"), password: f.get("password") } });
      }
      const next = params.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : mode === "register" ? "/profile?welcome=1" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? (err.code === "NETWORK" ? t.errors.network : err.message) : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md fade-in">
      <h1 className="mb-6 text-3xl font-semibold">{mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}</h1>
      <form onSubmit={onSubmit} className="card space-y-4 p-6" noValidate={false}>
        {mode === "register" && (
          <div>
            <label className="label" htmlFor="name">{t.auth.name}</label>
            <input id="name" name="name" className="input" autoComplete="name" maxLength={80} />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">{t.auth.email}</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">{t.auth.password}</label>
          <input id="password" name="password" type="password" required minLength={mode === "register" ? 10 : 1} className="input" autoComplete={mode === "register" ? "new-password" : "current-password"} aria-describedby={mode === "register" ? "pw-hint" : undefined} />
          {mode === "register" && <p id="pw-hint" className="muted mt-1 text-xs">{t.auth.passwordHint}</p>}
        </div>
        {mode === "register" && (
          <>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="acceptTerms" required className="mt-1 h-4 w-4" />
              <span>{t.auth.acceptTerms} (<Link href="/privacy" className="underline" target="_blank">{t.nav.privacy}</Link>)</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="imageConsent" className="mt-1 h-4 w-4" />
              <span>{t.auth.imageConsent}</span>
            </label>
          </>
        )}
        {error && <Notice tone="danger">{error}</Notice>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>{busy ? t.common.loading : mode === "login" ? t.auth.submitLogin : t.auth.submitRegister}</button>
        <p className="text-center text-sm muted">
          {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
          <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-[var(--accent)] underline">{mode === "login" ? t.nav.register : t.nav.login}</Link>
        </p>
      </form>
    </div>
  );
}
