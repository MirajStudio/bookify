import { users, availability, ensureIndexes } from "./collections";
import { env } from "./env";
import { randomUUID } from "crypto";

let bootstrapped = false;

export async function bootstrap() {
  if (bootstrapped) return;
  await ensureIndexes();

  const existing = await users.findOne({ email: env().ADMIN_EMAIL });
  if (!existing) {
    const userId = randomUUID();

    await users.insertOne({
      id: userId,
      email: env().ADMIN_EMAIL,
      name: "Admin",
      bio: null,
      defaultTimezone: "UTC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    await availability.insertOne({
      id: randomUUID(),
      userId,
      timezone: "UTC",
      weeklyHours: [
        { dayOfWeek: 0, intervals: [] },
        { dayOfWeek: 1, intervals: [{ start: "09:00", end: "17:00" }] },
        { dayOfWeek: 2, intervals: [{ start: "09:00", end: "17:00" }] },
        { dayOfWeek: 3, intervals: [{ start: "09:00", end: "17:00" }] },
        { dayOfWeek: 4, intervals: [{ start: "09:00", end: "17:00" }] },
        { dayOfWeek: 5, intervals: [{ start: "09:00", end: "17:00" }] },
        { dayOfWeek: 6, intervals: [] },
      ],
      dateOverrides: [],
      updatedAt: new Date().toISOString(),
    } as any);
  }

  bootstrapped = true;
}
