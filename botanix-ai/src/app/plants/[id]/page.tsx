import { notFound } from "next/navigation";
import { Leaf } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/page";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";
import { PlantDetail } from "@/components/PlantDetail";

export const metadata = { title: "Planta" };

export default async function PlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePageUser(`/plants/${id}`);
  await getDictionary();
  const plant = await db.userPlant.findFirst({
    where: { id, userId: user.id },
    include: {
      careEvents: { orderBy: { date: "desc" }, take: 100 },
      journal: { orderBy: { date: "desc" }, include: { photos: { select: { photoId: true } } } },
      reminders: { orderBy: { nextDueAt: "asc" } },
      diagnoses: { orderBy: { createdAt: "desc" }, include: { analysis: { select: { id: true, createdAt: true } } } },
    },
  });
  if (!plant) notFound();
  const plain = JSON.parse(JSON.stringify(plant));
  return (
    <div className="fade-in">
      <PageHeader title={plant.nickname} intro={[plant.commonName, plant.scientificName].filter(Boolean).join(" · ") || undefined} icon={<Leaf className="h-6 w-6" aria-hidden />} />
      <PlantDetail plant={plain} />
    </div>
  );
}
