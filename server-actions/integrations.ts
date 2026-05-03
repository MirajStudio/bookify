"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { initiateGoogleConnection, getConnection, listCalendars } from "@/lib/calendar";
import { integrations } from "@/lib/collections";
import { env } from "@/lib/env";
import { randomUUID } from "crypto";

export async function startGoogleConnect() {
  const session = await requireAdmin();
  const userId = session.user.id;
  const callbackUrl = `${env().APP_URL}/api/integrations/google/callback`;
  const { redirectUrl, connectionId } = await initiateGoogleConnection(userId, callbackUrl);

  await integrations.updateOne(
    { userId, provider: "google_calendar" },
    {
      id: randomUUID(),
      userId,
      provider: "google_calendar",
      composioUserId: userId,
      composioConnectionId: connectionId,
      status: "INITIATED",
      calendarId: "primary",
      calendarSummary: "",
      connectedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    } as any,
    { upsert: true },
  );

  redirect(redirectUrl);
}

export async function setActiveCalendar(calendarId: string, calendarSummary: string) {
  const session = await requireAdmin();
  await integrations.updateOne(
    { userId: session.user.id, provider: "google_calendar" },
    { calendarId, calendarSummary, lastCheckedAt: new Date().toISOString() } as any,
  );
}

export async function disconnectGoogle() {
  const session = await requireAdmin();
  await integrations.deleteOne({ userId: session.user.id, provider: "google_calendar" });
}
