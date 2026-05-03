export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { BookingsTable } from "@/components/admin/BookingsTable";
import type { BookingDoc } from "@/lib/types";

const tabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = (sp.tab ?? "upcoming") as (typeof tabs)[number]["id"];
  const now = new Date().toISOString();

  let query = db.from("bookings").select("*").limit(100);

  if (tab === "past") {
    query = query.eq("status", "confirmed").lt("start_utc", now).order("start_utc", { ascending: false });
  } else if (tab === "cancelled") {
    query = query.in("status", ["cancelled", "rescheduled"]).order("start_utc", { ascending: false });
  } else {
    // upcoming
    query = query.eq("status", "confirmed").gte("start_utc", now).order("start_utc", { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const list = (data ?? []) as BookingDoc[];

  return (
    <div className="space-y-7">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Inbox · {list.length}
        </p>
        <h1 className="text-[28px] leading-tight tracking-[-0.02em]">Bookings</h1>
      </header>

      <nav
        aria-label="Booking filters"
        className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-elevated p-1"
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <a
              key={t.id}
              href={`?tab=${t.id}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-7 items-center rounded-[5px] px-3 text-[12.5px] transition-colors duration-150 ${
                active
                  ? "bg-surface font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </a>
          );
        })}
      </nav>

      <BookingsTable bookings={list} />
    </div>
  );
}
