import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";

// Derecho de portabilidad (RGPD art. 20): todos los datos personales en JSON (las fotos se listan por id).
export const GET = route(async () => {
  const user = await requireUser();
  const data = await db.user.findUnique({
    where: { id: user.id },
    include: {
      locations: true,
      photos: { select: { id: true, width: true, height: true, createdAt: true, retainUntil: true } },
      analyses: { select: { id: true, kind: true, status: true, result: true, warnings: true, createdAt: true, promptVersion: true, provider: true } },
      gardens: { include: { zones: true } },
      designs: { include: { versions: true } },
      plants: { include: { careEvents: true, journal: true, reminders: true } },
      conversations: { include: { messages: true } },
      usage: true,
    },
  });
  const { passwordHash: _omit, ...safe } = data!;
  void _omit;
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), ...safe }, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="botanix-mis-datos.json"` },
  });
});
