import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { isSignedIn, userId } = await auth();

  console.log("Middleware auth:", {
    path: req.url,
    isSignedIn,
    userId,
    protected: isProtectedRoute(req),
  });

  if (isProtectedRoute(req) && !isSignedIn) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    console.log("Redirecting to sign-in:", signInUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|api/inngest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
