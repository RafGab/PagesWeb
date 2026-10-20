// Entorno común de pruebas: base de datos de pruebas y proveedores de DATOS DE PRUEBA.
import path from "node:path";
import os from "node:os";

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://botanix:botanix@localhost:5432/botanix_test?schema=public";
process.env.APP_URL = "http://localhost:3000";
process.env.AI_PROVIDER = "fixture";
process.env.CLIMATE_PROVIDER = "fixture";
process.env.TAXONOMY_PROVIDER = "gbif";
process.env.STORAGE_LOCAL_DIR = path.join(os.tmpdir(), `botanix-test-storage-${process.pid}`);
