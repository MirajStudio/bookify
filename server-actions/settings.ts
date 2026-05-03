"use server";

import { revalidatePath } from "next/cache";
import { users } from "@/lib/collections";
import { profileFormSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";

export async function saveProfile(formData: FormData) {
  const session = await requireAdmin();
  const parsed = profileFormSchema.parse({
    name: String(formData.get("name") ?? ""),
    bio: formData.get("bio") ? String(formData.get("bio")) : null,
    defaultTimezone: String(formData.get("defaultTimezone") ?? "UTC"),
  });
  await users.updateOne(
    { id: session.user.id },
    { ...parsed, updatedAt: new Date().toISOString() } as any,
  );
  revalidatePath("/settings");
}
