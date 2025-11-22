import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // First, try to find existing user
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // User doesn't exist, create them
    // Handle case where email might be missing or firstName/lastName might be null
    const name = user.firstName || user.lastName 
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() 
      : user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
    
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.error("User has no email address");
      return null;
    }

    // Use upsert to handle race conditions where user might be created between check and create
    loggedInUser = await db.user.upsert({
      where: {
        clerkUserId: user.id,
      },
      update: {
        // Update name and image if they changed in Clerk
        name: name || undefined,
        imageUrl: user.imageUrl || undefined,
      },
      create: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
        onboardingCompleted: false, // Explicitly set to false for new users
      },
    });

    return loggedInUser;
  } catch (error) {
    // Log the full error for debugging
    console.error("Error in checkUser:", error);
    // If it's a unique constraint error, try to fetch the user again (race condition)
    if (error.code === "P2002" || error.message?.includes("Unique constraint")) {
      try {
        const existingUser = await db.user.findUnique({
          where: {
            clerkUserId: user.id,
          },
        });
        if (existingUser) {
          return existingUser;
        }
      } catch (retryError) {
        console.error("Error retrying user fetch:", retryError);
      }
    }
    // Return null instead of undefined to be explicit
    return null;
  }
};
