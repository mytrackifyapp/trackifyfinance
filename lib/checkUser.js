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
      // Only log in development - this is expected in some edge cases
      if (process.env.NODE_ENV === "development") {
        console.error("User has no email address");
      }
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
    // If it's a unique constraint error (race condition), try to fetch the user again
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
        // Only log retry errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Error retrying user fetch:", retryError.message || retryError);
        }
      }
    } else {
      // Only log unexpected errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error in checkUser:", error.message || error);
      }
    }
    // Return null instead of undefined to be explicit
    return null;
  }
};
