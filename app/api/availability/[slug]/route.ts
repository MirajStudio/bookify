import { NextResponse } from "next/server";
import { eventTypes, availability, integrations } from "@/lib/collections";
import { computeSlots } from "@/lib/availability";
import { ymdInTz } from "@/lib/timezone";
import { getBusyTimes } from "@/lib/calendar";
import { db } from "@/lib/db";
import type { BookingDoc } from "@/lib/types";

export const revalidate = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const evt = await eventTypes.findOne({ slug, active: true });
  if (!evt) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const integ = await integrations.findOne({ provider: "google_calendar", status: "ACTIVE" });
  if (!integ) return NextResponse.json({ error: "calendar_not_connected" }, { status: 503 });

  const avail = await availability.findOne({ userId: integ.userId });
  if (!avail) return NextResponse.json({ error: "no_availability" }, { status: 503 });

  const now = new Date();
  const horizon = new Date(now.getTime() + evt.rules.maxAdvanceDays * 24 * 3600_000);

  let busy: Array<{ start: Date; end: Date }>;
  try {
    busy = await getBusyTimes(integ.composioUserId, integ.calendarId, now, horizon, avail.timezone);
  } catch {
    return NextResponse.json({ error: "calendar_unavailable" }, { status: 503 });
  }

  const counts: Record<string, number> = {};
  if (evt.rules.maxBookingsPerDay !== null) {
    const { data } = await db
      .from("bookings")
      .select("*")
      .eq("event_type_slug", slug)
      .eq("status", "confirmed")
      .gte("start_utc", now.toISOString())
      .lt("start_utc", horizon.toISOString());

    for (const b of (data ?? []) as BookingDoc[]) {
      const k = ymdInTz(new Date(b.startUtc), avail.timezone);
      counts[k] = (counts[k] ?? 0) + 1;
    }
  }

  const slots = computeSlots({ eventType: evt, availability: avail, busy, now, bookingsPerDay: counts });

  return NextResponse.json({
    timezone: avail.timezone,
    slots: slots.map((s) => ({ startUtc: s.startUtc.toISOString(), endUtc: s.endUtc.toISOString() })),
  });
}
