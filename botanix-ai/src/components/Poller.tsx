"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "./i18n";
import { Spinner } from "./ui";

/** Consulta el estado de un análisis en segundo plano y refresca la página al terminar. */
export function Poller({ analysisId, label }: { analysisId: string; label?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let stop = false;
    let delay = 2000;
    const started = Date.now();
    async function tick() {
      if (stop) return;
      try {
        const r = await fetch(`/api/analyses/${analysisId}`, { cache: "no-store" });
        setOffline(false);
        if (r.ok) {
          const { analysis } = await r.json();
          if (!["PENDING", "PROCESSING"].includes(analysis.status)) {
            router.refresh();
            return;
          }
        }
      } catch {
        setOffline(true);
      }
      setSeconds(Math.round((Date.now() - started) / 1000));
      delay = Math.min(delay * 1.3, 8000);
      setTimeout(tick, delay);
    }
    const id = setTimeout(tick, delay);
    return () => {
      stop = true;
      clearTimeout(id);
    };
  }, [analysisId, router]);
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
      <Spinner label={label ?? t.common.analyzing} />
      <p className="muted text-sm">{seconds > 0 ? `${seconds} s` : ""}</p>
      {offline && <p className="text-sm text-[var(--color-berry-600)]">{t.errors.network}</p>}
    </div>
  );
}
