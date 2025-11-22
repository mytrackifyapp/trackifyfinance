import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  
  // Extract subdomain (e.g., "my-product" from "my-product.mytrackify.com")
  const parts = hostname.split(".");
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "app.mytrackify.com";
  const mainDomainParts = mainDomain.split(".");
  
  // Extract subdomain (first part of hostname)
  const subdomain = parts.length > 0 ? parts[0] : null;
  
  // Check if this is a subdomain (has more parts than the main domain)
  // Exclude localhost, 127.0.0.1, www, api, and the main domain "app"
  const isSubdomain = parts.length > mainDomainParts.length && 
                      !hostname.includes("localhost") && 
                      !hostname.includes("127.0.0.1") &&
                      subdomain !== "www" && 
                      subdomain !== "api" &&
                      subdomain !== "app";
  
  // Handle subdomain routing for products
  if (isSubdomain && subdomain) {
    // Rewrite to product page with slug
    url.pathname = `/product/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development" && process.env.DEBUG_MIDDLEWARE === "true") {
    console.log("Middleware auth:", {
      path: req.url,
      hostname,
      subdomain: subdomain || "none",
      isSubdomain,
      userId,
      protected: isProtectedRoute(req),
    });
  }

  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    if (process.env.NODE_ENV === "development" && process.env.DEBUG_MIDDLEWARE === "true") {
      console.log("Redirecting to sign-in:", signInUrl.toString());
    }
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
