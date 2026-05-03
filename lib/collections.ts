import { db } from "./db";
import type {
  UserDoc,
  IntegrationDoc,
  EventTypeDoc,
  AvailabilityDoc,
  BookingDoc,
} from "./types";

// Helper: apply match filters, using .is(k, null) for null values
function applyMatch(q: any, match: Record<string, unknown>): any {
  for (const [k, v] of Object.entries(match)) {
    if (v === null || v === undefined) {
      q = q.is(k, null);
    } else {
      q = q.eq(k, v);
    }
  }
  return q;
}

// ── users ────────────────────────────────────────────────────────────────────

export const users = {
  findOne: async (match: Partial<UserDoc>) => {
    const q = applyMatch(db.from("users").select("*"), match as Record<string, unknown>);
    const { data } = await q.maybeSingle();
    return data as UserDoc | null;
  },
  insertOne: async (doc: UserDoc) => {
    await db.from("users").insert(doc);
  },
  updateOne: async (match: Partial<UserDoc>, update: Partial<UserDoc>) => {
    const q = applyMatch(db.from("users").update(update), match as Record<string, unknown>);
    await q;
  },
};

// ── integrations ─────────────────────────────────────────────────────────────

export const integrations = {
  findOne: async (match: Partial<IntegrationDoc>) => {
    const q = applyMatch(db.from("integrations").select("*"), match as Record<string, unknown>);
    const { data } = await q.maybeSingle();
    return data as IntegrationDoc | null;
  },
  updateOne: async (
    match: Partial<IntegrationDoc>,
    update: Partial<IntegrationDoc>,
    opts?: { upsert?: boolean },
  ) => {
    if (opts?.upsert) {
      const merged = { ...match, ...update };
      await db.from("integrations").upsert(merged);
    } else {
      const q = applyMatch(db.from("integrations").update(update), match as Record<string, unknown>);
      await q;
    }
  },
  deleteOne: async (match: Partial<IntegrationDoc>) => {
    const q = applyMatch(db.from("integrations").delete(), match as Record<string, unknown>);
    await q;
  },
};

// ── eventTypes ───────────────────────────────────────────────────────────────

export const eventTypes = {
  findOne: async (match: Partial<EventTypeDoc>) => {
    const q = applyMatch(db.from("event_types").select("*"), match as Record<string, unknown>);
    const { data } = await q.maybeSingle();
    return data as EventTypeDoc | null;
  },
  find: () => ({
    sort: (_field: string, dir: number) => ({
      limit: (n: number) => ({
        toArray: async () => {
          const { data } = await db
            .from("event_types")
            .select("*")
            .order("position", { ascending: dir === 1 })
            .limit(n);
          return (data ?? []) as EventTypeDoc[];
        },
      }),
    }),
  }),
  insertOne: async (doc: EventTypeDoc) => {
    await db.from("event_types").insert(doc);
  },
  updateOne: async (match: Partial<EventTypeDoc>, update: Partial<EventTypeDoc>) => {
    const q = applyMatch(db.from("event_types").update(update), match as Record<string, unknown>);
    await q;
  },
  deleteOne: async (match: Partial<EventTypeDoc>) => {
    const q = applyMatch(db.from("event_types").delete(), match as Record<string, unknown>);
    await q;
  },
};

// ── availability ─────────────────────────────────────────────────────────────

export const availability = {
  findOne: async (match: Partial<AvailabilityDoc>) => {
    const q = applyMatch(db.from("availability").select("*"), match as Record<string, unknown>);
    const { data } = await q.maybeSingle();
    return data as AvailabilityDoc | null;
  },
  insertOne: async (doc: AvailabilityDoc) => {
    await db.from("availability").insert(doc);
  },
  updateOne: async (
    match: Partial<AvailabilityDoc>,
    update: Partial<AvailabilityDoc>,
    opts?: { upsert?: boolean },
  ) => {
    if (opts?.upsert) {
      const merged = { ...match, ...update };
      await db.from("availability").upsert(merged);
    } else {
      const q = applyMatch(db.from("availability").update(update), match as Record<string, unknown>);
      await q;
    }
  },
};

// ── bookings ─────────────────────────────────────────────────────────────────

export const bookings = {
  findOne: async (match: Partial<BookingDoc>) => {
    const q = applyMatch(db.from("bookings").select("*"), match as Record<string, unknown>);
    const { data } = await q.maybeSingle();
    return data as BookingDoc | null;
  },
  insertOne: async (doc: BookingDoc) => {
    const { error } = await db.from("bookings").insert(doc);
    if (error) throw new Error(error.message);
  },
  updateOne: async (match: Partial<BookingDoc>, update: Partial<BookingDoc>) => {
    const q = applyMatch(db.from("bookings").update(update), match as Record<string, unknown>);
    await q;
  },
  countDocuments: async (match: Record<string, unknown>) => {
    let q = db.from("bookings").select("*", { count: "exact", head: true });
    for (const [k, v] of Object.entries(match)) {
      if (typeof v === "object" && v !== null) {
        const range = v as Record<string, unknown>;
        if (range.$gte) q = q.gte(k, range.$gte as string);
        if (range.$lt) q = q.lt(k, range.$lt as string);
      } else if (v === null || v === undefined) {
        q = q.is(k, null);
      } else {
        q = q.eq(k, v as string);
      }
    }
    const { count } = await q;
    return count ?? 0;
  },
};

// ── ensureIndexes (no-op for Supabase — indexes live in SQL migrations) ───────

export async function ensureIndexes() {
  // indexes are defined in Supabase SQL editor, nothing to do at runtime
}
