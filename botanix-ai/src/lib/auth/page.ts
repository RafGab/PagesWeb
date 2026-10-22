import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "./session";

export async function requirePageUser(next?: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}
