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

export async function checkOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { onboardingCompleted: false };
  }
  
  try {
    const user = await checkUser();
    return { 
      onboardingCompleted: user?.onboardingCompleted || false 
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return { onboardingCompleted: false };
  }
}

export async function updateProfile({ name, imageUrl }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    const user = await checkUser();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const data = {};
    if (typeof name === "string") data.name = name.trim();
    if (typeof imageUrl === "string") data.imageUrl = imageUrl.trim();

    const updated = await db.user.update({
      where: { id: user.id },
      data,
    });

    revalidatePath("/dashboard/settings");
    
    // Serialize the response - convert Date objects to ISO strings
    return { 
      success: true, 
      data: {
        id: updated.id,
        name: updated.name,
        imageUrl: updated.imageUrl,
        email: updated.email,
        createdAt: updated.createdAt?.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      }
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update profile" 
    };
  }
}

export async function completeOnboarding({ name, preferences }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in to continue." 
      };
    }

    const user = await checkUser();
    if (!user) {
      return { 
        success: false, 
        error: "User not found. Please try signing in again." 
      };
    }

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
    
    // Serialize the response - convert Date objects to ISO strings
    return { 
      success: true, 
      data: {
        id: updated.id,
        name: updated.name,
        onboardingCompleted: updated.onboardingCompleted,
        createdAt: updated.createdAt?.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      }
    };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    
    // Return a user-friendly error message
    const errorMessage = error.message || "Failed to complete onboarding. Please try again.";
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

