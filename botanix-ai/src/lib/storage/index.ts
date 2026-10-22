import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

export interface StorageDriver {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

// Claves generadas por el servidor: "<userId>/<id>.jpg". Se valida igualmente para impedir
// cualquier salida del directorio de almacenamiento.
const KEY_RE = /^[a-z0-9]{10,40}\/[a-z0-9]{10,40}\.jpg$/;

export class LocalStorage implements StorageDriver {
  constructor(private root: string) {}
  private resolve(key: string) {
    if (!KEY_RE.test(key)) throw new Error("Clave de almacenamiento no válida");
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root) + path.sep)) throw new Error("Ruta fuera del almacenamiento");
    return full;
  }
  async put(key: string, data: Buffer) {
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true, mode: 0o700 });
    await fs.writeFile(full, data, { mode: 0o600 });
  }
  async get(key: string) {
    try {
      return await fs.readFile(this.resolve(key));
    } catch {
      return null;
    }
  }
  async delete(key: string) {
    await fs.rm(this.resolve(key), { force: true });
  }
}

let driver: StorageDriver | null = null;
export function storage(): StorageDriver {
  driver ??= new LocalStorage(path.resolve(env().STORAGE_LOCAL_DIR));
  return driver;
}
