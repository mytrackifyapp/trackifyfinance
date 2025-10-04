// app/api/ingest/route.js
import { serve } from "inngest/next";
import inngest from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/inngest/function";

import arcjet, { shield, detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"] }),
  ],
});

export const GET = async (req) => {
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    return new Response("Blocked by Arcjet", { status: 403 });
  }

  return serve({
    client: inngest,
    functions: [
      processRecurringTransaction,
      triggerRecurringTransactions,
      generateMonthlyReports,
      checkBudgetAlerts,
    ],
  }).GET(req);
};

export const POST = GET;
export const PUT = GET;
