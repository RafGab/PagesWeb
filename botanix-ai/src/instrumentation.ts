// Se ejecuta una vez al arrancar el servidor. Programa la limpieza diaria de fotos caducadas
// dentro del propio proceso (en Render, un cron job no puede acceder al disco del servicio web).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  const { db } = await import("@/lib/db");
  const { runCleanup } = await import("@/lib/services/cleanup");
  const run = () =>
    runCleanup(db, process.env.STORAGE_LOCAL_DIR ?? "./storage")
      .then((r) => console.log(`[botanix] limpieza: ${r.photos} fotos y ${r.sessions} sesiones eliminadas`))
      .catch((e) => console.error("[botanix] fallo en la limpieza:", e instanceof Error ? e.message : "desconocido"));
  setTimeout(run, 60_000);
  setInterval(run, 24 * 60 * 60_000).unref();
}
