import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { route } from "@/lib/security/http";
import { AppError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await db.conversation.findFirst({ where: { id, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!conversation) throw new AppError("NOT_FOUND", "Conversación no encontrada.");
  return NextResponse.json({ conversation });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { count } = await db.conversation.deleteMany({ where: { id, userId: user.id } });
  if (!count) throw new AppError("NOT_FOUND", "Conversación no encontrada.");
  return NextResponse.json({ ok: true });
});
