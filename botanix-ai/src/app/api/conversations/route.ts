import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";

export const GET = route(async () => {
  const user = await requireUser();
  const conversations = await db.conversation.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 30, select: { id: true, title: true, updatedAt: true } });
  return NextResponse.json({ conversations });
});
