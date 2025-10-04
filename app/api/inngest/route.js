// app/api/inngest/route.js

import { serve } from "inngest/next";
import {inngest} from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/inngest/function";

import arcjet, { shield, detectBot } from "@arcjet/next";

// ✅ Configure Arcjet properly
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// ✅ Main route handler
export const GET = async (req) => {
  try {
    // Protect route with Arcjet
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      return new Response("Blocked by Arcjet", { status: 403 });
    }

    // ✅ Serve Inngest functions
    const handler = serve({
      client: inngest,
      functions: [
        processRecurringTransaction,
        triggerRecurringTransactions,
        generateMonthlyReports,
        checkBudgetAlerts,
      ],
    });

    return handler(req);
  } catch (error) {
    console.error("Error in inngest route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// ✅ Reuse the same logic for POST and PUT
export const POST = GET;
export const PUT = GET;
