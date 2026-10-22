import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { climateForUser } from "@/lib/services/sowing";
import { whatToSowNow } from "@/lib/sowing/calendar";

const Q = z.object({ locationId: z.string().optional(), month: z.coerce.number().int().min(1).max(12).optional() });

export const GET = route(async (req) => {
  const user = await requireUser();
  const q = Q.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { location, normals, summary, forecast } = await climateForUser(user, q.locationId, true);
  const currentMonth = Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: location.timezone ?? "UTC" }).format(new Date()));
  const month = q.month ?? currentMonth;
  const lang = user.locale === "en" ? "en" : "es";
  const result = whatToSowNow(normals.months, summary, location.latitude, month, { lang, forecast: month === currentMonth ? forecast : null, experience: user.experience });
  return NextResponse.json({ location, summary, normals, forecast, ...result });
});
