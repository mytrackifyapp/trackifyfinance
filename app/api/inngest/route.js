// app/api/inngest/route.js
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
  syncCryptoPortfolios,
} from "@/lib/inngest/function";

import arcjet, { shield, detectBot } from "@arcjet/next";

// Arcjet setup
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"], // Inngest bots
    }),
  ],
});

// Arcjet wrapper
function withArcjet(handler) {
  return async (req, ...rest) => {
    const decision = await aj.protect(req);
    if (decision?.isDenied?.()) {
      return new Response("Blocked by Arcjet", { status: 403 });
    }
    return handler(req, ...rest);
  };
}

// Inngest + Arcjet
export const GET = withArcjet(
  serve({
    client: inngest,
    functions: [
      processRecurringTransaction,
      triggerRecurringTransactions,
      generateMonthlyReports,
      checkBudgetAlerts,
      syncCryptoPortfolios,
    ],
  }).GET
);

export const POST = GET;
export const PUT = GET;
