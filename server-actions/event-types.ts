"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventTypes } from "@/lib/collections";
import { eventTypeFormSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";
import type { EventTypeDoc } from "@/lib/types";

export async function createEventType(formData: FormData) {
  await requireAdmin();
  const parsed = eventTypeFormSchema.parse(JSON.parse(String(formData.get("payload"))));
  const last = await eventTypes.find().sort("position", -1).limit(1).toArray();
  const position = (last[0]?.position ?? 0) + 1;
  const doc: EventTypeDoc = {
    id: randomUUID(),
    ...parsed,
    position,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any;
  await eventTypes.insertOne(doc);
  revalidatePath("/event-types");
  redirect("/event-types");
}

export async function updateEventType(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = eventTypeFormSchema.parse(JSON.parse(String(formData.get("payload"))));
  await eventTypes.updateOne({ id }, { ...parsed, updatedAt: new Date().toISOString() } as any);
  revalidatePath("/event-types");
  redirect("/event-types");
}

export async function deleteEventType(id: string) {
  await requireAdmin();
  await eventTypes.deleteOne({ id });
  revalidatePath("/event-types");
}

export async function toggleActive(id: string, active: boolean) {
  await requireAdmin();
  await eventTypes.updateOne({ id }, { active, updatedAt: new Date().toISOString() } as any);
  revalidatePath("/event-types");
}

export async function reorderEventType(id: string, newPosition: number) {
  await requireAdmin();
  await eventTypes.updateOne(
    { id },
    { position: newPosition, updatedAt: new Date().toISOString() } as any,
  );
  revalidatePath("/event-types");
}
