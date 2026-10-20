import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { burnPasswordCheck, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { clientIp, enforceRateLimit, route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

const Body = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export const POST = route(async (req) => {
  const body = Body.parse(await req.json());
  enforceRateLimit(`login:${clientIp(req)}`, 20, 15 * 60_000);
  enforceRateLimit(`login-email:${body.email}`, 8, 15 * 60_000);
  const user = await db.user.findUnique({ where: { email: body.email } });
  const ok = user ? await verifyPassword(body.password, user.passwordHash) : await burnPasswordCheck(body.password);
  if (!user || !ok) throw new AppError("UNAUTHORIZED", "Correo o contraseña incorrectos.");
  await createSession(user.id, req.headers.get("user-agent"));
  return NextResponse.json({ ok: true });
});
