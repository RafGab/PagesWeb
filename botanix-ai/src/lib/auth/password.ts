import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// Comparación ficticia para igualar tiempos cuando el email no existe (evita enumeración de cuentas).
let dummyHash: Promise<string> | null = null;
export async function burnPasswordCheck(plain: string) {
  dummyHash ??= bcrypt.hash("botanix-dummy-password", ROUNDS);
  await bcrypt.compare(plain, await dummyHash);
  return false;
}
