import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Arcjet middleware (bot + shield)
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"], // Inngest
    }),
  ],
});

// Clerk middleware — protect specific routes
const clerk = clerkMiddleware((auth, req) => {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/account") ||
    path.startsWith("/transaction")
  ) {
    auth().protect(); // block if not signed in
  }

  return NextResponse.next();
});

// Chain Arcjet first, then Clerk
export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    // Run for all routes except Next internals & static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)", // API routes
  ],
};
