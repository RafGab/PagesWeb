import type { PlanId } from "@prisma/client";

// Límites por plan. Los cobros no están implementados: cambiar de plan es una operación de
// administración hasta que se elija y configure una pasarela de pago.
export interface PlanLimits {
  analysesPerMonth: number; // identificaciones + diagnósticos
  gardenDesignsPerMonth: number;
  chatMessagesPerMonth: number;
  maxPhotosPerAnalysis: number;
  aiBudgetUsdPerMonth: number; // tope de coste de IA por usuario (protección de costes)
}

export const PLANS: Record<PlanId, PlanLimits & { label: { es: string; en: string } }> = {
  FREE: { label: { es: "Gratuito", en: "Free" }, analysesPerMonth: 10, gardenDesignsPerMonth: 2, chatMessagesPerMonth: 40, maxPhotosPerAnalysis: 3, aiBudgetUsdPerMonth: 2 },
  PERSONAL: { label: { es: "Personal prémium", en: "Personal premium" }, analysesPerMonth: 150, gardenDesignsPerMonth: 15, chatMessagesPerMonth: 600, maxPhotosPerAnalysis: 5, aiBudgetUsdPerMonth: 20 },
  GARDENER_PRO: { label: { es: "Jardinería profesional", en: "Professional gardener" }, analysesPerMonth: 600, gardenDesignsPerMonth: 60, chatMessagesPerMonth: 3000, maxPhotosPerAnalysis: 6, aiBudgetUsdPerMonth: 80 },
  MAINTENANCE_COMPANY: { label: { es: "Empresas de mantenimiento", en: "Maintenance companies" }, analysesPerMonth: 2000, gardenDesignsPerMonth: 150, chatMessagesPerMonth: 8000, maxPhotosPerAnalysis: 6, aiBudgetUsdPerMonth: 250 },
  NURSERY: { label: { es: "Viveros y centros de jardinería", en: "Nurseries & garden centres" }, analysesPerMonth: 2000, gardenDesignsPerMonth: 100, chatMessagesPerMonth: 8000, maxPhotosPerAnalysis: 6, aiBudgetUsdPerMonth: 250 },
  LANDSCAPER: { label: { es: "Paisajistas", en: "Landscape designers" }, analysesPerMonth: 800, gardenDesignsPerMonth: 300, chatMessagesPerMonth: 4000, maxPhotosPerAnalysis: 8, aiBudgetUsdPerMonth: 250 },
  SMALL_FARM: { label: { es: "Pequeñas explotaciones", en: "Small farms" }, analysesPerMonth: 1000, gardenDesignsPerMonth: 20, chatMessagesPerMonth: 4000, maxPhotosPerAnalysis: 6, aiBudgetUsdPerMonth: 120 },
};
