"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateProfile({ name, imageUrl }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const data = {};
  if (typeof name === "string") data.name = name.trim();
  if (typeof imageUrl === "string") data.imageUrl = imageUrl.trim();

  const updated = await db.user.update({
    where: { id: user.id },
    data,
  });

  revalidatePath("/dashboard/settings");
  return { success: true, data: updated };
}

export async function completeOnboarding({ name, preferences }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const data = {
    onboardingCompleted: true,
  };
  
  if (typeof name === "string" && name.trim()) {
    data.name = name.trim();
  }
  
  if (Array.isArray(preferences) && preferences.length > 0) {
    data.onboardingPreferences = JSON.stringify(preferences);
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true, data: updated };
}

export async function checkOnboardingStatus() {
  const user = await checkUser();
  if (!user) return { completed: false };
  return { completed: user.onboardingCompleted || false };
}

