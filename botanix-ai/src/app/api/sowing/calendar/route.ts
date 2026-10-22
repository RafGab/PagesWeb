import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { climateForUser } from "@/lib/services/sowing";
import { buildCalendar } from "@/lib/sowing/calendar";

export const GET = route(async (req) => {
  const user = await requireUser();
  const locationId = new URL(req.url).searchParams.get("locationId");
  const { location, normals, summary } = await climateForUser(user, locationId);
  const calendar = buildCalendar(normals.months, summary, location.latitude, user.locale === "en" ? "en" : "es");
  return NextResponse.json({ location, summary, normals, calendar });
});
