import "server-only";
import type { AnalysisKind, User } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { PLANS } from "@/lib/plans";
import { costUsd } from "@/lib/ai/pricing";
import type { AiUsageInfo } from "@/lib/ai/types";

export function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function monthlyCostUsd(userId: string) {
  const agg = await db.aiUsage.aggregate({ where: { userId, createdAt: { gte: monthStart() } }, _sum: { costUsd: true } });
  return Number(agg._sum.costUsd ?? 0);
}

export async function assertWithinLimits(user: User, op: "analysis" | "garden" | "chat", kind?: AnalysisKind) {
  const plan = PLANS[user.plan];
  const since = monthStart();
  if (op === "analysis") {
    const used = await db.analysis.count({ where: { userId: user.id, kind: { in: ["IDENTIFY", "DIAGNOSE"] }, createdAt: { gte: since }, status: { notIn: ["FAILED", "NOT_CONFIGURED"] } } });
    if (used >= plan.analysesPerMonth) throw new AppError("PLAN_LIMIT", `Has alcanzado los ${plan.analysesPerMonth} análisis de este mes de tu plan.`, { kind });
  } else if (op === "garden") {
    const used = await db.analysis.count({ where: { userId: user.id, kind: "GARDEN_SPACE", createdAt: { gte: since }, status: { notIn: ["FAILED", "NOT_CONFIGURED"] } } });
    if (used >= plan.gardenDesignsPerMonth) throw new AppError("PLAN_LIMIT", `Has alcanzado los ${plan.gardenDesignsPerMonth} diseños de este mes de tu plan.`);
  } else {
    const used = await db.chatMessage.count({ where: { role: "user", createdAt: { gte: since }, conversation: { userId: user.id } } });
    if (used >= plan.chatMessagesPerMonth) throw new AppError("PLAN_LIMIT", `Has alcanzado los ${plan.chatMessagesPerMonth} mensajes de este mes de tu plan.`);
  }
  if ((await monthlyCostUsd(user.id)) >= plan.aiBudgetUsdPerMonth) {
    throw new AppError("PLAN_LIMIT", "Se ha alcanzado el tope de consumo de IA de tu plan para este mes.");
  }
}

export async function recordUsage(userId: string, operation: string, usage: AiUsageInfo, analysisId?: string) {
  const cost = costUsd(usage.model, usage.inputTokens, usage.outputTokens, usage.cacheReadTokens);
  if (cost === null && usage.provider !== "fixture") console.warn(`[botanix] sin tarifa registrada para el modelo ${usage.model}; coste guardado como 0`);
  await db.aiUsage.create({
    data: {
      userId,
      analysisId,
      operation,
      provider: usage.provider,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      costUsd: cost ?? 0,
    },
  });
}
