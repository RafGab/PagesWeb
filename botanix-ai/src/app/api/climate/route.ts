import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { climateForUser } from "@/lib/services/sowing";

export const GET = route(async (req) => {
  const user = await requireUser();
  const locationId = new URL(req.url).searchParams.get("locationId");
  const { location, normals, summary, forecast } = await climateForUser(user, locationId, true);
  return NextResponse.json({ location, normals, summary, forecast });
});
