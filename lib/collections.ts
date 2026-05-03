import { db } from "./db";
import type {
  UserDoc,
  IntegrationDoc,
  EventTypeDoc,
  AvailabilityDoc,
  BookingDoc,
} from "./types";

// ── users ────────────────────────────────────────────────────────────────────

export const users = {
  findOne: async (match: Partial<UserDoc>) => {
    let q = db.from("users").select("*");
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    const { data } = await q.single();
    return data as UserDoc | null;
  },
  insertOne: async (doc: UserDoc) => {
    await db.from("users").insert(doc);
  },
  updateOne: async (match: Partial<UserDoc>, update: Partial<UserDoc>) => {
    let q = db.from("users").update(update);
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    await q;
  },
};

// ── integrations ─────────────────────────────────────────────────────────────

export const integrations = {
  findOne: async (match: Partial<IntegrationDoc>) => {
    let q = db.from("integrations").select("*");
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
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
      let q = db.from("integrations").update(update);
      for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
      await q;
    }
  },
  deleteOne: async (match: Partial<IntegrationDoc>) => {
    let q = db.from("integrations").delete();
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    await q;
  },
};

// ── eventTypes ───────────────────────────────────────────────────────────────

export const eventTypes = {
  findOne: async (match: Partial<EventTypeDoc>) => {
    let q = db.from("event_types").select("*");
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
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
    let q = db.from("event_types").update(update);
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    await q;
  },
  deleteOne: async (match: Partial<EventTypeDoc>) => {
    let q = db.from("event_types").delete();
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    await q;
  },
};

// ── availability ─────────────────────────────────────────────────────────────

export const availability = {
  findOne: async (match: Partial<AvailabilityDoc>) => {
    let q = db.from("availability").select("*");
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
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
      let q = db.from("availability").update(update);
      for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
      await q;
    }
  },
};

// ── bookings ─────────────────────────────────────────────────────────────────

export const bookings = {
  findOne: async (match: Partial<BookingDoc>) => {
    let q = db.from("bookings").select("*");
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    const { data } = await q.maybeSingle();
    return data as BookingDoc | null;
  },
  insertOne: async (doc: BookingDoc) => {
    const { error } = await db.from("bookings").insert(doc);
    if (error) throw new Error(error.message);
  },
  updateOne: async (match: Partial<BookingDoc>, update: Partial<BookingDoc>) => {
    let q = db.from("bookings").update(update);
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    await q;
  },
  countDocuments: async (match: Record<string, unknown>) => {
    let q = db.from("bookings").select("*", { count: "exact", head: true });
    for (const [k, v] of Object.entries(match)) {
      if (typeof v === "object" && v !== null) {
        const range = v as Record<string, unknown>;
        if (range.$gte) q = q.gte(k, range.$gte);
        if (range.$lt) q = q.lt(k, range.$lt);
      } else {
        q = q.eq(k, v);
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
