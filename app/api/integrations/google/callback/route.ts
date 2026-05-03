import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { integrations } from "@/lib/collections";
import { getConnection, listCalendars } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userId = session.user.id;
  const integ = await integrations.findOne({ userId, provider: "google_calendar" });
  if (!integ) {
    return NextResponse.redirect(new URL("/settings?error=no_connection", req.url));
  }

  const { status } = await getConnection(integ.composioConnectionId);
  if (status !== "ACTIVE") {
    await integrations.updateOne(
      { userId, provider: "google_calendar" },
      { status: status as any, lastCheckedAt: new Date().toISOString() },
    );
    return NextResponse.redirect(new URL("/settings?error=connection_failed", req.url));
  }

  const cals = await listCalendars(userId);
  const primary = cals.find((c) => c.primary) ?? cals[0];

  await integrations.updateOne(
    { userId, provider: "google_calendar" },
    {
      status: "ACTIVE",
      calendarId: primary?.id ?? "primary",
      calendarSummary: primary?.summary ?? "Primary",
      connectedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    } as any,
  );

  return NextResponse.redirect(new URL("/settings?connected=1", req.url));
}
