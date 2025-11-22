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

// For now, products will be stored client-side in localStorage
// In the future, you can add a Product model to the database
export async function getUserProducts() {
  try {
    const user = await getCurrentUser();
    // Return empty array for now - products will be stored client-side
    // In production, you'd fetch from database:
    // return await db.product.findMany({ where: { userId: user.id } });
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

