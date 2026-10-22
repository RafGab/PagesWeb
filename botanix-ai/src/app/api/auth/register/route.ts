import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { clientIp, enforceRateLimit, route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10).max(200),
  name: z.string().trim().max(80).optional(),
  locale: z.enum(["es", "en"]).default("es"),
  acceptTerms: z.literal(true),
  imageConsent: z.boolean().default(false),
});

export const POST = route(async (req) => {
  enforceRateLimit(`register:${clientIp(req)}`, env().RATE_LIMIT_REGISTER_PER_HOUR, 60 * 60_000);
  const body = Body.parse(await req.json());
  const exists = await db.user.findUnique({ where: { email: body.email } });
  if (exists) throw new AppError("CONFLICT", "Ya existe una cuenta con ese correo.");
  const user = await db.user.create({
    data: {
      email: body.email,
      passwordHash: await hashPassword(body.password),
      name: body.name || null,
      locale: body.locale,
      termsAcceptedAt: new Date(),
      imageConsentAt: body.imageConsent ? new Date() : null,
    },
  });
  await createSession(user.id, req.headers.get("user-agent"));
  return NextResponse.json({ ok: true }, { status: 201 });
});
