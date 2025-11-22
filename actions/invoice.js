"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

// For now, we'll store invoices in localStorage on the client side
// In the future, you can add an Invoice model to the database
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");
  return user;
}

// This is a placeholder - in a real app, you'd save invoices to the database
// For now, we'll handle invoice storage on the client side
export async function getUserInvoices() {
  try {
    const user = await getCurrentUser();
    // Return empty array for now - invoices will be stored client-side
    // In production, you'd fetch from database:
    // return await db.invoice.findMany({ where: { userId: user.id } });
    return [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

