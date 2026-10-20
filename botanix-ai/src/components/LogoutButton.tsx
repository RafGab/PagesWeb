"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useI18n } from "./i18n";

export function LogoutButton() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-ghost !px-3 !py-2 text-sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{t.nav.logout}</span>
    </button>
  );
}
