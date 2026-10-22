// Ejecución manual de la limpieza (la app también la ejecuta sola cada 24 h).
import { PrismaClient } from "@prisma/client";
import { runCleanup } from "../src/lib/services/cleanup";

const db = new PrismaClient();
runCleanup(db, process.env.STORAGE_LOCAL_DIR ?? "./storage")
  .then((r) => console.log(`Fotos eliminadas: ${r.photos} · Sesiones caducadas eliminadas: ${r.sessions}`))
  .finally(() => db.$disconnect());
