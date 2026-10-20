import "server-only";
import type { User } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { getClimateContext, getForecast } from "@/lib/climate/service";
import { getLocation } from "./context";

/** Ubicación + clima de un usuario, con error claro si no hay ubicación. */
export async function climateForUser(user: User, locationId?: string | null, withForecast = false) {
  const location = await getLocation(user.id, locationId);
  if (!location) throw new AppError("VALIDATION", "Añade primero una ubicación en tu perfil.");
  const climate = await getClimateContext(location.latitude, location.longitude, location.elevationM);
  let forecast = null;
  if (withForecast) {
    try {
      forecast = await getForecast(location.latitude, location.longitude);
    } catch {
      forecast = null; // la previsión es opcional: sin ella se usan solo los promedios
    }
  }
  return { location, ...climate, forecast };
}
