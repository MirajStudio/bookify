"use server";

import { revalidatePath } from "next/cache";
import { availability, users } from "@/lib/collections";
import { availabilityFormSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";
import type { AvailabilityDoc } from "@/lib/types";

export async function saveAvailability(formData: FormData) {
  const session = await requireAdmin();
  const parsed = availabilityFormSchema.parse(JSON.parse(String(formData.get("payload"))));
  const user = await users.findOne({ id: session.user.id });
  if (!user) throw new Error("User missing");
  await availability.updateOne(
    { userId: user.id },
    {
      ...parsed,
      weeklyHours: parsed.weeklyHours as AvailabilityDoc["weeklyHours"],
      userId: user.id,
      updatedAt: new Date().toISOString(),
    } as any,
    { upsert: true },
  );
  revalidatePath("/availability");
}
