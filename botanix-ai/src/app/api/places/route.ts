import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { enforceRateLimit, route } from "@/lib/security/http";
import { climateProvider } from "@/lib/climate/service";

const Q = z.object({ q: z.string().trim().min(2).max(100), lang: z.enum(["es", "en"]).default("es") });

export const GET = route(async (req) => {
  const user = await requireUser();
  enforceRateLimit(`places:${user.id}`, 60, 60_000);
  const { q, lang } = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
  const places = await climateProvider().searchPlaces(q, lang);
  return NextResponse.json({ places });
});
